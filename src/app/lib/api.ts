import { loadSession } from "./auth";
import type {
  DashboardStats,
  Guest,
  GuestInput,
  OccupancyPoint,
  Reservation,
  ReservationStatus,
  RevenuePoint,
  Room,
  RoomInput,
  RoomStatus,
  RoomType,
  Service,
  ServiceInput,
  Staff,
  StaffInput,
} from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(fn: UnauthorizedHandler | null): void {
  unauthorizedHandler = fn;
}

async function extractDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ");
    }
  } catch {
    // sem corpo JSON, usa o texto de status abaixo
  }
  return res.statusText || `Erro ${res.status}`;
}

function authHeaders(): Record<string, string> {
  const session = loadSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    },
  });

  if (res.status === 401) {
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    throw new ApiError(await extractDetail(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function qs(params: Record<string, string | number | boolean | undefined>): string {
  const usable = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  if (usable.length === 0) return "";
  const search = new URLSearchParams();
  usable.forEach(([key, value]) => search.set(key, String(value)));
  return `?${search.toString()}`;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },

  rooms: {
    list: (status?: RoomStatus) => request<Room[]>(`/rooms${qs({ status_filter: status })}`),
    availability: (checkin: string, checkout: string, pax: number, type?: RoomType) =>
      request<Room[]>(`/rooms/availability${qs({ checkin, checkout, pax, type })}`),
    create: (data: RoomInput) => request<Room>("/rooms", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<RoomInput>) =>
      request<Room>(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/rooms/${id}`, { method: "DELETE" }),
  },

  guests: {
    list: (q?: string) => request<Guest[]>(`/guests${qs({ q })}`),
    create: (data: GuestInput) => request<Guest>("/guests", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<GuestInput>) =>
      request<Guest>(`/guests/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/guests/${id}`, { method: "DELETE" }),
  },

  reservations: {
    list: (status?: ReservationStatus) =>
      request<Reservation[]>(`/reservations${qs({ status_filter: status })}`),
    update: (id: number, data: { status?: ReservationStatus; checkin?: string; checkout?: string; guests?: number }) =>
      request<Reservation>(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  staff: {
    list: () => request<Staff[]>("/staff"),
    create: (data: StaffInput) => request<Staff>("/staff", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<StaffInput>) =>
      request<Staff>(`/staff/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/staff/${id}`, { method: "DELETE" }),
  },

  services: {
    list: () => request<Service[]>("/services"),
    create: (data: ServiceInput) => request<Service>("/services", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ServiceInput>) =>
      request<Service>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/services/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    stats: () => request<DashboardStats>("/dashboard/stats"),
    revenue: () => request<RevenuePoint[]>("/dashboard/revenue"),
    occupancy: () => request<OccupancyPoint[]>("/dashboard/occupancy"),
  },

  guestPortal: {
    myReservations: (email: string) =>
      request<Reservation[]>(`/guest-portal/reservations${qs({ email })}`),
    createBooking: (data: {
      room_id: number;
      checkin: string;
      checkout: string;
      guests: number;
      guest_name: string;
      guest_email: string;
      guest_phone: string;
      guest_cpf: string;
    }) => request<Reservation>("/guest-portal/bookings", { method: "POST", body: JSON.stringify(data) }),
    cancel: (id: number, guestEmail: string) =>
      request<Reservation>(`/guest-portal/reservations/${id}/cancel${qs({ guest_email: guestEmail })}`, {
        method: "POST",
      }),
  },
};
