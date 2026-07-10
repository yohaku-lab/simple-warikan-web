/**
 * Asks the browser not to evict this origin's storage under disk pressure
 * (navigator.storage.persist()). Best-effort: browsers may deny or ignore it, and Firefox
 * shows a permission dialog — so this is called when the user records/imports data (a
 * meaningful moment) rather than on page load.
 */
export async function requestPersistentStorage(): Promise<void> {
  try {
    const storage = navigator.storage;
    if (!storage?.persist) return;
    if (storage.persisted && (await storage.persisted())) return;
    await storage.persist();
  } catch {
    // Unsupported or denied — persistence stays best-effort.
  }
}
