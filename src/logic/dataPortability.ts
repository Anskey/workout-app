import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { pickSyncableState, useStore, type SyncableState } from '@/store/useStore';
import { todayISODate } from './dates';

export interface ExportResult {
  ok: boolean;
  error?: string;
}

/** Writes the current data to a JSON file in cache and opens the share sheet so it can
 * be saved to Drive/Files/email/etc. — a manual backup independent of cloud sync. */
export async function exportData(): Promise<ExportResult> {
  try {
    const data = pickSyncableState(useStore.getState());
    const json = JSON.stringify(data, null, 2);
    const dir = new Directory(Paths.cache, 'sculpt-exports');
    if (!dir.exists) dir.create({ intermediates: true });
    const file = new File(dir, `sculpt-backup-${todayISODate()}.json`);
    if (file.exists) file.delete();
    file.write(json);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Sculpt data' });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Export failed.' };
  }
}

function isSyncableState(value: unknown): value is SyncableState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.profile === 'object' &&
    v.profile !== null &&
    Array.isArray(v.programs) &&
    typeof v.activeProgramId === 'string' &&
    Array.isArray(v.measurements) &&
    Array.isArray(v.nutritionLogs) &&
    Array.isArray(v.sessionLogs)
  );
}

export interface ImportResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

/** Lets the user pick a previously-exported JSON file and replaces all local data with
 * it. Destructive by design (this is a full restore, not a merge) — callers should
 * confirm with the user before invoking this. */
export async function importData(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (picked.canceled) return { ok: false, cancelled: true };

  try {
    const file = new File(picked.assets[0].uri);
    const text = await file.text();
    const parsed: unknown = JSON.parse(text);
    if (!isSyncableState(parsed)) {
      return { ok: false, error: "That file doesn't look like a Sculpt backup." };
    }
    useStore.getState().hydrateFromCloud(parsed);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'That file could not be read as JSON.' };
  }
}
