"use client";

import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { loginUser, saveToken } from "@/lib/auth";

import { AsyncButton } from "@/components/ui/AsyncButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

   const [email, setEmail] = useState("lucrurangwa@gmail.com");
  const [password, setPassword] = useState("Owner@123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email.trim(), password);
      saveToken(result.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.backLink} href="/">
          <ArrowLeft size={15} />
          <span>Back</span>
        </a>

        <a className={styles.brand} href="/">
          <span className={styles.brandMark}>S</span>
          <span>
            <strong>Suparsale</strong>
            <small>Store Ltd</small>
          </span>
        </a>

        <ThemeToggle />
      </header>

      <section className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <LockKeyhole size={22} />
            </div>

            <h1>Login</h1>
            <p>Access Suparsale Store Ltd business control system.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error ? <div className={styles.errorBox}>{error}</div> : null}

            <label className={styles.formGroup}>
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span>Password</span>

              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <AsyncButton loading={loading} type="submit">
              <LockKeyhole size={15} />
              Login to system
            </AsyncButton>
          </form>
        </div>
      </section>
    </main>
  );
}
