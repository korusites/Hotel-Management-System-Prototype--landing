import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Eye, LogOut, Search, X } from "lucide-react";

import { NAVY, serif } from "../../theme";
import { ResBadge, SHeader, resStatusCfg } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Reservation, ReservationStatus } from "../../lib/types";
import { ReservationServicesModal } from "../modals/ReservationServicesModal";
import { useStaffAuth } from "../AuthContext";

export function ReservationsView() {
  const { role } = useStaffAuth();
  const canManage = role === "administrador" || role === "gerente" || role === "recepcionista";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<ReservationStatus | "todas">("todas");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Reservation | null>(null);

  function refetch() {
    setLoading(true);
    api.reservations
      .list(tab === "todas" ? undefined : tab)
      .then(setReservations)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar as reservas."))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, [tab]);

  async function handleStatusChange(reservation: Reservation, status: ReservationStatus, confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    try {
      await api.reservations.update(reservation.id, { status });
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível atualizar a reserva.");
    }
  }

  const filtered = reservations.filter((r) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      r.guest_name.toLowerCase().includes(needle) ||
      r.code.toLowerCase().includes(needle) ||
      r.room_number.toLowerCase().includes(needle)
    );
  });

  return (
    <div>
      <SHeader title="Reservas" sub="Gestão completa" />
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit flex-wrap">
          {(["todas", "confirmada", "pendente", "cancelada", "checkout"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "todas" ? "Todas" : resStatusCfg[t].label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por hóspede, código ou quarto..."
            className="w-full pl-8 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando reservas...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const isTerminal = r.status === "cancelada" || r.status === "checkout";
            return (
              <div key={r.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: NAVY }}>{r.room_number}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-foreground text-sm">{r.guest_name}</p><span className="text-xs text-muted-foreground">{r.code}</span><ResBadge status={r.status} /></div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.room_type} · {r.guests} hóspede{r.guests > 1 ? "s" : ""} · {r.nights} noites</p>
                      <div className="flex items-center gap-2 mt-1"><span className="text-xs text-muted-foreground">In: <strong className="text-foreground">{r.checkin}</strong></span><ChevronRight size={11} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Out: <strong className="text-foreground">{r.checkout}</strong></span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right"><p className="text-base font-bold text-foreground" style={{ fontFamily: serif }}>R$ {r.total.toLocaleString("pt-BR")}</p></div>
                    <div className="flex gap-1">
                      <button onClick={() => setViewing(r)} className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Serviços consumidos"><Eye size={13} /></button>
                      {canManage && !isTerminal && (
                        <>
                          {r.status === "pendente" && (
                            <button
                              onClick={() => handleStatusChange(r, "confirmada", `Ativar a reserva ${r.code}?`)}
                              title="Ativar reserva"
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors">
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(r, "checkout", `Encerrar a reserva ${r.code}?`)}
                            title="Encerrar reserva"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <LogOut size={13} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(r, "cancelada", `Cancelar a reserva ${r.code}?`)}
                            title="Cancelar reserva"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewing && <ReservationServicesModal reservation={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
