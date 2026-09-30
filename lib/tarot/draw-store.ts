import type { SpreadId } from "@/types/spread";
import type { ShuffledCard } from "@/types/tarot";

/**
 * Persisted server-side draw session record for Server Invariant Checks (SDD §5 Guard).
 */
export interface DrawSession {
  drawId: string;
  spreadId: SpreadId;
  reversedEnabled: boolean;
  deck: ShuffledCard[];
  createdAt: number;
}

/**
 * In-memory storage for active draw sessions.
 * Sessions expire after 1 hour (3,600,000 ms).
 */
const SESSION_TTL_MS = 60 * 60 * 1000;
const MAX_SESSIONS = 5000;

const sessionStore = new Map<string, DrawSession>();

/**
 * Removes sessions that have exceeded the TTL.
 */
export function cleanupExpiredSessions(now: number = Date.now()): void {
  for (const [id, session] of sessionStore.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessionStore.delete(id);
    }
  }
}

/**
 * Saves a newly generated draw session to the in-memory store.
 */
export function saveDrawSession(session: DrawSession): void {
  cleanupExpiredSessions();

  // If store is still at maximum capacity, evict the oldest session
  if (sessionStore.size >= MAX_SESSIONS) {
    const oldestKey = sessionStore.keys().next().value;
    if (oldestKey) {
      sessionStore.delete(oldestKey);
    }
  }

  sessionStore.set(session.drawId, session);
}

/**
 * Retrieves an active draw session by its unique ID.
 * Returns undefined if not found or expired.
 */
export function getDrawSession(drawId: string, now: number = Date.now()): DrawSession | undefined {
  const session = sessionStore.get(drawId);
  if (!session) {
    return undefined;
  }

  if (now - session.createdAt > SESSION_TTL_MS) {
    sessionStore.delete(drawId);
    return undefined;
  }

  return session;
}

/**
 * Deletes a draw session once completed or invalidated.
 */
export function deleteDrawSession(drawId: string): boolean {
  return sessionStore.delete(drawId);
}

/**
 * Clears all active sessions (primarily for test isolation).
 */
export function clearDrawSessions(): void {
  sessionStore.clear();
}

/**
 * Returns current count of stored sessions (for monitoring and tests).
 */
export function getDrawSessionCount(): number {
  return sessionStore.size;
}
