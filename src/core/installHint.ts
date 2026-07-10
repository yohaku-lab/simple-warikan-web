export type InstallHintPlatform = "ios" | "android";

/**
 * Decides whether to nudge the user to add the app to their home screen, and with which
 * platform-specific wording. Pure so it can be unit-tested; the DOM-reading wrapper lives
 * in InstallHintBanner.
 *
 * The nudge matters most on iOS: Safari deletes a site's localStorage after 7 days without
 * a visit (ITP), but home-screen web apps are exempt, so installing is the difference
 * between "data can silently vanish" and "data stays like a native app".
 */
export function detectInstallHintPlatform(userAgent: string, isStandalone: boolean): InstallHintPlatform | null {
  if (isStandalone) return null;
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return null;
}

/** True when already running as a home-screen web app (nothing to nudge about). */
export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari's non-standard flag, set when launched from the Home Screen.
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
