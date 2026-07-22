import { useState } from "react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { GoldBtn, OutlineBtn, inputClass, labelClass } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Staff, StaffRole, StaffStatus } from "../../lib/types";
import { useStaffAuth } from "../AuthContext";

const ROLES: StaffRole[] = ["administrador", "gerente", "recepcionista", "governanta"];
const STATUSES: StaffStatus[] = ["ativo", "inativo"];

export function StaffFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Staff | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { role: currentRole } = useStaffAuth();
  const isAdmin = currentRole === "administrador";

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? "recepcionista",
    department: initial?.department ?? "",
    since: initial?.since ?? new Date().toISOString().slice(0, 10),
    status: initial?.status ?? "ativo",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      if (initial) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          role: form.role,
          department: form.department || null,
          status: form.status,
        };
        if (form.password) payload.password = form.password;
        await api.staff.update(initial.id, payload);
      } else {
        await api.staff.create({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          role: form.role as StaffRole,
          department: form.department || null,
          since: form.since,
          password: form.password,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o funcionário.");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Acesso restrito</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Apenas administradores podem criar ou editar funcionários.</p>
          <DialogFooter><OutlineBtn onClick={onClose}>Fechar</OutlineBtn></DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? `Editar ${initial.name}` : "Novo funcionário"}</DialogTitle>
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
            <label className={labelClass}>Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Papel</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })} className={inputClass}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Departamento</label>
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass} />
          </div>
          {initial ? (
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StaffStatus })} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className={labelClass}>Desde</label>
              <input type="date" value={form.since} onChange={(e) => setForm({ ...form, since: e.target.value })} className={inputClass} />
            </div>
          )}
          <div className="col-span-2">
            <label className={labelClass}>{initial ? "Nova senha (deixe em branco para manter)" : "Senha *"}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <DialogFooter>
          <OutlineBtn onClick={onClose}>Cancelar</OutlineBtn>
          <GoldBtn onClick={submit} disabled={saving || !form.name || !form.email || (!initial && !form.password)}>
            {saving ? "Salvando..." : "Salvar"}
          </GoldBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
