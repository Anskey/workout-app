import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { firestore, isFirebaseConfigured } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { pickSyncableState, useStore, type SyncableState } from '@/store/useStore';

let stopStoreWatch: (() => void) | null = null;
let stopSnapshot: Unsubscribe | null = null;
let applyingRemote = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let firstSyncWaiters: (() => void)[] = [];

function resolveFirstSyncWaiters() {
  const waiters = firstSyncWaiters;
  firstSyncWaiters = [];
  waiters.forEach((resolve) => resolve());
}

/** Resolves once the first Firestore snapshot after signing in has been applied (or
 * seeded, if this account has no cloud data yet) — or after `timeoutMs`, so a slow
 * network doesn't strand the caller forever. Lets a screen that just signed someone
 * in wait for their real data to actually arrive before deciding where to navigate,
 * instead of acting on whatever was on the device a moment before. */
export function waitForFirstCloudSync(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    firstSyncWaiters.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function userDocRef(uid: string) {
  if (!firestore) throw new Error('Firestore is not configured (missing .env.local values)');
  return doc(firestore, 'users', uid);
}

async function pushNow(uid: string) {
  if (!firestore) return;
  const data = pickSyncableState(useStore.getState());
  await setDoc(userDocRef(uid), data);
}

function schedulePush(uid: string) {
  if (pushTimer) clearTimeout(pushTimer);
  // Debounced: logging a set, editing a field, etc. fire several store updates in a
  // row — wait for things to settle before writing to Firestore.
  pushTimer = setTimeout(() => {
    pushNow(uid).catch((e) => console.warn('[cloudSync] push failed', e));
  }, 1500);
}

function startWatchingLocalChanges(uid: string) {
  stopStoreWatch?.();
  stopStoreWatch = useStore.subscribe(() => {
    if (applyingRemote) return;
    schedulePush(uid);
  });
}

function startWatchingCloud(uid: string) {
  stopSnapshot?.();
  stopSnapshot = onSnapshot(
    userDocRef(uid),
    (snap) => {
      // Our own optimistic write echoing back — the store already has this data.
      if (snap.metadata.hasPendingWrites) return;
      const data = snap.data() as SyncableState | undefined;
      if (!data) {
        // First time this account has synced from any device: seed the cloud with
        // whatever's here locally, so existing data isn't lost.
        pushNow(uid).catch((e) => console.warn('[cloudSync] initial push failed', e));
        resolveFirstSyncWaiters();
        return;
      }
      applyingRemote = true;
      useStore.getState().hydrateFromCloud(data);
      applyingRemote = false;
      resolveFirstSyncWaiters();
    },
    (e) => console.warn('[cloudSync] snapshot error', e)
  );
}

function stopSyncing() {
  stopStoreWatch?.();
  stopStoreWatch = null;
  stopSnapshot?.();
  stopSnapshot = null;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = null;
}

/** Call once near app startup. Wires Firebase auth state to Firestore sync:
 * signing in pulls (or seeds, if this is the first device for the account) cloud
 * data and starts watching local changes to push; signing out just stops syncing —
 * local data stays put as the last-synced cache. */
let didInit = false;

export function initCloudSync() {
  if (!isFirebaseConfigured || didInit) return;
  didInit = true;

  const apply = (uid: string | undefined) => {
    if (uid) {
      startWatchingCloud(uid);
      startWatchingLocalChanges(uid);
    } else {
      stopSyncing();
    }
  };

  useAuthStore.subscribe((state, prev) => {
    if (state.user?.uid === prev.user?.uid) return;
    apply(state.user?.uid);
  });

  // Auth may already have resolved (a persisted session) before this runs.
  apply(useAuthStore.getState().user?.uid);
}
