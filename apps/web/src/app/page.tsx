import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Users,
  WalletCards,
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import styles from "./page.module.css";

const features = [
  {
    icon: <Boxes size={20} />,
    title: "Product and stock control",
    text: "Manage smart TVs, digital TVs, fridges, irons, washing machines, fans, bicycles, accessories, and every item in the shop.",
  },
  {
    icon: <ShoppingCart size={20} />,
    title: "Fast daily selling",
    text: "Create clear sales, record payments, handle pay-later customers, and keep every sale connected to the stock it removed.",
  },
  {
    icon: <Banknote size={20} />,
    title: "Money and payment proof",
    text: "Track cash, MoMo, bank, card, expenses, debt payments, and daily closing without notebooks or Excel sheets.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Owner plus limited staff access",
    text: "The owner sees everything. The staff member only gets the daily tools needed to sell, receive payments, and manage assigned stock tasks.",
  },
];

const simpleSteps = [
  "Open cash",
  "Sell product",
  "Record payment",
  "Download report",
];

export default function LandingPage() {
  return (
    <main className={`${styles.page} page-shell`}>
      <header className={styles.header}>
        <a className="brand" href="/">
          <span className="brand-icon">S</span>
          <span className={styles.brandText}>Suparsale Store</span>
        </a>

        <div className={styles.headerActions}>
          <ThemeToggle />

          <a href="/login" className={`${styles.hideOnSmall} btn btn-outline`}>
            Login
          </a>

          <a href="/login" className={`${styles.openButton} btn btn-primary`}>
            <span>Open System</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className="hero-kicker">
            <CheckCircle2 size={15} />
            Built for Suparsale Store Ltd
          </div>

          <h1 className={styles.heroTitle}>
            Stop using WhatsApp, Excel, and notebooks to control the shop.
            <span> Run everything from one premium system.</span>
          </h1>

          <p className={styles.heroText}>
            Suparsale Store Ltd sells electronics and home appliances: smart TVs,
            digital TVs, big and small TVs, fridges, irons, washing machines,
            fans, bicycles, accessories, and related materials. This system keeps
            stock, sales, payments, customer debts, expenses, staff actions, and
            downloadable PDF reports in one clean business control center.
          </p>

          <div className={styles.heroActions}>
            <a href="/login" className="btn btn-primary">
              Start with Login
              <ArrowRight size={14} />
            </a>

            <a href="#features" className="btn btn-outline">
              View What It Controls
            </a>
          </div>

          <div className={styles.trustStrip}>
            <div>
              <strong>No notebooks</strong>
              <span>Every action saved</span>
            </div>

            <div>
              <strong>Owner-first</strong>
              <span>Full access and proof</span>
            </div>

            <div>
              <strong>Daily reports</strong>
              <span>Date, time, PDF export</span>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className="stat-card">
              <div className="stat-label">Main users</div>
              <div className="stat-value">Owner + 1 staff</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Currency</div>
              <div className="stat-value">Rwf</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Focus</div>
              <div className="stat-value">Electronics retail</div>
            </div>
          </div>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <div>
              <span className="preview-dot" />
              <strong>Suparsale Dashboard Preview</strong>
            </div>

            <span className="badge badge-green">Open</span>
          </div>

          <div className={styles.previewGrid}>
            <aside className={styles.previewSidebar}>
              <div className={styles.previewMenu}>
                <div className={styles.activeMenuItem}>
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </div>

                <div>
                  <ShoppingCart size={15} />
                  <span>Sales</span>
                </div>

                <div>
                  <Package size={15} />
                  <span>Stock</span>
                </div>

                <div>
                  <Users size={15} />
                  <span>Customers</span>
                </div>

                <div>
                  <ReceiptText size={15} />
                  <span>Reports</span>
                </div>
              </div>
            </aside>

            <section className={styles.previewContent}>
              <div className={styles.previewTop}>
                <div>
                  <div className={styles.previewTitle}>Today in the shop</div>
                  <div className={styles.previewSubtitle}>Suparsale main shop</div>
                </div>

                <span className="badge badge-green">Controlled</span>
              </div>

              <div className={styles.previewStats}>
                <div className="stat-card">
                  <div className="stat-label">Sales</div>
                  <div className="stat-value">Rwf 850k</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Customer debts</div>
                  <div className="stat-value">Rwf 120k</div>
                </div>
              </div>

              <div className={styles.previewList}>
                <div className={styles.previewItem}>
                  <div className={styles.previewItemTop}>
                    <span>Customer bought Smart TV</span>
                    <span className="badge badge-blue">Paid by MoMo</span>
                  </div>

                  <div className={styles.previewItemMeta}>
                    <span>
                      <Clock3 size={12} /> 14:30
                    </span>
                    <span>Rwf 450,000</span>
                  </div>
                </div>

                <div className={styles.previewItem}>
                  <div className={styles.previewItemTop}>
                    <span>Low stock warning</span>
                    <span className="badge badge-blue">3 left</span>
                  </div>

                  <div className={styles.previewItemMeta}>
                    <span>Fridge 220L</span>
                    <span>Restock before weekend</span>
                  </div>
                </div>

                <div className={styles.previewItem}>
                  <div className={styles.previewItemTop}>
                    <span>Owner attention needed</span>
                    <span className="badge badge-blue">Review</span>
                  </div>

                  <div className={styles.previewItemMeta}>
                    <span>
                      <AlertTriangle size={12} /> Expense pending
                    </span>
                    <span>Approve before closing</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className={styles.flowSection}>
        <div className={styles.flowPanel}>
          <div className={styles.flowCopy}>
            <span className="hero-kicker dashboard-kicker">
              <WalletCards size={15} />
              Daily shop flow
            </span>

            <h2 className={styles.sectionTitle}>Easy steps for everyday work</h2>

            <p className={styles.flowText}>
              A simple daily path for the owner and staff member: open cash,
              sell products, receive money, and download the PDF proof report.
            </p>
          </div>

          <div className={styles.flowGrid}>
            {simpleSteps.map((step, index) => (
              <div className={styles.flowCard} key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featureSection} id="features">
        <div className={styles.sectionHeadingRow}>
          <div>
            <span className="hero-kicker dashboard-kicker">
              <ShieldCheck size={15} />
              Built for daily control
            </span>

            <h2 className={styles.sectionTitle}>
              Only the tools Suparsale Store Ltd needs to run cleanly
            </h2>
          </div>

          <a href="/login" className="btn btn-outline">
            Open System
          </a>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
