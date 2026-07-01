"use client";

import {
  AlertTriangle,
  Banknote,
  Boxes,
  CheckCircle2,
  Clock3,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  WalletCards,
} from "lucide-react";
import { AuthUser, getCurrentUser, getToken } from "@/lib/auth";
import type { FormEvent, ReactNode } from "react";
import { ProblemSeverity, ShopProblem, getProblems } from "@/lib/problems";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

function getTodayDate() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasPermission(user: AuthUser | null, permission: string) {
  if (!user) return false;
  if (user.role === "owner") return true;
  if (user.permissions.includes("*")) return true;
  return user.permissions.includes(permission);
}

function getSeverityBadge(severity: ProblemSeverity) {
  if (severity === "critical") return "badge badge-blue";
  if (severity === "warning") return "badge badge-blue";
  return "badge badge-green";
}

function getSeverityLabel(severity: ProblemSeverity) {
  if (severity === "critical") return "Urgent";
  if (severity === "warning") return "Needs review";
  return "Note";
}

function getProblemIcon(problem: ShopProblem) {
  if (problem.category === "cash") return <Banknote size={18} />;
  if (problem.category === "debt") return <WalletCards size={18} />;
  if (problem.category === "expense") return <ReceiptText size={18} />;
  if (problem.category === "stock") return <Boxes size={18} />;
  return <ShoppingCart size={18} />;
}

export default function ProblemsPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [businessDate, setBusinessDate] = useState(getTodayDate());
  const [problems, setProblems] = useState<ShopProblem[]>([]);
  const [cashProblems, setCashProblems] = useState<ShopProblem[]>([]);
  const [debtProblems, setDebtProblems] = useState<ShopProblem[]>([]);
  const [expenseProblems, setExpenseProblems] = useState<ShopProblem[]>([]);
  const [stockProblems, setStockProblems] = useState<ShopProblem[]>([]);
  const [salesProblems, setSalesProblems] = useState<ShopProblem[]>([]);
  const [cleanAreas, setCleanAreas] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const canViewProblems = hasPermission(user, "problems.view");

  const criticalProblems = useMemo(
    () => problems.filter((problem) => problem.severity === "critical"),
    [problems],
  );

  const warningProblems = useMemo(
    () => problems.filter((problem) => problem.severity === "warning"),
    [problems],
  );

  const infoProblems = useMemo(
    () => problems.filter((problem) => problem.severity === "info"),
    [problems],
  );

  const urgentProblems = useMemo(
    () =>
      problems.filter(
        (problem) =>
          problem.severity === "critical" || problem.severity === "warning",
      ),
    [problems],
  );

  const priorityProblems = useMemo(
    () => (urgentProblems.length > 0 ? urgentProblems : infoProblems.slice(0, 3)),
    [infoProblems, urgentProblems],
  );

  const hasProblems = problems.length > 0;
  const hasUrgentWork =
    criticalProblems.length > 0 || warningProblems.length > 0;

  useEffect(() => {
    loadProblems(businessDate);
  }, []);

  async function loadProblems(nextDate = businessDate) {
    const token = getToken();

    if (!token) {
      setMessage("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const [meResponse, problemsResponse] = await Promise.all([
        getCurrentUser(token),
        getProblems(token, nextDate),
      ]);

      setUser(meResponse.user);
      setBusinessDate(problemsResponse.businessDate);
      setProblems(problemsResponse.problems);
      setCashProblems(problemsResponse.groups.cashProblems);
      setDebtProblems(problemsResponse.groups.debtProblems);
      setExpenseProblems(problemsResponse.groups.expenseProblems);
      setStockProblems(problemsResponse.groups.stockProblems);
      setSalesProblems(problemsResponse.groups.salesProblems);
      setCleanAreas(problemsResponse.summary.cleanAreas);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load problems.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadProblems(businessDate);
  }

  return (
    <AppShell title="Attention">
      <div className={styles.problemsPage}>
        <section className={`dashboard-hero ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <span className="hero-kicker dashboard-kicker">
              <AlertTriangle size={15} />
              Daily business checks
            </span>

            <h1>Owner attention</h1>

            <p>
              See what needs action now, what can wait, and what is clean before
              closing the day.
            </p>
          </div>

          <div className={`dashboard-hero-actions ${styles.heroActions}`}>
            <form onSubmit={handleDateSubmit} className={styles.dateForm}>
              <input
                type="date"
                value={businessDate}
                onChange={(event) => setBusinessDate(event.target.value)}
              />

              <button className="btn btn-outline" type="submit">
                <RefreshCw size={14} />
                Check date
              </button>
            </form>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => loadProblems(businessDate)}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </section>

        {message ? <div className={styles.messageBox}>{message}</div> : null}

        {!canViewProblems && user ? (
          <div className={styles.permissionNotice}>
            <ShieldCheck size={20} />
            <div>
              <strong>No access</strong>
              <span>You do not have permission to view shop problems.</span>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="loading-card">
            <Loader2 className="spin" size={18} />
            <div>
              <strong>Checking shop problems...</strong>
              <p>Looking at cash, payments, expenses, stock, and sales.</p>
            </div>
          </div>
        ) : null}

        {!loading && canViewProblems ? (
          <>
            <section
              className={
                hasUrgentWork
                  ? styles.summaryCardWarning
                  : styles.summaryCardClean
              }
            >
              <div className={styles.summaryIntro}>
                <div className="feature-icon">
                  {hasProblems ? (
                    <AlertTriangle size={21} />
                  ) : (
                    <CheckCircle2 size={21} />
                  )}
                </div>

                <div>
                  <strong>
                    {hasProblems
                      ? "Fix these before closing the day."
                      : "The shop looks clean right now."}
                  </strong>
                  <span>
                    {hasProblems
                      ? "Start with the first item below. Everything else can wait."
                      : "No urgent item was found for this date."}
                  </span>
                </div>
              </div>

              <div className={styles.statusGrid}>
                <StatusMini
                  label="Urgent"
                  value={String(criticalProblems.length)}
                  danger={criticalProblems.length > 0}
                />

                <StatusMini
                  label="Needs review"
                  value={String(warningProblems.length)}
                  danger={warningProblems.length > 0}
                />

                <StatusMini label="Notes" value={String(infoProblems.length)} />

                <StatusMini
                  label="Date"
                  value={String(problems.length)}
                  danger={problems.length > 0}
                />
              </div>
            </section>

            <ProblemSection
              title="Action needed first"
              subtitle="Only the items the owner should fix or review now."
              emptyTitle="No action needed"
              emptyText="There is no urgent or review item for this date."
              problems={priorityProblems}
              onAction={(href) => router.push(href)}
              featured
            />

            <section className={styles.cleanStrip}>
              <div>
                <strong>Clean areas</strong>
                <span>
                  {cleanAreas.length > 0
                    ? cleanAreas.join(", ")
                    : "No clean area found yet."}
                </span>
              </div>

              <span className="badge badge-green">
                {cleanAreas.length} clean
              </span>
            </section>

          </>
        ) : null}
      </div>
    </AppShell>
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
      <strong className={danger ? styles.dangerValue : ""}>{value}</strong>
    </div>
  );
}

type ProblemMetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
  help: string;
  badge: string;
  badgeClass: string;
};

function ProblemMetric({
  icon,
  label,
  value,
  help,
  badge,
  badgeClass,
}: ProblemMetricProps) {
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

type ProblemSectionProps = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyText: string;
  problems: ShopProblem[];
  onAction: (href: string) => void;
  featured?: boolean;
};

function ProblemSection({
  title,
  subtitle,
  emptyTitle,
  emptyText,
  problems,
  onAction,
  featured = false,
}: ProblemSectionProps) {
  return (
    <section
      className={
        featured
          ? `${styles.problemSection} ${styles.featuredSection}`
          : styles.problemSection
      }
    >
      <div className={styles.sectionHeader}>
        <div>
          <div className="table-title">{title}</div>
          <div className="app-subtitle">{subtitle}</div>
        </div>

        <span
          className={
            problems.length > 0 ? "badge badge-blue" : "badge badge-green"
          }
        >
          {problems.length > 0 ? `${problems.length} item(s)` : "Clean"}
        </span>
      </div>

      <div className={styles.problemList}>
        {problems.map((problem) => (
          <article key={problem.id} className={styles.problemCard}>
            <div className={styles.problemIcon}>{getProblemIcon(problem)}</div>

            <div className={styles.problemContent}>
              <div className={styles.problemTitleRow}>
                <strong>{problem.title}</strong>
                <span className={getSeverityBadge(problem.severity)}>
                  {getSeverityLabel(problem.severity)}
                </span>
              </div>

              <p>{problem.message}</p>
              <span>Detected {formatDate(problem.detectedAt)}</span>
            </div>

            <button
              className="btn btn-outline"
              type="button"
              onClick={() => onAction(problem.actionHref)}
            >
              {problem.actionLabel}
            </button>
          </article>
        ))}

        {problems.length === 0 ? (
          <div className={styles.emptyCard}>
            <CheckCircle2 size={18} />
            <div>
              <strong>{emptyTitle}</strong>
              <span>{emptyText}</span>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}




