import { useEffect, useState } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { GOLD } from "../../theme";
import { SHeader, StatCard } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { RevenuePoint } from "../../lib/types";

export function FinanceView() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard
      .revenue()
      .then(setRevenue)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os dados financeiros."))
      .finally(() => setLoading(false));
  }, []);

  const total = revenue.reduce((s, d) => s + d.receita, 0);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div>
      <SHeader title="Financeiro" sub="Receita — últimos 12 meses" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard title="Receita (12 meses)" value={`R$ ${(total / 1000).toFixed(0)}k`} icon={<TrendingUp size={16} />} />
        <StatCard title="Média mensal" value={`R$ ${(total / (revenue.length || 1) / 1000).toFixed(0)}k`} icon={<DollarSign size={16} />} />
      </div>
      <div className="bg-card rounded-lg border border-border p-4 mb-4">
        <p className="text-sm font-medium mb-3">Receita por mês</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenue} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            <Bar dataKey="receita" name="Receita" fill={GOLD} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-2 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Mês</span><span>Receita</span>
        </div>
        {revenue.map((d) => (
          <div key={d.month} className="grid grid-cols-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 text-sm items-center">
            <span className="font-medium">{d.month}</span>
            <span className="text-emerald-600">R$ {d.receita.toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
