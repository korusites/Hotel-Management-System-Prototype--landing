import { useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Guest } from "../../lib/types";

export function GuestFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Guest | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    cpf: initial?.cpf ?? "",
    city: initial?.city ?? "",
    rating: initial?.rating ?? 5,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    const payload = { ...form, city: form.city || null, rating: Number(form.rating) };
    try {
      if (initial) await api.guests.update(initial.id, payload);
      else await api.guests.create(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o hóspede.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? `Editar ${initial.name}` : "Novo hóspede"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Nome *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>E-mail *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone *</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CPF *</label>
            <input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cidade</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Avaliação (1-5)</label>
            <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <GoldBtn onClick={submit} disabled={saving || !form.name || !form.email}>{saving ? "Salvando..." : "Salvar"}</GoldBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
