import { BarChart3, BedDouble, CalendarCheck, DollarSign, Download, UserCog, Users, Wrench } from "lucide-react";

import { SHeader } from "../../components/shared";

const rpts = [
  { name: "Ocupação", desc: "Taxa por período", icon: <BedDouble size={17} />, last: "21/07" },
  { name: "Financeiro", desc: "Receitas e lucro", icon: <DollarSign size={17} />, last: "21/07" },
  { name: "Reservas", desc: "Histórico completo", icon: <CalendarCheck size={17} />, last: "20/07" },
  { name: "Hóspedes", desc: "Perfil e histórico", icon: <Users size={17} />, last: "18/07" },
  { name: "Serviços", desc: "Mais solicitados", icon: <Wrench size={17} />, last: "15/07" },
  { name: "Equipe", desc: "Escala e dados", icon: <UserCog size={17} />, last: "01/07" },
];

// Sem endpoint de geração de relatório no backend ainda — tela permanece ilustrativa.
export function ReportsView() {
  return (
    <div>
      <SHeader title="Relatórios" sub="Gere e exporte" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {rpts.map((r) => (
          <div key={r.name} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: "#EFEBE3", color: "#B8914A" }}>{r.icon}</div>
            <h3 className="font-medium text-foreground text-sm mb-0.5">{r.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{r.last}</span>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"><Download size={10} />Gerar</button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5"><BarChart3 size={12} />Geração de relatórios ainda não tem suporte no backend — botões são ilustrativos.</p>
    </div>
  );
}
