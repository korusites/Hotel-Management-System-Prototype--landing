import type { StaffRole } from "./types";

const STORAGE_KEY = "hotel_staff_session";

export interface Session {
  token: string;
  role: StaffRole;
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
