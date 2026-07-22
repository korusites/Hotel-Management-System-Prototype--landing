import { useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Service } from "../../lib/types";

export function ServiceFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    price: initial?.price ?? 0,
    unit: initial?.unit ?? "",
    available: initial?.available ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    const payload = { ...form, price: Number(form.price) };
    try {
      if (initial) await api.services.update(initial.id, payload);
      else await api.services.create(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? `Editar ${initial.name}` : "Novo serviço"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Nome *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Categoria *</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unidade *</label>
            <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="por pessoa, por hora..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Preço (R$)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="available" type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
            <label htmlFor="available" className="text-sm text-foreground">Disponível</label>
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <GoldBtn onClick={submit} disabled={saving || !form.name || !form.category || !form.unit}>{saving ? "Salvando..." : "Salvar"}</GoldBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
