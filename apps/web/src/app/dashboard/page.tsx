"use client";

import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  CheckCircle2,
  Clock3,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react";
import {
  CashSession,
  CashTotals,
  MoneyLedgerEntry,
  getCashToday,
} from "@/lib/cash";
import { CustomerDebt, getDebts } from "@/lib/debts";
import { Expense, getExpenses } from "@/lib/expenses";
import { Product, getProducts } from "@/lib/products";
import { SaleListItem, getSales } from "@/lib/sales";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import type { ReactNode } from "react";
import { getToken } from "@/lib/auth";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

function formatRwf(value: number) {
  return `Rwf ${Math.abs(Number(value || 0)).toLocaleString("en-US")}`;
}

function formatDate(value: string | null) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function localDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

const emptyTotals: CashTotals = {
  moneyInRwf: 0,
  moneyOutRwf: 0,

  cashInRwf: 0,
  cashOutRwf: 0,

  momoInRwf: 0,
  momoOutRwf: 0,

  bankInRwf: 0,
  bankOutRwf: 0,

  cardInRwf: 0,
  cardOutRwf: 0,

  otherInRwf: 0,
  otherOutRwf: 0,

  expectedCashRwf: 0,
};

export default function DashboardPage() {
  const router = useRouter();

  const [businessDate, setBusinessDate] = useState(localDateKey(new Date()));
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [cashTotals, setCashTotals] = useState<CashTotals>(emptyTotals);
  const [ledger, setLedger] = useState<MoneyLedgerEntry[]>([]);
  const [sales, setSales] = useState<SaleListItem[]>([]);
  const [debts, setDebts] = useState<CustomerDebt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const isCashOpen = cashSession?.status === "open";
  const isCashClosed = cashSession?.status === "closed";
  const cashNotOpened = !cashSession;

  const todaySales = useMemo(
    () => sales.filter((sale) => localDateKey(sale.createdAt) === businessDate),
    [businessDate, sales],
  );

  const todaySalesTotal = useMemo(
    () =>
      todaySales.reduce(
        (sum, sale) => sum + Number(sale.totalAmountRwf || 0),
        0,
      ),
    [todaySales],
  );

  const todayPaidTotal = useMemo(
    () =>
      todaySales.reduce(
        (sum, sale) => sum + Number(sale.amountPaidRwf || 0),
        0,
      ),
    [todaySales],
  );

  const openDebts = useMemo(
    () => debts.filter((debt) => Number(debt.balanceRwf || 0) > 0),
    [debts],
  );

  const openDebtTotal = useMemo(
    () =>
      openDebts.reduce((sum, debt) => sum + Number(debt.balanceRwf || 0), 0),
    [openDebts],
  );

  const overdueDebts = useMemo(() => {
    return openDebts.filter((debt) => {
      if (!debt.expectedPaymentAt) return false;
      return new Date(debt.expectedPaymentAt).getTime() < Date.now();
    });
  }, [openDebts]);

  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.isActive &&
          Number(product.currentStock || 0) <=
            Number(product.lowStockAlert || 0),
      ),
    [products],
  );

  const stockValue = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.currentStock || 0) *
            Number(product.buyingPriceRwf || 0),
        0,
      ),
    [products],
  );

  const approvedExpenses = useMemo(
    () => expenses.filter((expense) => expense.status === "approved"),
    [expenses],
  );

  const pendingExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          expense.status === "waiting_owner_review" && expense.isActive === 1,
      ),
    [expenses],
  );

  const todayExpenses = useMemo(() => {
    return approvedExpenses.filter((expense) => {
      const dateValue = expense.paidAt || expense.createdAt;
      return localDateKey(dateValue) === businessDate;
    });
  }, [approvedExpenses, businessDate]);

  const todayExpenseTotal = useMemo(
    () =>
      todayExpenses.reduce(
        (sum, expense) => sum + Number(expense.amountRwf || 0),
        0,
      ),
    [todayExpenses],
  );

  const pendingExpenseTotal = useMemo(
    () =>
      pendingExpenses.reduce(
        (sum, expense) => sum + Number(expense.amountRwf || 0),
        0,
      ),
    [pendingExpenses],
  );

  const netMoneyMovement = useMemo(
    () =>
      Number(cashTotals.moneyInRwf || 0) - Number(cashTotals.moneyOutRwf || 0),
    [cashTotals.moneyInRwf, cashTotals.moneyOutRwf],
  );

  const cashReopenedToday = useMemo(
    () => ledger.some((entry) => entry.category === "cash_reopened"),
    [ledger],
  );

  const hasCashDifference =
    isCashClosed && Number(cashSession?.differenceRwf || 0) !== 0;

  const problemCount = useMemo(() => {
    let count = 0;

    if (!isCashOpen) count += 1;
    count += lowStockProducts.length;
    count += overdueDebts.length;
    count += pendingExpenses.length;

    if (hasCashDifference) count += 1;
    if (cashReopenedToday) count += 1;

    return count;
  }, [
    cashReopenedToday,
    hasCashDifference,
    isCashOpen,
    lowStockProducts.length,
    overdueDebts.length,
    pendingExpenses.length,
  ]);

  const latestSales = useMemo(() => sales.slice(0, 4), [sales]);
  const topOpenDebts = useMemo(() => openDebts.slice(0, 4), [openDebts]);
  const latestLedger = useMemo(() => ledger.slice(0, 4), [ledger]);

  const shopStatusTitle = isCashOpen
    ? "Shop is open"
    : cashNotOpened
      ? "Cash is not open"
      : "Cash is closed";

  const shopStatusHelp = isCashOpen
    ? `Expected cash in drawer is ${formatRwf(cashTotals.expectedCashRwf)}.`
    : cashNotOpened
      ? "Open cash before sales, payments, and expenses start."
      : "Selling and payments are blocked until cash is reopened.";

  const mainActionLabel = isCashOpen
    ? "Start selling"
    : cashNotOpened
      ? "Open cash"
      : "View cash";

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setMessage("");

    try {
      const [
        cashResult,
        salesResult,
        debtsResult,
        productsResult,
        expensesResult,
      ] = await Promise.allSettled([
        getCashToday(token),
        getSales(token),
        getDebts(token),
        getProducts(token),
        getExpenses(token),
      ]);

      if (cashResult.status === "fulfilled") {
        setBusinessDate(cashResult.value.businessDate);
        setCashSession(cashResult.value.session);
        setCashTotals(cashResult.value.totals);
        setLedger(cashResult.value.ledger);
      }

      if (salesResult.status === "fulfilled") {
        setSales(salesResult.value.sales);
      }

      if (debtsResult.status === "fulfilled") {
        setDebts(debtsResult.value.debts);
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.products);
      }

      if (expensesResult.status === "fulfilled") {
        setExpenses(expensesResult.value.expenses);
      }

      const failed = [
        cashResult,
        salesResult,
        debtsResult,
        productsResult,
        expensesResult,
      ].filter((result) => result.status === "rejected");

      if (failed.length > 0) {
        setMessage(
          "Some dashboard sections could not load because this account may not have all permissions.",
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleMainAction() {
    if (isCashOpen) {
      router.push("/sales");
      return;
    }

    router.push("/cash");
  }

  return (
    <AppShell title="Dashboard">
      <div className={styles.dashboardPage}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>
              <ShieldCheck size={15} />
              Owner first-glance dashboard
            </span>

            <h1>Today at Suparsale Store</h1>

            <p>
              See the few numbers and problems that matter before you make a
              decision.
            </p>
          </div>

          <div className={styles.heroActions}>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={handleMainAction}
            >
              {mainActionLabel}
              <ArrowRight size={15} />
            </button>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={loadDashboard}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </section>

        {message ? <div className={styles.messageBox}>{message}</div> : null}

        <section
          className={`${styles.statusCard} ${
            isCashOpen ? styles.statusOpen : styles.statusWarning
          }`}
        >
          <div className={styles.statusMain}>
            <div className={styles.statusIcon}>
              {isCashOpen ? (
                <CheckCircle2 size={21} />
              ) : (
                <AlertTriangle size={21} />
              )}
            </div>

            <div>
              <span>Shop status</span>
              <strong>{shopStatusTitle}</strong>
              <p>{shopStatusHelp}</p>
            </div>
          </div>

          <div className={styles.statusMiniGrid}>
            <StatusMini label="Date" value={businessDate} />
            <StatusMini label="Problems" value={String(problemCount)} danger={problemCount > 0} />
            <StatusMini label="Expected cash" value={formatRwf(cashTotals.expectedCashRwf)} />
          </div>
        </section>

        <section className={styles.kpiGrid}>
          <KpiCard
            icon={<ShoppingCart size={19} />}
            label="Sales today"
            value={formatRwf(todaySalesTotal)}
            help={`${todaySales.length} sale(s) recorded`}
            tone="blue"
          />

          <KpiCard
            icon={<Banknote size={19} />}
            label="Money received"
            value={formatRwf(cashTotals.moneyInRwf)}
            help={`Paid today: ${formatRwf(todayPaidTotal)}`}
            tone="green"
          />

          <KpiCard
            icon={<WalletCards size={19} />}
            label="Customer debts"
            value={formatRwf(openDebtTotal)}
            help={`${openDebts.length} open · ${overdueDebts.length} overdue`}
            tone={overdueDebts.length > 0 ? "danger" : "blue"}
          />

          <KpiCard
            icon={<Boxes size={19} />}
            label="Stock value"
            value={formatRwf(stockValue)}
            help={`${lowStockProducts.length} low-stock product(s)`}
            tone={lowStockProducts.length > 0 ? "danger" : "blue"}
          />
        </section>

        <section className={styles.ownerGrid}>
          <div className={styles.focusPanel}>
            <PanelHeader
              title="What needs attention"
              subtitle="Fix these first. Ignore everything else until these are clear."
              right={
                loading ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <span
                    className={
                      problemCount > 0 ? styles.dangerBadge : styles.goodBadge
                    }
                  >
                    {problemCount > 0 ? `${problemCount} issue(s)` : "Clear"}
                  </span>
                )
              }
            />

            <div className={styles.issueList}>
              {!isCashOpen ? (
                <IssueItem
                  icon={<AlertTriangle size={17} />}
                  title="Cash is not open"
                  text="Sales, payments, and paid expenses need cash opened first."
                />
              ) : null}

              {overdueDebts.length > 0 ? (
                <IssueItem
                  icon={<WalletCards size={17} />}
                  title={`${overdueDebts.length} overdue debt(s)`}
                  text="Follow up customers who passed their promised payment time."
                />
              ) : null}

              {pendingExpenses.length > 0 ? (
                <IssueItem
                  icon={<ReceiptText size={17} />}
                  title={`${pendingExpenses.length} expense approval(s)`}
                  text={`Waiting owner review: ${formatRwf(pendingExpenseTotal)}.`}
                />
              ) : null}

              {lowStockProducts.length > 0 ? (
                <IssueItem
                  icon={<Boxes size={17} />}
                  title={`${lowStockProducts.length} low-stock product(s)`}
                  text="Restock before customers ask for unavailable products."
                />
              ) : null}

              {hasCashDifference ? (
                <IssueItem
                  icon={<Banknote size={17} />}
                  title="Cash difference found"
                  text={`Closing difference: ${formatRwf(
                    cashSession?.differenceRwf || 0,
                  )}.`}
                />
              ) : null}

              {cashReopenedToday ? (
                <IssueItem
                  icon={<Clock3 size={17} />}
                  title="Cash was reopened today"
                  text="Review the cash proof and audit trail before closing."
                />
              ) : null}

              {problemCount === 0 ? (
                <IssueItem
                  icon={<CheckCircle2 size={17} />}
                  title="No urgent problem found"
                  text="The shop looks clean right now."
                />
              ) : null}
            </div>
          </div>

          <div className={styles.moneyPanel}>
            <PanelHeader
              title="Money today"
              subtitle="Simple cash movement view."
            />

            <div className={styles.moneyRows}>
              <MoneyRow label="Received" value={cashTotals.moneyInRwf} />
              <MoneyRow label="Spent" value={cashTotals.moneyOutRwf} />
              <MoneyRow label="Net movement" value={netMoneyMovement} strong />
              <MoneyRow label="Expenses today" value={todayExpenseTotal} />
            </div>

            <div className={styles.methodGrid}>
              <MethodMini label="Cash" value={cashTotals.cashInRwf} />
              <MethodMini label="MoMo" value={cashTotals.momoInRwf} />
              <MethodMini label="Bank" value={cashTotals.bankInRwf} />
              <MethodMini
                label="Card/Other"
                value={cashTotals.cardInRwf + cashTotals.otherInRwf}
              />
            </div>
          </div>
        </section>

        <section className={styles.activityGrid}>
          <ActivityPanel
            title="Latest sales"
            subtitle="Recent products sold."
            emptyTitle="No sales yet"
            emptyText="Sales will appear here after selling starts."
          >
            {latestSales.map((sale) => (
              <IssueItem
                key={sale.id}
                icon={<ShoppingCart size={17} />}
                title={`${sale.saleNumber} · ${formatRwf(sale.totalAmountRwf)}`}
                text={`${sale.customerName || sale.walkInName || "Walk-in customer"} · Paid ${formatRwf(
                  sale.amountPaidRwf,
                )} · Balance ${formatRwf(sale.balanceRwf)}`}
              />
            ))}
          </ActivityPanel>

          <ActivityPanel
            title="Debts to follow"
            subtitle="Customers who still owe money."
            emptyTitle="No open debts"
            emptyText="No customer debt is currently open."
          >
            {topOpenDebts.map((debt) => (
              <IssueItem
                key={debt.id}
                icon={<Users size={17} />}
                title={`${debt.customerName} · ${formatRwf(debt.balanceRwf)}`}
                text={`Sale: ${debt.saleNumber || "No sale number"} · Expected: ${formatDate(
                  debt.expectedPaymentAt,
                )}`}
              />
            ))}
          </ActivityPanel>

          <ActivityPanel
            title="Latest money proof"
            subtitle="Recent money movement records."
            emptyTitle="No money movement"
            emptyText="Money proof appears after sales, payments, expenses, or cash actions."
          >
            {latestLedger.map((entry) => (
              <IssueItem
                key={entry.id}
                icon={<Banknote size={17} />}
                title={`${entry.direction === "money_in" ? "Received" : entry.direction === "money_out" ? "Spent" : "Cash note"} · ${formatRwf(
                  entry.amountRwf,
                )}`}
                text={`${entry.category} · ${entry.method} · ${formatDate(
                  entry.happenedAt,
                )}`}
              />
            ))}
          </ActivityPanel>
        </section>
      </div>
    </AppShell>
  );
}

type KpiCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  help: string;
  tone: "blue" | "green" | "danger";
};

function KpiCard({ icon, label, value, help, tone }: KpiCardProps) {
  return (
    <article className={`${styles.kpiCard} ${styles[`tone${tone}`]}`}>
      <div className={styles.kpiTop}>
        <div className={styles.kpiIcon}>{icon}</div>
        <span>{label}</span>
      </div>

      <strong>{value}</strong>
      <p>{help}</p>
    </article>
  );
}

type StatusMiniProps = {
  label: string;
  value: string;
  danger?: boolean;
};

function StatusMini({ label, value, danger = false }: StatusMiniProps) {
  return (
    <div className={styles.statusMini}>
      <span>{label}</span>
      <strong className={danger ? styles.dangerText : ""}>{value}</strong>
    </div>
  );
}

type PanelHeaderProps = {
  title: string;
  subtitle: string;
  right?: ReactNode;
};

function PanelHeader({ title, subtitle, right }: PanelHeaderProps) {
  return (
    <div className={styles.panelHeader}>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {right ? <div className={styles.panelRight}>{right}</div> : null}
    </div>
  );
}

type IssueItemProps = {
  icon: ReactNode;
  title: string;
  text: string;
};

function IssueItem({ icon, title, text }: IssueItemProps) {
  return (
    <div className={styles.issueItem}>
      <div className={styles.issueIcon}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

type MoneyRowProps = {
  label: string;
  value: number;
  strong?: boolean;
};

function MoneyRow({ label, value, strong = false }: MoneyRowProps) {
  return (
    <div className={strong ? styles.moneyRowStrong : styles.moneyRow}>
      <span>{label}</span>
      <strong>{formatRwf(value)}</strong>
    </div>
  );
}

type MethodMiniProps = {
  label: string;
  value: number;
};

function MethodMini({ label, value }: MethodMiniProps) {
  return (
    <div className={styles.methodMini}>
      <span>{label}</span>
      <strong>{formatRwf(value)}</strong>
    </div>
  );
}

type ActivityPanelProps = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyText: string;
  children: ReactNode;
};

function ActivityPanel({
  title,
  subtitle,
  emptyTitle,
  emptyText,
  children,
}: ActivityPanelProps) {
  const hasChildren = Array.isArray(children)
    ? children.filter(Boolean).length > 0
    : Boolean(children);

  return (
    <section className={styles.activityPanel}>
      <PanelHeader title={title} subtitle={subtitle} />

      <div className={styles.issueList}>
        {hasChildren ? (
          children
        ) : (
          <IssueItem
            icon={<ShieldCheck size={17} />}
            title={emptyTitle}
            text={emptyText}
          />
        )}
      </div>
    </section>
  );
}
