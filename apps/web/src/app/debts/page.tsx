"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from "lucide-react";
import { CashSession, getCashToday } from "@/lib/cash";
import {
  CustomerDebt,
  CustomerDebtInstallment,
  getDebts,
  recordDebtPayment,
} from "@/lib/debts";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { SalePaymentMethod } from "@/lib/sales";
import { getToken } from "@/lib/auth";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

function formatRwf(value: number) {
  return `Rwf ${Math.abs(Number(value || 0)).toLocaleString("en-US")}`;
}

function formatDate(value: string | null) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(value: string | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DebtsPage() {
  const router = useRouter();

  const [debts, setDebts] = useState<CustomerDebt[]>([]);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [visibleDebtsCount, setVisibleDebtsCount] = useState(8);
  const [visibleInstallmentPlansCount, setVisibleInstallmentPlansCount] =
    useState(6);

  const [selectedDebt, setSelectedDebt] = useState<CustomerDebt | null>(null);
  const [selectedInstallment, setSelectedInstallment] =
    useState<CustomerDebtInstallment | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [amountRwf, setAmountRwf] = useState("");
  const [method, setMethod] = useState<SalePaymentMethod>("cash");
  const [note, setNote] = useState("");

  const isCashOpen = cashSession?.status === "open";
  const cashPaymentNeedsDrawer = method === "cash";
  const cashBlocksPayment = cashPaymentNeedsDrawer && !isCashOpen;

  const cashMessage = !cashSession
    ? "Cash drawer is not open. Cash debt payments need an open cash drawer."
    : cashSession.status === "closed"
      ? "Cash drawer is closed. Choose MoMo, Bank, Card, Other, or open cash."
      : "";

  const pendingDebts = useMemo(
    () => debts.filter((debt) => debt.balanceRwf > 0),
    [debts],
  );

  const paidDebts = useMemo(
    () => debts.filter((debt) => debt.balanceRwf <= 0),
    [debts],
  );

  const totalDebtBalance = useMemo(
    () => debts.reduce((sum, debt) => sum + Number(debt.balanceRwf || 0), 0),
    [debts],
  );

  const totalDebtOriginal = useMemo(
    () =>
      debts.reduce((sum, debt) => sum + Number(debt.originalAmountRwf || 0), 0),
    [debts],
  );

  const installmentDebts = useMemo(
    () => debts.filter((debt) => (debt.installments || []).length > 0),
    [debts],
  );

  const overdueInstallments = useMemo(() => {
    return debts.flatMap((debt) =>
      (debt.installments || []).filter(
        (installment) =>
          installment.balanceRwf > 0 && isOverdue(installment.dueAt),
      ),
    );
  }, [debts]);

  const dueSoonDebts = useMemo(() => {
    const now = Date.now();
    const nextSevenDays = now + 7 * 24 * 60 * 60 * 1000;

    return pendingDebts.filter((debt) => {
      if (!debt.expectedPaymentAt) return false;

      const dueTime = new Date(debt.expectedPaymentAt).getTime();

      return dueTime >= now && dueTime <= nextSevenDays;
    });
  }, [pendingDebts]);

  const urgentDebts = useMemo(() => {
    return pendingDebts.filter(
      (debt) =>
        isOverdue(debt.expectedPaymentAt) ||
        (debt.installments || []).some(
          (installment) =>
            installment.balanceRwf > 0 && isOverdue(installment.dueAt),
        ),
    );
  }, [pendingDebts]);

  const filteredDebts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return debts;

    return debts.filter((debt) => {
      const customerName = (debt.customerName || "").toLowerCase();
      const customerPhone = (debt.customerPhone || "").toLowerCase();
      const saleNumber = (debt.saleNumber || "").toLowerCase();
      const status = (debt.status || "").toLowerCase();

      return (
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        saleNumber.includes(term) ||
        status.includes(term)
      );
    });
  }, [debts, search]);

  const filteredInstallmentDebts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return installmentDebts;

    return installmentDebts.filter((debt) => {
      const customerName = (debt.customerName || "").toLowerCase();
      const customerPhone = (debt.customerPhone || "").toLowerCase();
      const saleNumber = (debt.saleNumber || "").toLowerCase();

      const installmentMatch = (debt.installments || []).some(
        (installment) =>
          String(installment.installmentNumber).includes(term) ||
          (installment.status || "").toLowerCase().includes(term) ||
          formatDate(installment.dueAt).toLowerCase().includes(term),
      );

      return (
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        saleNumber.includes(term) ||
        installmentMatch
      );
    });
  }, [installmentDebts, search]);

  const visibleDebts = useMemo(
    () => filteredDebts.slice(0, visibleDebtsCount),
    [filteredDebts, visibleDebtsCount],
  );

  const visibleInstallmentDebts = useMemo(
    () => filteredInstallmentDebts.slice(0, visibleInstallmentPlansCount),
    [filteredInstallmentDebts, visibleInstallmentPlansCount],
  );

  const hasMoreDebts = visibleDebtsCount < filteredDebts.length;

  const hasMoreInstallmentPlans =
    visibleInstallmentPlansCount < filteredInstallmentDebts.length;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const [debtsResponse, cashResponse] = await Promise.all([
        getDebts(token),
        getCashToday(token),
      ]);

      setDebts(debtsResponse.debts);
      setCashSession(cashResponse.session);
      setVisibleDebtsCount(8);
      setVisibleInstallmentPlansCount(6);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load debts.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openPaymentModal(
    debt: CustomerDebt,
    installment?: CustomerDebtInstallment,
  ) {
    setSelectedDebt(debt);
    setSelectedInstallment(installment || null);

    if (installment) {
      setAmountRwf(String(installment.balanceRwf));
      setNote(`Payment for installment ${installment.installmentNumber}.`);
    } else {
      setAmountRwf(String(debt.balanceRwf));
      setNote("Customer came back and paid.");
    }

    setMethod("cash");
    setPaymentModalOpen(true);
  }

  function closePaymentModal() {
    setSelectedDebt(null);
    setSelectedInstallment(null);
    setAmountRwf("");
    setMethod("cash");
    setNote("");
    setSaving(false);
    setPaymentModalOpen(false);
  }

  async function handleRecordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cashBlocksPayment) {
      setMessage(cashMessage || "Open cash drawer before receiving cash payment.");
      return;
    }

    const token = getToken();
    if (!token || !selectedDebt) return;

    const amount = Number(amountRwf || 0);

    if (amount <= 0) {
      setMessage("Payment amount must be greater than zero.");
      return;
    }

    if (amount > selectedDebt.balanceRwf) {
      setMessage("Payment cannot be greater than remaining debt balance.");
      return;
    }

    if (selectedInstallment && amount > selectedInstallment.balanceRwf) {
      setMessage(
        "Payment cannot be greater than selected installment balance.",
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await recordDebtPayment(token, selectedDebt.id, {
        amountRwf: amount,
        method,
        note,
        installmentId: selectedInstallment?.id,
      });

      closePaymentModal();
      await loadData();
      setMessage("Debt payment recorded successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not record debt payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Debts">
      <div className={styles.debtsPage}>
        <section className={`dashboard-hero ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <span className="hero-kicker dashboard-kicker">
              <WalletCards size={15} />
              Customer debts
            </span>

            <h1>Money to collect</h1>

            <p>
              See who owes the business, what is overdue, what is due soon,
              and record payments without opening complicated reports.
            </p>
          </div>

          <div className={`dashboard-hero-actions ${styles.heroActions}`}>
            <button
              className="btn btn-outline"
              type="button"
              onClick={loadData}
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            {!isCashOpen ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => router.push("/cash")}
              >
                <WalletCards size={14} />
                {cashSession ? "View cash" : "Open cash"}
              </button>
            ) : null}
          </div>
        </section>

        {!isCashOpen ? (
          <NoticeCard
            title="Cash drawer is closed"
            text="Only cash debt payments need an open cash drawer. MoMo, Bank, Card, and Other payments can still be recorded."
            actionLabel={cashSession ? "View cash" : "Open cash"}
            onAction={() => router.push("/cash")}
          />
        ) : null}

        <div className={styles.metricsGrid}>
          <MetricCard
            icon={<WalletCards size={20} />}
            label="Money to collect"
            value={formatRwf(totalDebtBalance)}
            help={`${pendingDebts.length} customer balance(s) still open`}
            badge="Collect"
            badgeClass="badge badge-blue"
          />

          <MetricCard
            icon={<AlertTriangle size={20} />}
            label="Overdue"
            value={String(urgentDebts.length)}
            help={`${overdueInstallments.length} overdue installment(s) included`}
            badge="Urgent"
            badgeClass="badge badge-blue"
          />

          <MetricCard
            icon={<CalendarClock size={20} />}
            label="Due soon"
            value={String(dueSoonDebts.length)}
            help="Expected within the next 7 days"
            badge="Soon"
            badgeClass="badge badge-blue"
          />

          <MetricCard
            icon={<CheckCircle2 size={20} />}
            label="Cleared"
            value={String(paidDebts.length)}
            help={`${formatRwf(totalDebtOriginal - totalDebtBalance)} already collected`}
            badge="Done"
            badgeClass="badge badge-green"
          />
        </div>

        {message ? <div className={styles.messageBox}>{message}</div> : null}

        <section className={`table-card premium-panel ${styles.controlPanel}`}>
          <div className="table-card-header">
            <div>
              <div className="table-title">Find a customer balance</div>
              <div className="app-subtitle">
                Search by customer, phone, sale number, or payment status.
              </div>
            </div>

            {loading ? (
              <Loader2
                className="spin"
                size={20}
                style={{ color: "var(--blue)" }}
              />
            ) : null}
          </div>

          <div className={styles.toolbar}>
            <div className="hdr-search">
              <Search size={14} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleDebtsCount(8);
                  setVisibleInstallmentPlansCount(6);
                }}
                placeholder="Search customer, phone, sale number, status..."
              />
            </div>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => {
                setSearch("");
                setVisibleDebtsCount(8);
                setVisibleInstallmentPlansCount(6);
              }}
            >
              Clear
            </button>
          </div>
        </section>

        <section className={`table-card premium-panel ${styles.listPanel}`}>
          <div className="table-card-header">
            <div>
              <div className="table-title">Customers to collect from</div>
              <div className="app-subtitle">
                Open balances first. Record payment when the customer pays.
              </div>
            </div>

            <span className="badge badge-blue">
              {filteredDebts.length} record(s)
            </span>
          </div>

          <div className={styles.debtGrid}>
            {visibleDebts.map((debt) => {
              const installments = debt.installments || [];
              const nextInstallment =
                installments.find(
                  (installment) => installment.balanceRwf > 0,
                ) || null;
              const isPaid = debt.balanceRwf <= 0;

              return (
                <article key={debt.id} className={styles.debtCard}>
                  <div className={styles.debtCardTop}>
                    <div className={styles.debtIdentity}>
                      <div className={styles.cardIcon}>
                        <WalletCards size={18} />
                      </div>

                      <div>
                        <h3>{debt.customerName}</h3>
                        <p>{debt.customerPhone || "No phone"}</p>
                        <span>{debt.saleNumber || "No sale number"}</span>
                      </div>
                    </div>

                    <span
                      className={
                        isPaid ? "badge badge-green" : "badge badge-blue"
                      }
                    >
                      {isPaid ? "Paid" : debt.status}
                    </span>
                  </div>

                  <div className={styles.miniGrid}>
                    <MiniInfo
                      label="Balance"
                      value={formatRwf(debt.balanceRwf)}
                      tone={isPaid ? "success" : "warning"}
                    />

                    <MiniInfo
                      label="Sale debt"
                      value={formatRwf(debt.originalAmountRwf)}
                    />

                    <MiniInfo
                      label="Paid"
                      value={formatRwf(debt.amountPaidRwf)}
                      tone={debt.amountPaidRwf > 0 ? "success" : "default"}
                    />

                    <MiniInfo
                      label="Payment type"
                      value={
                        installments.length > 0
                          ? `${installments.length} installment(s)`
                          : "One payment"
                      }
                    />
                  </div>

                  {nextInstallment ? (
                    <div className={styles.nextInstallmentBox}>
                      <CalendarClock size={15} />
                      <div>
                        <strong>
                          Next installment #{nextInstallment.installmentNumber}
                        </strong>
                        <span>
                          {formatRwf(nextInstallment.balanceRwf)} · Due{" "}
                          {formatDate(nextInstallment.dueAt)}
                        </span>
                      </div>
                    </div>
                  ) : installments.length > 0 ? (
                    <div className={styles.nextInstallmentBox}>
                      <CheckCircle2 size={15} />
                      <div>
                        <strong>All installments cleared</strong>
                        <span>No unpaid installment remains.</span>
                      </div>
                    </div>
                  ) : null}

                  <div className={styles.cardFooter}>
                    {debt.balanceRwf > 0 ? (
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        onClick={() => openPaymentModal(debt)}
                        disabled={false}
                      >
                        <Plus size={13} />
                        Record payment
                      </button>
                    ) : (
                      <span className="badge badge-green">Cleared</span>
                    )}
                  </div>
                </article>
              );
            })}

            {filteredDebts.length === 0 ? (
              <EmptyCard
                icon={<WalletCards size={20} />}
                title="No customer debts found"
                text="Create a pay-later or installment sale from the Sell page."
              />
            ) : null}
          </div>

          {hasMoreDebts ? (
            <div className={styles.loadMoreBox}>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => setVisibleDebtsCount((current) => current + 8)}
              >
                Load more debts
              </button>
            </div>
          ) : null}
        </section>

        <section className={`table-card premium-panel ${styles.planPanel}`}>
          <div className="table-card-header">
            <div>
              <div className="table-title">Installment plans</div>
              <div className="app-subtitle">
                Detailed schedule for customers paying in parts.
              </div>
            </div>

            <span className="badge badge-blue">
              {filteredInstallmentDebts.length} plan(s)
            </span>
          </div>

          <div className={styles.planList}>
            {visibleInstallmentDebts.map((debt) => (
              <article key={debt.id} className={styles.planCard}>
                <div className={styles.planCardTop}>
                  <div className={styles.debtIdentity}>
                    <div className={styles.cardIcon}>
                      <CalendarClock size={18} />
                    </div>

                    <div>
                      <h3>{debt.customerName}</h3>
                      <p>{debt.saleNumber || "No sale number"}</p>
                      <span>
                        Balance: {formatRwf(debt.balanceRwf)} · Original:{" "}
                        {formatRwf(debt.originalAmountRwf)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.installmentGrid}>
                  {(debt.installments || []).map((installment) => {
                    const paid = installment.balanceRwf <= 0;
                    const overdue =
                      !paid && isOverdue(installment.dueAt || null);

                    return (
                      <div
                        key={installment.id}
                        className={cx(
                          styles.installmentCard,
                          overdue && styles.installmentCardOverdue,
                          paid && styles.installmentCardPaid,
                        )}
                      >
                        <div className={styles.installmentTop}>
                          <strong>
                            Installment #{installment.installmentNumber}
                          </strong>

                          <span
                            className={
                              paid
                                ? "badge badge-green"
                                : overdue
                                  ? "badge badge-blue"
                                  : "badge badge-blue"
                            }
                          >
                            {paid ? "Paid" : overdue ? "Overdue" : "Open"}
                          </span>
                        </div>

                        <div className={styles.miniGrid}>
                          <MiniInfo
                            label="Expected"
                            value={formatRwf(installment.expectedAmountRwf)}
                          />

                          <MiniInfo
                            label="Balance"
                            value={formatRwf(installment.balanceRwf)}
                            tone={paid ? "success" : "warning"}
                          />

                          <MiniInfo
                            label="Due"
                            value={formatDate(installment.dueAt)}
                          />
                        </div>

                        {installment.balanceRwf > 0 ? (
                          <button
                            className="btn btn-outline btn-sm"
                            type="button"
                            onClick={() => openPaymentModal(debt, installment)}
                            disabled={false}
                          >
                            Pay installment
                          </button>
                        ) : (
                          <span className="badge badge-green">Paid</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}

            {filteredInstallmentDebts.length === 0 ? (
              <EmptyCard
                icon={<CheckCircle2 size={20} />}
                title="No installment plans yet"
                text="Create an installment sale from the Sell page."
              />
            ) : null}
          </div>

          {hasMoreInstallmentPlans ? (
            <div className={styles.loadMoreBox}>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() =>
                  setVisibleInstallmentPlansCount((current) => current + 6)
                }
              >
                Load more installment plans
              </button>
            </div>
          ) : null}
        </section>

        {paymentModalOpen && selectedDebt ? (
          <div className="staff-modal-backdrop">
            <div className="staff-modal">
              <div className="staff-modal-header">
                <div>
                  <div className="staff-modal-icon">
                    <WalletCards size={22} />
                  </div>

                  <h2>Record debt payment</h2>
                  <p>
                    {selectedDebt.customerName} owes{" "}
                    {formatRwf(selectedDebt.balanceRwf)}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="staff-modal-close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="staff-modal-body">
                {selectedInstallment ? (
                  <div className={styles.selectedInstallmentBox}>
                    <div className="staff-form-section-title">
                      Selected installment
                    </div>

                    <strong>
                      Installment #{selectedInstallment.installmentNumber}
                    </strong>

                    <span>
                      Balance: {formatRwf(selectedInstallment.balanceRwf)} ·
                      Due: {formatDate(selectedInstallment.dueAt)}
                    </span>
                  </div>
                ) : (selectedDebt.installments || []).length > 0 ? (
                  <div className={styles.allocationBox}>
                    <div className="staff-form-section-title">
                      Payment allocation
                    </div>
                    <p>
                      No specific installment selected. The system will apply
                      this payment to the oldest unpaid installments first.
                    </p>
                  </div>
                ) : null}

                <div className="staff-form-grid">
                  <label className="staff-form-group">
                    <span>Amount received</span>
                    <input
                      type="number"
                      min={1}
                      max={
                        selectedInstallment
                          ? selectedInstallment.balanceRwf
                          : selectedDebt.balanceRwf
                      }
                      value={amountRwf}
                      onChange={(event) => setAmountRwf(event.target.value)}
                      required
                    />
                  </label>

                  <label className="staff-form-group">
                    <span>Payment method</span>
                    <select
                      value={method}
                      onChange={(event) =>
                        setMethod(event.target.value as SalePaymentMethod)
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="momo">MoMo</option>
                      <option value="bank">Bank</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                <label className="staff-form-group">
                  <span>Payment note</span>
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Example: Customer came back and paid installment."
                  />
                </label>

                <div className="staff-modal-footer">
                  <button
                    type="button"
                    onClick={closePaymentModal}
                    className="staff-btn staff-btn-outline"
                  >
                    Cancel
                  </button>

                  <AsyncButton
                    loading={saving}
                    disabled={cashBlocksPayment}
                    type="submit"
                  >
                    <Plus size={15} />
                    Save payment
                  </AsyncButton>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  help: string;
  badge: string;
  badgeClass: string;
};

function MetricCard({
  icon,
  label,
  value,
  help,
  badge,
  badgeClass,
}: MetricCardProps) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricTop}>
        <div className="feature-icon">{icon}</div>
        <span className={badgeClass}>{badge}</span>
      </div>

      <div className="stat-label">{label}</div>
      <div className={styles.metricValue}>{value}</div>
      <div className="stat-help">{help}</div>
    </div>
  );
}

type MiniInfoProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
};

function MiniInfo({ label, value, tone = "default" }: MiniInfoProps) {
  return (
    <div
      className={cx(
        styles.miniInfo,
        tone === "success" && styles.miniInfoSuccess,
        tone === "warning" && styles.miniInfoWarning,
      )}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type EmptyCardProps = {
  icon: ReactNode;
  title: string;
  text: string;
};

function EmptyCard({ icon, title, text }: EmptyCardProps) {
  return (
    <div className={styles.emptyCard}>
      <div>{icon}</div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

type NoticeCardProps = {
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
};

function NoticeCard({ title, text, actionLabel, onAction }: NoticeCardProps) {
  return (
    <div className={styles.noticeCard}>
      <div className={styles.noticeContent}>
        <AlertTriangle size={20} />
        <div>
          <strong>{title}</strong>
          <p>{text}</p>
        </div>
      </div>

      <button className="btn btn-primary" type="button" onClick={onAction}>
        <WalletCards size={14} />
        {actionLabel}
      </button>
    </div>
  );
}




