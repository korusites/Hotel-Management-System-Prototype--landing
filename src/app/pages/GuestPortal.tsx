import { useState } from "react";
import { Building2, ChevronLeft, ChevronRight, User, CheckCircle2, CalendarX2 } from "lucide-react";

import { CREAM, GOLD, NAVY, mono, sans, serif } from "../theme";
import { GoldBtn, ResBadge } from "../components/shared";
import { ApiError, api } from "../lib/api";
import type { Reservation } from "../lib/types";

export function GuestPortal({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [canceling, setCanceling] = useState<number | null>(null);

  async function search() {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.guestPortal.myReservations(email);
      setReservations(res);
      setFound(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível buscar suas reservas.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCancel(id: number) {
    setError(null);
    try {
      const updated = await api.guestPortal.cancel(id, email);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível cancelar a reserva.");
    } finally {
      setCanceling(null);
    }
  }

  return (
    <div style={{ backgroundColor: CREAM, fontFamily: sans }} className="min-h-screen">
      <div style={{ backgroundColor: NAVY }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"><ChevronLeft size={15} />Voltar</button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: GOLD }}><Building2 size={13} className="text-white" /></div>
            <span className="text-white font-bold text-sm" style={{ fontFamily: serif }}>Grand Palácio</span>
          </div>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: serif, color: NAVY }}>Minhas Reservas</h2>
          <p className="text-sm text-muted-foreground">Consulte e gerencie suas reservas no Grand Palácio</p>
        </div>

        {!found ? (
          <div className="max-w-sm mx-auto bg-card rounded-xl border border-border p-6">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "#EFEBE3" }}>
              <User size={24} style={{ color: GOLD }} />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-5">Informe o e-mail usado na reserva.</p>
            <div className="space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <GoldBtn onClick={search} full disabled={loading}>{loading ? "Buscando..." : "Buscar Reservas"}</GoldBtn>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Reservas para <strong className="text-foreground">{email}</strong></p>
              <button onClick={() => { setFound(false); setEmail(""); setReservations([]); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sair</button>
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            {reservations.length === 0 ? (
              <p className="text-center py-16 text-sm text-muted-foreground">Nenhuma reserva encontrada para este e-mail.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div key={r.id} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ fontFamily: mono }}>{r.code}</span>
                          <ResBadge status={r.status} />
                        </div>
                        <p className="font-semibold" style={{ fontFamily: serif }}>{r.room_type} — Quarto {r.room_number}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>In: <strong className="text-foreground">{r.checkin}</strong></span>
                          <ChevronRight size={12} />
                          <span>Out: <strong className="text-foreground">{r.checkout}</strong></span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.nights} noite{r.nights > 1 ? "s" : ""} · {r.guests} hóspede{r.guests > 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color: GOLD, fontFamily: serif }}>R$ {r.total.toLocaleString("pt-BR")}</p>
                        {r.status !== "cancelada" && r.status !== "checkout" && (
                          <button onClick={() => setCanceling(r.id)}
                            className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto transition-colors">
                            <CalendarX2 size={11} />Cancelar reserva
                          </button>
                        )}
                      </div>
                    </div>

                    {canceling === r.id && (
                      <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "#fdecea", border: "1px solid rgba(184,50,50,0.15)" }}>
                        <p className="text-sm font-semibold text-red-700 mb-1">Cancelar esta reserva?</p>
                        <p className="text-xs text-red-600 mb-3">Esta ação não poderá ser desfeita. Verifique nossa política de cancelamento.</p>
                        <div className="flex gap-2">
                          <button onClick={() => confirmCancel(r.id)}
                            className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                            Confirmar Cancelamento
                          </button>
                          <button onClick={() => setCanceling(null)}
                            className="px-4 py-1.5 rounded text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                            Manter Reserva
                          </button>
                        </div>
                      </div>
                    )}
                    {r.status === "cancelada" && (
                      <div className="mt-3 p-3 rounded-lg bg-muted text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 size={12} style={{ color: "#3d8c6e" }} />
                        Reserva cancelada com sucesso.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
