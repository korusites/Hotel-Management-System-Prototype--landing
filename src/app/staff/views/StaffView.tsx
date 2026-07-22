import { useEffect, useState } from "react";
import { Edit2, Mail, Phone, Trash2 } from "lucide-react";

import { NAVY } from "../../theme";
import { AddBtn, SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Staff } from "../../lib/types";
import { StaffFormModal } from "../modals/StaffFormModal";
import { useStaffAuth } from "../AuthContext";

export function StaffView() {
  const { role } = useStaffAuth();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);

  const canView = role === "administrador" || role === "gerente";
  const canManage = role === "administrador";

  function refetch() {
    setLoading(true);
    api.staff
      .list()
      .then(setStaff)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os funcionários."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (canView) refetch();
    else setLoading(false);
  }, [canView]);

  async function handleDelete(member: Staff) {
    if (!confirm(`Excluir o funcionário ${member.name}?`)) return;
    try {
      await api.staff.remove(member.id);
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível excluir o funcionário.");
    }
  }

  if (!canView) {
    return (
      <div>
        <SHeader title="Funcionários" />
        <p className="text-sm text-muted-foreground">Apenas administradores e gerentes podem visualizar a equipe.</p>
      </div>
    );
  }

  return (
    <div>
      <SHeader title="Funcionários" sub={`${staff.length} colaboradores`} action={canManage ? <AddBtn label="Novo Funcionário" onClick={() => { setEditing(null); setModalOpen(true); }} /> : undefined} />
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando funcionários...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {staff.map((s) => (
            <div key={s.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
                  {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm truncate">{s.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${s.status === "ativo" ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{s.status === "ativo" ? "Ativo" : "Inativo"}</span>
                  </div>
                  <p className="text-xs font-medium capitalize" style={{ color: "#B8914A" }}>{s.role}</p>
                  <p className="text-xs text-muted-foreground">{s.department}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail size={10} /><span className="truncate">{s.email}</span></div>
                {s.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone size={10} />{s.phone}</div>}
              </div>
              {canManage && (
                <div className="flex gap-1 mt-3 justify-end">
                  <button onClick={() => { setEditing(s); setModalOpen(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(s)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <StaffFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refetch(); }}
        />
      )}
    </div>
  );
}
