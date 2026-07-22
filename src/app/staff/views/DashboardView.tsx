import { useEffect, useState } from "react";
import { BedDouble, CalendarCheck, DollarSign, Users } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import { GOLD, serif } from "../../theme";
import { StatCard, ResBadge } from "../../components/shared";
import { api } from "../../lib/api";
import type { DashboardStats, OccupancyPoint, Reservation, RevenuePoint } from "../../lib/types";

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyPoint[]>([]);
  const [recent, setRecent] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.stats(),
      api.dashboard.revenue(),
      api.dashboard.occupancy(),
      api.reservations.list(),
    ])
      .then(([s, r, o, res]) => {
        setStats(s);
        setRevenue(r);
        setOccupancy(o);
        setRecent(res.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Carregando painel...</p>;
  if (!stats) return <p className="text-sm text-red-500">Não foi possível carregar o painel.</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: serif }}>Painel de Controle</h1>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Ocupação" value={`${stats.occupancy_rate}%`} sub={`${stats.occupied_rooms}/${stats.total_rooms} quartos`} icon={<BedDouble size={16} />} />
        <StatCard title="Receita do mês" value={`R$ ${(stats.revenue_month / 1000).toFixed(0)}k`} icon={<DollarSign size={16} />} />
        <StatCard title="Reservas ativas" value={`${stats.reservations_count}`} icon={<CalendarCheck size={16} />} />
        <StatCard title="Hóspedes registrados" value={`${stats.guests_count}`} icon={<Users size={16} />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-lg p-4 border border-border">
          <p className="text-sm font-medium text-foreground mb-3">Receita — últimos 12 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.2} /><stop offset="95%" stopColor={GOLD} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Receita"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Area type="monotone" dataKey="receita" name="Receita" stroke={GOLD} strokeWidth={2} fill="url(#gR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm font-medium text-foreground mb-3">Ocupação — últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={occupancy} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B6655" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Ocupação"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Bar dataKey="occupancy_rate" fill={GOLD} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card rounded-lg p-4 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Reservas Recentes</p>
        <div className="space-y-2">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><p className="text-sm font-medium text-foreground">{r.guest_name}</p><p className="text-xs text-muted-foreground">Qto {r.room_number} · {r.checkin} → {r.checkout}</p></div>
              <div className="text-right"><ResBadge status={r.status} /><p className="text-xs text-muted-foreground mt-0.5">R$ {r.total.toLocaleString("pt-BR")}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
