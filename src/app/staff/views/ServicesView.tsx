import { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

import { AddBtn, SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { Service } from "../../lib/types";
import { ServiceFormModal } from "../modals/ServiceFormModal";
import { useStaffAuth } from "../AuthContext";

export function ServicesView() {
  const { role } = useStaffAuth();
  const canManage = role === "administrador" || role === "gerente";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  function refetch() {
    setLoading(true);
    api.services
      .list()
      .then(setServices)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os serviços."))
      .finally(() => setLoading(false));
  }

  useEffect(refetch, []);

  async function handleDelete(service: Service) {
    if (!confirm(`Excluir o serviço "${service.name}"?`)) return;
    try {
      await api.services.remove(service.id);
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível excluir o serviço.");
    }
  }

  return (
    <div>
      <SHeader title="Serviços Adicionais" action={canManage ? <AddBtn label="Novo Serviço" onClick={() => { setEditing(null); setModalOpen(true); }} /> : undefined} />
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando serviços...</p>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Serviço</span><span>Categoria</span><span>Preço</span><span>Usos</span><span>Status</span><span>Ações</span>
          </div>
          {services.map((s) => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 items-center">
              <p className="text-sm font-medium text-foreground">{s.name}</p>
              <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground w-fit">{s.category}</span>
              <div><p className="text-sm font-medium">R$ {s.price}</p><p className="text-xs text-muted-foreground">{s.unit}</p></div>
              <p className="text-sm text-foreground">{s.used}x</p>
              <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${s.available ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{s.available ? "Disponível" : "Indisponível"}</span>
              {canManage ? (
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(s); setModalOpen(true); }} className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12} /></button>
                  <button onClick={() => handleDelete(s)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
              ) : <span />}
            </div>
          ))}
        </div>
      )}
      {modalOpen && (
        <ServiceFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refetch(); }}
        />
      )}
    </div>
  );
}
