import { useState, type ReactNode } from "react";
import { BedDouble, CalendarCheck, DollarSign, Download, UserCog, Users, Wrench } from "lucide-react";

import { SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { ReportType } from "../../lib/types";
import { useStaffAuth } from "../AuthContext";

const rpts: { type: ReportType; name: string; desc: string; icon: ReactNode; adminOnly?: boolean }[] = [
  { type: "rooms", name: "Ocupação", desc: "Quartos e status atual", icon: <BedDouble size={17} /> },
  { type: "financial", name: "Financeiro", desc: "Receita dos últimos 12 meses", icon: <DollarSign size={17} /> },
  { type: "reservations", name: "Reservas", desc: "Histórico completo", icon: <CalendarCheck size={17} /> },
  { type: "guests", name: "Hóspedes", desc: "Perfil e histórico de estadas", icon: <Users size={17} /> },
  { type: "services", name: "Serviços", desc: "Uso por serviço adicional", icon: <Wrench size={17} /> },
  { type: "staff", name: "Equipe", desc: "Escala e dados", icon: <UserCog size={17} />, adminOnly: true },
];

export function ReportsView() {
  const { role } = useStaffAuth();
  const [downloading, setDownloading] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = rpts.filter((r) => !r.adminOnly || role === "administrador" || role === "gerente");

  async function handleDownload(type: ReportType) {
    setDownloading(type);
    setError(null);
    try {
      await api.reports.download(type);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível gerar o relatório.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <SHeader title="Relatórios" sub="Gere e exporte em CSV" />
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((r) => (
          <div key={r.type} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "#EFEBE3", color: "#B8914A" }}>{r.icon}</div>
            <h3 className="font-medium text-foreground text-sm mb-0.5">{r.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
            <div className="flex items-center justify-end">
              <button
                onClick={() => handleDownload(r.type)}
                disabled={downloading === r.type}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Download size={10} />
                {downloading === r.type ? "Gerando..." : "Gerar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
