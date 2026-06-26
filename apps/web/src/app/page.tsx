import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import styles from "./page.module.css";

const modules = [
  {
    icon: <Package size={20} />,
    title: "Products",
    text: "One clean product list for TVs, fridges, irons, fans, bicycles, accessories, and appliances.",
  },
  {
    icon: <Boxes size={20} />,
    title: "Stock",
    text: "Receive stock, record damaged items, and see low-stock products before they become a problem.",
  },
  {
    icon: <ShoppingCart size={20} />,
    title: "Sales",
    text: "Create sales quickly and let the system reduce stock automatically.",
  },
  {
    icon: <WalletCards size={20} />,
    title: "Payments",
    text: "Track cash, MoMo, bank, card, customer payments, and daily closing.",
  },
  {
    icon: <Users size={20} />,
    title: "Customers",
    text: "Know who bought, who paid, who still owes, and what needs follow-up.",
  },
  {
    icon: <FileText size={20} />,
    title: "Reports",
    text: "Download daily, weekly, monthly, and custom-date reports without Excel.",
  },
];

const workflow = [
  "Check stock",
  "Sell product",
  "Receive payment",
  "Close with report",
];

const protection = [
  "Owner sees cost, profit, reports, and staff actions.",
  "Staff sees only daily selling and stock tools.",
  "Cost and profit stay hidden from limited staff.",
];

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.shell}>
          <a className={styles.brand} href="/">
            <span className={styles.brandMark}>S</span>
            <span>
              <strong>Suparsale</strong>
              <small>Store Ltd</small>
            </span>
          </a>

          <nav className={styles.navLinks} aria-label="Landing navigation">
            <a href="#modules">Modules</a>
            <a href="#workflow">Workflow</a>
            <a href="#access">Access</a>
          </nav>

          <div className={styles.headerActions}>
            <ThemeToggle />
            <a href="/login" className={styles.loginButton}>
              Login
            </a>
            <a href="/login" className={styles.openButton}>
              <span>Open system</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>
              <BadgeCheck size={15} />
              Business control system for Suparsale Store Ltd
            </span>

            <h1>Know what happened in your shop today.</h1>

            <p>
              Control stock, sales, payments, debts, expenses, staff actions,
              and reports from one clean system built for Suparsale’s daily
              retail work.
            </p>

            <div className={styles.heroActions}>
              <a href="/login" className={styles.primaryCta}>
                Login to system
                <ArrowRight size={16} />
              </a>

              <a href="#modules" className={styles.secondaryCta}>
                View controls
              </a>
            </div>

            <div className={styles.trustGrid}>
              <span>
                <CheckCircle2 size={14} />
                Owner-first
              </span>
              <span>
                <CheckCircle2 size={14} />
                Staff-safe
              </span>
              <span>
                <CheckCircle2 size={14} />
                RWF reports
              </span>
            </div>
          </div>

          <div className={styles.heroBoard}>
            <div className={styles.boardTop}>
              <div>
                <span className={styles.liveDot} />
                <strong>Today’s shop control</strong>
              </div>
              <span>Live</span>
            </div>

            <div className={styles.boardBody}>
              <aside className={styles.boardMenu}>
                <span className={styles.activeMenu}>
                  <Boxes size={14} />
                  Stock
                </span>
                <span>
                  <ShoppingCart size={14} />
                  Sales
                </span>
                <span>
                  <Banknote size={14} />
                  Cash
                </span>
                <span>
                  <ReceiptText size={14} />
                  Reports
                </span>
              </aside>

              <div className={styles.boardContent}>
                <div className={styles.boardHeading}>
                  <div>
                    <small>SUPARSALE STORE LTD</small>
                    <strong>Daily overview</strong>
                  </div>
                  <span>RWF</span>
                </div>

                <div className={styles.boardMetrics}>
                  <div>
                    <span>Sales today</span>
                    <strong>850,000</strong>
                  </div>
                  <div>
                    <span>Stock alerts</span>
                    <strong>3 items</strong>
                  </div>
                </div>

                <div className={styles.boardList}>
                  <div>
                    <span className={styles.listIcon}>
                      <ShoppingCart size={15} />
                    </span>
                    <div>
                      <strong>Samsung Smart TV sold</strong>
                      <small>Paid by MoMo · 14:30</small>
                    </div>
                    <b>550k</b>
                  </div>

                  <div>
                    <span className={styles.listIcon}>
                      <Boxes size={15} />
                    </span>
                    <div>
                      <strong>HDMI Cable 3M low stock</strong>
                      <small>Alert level reached</small>
                    </div>
                    <b>Check</b>
                  </div>

                  <div>
                    <span className={styles.listIcon}>
                      <WalletCards size={15} />
                    </span>
                    <div>
                      <strong>Customer payment received</strong>
                      <small>Cash desk updated</small>
                    </div>
                    <b>Done</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statementSection}>
        <div className={styles.shell}>
          <div className={styles.statementGrid}>
            <div>
              <span className={styles.sectionLabel}>Why this system exists</span>
              <h2>No more guessing from notebooks, Excel, or WhatsApp.</h2>
            </div>

            <div className={styles.statementCards}>
              <div>
                <ShieldCheck size={18} />
                <span>Every sale has proof.</span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Every stock change is recorded.</span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Every payment can be checked.</span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Every report is ready for the owner.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.modulesSection} id="modules">
        <div className={styles.shell}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionLabel}>What it controls</span>
              <h2>One system for the work that moves money.</h2>
            </div>

            <a href="/login" className={styles.sectionButton}>
              Open system
            </a>
          </div>

          <div className={styles.modulesGrid}>
            {modules.map((module) => (
              <article className={styles.moduleCard} key={module.title}>
                <div className={styles.moduleIcon}>{module.icon}</div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.workflowSection} id="workflow">
        <div className={styles.shell}>
          <div className={styles.workflowPanel}>
            <div className={styles.workflowCopy}>
              <span className={styles.sectionLabel}>Daily workflow</span>
              <h2>Simple enough for staff. Strong enough for owner control.</h2>
              <p>
                The flow is clear: check stock, create sale, receive payment,
                and close the day with proof.
              </p>
            </div>

            <div className={styles.workflowSteps}>
              {workflow.map((step, index) => (
                <div className={styles.workflowCard} key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.mobileSection}>
        <div className={`${styles.shell} ${styles.mobileGrid}`}>
          <div>
            <span className={styles.sectionLabel}>Mobile-ready PWA</span>
            <h2>Works cleanly on shop phones and laptops.</h2>
            <p>
              Buttons stay easy to tap, cards stay readable, and the system
              avoids horizontal scrolling on small screens.
            </p>

            <div className={styles.mobileChecks}>
              <span>
                <CheckCircle2 size={15} />
                Phone friendly
              </span>
              <span>
                <CheckCircle2 size={15} />
                Fast daily actions
              </span>
              <span>
                <CheckCircle2 size={15} />
                Clear owner/staff views
              </span>
            </div>
          </div>

          <div className={styles.phoneMock}>
            <div className={styles.phoneTop} />
            <div className={styles.phoneScreen}>
              <small>Overview</small>
              <div>
                <span>Sales today</span>
                <strong>Rwf 850k</strong>
              </div>
              <div>
                <span>Low stock</span>
                <strong>3 products</strong>
              </div>
              <div>
                <span>Payments</span>
                <strong>Cash + MoMo</strong>
              </div>
              <BarChart3 size={86} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.accessSection} id="access">
        <div className={styles.shell}>
          <div className={styles.accessGrid}>
            <div className={styles.ownerCard}>
              <LockKeyhole size={24} />
              <h2>Owner sees the full business picture.</h2>
              <p>
                Product cost, profit, stock value, staff actions, sales,
                payments, expenses, customer debts, and reports stay visible to
                the owner.
              </p>
            </div>

            <div className={styles.staffCard}>
              <Users size={24} />
              <h2>Staff sees only daily tools.</h2>
              <p>
                Staff can sell, add products safely, view useful stock
                information, and record allowed actions without seeing
                owner-only cost data.
              </p>
            </div>
          </div>

          <div className={styles.protectionList}>
            {protection.map((item) => (
              <span key={item}>
                <CheckCircle2 size={15} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerCta}>
            <div>
              <Clock3 size={22} />
              <h2>Built for everyday Suparsale operations.</h2>
              <p>
                Clean enough for staff. Powerful enough for the owner. Focused
                on stock, sales, money, debts, and proof.
              </p>
            </div>

            <a href="/login" className={styles.primaryCta}>
              Login to system
              <ArrowRight size={16} />
            </a>
          </div>

          <div className={styles.footerBottom}>
            <a className={styles.footerBrand} href="/">
              <span className={styles.brandMark}>S</span>
              <span>
                <strong>Suparsale Store Ltd</strong>
                <small>Business control system</small>
              </span>
            </a>

            <span>© 2026 Suparsale Store Ltd</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
