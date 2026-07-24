import { useState, type ReactNode } from "react";
import { BedDouble, CalendarCheck, DollarSign, Download, UserCog, Users, Wrench } from "lucide-react";

import { SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import { PERIOD_REPORTS, type ReportType } from "../../lib/types";
import { useStaffAuth } from "../AuthContext";

const rpts: { type: ReportType; name: string; desc: string; icon: ReactNode; adminOnly?: boolean }[] = [
  { type: "rooms", name: "Ocupação", desc: "Quartos e status atual", icon: <BedDouble size={17} /> },
  { type: "financial", name: "Financeiro", desc: "Receita por período", icon: <DollarSign size={17} /> },
  { type: "reservations", name: "Reservas", desc: "Histórico por período", icon: <CalendarCheck size={17} /> },
  { type: "guests", name: "Hóspedes", desc: "Perfil e histórico de estadas", icon: <Users size={17} /> },
  { type: "services", name: "Serviços", desc: "Uso por período", icon: <Wrench size={17} /> },
  { type: "staff", name: "Equipe", desc: "Escala e dados", icon: <UserCog size={17} />, adminOnly: true },
];

type Period = { start: string; end: string };

export function ReportsView() {
  const { role } = useStaffAuth();
  const [downloading, setDownloading] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periods, setPeriods] = useState<Record<string, Period>>({});

  const visible = rpts.filter((r) => !r.adminOnly || role === "administrador" || role === "gerente");

  function setPeriod(type: ReportType, field: keyof Period, value: string) {
    setPeriods((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  }

  async function handleDownload(type: ReportType) {
    const needsPeriod = PERIOD_REPORTS.includes(type);
    const period = periods[type];
    if (needsPeriod && (!period?.start || !period?.end)) {
      setError("Selecione o período (data inicial e final) antes de gerar este relatório.");
      return;
    }
    setDownloading(type);
    setError(null);
    try {
      await api.reports.download(type, needsPeriod ? period : undefined);
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
        {visible.map((r) => {
          const needsPeriod = PERIOD_REPORTS.includes(r.type);
          const period = periods[r.type] ?? { start: "", end: "" };
          return (
            <div key={r.type} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "#EFEBE3", color: "#B8914A" }}>{r.icon}</div>
              <h3 className="font-medium text-foreground text-sm mb-0.5">{r.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
              {needsPeriod && (
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  <input
                    type="date"
                    value={period.start}
                    onChange={(e) => setPeriod(r.type, "start", e.target.value)}
                    className="px-2 py-1.5 bg-input-background border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <input
                    type="date"
                    value={period.end}
                    onChange={(e) => setPeriod(r.type, "end", e.target.value)}
                    className="px-2 py-1.5 bg-input-background border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              )}
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
          );
        })}
      </div>
    </div>
  );
}
