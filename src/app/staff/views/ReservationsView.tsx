import { useEffect, useState } from "react";
import { ChevronRight, Eye, X } from "lucide-react";

import { NAVY, serif } from "../../theme";
import { ResBadge, SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Reservation, ReservationStatus } from "../../lib/types";
import { ReservationServicesModal } from "../modals/ReservationServicesModal";
import { useStaffAuth } from "../AuthContext";

export function ReservationsView() {
  const { role } = useStaffAuth();
  const canManage = role === "administrador" || role === "gerente" || role === "recepcionista";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tab, setTab] = useState<ReservationStatus | "todas">("todas");
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

  async function handleCancel(reservation: Reservation) {
    if (!confirm(`Cancelar a reserva ${reservation.code}?`)) return;
    try {
      await api.reservations.update(reservation.id, { status: "cancelada" });
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível cancelar a reserva.");
    }
  }

  return (
    <div>
      <SHeader title="Reservas" sub="Gestão completa" />
      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit flex-wrap">
        {(["todas", "confirmada", "pendente", "cancelada", "checkout"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "todas" ? "Todas" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando reservas...</p>
      ) : (
        <div className="space-y-2">
          {reservations.map((r) => (
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
                    {canManage && r.status !== "cancelada" && r.status !== "checkout" && (
                      <button onClick={() => handleCancel(r)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><X size={13} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {viewing && <ReservationServicesModal reservation={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
