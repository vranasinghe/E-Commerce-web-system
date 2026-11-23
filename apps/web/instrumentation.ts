// Runs once when the Next.js server starts (Node runtime only). Resets demo data
// whose 24-hour window has ended, now and then every hour. This also runs on each
// demo login, which covers hosts where a long-running timer is not available.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { isDemoLoginEnabled, purgeExpiredDemoData } = await import("./lib/demo");
  if (!isDemoLoginEnabled()) return;

  const run = () =>
    purgeExpiredDemoData()
      .then((n) => n > 0 && console.log(`[demo] reset ${n} demo account(s)`))
      .catch((err) => console.error("[demo] cleanup failed", err));

  void run();
  setInterval(run, 60 * 60 * 1000).unref();
}
