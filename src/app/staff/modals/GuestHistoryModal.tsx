import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { OutlineBtn, ResBadge } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Guest, Reservation } from "../../lib/types";

export function GuestHistoryModal({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.guests
      .reservations(guest.id)
      .then(setReservations)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar o histórico."))
      .finally(() => setLoading(false));
  }, [guest.id]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Histórico de reservas — {guest.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma reserva encontrada para este hóspede.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.code}</span>
                    <ResBadge status={r.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.room_type} — Qto {r.room_number} · {r.checkin} → {r.checkout}
                  </p>
                </div>
                <span className="font-semibold">R$ {r.total.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <OutlineBtn onClick={onClose}>Fechar</OutlineBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
