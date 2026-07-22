import { useState, useEffect } from "react";
import {
  LayoutDashboard, BedDouble, Users, CalendarCheck, UserCog,
  DollarSign, BarChart3, Wrench, Settings, LogOut, Bell,
  Search, Plus, TrendingUp, TrendingDown, CheckCircle2,
  Eye, Edit2, Trash2, Download, Star, Phone, Mail, MapPin,
  ChevronRight, Building2, Shield, RefreshCw, X, Menu,
  ChevronDown, ChevronLeft, CheckCheck, CalendarX2, Quote,
  Instagram, Facebook, Twitter, Lock, User,
  Waves, Dumbbell, UtensilsCrossed, Car, Coffee, Wind,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── Design tokens ───────────────────────────────────────────────────────────
const GOLD  = "#B8914A";
const NAVY  = "#162036";
const CREAM = "#F7F4EE";
const serif = "'Lora', Georgia, serif";
const sans  = "'Outfit', system-ui, sans-serif";
const mono  = "'DM Mono', monospace";

// ─── Types ───────────────────────────────────────────────────────────────────
type AppPage     = "landing" | "guest-book" | "guest-portal" | "staff-login" | "staff-portal";
type StaffView   = "dashboard"|"quartos"|"hospedes"|"reservas"|"funcionarios"|"financeiro"|"relatorios"|"servicos"|"configuracoes";
type RoomStatus  = "disponivel"|"ocupado"|"manutencao"|"reservado";
type RoomType    = "Standard"|"Luxo"|"Suite"|"Presidencial";
type ResStatus   = "confirmada"|"pendente"|"cancelada"|"checkout";

interface Room        { id:string; number:string; floor:number; type:RoomType; status:RoomStatus; capacity:number; price:number; amenities:string[]; img:string; }
interface GuestRec    { id:string; name:string; email:string; phone:string; cpf:string; city:string; stays:number; lastStay:string; rating:number; }
interface Reservation { id:string; guestName:string; room:string; roomType:RoomType; checkin:string; checkout:string; nights:number; status:ResStatus; total:number; guests:number; }
interface StaffMember { id:string; name:string; role:string; department:string; email:string; phone:string; status:"ativo"|"inativo"; since:string; }
interface Service     { id:string; name:string; category:string; price:number; unit:string; available:boolean; used:number; }

// ─── Data ────────────────────────────────────────────────────────────────────
const roomsData: Room[] = [
  { id:"1",  number:"101", floor:1, type:"Standard",     status:"ocupado",    capacity:2, price:280,  amenities:["Wi-Fi","TV","AC","Frigobar"],                                     img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format" },
  { id:"2",  number:"102", floor:1, type:"Standard",     status:"disponivel", capacity:2, price:280,  amenities:["Wi-Fi","TV","AC","Frigobar"],                                     img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format" },
  { id:"3",  number:"103", floor:1, type:"Standard",     status:"reservado",  capacity:2, price:280,  amenities:["Wi-Fi","TV","AC","Frigobar"],                                     img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format" },
  { id:"4",  number:"201", floor:2, type:"Luxo",         status:"ocupado",    capacity:3, price:480,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Frigobar"],                img:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format" },
  { id:"5",  number:"202", floor:2, type:"Luxo",         status:"disponivel", capacity:3, price:480,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Frigobar"],                img:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format" },
  { id:"6",  number:"203", floor:2, type:"Luxo",         status:"manutencao", capacity:3, price:480,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Frigobar"],                img:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format" },
  { id:"7",  number:"301", floor:3, type:"Suite",        status:"ocupado",    capacity:4, price:780,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Sala","Butler"],           img:"https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop&auto=format" },
  { id:"8",  number:"302", floor:3, type:"Suite",        status:"disponivel", capacity:4, price:780,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Sala","Butler"],           img:"https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop&auto=format" },
  { id:"9",  number:"401", floor:4, type:"Presidencial", status:"disponivel", capacity:6, price:1850, amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Sala","Cozinha","Butler"], img:"https://images.unsplash.com/photo-1711059985570-4c32ed12a12c?w=600&h=400&fit=crop&auto=format" },
  { id:"10", number:"104", floor:1, type:"Standard",     status:"disponivel", capacity:2, price:280,  amenities:["Wi-Fi","TV","AC","Frigobar"],                                     img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format" },
  { id:"11", number:"204", floor:2, type:"Luxo",         status:"reservado",  capacity:3, price:480,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda"],                           img:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format" },
  { id:"12", number:"303", floor:3, type:"Suite",        status:"ocupado",    capacity:4, price:780,  amenities:["Wi-Fi","TV","AC","Banheira","Varanda","Sala"],                    img:"https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop&auto=format" },
];

const guestsData: GuestRec[] = [
  { id:"1", name:"Marcela Fonseca",         email:"marcela.fonseca@email.com",  phone:"(11) 99234-5678", cpf:"123.456.789-00", city:"São Paulo, SP",      stays:7,  lastStay:"2025-07-10", rating:5 },
  { id:"2", name:"Roberto Henrique Castro", email:"roberto.castro@email.com",   phone:"(21) 98765-4321", cpf:"987.654.321-00", city:"Rio de Janeiro, RJ", stays:3,  lastStay:"2025-06-28", rating:4 },
  { id:"3", name:"Juliana Martins",         email:"juliana.m@email.com",        phone:"(31) 97654-3210", cpf:"456.789.123-00", city:"Belo Horizonte, MG", stays:1,  lastStay:"2025-07-15", rating:5 },
  { id:"4", name:"Fernando Alves Neto",     email:"f.alves@email.com",          phone:"(41) 96543-2109", cpf:"789.123.456-00", city:"Curitiba, PR",       stays:12, lastStay:"2025-07-01", rating:5 },
  { id:"5", name:"Camila Rodrigues",        email:"camila.rod@email.com",       phone:"(51) 95432-1098", cpf:"321.654.987-00", city:"Porto Alegre, RS",   stays:2,  lastStay:"2025-05-20", rating:4 },
  { id:"6", name:"Alexandre Vieira",        email:"a.vieira@email.com",         phone:"(11) 94321-0987", cpf:"654.987.321-00", city:"Campinas, SP",       stays:5,  lastStay:"2025-07-18", rating:3 },
];

const reservationsData: Reservation[] = [
  { id:"RES-0241", guestName:"Marcela Fonseca",         room:"301", roomType:"Suite",        checkin:"2025-07-20", checkout:"2025-07-25", nights:5, status:"confirmada", total:3900,  guests:2 },
  { id:"RES-0242", guestName:"Roberto Henrique Castro", room:"201", roomType:"Luxo",         checkin:"2025-07-18", checkout:"2025-07-22", nights:4, status:"confirmada", total:1920,  guests:2 },
  { id:"RES-0243", guestName:"Juliana Martins",         room:"101", roomType:"Standard",     checkin:"2025-07-15", checkout:"2025-07-19", nights:4, status:"checkout",   total:1120,  guests:1 },
  { id:"RES-0244", guestName:"Fernando Alves Neto",     room:"401", roomType:"Presidencial", checkin:"2025-07-22", checkout:"2025-07-28", nights:6, status:"pendente",   total:11100, guests:4 },
  { id:"RES-0245", guestName:"Camila Rodrigues",        room:"204", roomType:"Luxo",         checkin:"2025-07-24", checkout:"2025-07-27", nights:3, status:"confirmada", total:1440,  guests:2 },
  { id:"RES-0246", guestName:"Alexandre Vieira",        room:"103", roomType:"Standard",     checkin:"2025-07-19", checkout:"2025-07-21", nights:2, status:"cancelada",  total:560,   guests:1 },
  { id:"RES-0247", guestName:"Marcela Fonseca",         room:"303", roomType:"Suite",        checkin:"2025-07-10", checkout:"2025-07-14", nights:4, status:"checkout",   total:3120,  guests:2 },
];

const staffData: StaffMember[] = [
  { id:"1", name:"Ana Paula Souza",     role:"Gerente Geral",   department:"Administração",      email:"ana.souza@hotel.com",     phone:"(11) 3344-5566", status:"ativo",  since:"2019-03-01" },
  { id:"2", name:"Carlos Eduardo Lima", role:"Recepcionista",   department:"Recepção",           email:"carlos.lima@hotel.com",   phone:"(11) 3344-5567", status:"ativo",  since:"2021-06-15" },
  { id:"3", name:"Patrícia Gomes",      role:"Governanta",      department:"Housekeeping",       email:"patricia.gomes@hotel.com",phone:"(11) 3344-5568", status:"ativo",  since:"2020-01-10" },
  { id:"4", name:"Rodrigo Mendes",      role:"Chef de Cozinha", department:"Alimentos & Bebidas",email:"rodrigo.m@hotel.com",     phone:"(11) 3344-5569", status:"ativo",  since:"2022-08-20" },
  { id:"5", name:"Luciana Ferreira",    role:"Concierge",       department:"Recepção",           email:"luciana.f@hotel.com",     phone:"(11) 3344-5570", status:"inativo",since:"2020-05-01" },
];

const servicesData: Service[] = [
  { id:"1", name:"Café da Manhã Premium",   category:"Alimentação", price:65,  unit:"por pessoa",  available:true,  used:142 },
  { id:"2", name:"Spa & Massagem 60min",    category:"Bem-estar",   price:220, unit:"por sessão",  available:true,  used:38  },
  { id:"3", name:"Transfer Aeroporto",      category:"Transporte",  price:150, unit:"por trajeto", available:true,  used:55  },
  { id:"4", name:"Lavanderia Express",      category:"Serviços",    price:45,  unit:"por peça",    available:true,  used:89  },
  { id:"5", name:"Baby Sitter",             category:"Bem-estar",   price:80,  unit:"por hora",    available:false, used:12  },
  { id:"6", name:"Estacionamento Valet",    category:"Transporte",  price:55,  unit:"por diária",  available:true,  used:201 },
  { id:"7", name:"Late Checkout (até 16h)", category:"Serviços",    price:120, unit:"por uso",     available:true,  used:67  },
];

const revenueData = [
  { month:"Jan", receita:142000, despesas:98000  },
  { month:"Fev", receita:128000, despesas:91000  },
  { month:"Mar", receita:165000, despesas:104000 },
  { month:"Abr", receita:152000, despesas:97000  },
  { month:"Mai", receita:178000, despesas:108000 },
  { month:"Jun", receita:195000, despesas:115000 },
  { month:"Jul", receita:211000, despesas:121000 },
];

const occupancyData = [
  { day:"Seg", v:72 },{ day:"Ter", v:68 },{ day:"Qua", v:85 },
  { day:"Qui", v:91 },{ day:"Sex", v:96 },{ day:"Sáb", v:100 },{ day:"Dom", v:88 },
];

const pieData = [
  { name:"Standard", value:4, color:"#6b7a9c" },
  { name:"Luxo",     value:4, color:GOLD       },
  { name:"Suite",    value:3, color:"#2D5F8A"  },
  { name:"Presid.",  value:1, color:"#3d8c6e"  },
];

const roomShowcase = [
  { type:"Standard"     as RoomType, tagline:"Conforto Refinado",        price:280,  capacity:2, highlights:["26 m²","Cama Queen","Wi-Fi Fibra","Frigobar"],                     img:"https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&h=500&fit=crop&auto=format" },
  { type:"Luxo"         as RoomType, tagline:"Elegância com Vista",      price:480,  capacity:3, highlights:["38 m²","Cama King","Varanda Privativa","Banheira"],               img:"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&h=500&fit=crop&auto=format" },
  { type:"Suite"        as RoomType, tagline:"Espaço & Exclusividade",   price:780,  capacity:4, highlights:["62 m²","Sala Separada","Butler 24h","Vista Panorâmica"],          img:"https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=700&h=500&fit=crop&auto=format" },
  { type:"Presidencial" as RoomType, tagline:"O Ápice da Hospitalidade", price:1850, capacity:6, highlights:["120 m²","Cozinha Gourmet","Adega Privativa","Concierge Exclusivo"],img:"https://images.unsplash.com/photo-1711059985570-4c32ed12a12c?w=700&h=500&fit=crop&auto=format" },
];

const testimonials = [
  { name:"Beatriz Carvalho",  city:"São Paulo, SP",      init:"BC", stars:5, text:"Uma experiência incomparável. O atendimento é de excelência e os quartos transmitem um conforto que faz você não querer ir embora. Já é minha segunda vez e certamente voltarei." },
  { name:"Gustavo Marinho",   city:"Brasília, DF",       init:"GM", stars:5, text:"Me hospedei na Suite e foi simplesmente magnífico. A vista da varanda ao amanhecer é inesquecível. O staff é atencioso e o café da manhã está entre os melhores que já tive." },
  { name:"Isabela Teixeira",  city:"Florianópolis, SC",  init:"IT", stars:5, text:"Hotel impecável. Ambiente sofisticado, limpeza primorosa e localização perfeita. O serviço de concierge resolveu todos os meus compromissos com agilidade e profissionalismo." },
];

// ─── Status configs ───────────────────────────────────────────────────────────
const roomStatusCfg: Record<RoomStatus, {label:string;color:string;bg:string}> = {
  disponivel: { label:"Disponível", color:"#3d8c6e", bg:"#e8f5ee" },
  ocupado:    { label:"Ocupado",    color:"#B83232", bg:"#fdecea" },
  manutencao: { label:"Manutenção", color:"#e67e22", bg:"#fef3e2" },
  reservado:  { label:"Reservado",  color:"#2D5F8A", bg:"#e3f0f8" },
};
const resStatusCfg: Record<ResStatus, {label:string;color:string;bg:string}> = {
  confirmada: { label:"Confirmada", color:"#3d8c6e", bg:"#e8f5ee" },
  pendente:   { label:"Pendente",   color:"#e67e22", bg:"#fef3e2" },
  cancelada:  { label:"Cancelada",  color:"#B83232", bg:"#fdecea" },
  checkout:   { label:"Checkout",   color:"#6B6655", bg:"#f0ede7" },
};

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function RoomBadge({ status }: { status: RoomStatus }) {
  const c = roomStatusCfg[status];
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ color:c.color, backgroundColor:c.bg }}>{c.label}</span>;
}
function ResBadge({ status }: { status: ResStatus }) {
  const c = resStatusCfg[status];
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ color:c.color, backgroundColor:c.bg }}>{c.label}</span>;
}
function GoldBtn({ children, onClick, full, lg, sm }: { children:React.ReactNode; onClick?:()=>void; full?:boolean; lg?:boolean; sm?:boolean }) {
  const pad = lg ? "px-8 py-4 text-base" : sm ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm";
  return (
    <button onClick={onClick} style={{ backgroundColor:GOLD, fontFamily:sans }}
      className={`${pad} ${full?"w-full":""} rounded font-semibold text-white tracking-wide hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}>
      {children}
    </button>
  );
}
function OutlineBtn({ children, onClick, dark, full }: { children:React.ReactNode; onClick?:()=>void; dark?:boolean; full?:boolean }) {
  return (
    <button onClick={onClick} style={{ fontFamily:sans, borderColor:dark?"rgba(255,255,255,0.35)":NAVY, color:dark?"white":NAVY }}
      className={`${full?"w-full":""} px-6 py-3 rounded text-sm font-semibold border hover:bg-white/10 transition-all flex items-center justify-center gap-2`}>
      {children}
    </button>
  );
}
function StatCard({ title, value, sub, icon, trend, up }: { title:string;value:string;sub?:string;icon:React.ReactNode;trend?:string;up?:boolean }) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor:"#EFEBE3", color:GOLD }}>{icon}</div>
        {trend && <span className={`flex items-center gap-0.5 text-xs font-medium ${up?"text-emerald-600":"text-red-500"}`}>{up?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{trend}</span>}
      </div>
      <div>
        <p className="text-xl font-semibold text-foreground" style={{ fontFamily:serif }}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
function AddBtn({ label }: { label:string }) {
  return (
    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity"
      style={{ backgroundColor:GOLD, fontFamily:sans }}><Plus size={13}/>{label}</button>
  );
}
function SHeader({ title, sub, action }: { title:string; sub?:string; action?:React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily:serif }}>{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ════════════════════════════════════════════════════════════════════════════
function LandingPage({ onBook, onPortal, onStaff }: { onBook:()=>void; onPortal:()=>void; onStaff:()=>void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkin,  setCheckin]  = useState("");
  const [checkout, setCheckout] = useState("");
  const [pax,      setPax]      = useState(2);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ backgroundColor:CREAM, fontFamily:sans, color:NAVY }}>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"bg-white/96 backdrop-blur-sm shadow-sm":""}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor:GOLD }}>
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ fontFamily:serif, color:scrolled?NAVY:"white" }}>Grand Palácio</p>
              <p className="text-[10px] tracking-[0.18em] uppercase mt-0.5" style={{ color:scrolled?GOLD:"rgba(255,255,255,0.6)" }}>Hotel &amp; Resorts</p>
            </div>
          </div>

          {/* Links desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {["Quartos","Experiências","Gastronomia","Localização"].map(l => (
              <a key={l} href="#" className="text-sm font-medium transition-opacity hover:opacity-60" style={{ color:scrolled?NAVY:"white" }}>{l}</a>
            ))}
          </div>

          {/* CTAs desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={onPortal} className="text-sm font-medium hover:opacity-60 transition-opacity" style={{ color:scrolled?NAVY:"white" }}>
              Minhas Reservas
            </button>
            <GoldBtn onClick={onBook} sm>Reservar Agora</GoldBtn>
            <button onClick={onStaff} className="text-xs font-medium opacity-40 hover:opacity-70 transition-opacity" style={{ color:scrolled?NAVY:"white" }}>
              Staff
            </button>
          </div>

          {/* Hamburger */}
          <button className="lg:hidden p-2 rounded" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22} style={{ color:scrolled?NAVY:"white" }}/> : <Menu size={22} style={{ color:scrolled?NAVY:"white" }}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-border px-6 py-4 space-y-3">
            {["Quartos","Experiências","Gastronomia","Localização"].map(l => (
              <a key={l} href="#" className="block text-sm font-medium py-1" style={{ color:NAVY }}>{l}</a>
            ))}
            <div className="pt-3 border-t border-border space-y-2">
              <button onClick={onPortal} className="block text-sm text-muted-foreground py-1">Minhas Reservas</button>
              <GoldBtn onClick={onBook} full>Reservar Agora</GoldBtn>
              <button onClick={onStaff} className="block text-xs text-muted-foreground py-1">Acesso Staff</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-neutral-800">
          <img src="https://images.unsplash.com/photo-1646991761123-d83ce47c30c9?w=1800&h=1000&fit=crop&auto=format"
            alt="Lobby elegante do Grand Palácio Hotel" className="w-full h-full object-cover opacity-55" />
          <div className="absolute inset-0" style={{ background:"linear-gradient(to bottom, rgba(22,32,54,0.25) 0%, rgba(22,32,54,0.70) 100%)" }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.35em] uppercase mb-5 font-medium" style={{ color:GOLD }}>São Paulo · Brasil · Desde 1987</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6" style={{ fontFamily:serif }}>
            Onde o Luxo<br/>
            <em className="not-italic" style={{ color:GOLD }}>Encontra</em> o Lar
          </h1>
          <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
            Experiencie o mais alto padrão de hospitalidade no coração de São Paulo. Quartos exclusivos, gastronomia premiada e serviço impecável.
          </p>

          {/* Booking widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 inline-block w-full max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label:"Check-in",  val:checkin,  set:setCheckin  },
                { label:"Check-out", val:checkout, set:setCheckout },
              ].map(f => (
                <div key={f.label} className="text-left">
                  <label className="text-xs text-white/55 block mb-1.5 uppercase tracking-widest">{f.label}</label>
                  <input type="date" value={f.val} onChange={e => f.set(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    style={{ colorScheme:"dark" }} />
                </div>
              ))}
              <div className="text-left">
                <label className="text-xs text-white/55 block mb-1.5 uppercase tracking-widest">Hóspedes</label>
                <select value={pax} onChange={e => setPax(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/50">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="text-foreground bg-white">{n} {n===1?"hóspede":"hóspedes"}</option>)}
                </select>
              </div>
            </div>
            <GoldBtn onClick={onBook} full lg>
              <Search size={17} />Verificar Disponibilidade
            </GoldBtn>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
          <span className="text-xs text-white tracking-[0.2em] uppercase">Explore</span>
          <ChevronDown size={15} className="text-white animate-bounce" />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div style={{ backgroundColor:NAVY }} className="py-9">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { val:"37",  label:"Anos de Tradição"   },
            { val:"12",  label:"Quartos Exclusivos" },
            { val:"98%", label:"Taxa de Satisfação" },
            { val:"24h", label:"Concierge Dedicado" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold mb-1" style={{ color:GOLD, fontFamily:serif }}>{s.val}</p>
              <p className="text-xs text-white/50 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Room showcase ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color:GOLD }}>Acomodações</p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily:serif }}>Quartos &amp; Suítes</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">Cada acomodação foi desenhada para oferecer o máximo em conforto, privacidade e estética, com materiais selecionados e atenção ao detalhe.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roomShowcase.map(r => (
            <div key={r.type} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
              <div className="relative h-52 bg-neutral-200 overflow-hidden">
                <img src={r.img} alt={`Quarto ${r.type}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(22,32,54,0.55) 0%, transparent 55%)" }} />
                <p className="absolute bottom-3 left-3 text-xs font-medium text-white/70 uppercase tracking-wider">{r.tagline}</p>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold" style={{ fontFamily:serif }}>{r.type}</h3>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color:GOLD }}>R$ {r.price}</p>
                    <p className="text-xs text-muted-foreground">/noite</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Até {r.capacity} {r.capacity>1?"pessoas":"pessoa"}</p>
                <div className="grid grid-cols-2 gap-1 mb-4">
                  {r.highlights.map(h => (
                    <div key={h} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCheck size={10} style={{ color:GOLD }} />{h}
                    </div>
                  ))}
                </div>
                <button onClick={onBook}
                  className="w-full py-2 rounded border text-xs font-semibold transition-all"
                  style={{ borderColor:GOLD, color:GOLD }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor=GOLD; (e.currentTarget as HTMLElement).style.color="white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor="transparent"; (e.currentTarget as HTMLElement).style.color=GOLD; }}>
                  Reservar este quarto
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Experiences ── */}
      <section className="py-20 px-6" style={{ backgroundColor:"#EDE9E1" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color:GOLD }}>Experiências</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-5" style={{ fontFamily:serif }}>Muito Além do Quarto</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">No Grand Palácio, cada detalhe é pensado para transformar sua estadia em uma experiência sensorial completa — do amanhecer ao entardecer.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon:<UtensilsCrossed size={19}/>, label:"Restaurante Gourmet",  desc:"Chef premiado, menu sazonal" },
                { icon:<Waves size={19}/>,           label:"Spa & Piscina",        desc:"Relax e bem-estar exclusivo" },
                { icon:<Dumbbell size={19}/>,        label:"Fitness 24h",          desc:"Equipamentos de última geração" },
                { icon:<Car size={19}/>,             label:"Transfer & Valet",     desc:"Mobilidade sem preocupação" },
                { icon:<Coffee size={19}/>,          label:"Café da Manhã",        desc:"Mesa farta e regional" },
                { icon:<Wind size={19}/>,            label:"Concierge 24h",        desc:"Seu assistente pessoal" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-white/70 rounded-xl hover:bg-white transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor:"#EFEBE3", color:GOLD }}>{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src="https://images.unsplash.com/photo-1758448756167-88dc934c58e4?w=500&h=620&fit=crop&auto=format"
              alt="Piscina infinita ao entardecer" className="rounded-xl w-full h-80 object-cover" />
            <div className="space-y-3 mt-10">
              <img src="https://images.unsplash.com/photo-1643101570532-88c8ecc07c1f?w=400&h=300&fit=crop&auto=format"
                alt="Restaurante gourmet do hotel" className="rounded-xl w-full h-36 object-cover" />
              <img src="https://images.unsplash.com/photo-1774281340465-01b55378587f?w=400&h=300&fit=crop&auto=format"
                alt="Rooftop lounge ao pôr do sol" className="rounded-xl w-full h-36 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color:GOLD }}>Depoimentos</p>
          <h2 className="text-4xl font-bold" style={{ fontFamily:serif }}>O que Nossos Hóspedes Dizem</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.name} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
              <Quote size={26} style={{ color:GOLD, opacity:0.35 }} className="mb-4" />
              <p className="text-sm leading-relaxed text-muted-foreground mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor:NAVY }}>{t.init}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({length:5}).map((_,i) => <Star key={i} size={11} fill={GOLD} stroke={GOLD} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="mx-4 sm:mx-6 mb-16 rounded-2xl overflow-hidden relative" style={{ backgroundColor:NAVY }}>
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1637730827702-de34e9ae4ede?w=1400&h=500&fit=crop&auto=format"
            alt="" className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="relative z-10 py-16 px-8 text-center">
          <p className="text-xs tracking-[0.28em] uppercase mb-3 font-medium" style={{ color:GOLD }}>Reserve Agora</p>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily:serif }}>Sua Próxima Estadia Inesquecível</h2>
          <p className="text-white/60 mb-9 max-w-md mx-auto text-sm leading-relaxed">Disponibilidade limitada. Reserve hoje e garanta a melhor tarifa com cancelamento gratuito em até 48h antes do check-in.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <GoldBtn onClick={onBook} lg>Verificar Disponibilidade</GoldBtn>
            <OutlineBtn onClick={onPortal} dark>Já tenho uma reserva</OutlineBtn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor:NAVY }} className="px-6 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor:GOLD }}><Building2 size={13} className="text-white"/></div>
                <span className="text-white font-bold" style={{ fontFamily:serif }}>Grand Palácio</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">Hospitalidade de excelência no coração de São Paulo desde 1987.</p>
              <div className="flex gap-2">
                {[Instagram,Facebook,Twitter].map((Icon,i) => (
                  <button key={i} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Icon size={13} className="text-white/60" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color:GOLD }}>Hotel</p>
              {["Sobre nós","Quartos & Suítes","Experiências","Gastronomia","Eventos"].map(l => (
                <a key={l} href="#" className="block text-xs text-white/40 hover:text-white/70 mb-2 transition-colors">{l}</a>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color:GOLD }}>Suporte</p>
              {["Central de Reservas","Cancelamentos","Política de Privacidade","LGPD","Termos de Uso"].map(l => (
                <a key={l} href="#" className="block text-xs text-white/40 hover:text-white/70 mb-2 transition-colors">{l}</a>
              ))}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 font-semibold" style={{ color:GOLD }}>Contato</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/40"><Phone size={11}/>(11) 3344-5500</div>
                <div className="flex items-center gap-2 text-xs text-white/40"><Mail size={11}/>contato@grandpalacio.com.br</div>
                <div className="flex items-start gap-2 text-xs text-white/40"><MapPin size={11} className="mt-0.5 flex-shrink-0"/>Av. Paulista, 1000<br/>São Paulo, SP</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-white/25">© 2025 Grand Palácio Hotel. Todos os direitos reservados.</p>
            <button onClick={onStaff} className="text-xs text-white/20 hover:text-white/40 flex items-center gap-1 transition-colors">
              <Lock size={10}/>Acesso para funcionários
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GUEST BOOKING FLOW
// ════════════════════════════════════════════════════════════════════════════
function GuestBooking({ onBack, onDone }: { onBack:()=>void; onDone:()=>void }) {
  const [step, setStep]     = useState<"search"|"select"|"form"|"done">("search");
  const [checkin,  setCI]   = useState("");
  const [checkout, setCO]   = useState("");
  const [pax,      setPax]  = useState(2);
  const [typeF,    setTypeF] = useState<RoomType|"Todos">("Todos");
  const [picked,   setPicked] = useState<Room|null>(null);
  const [form,     setForm]  = useState({ name:"", email:"", phone:"", cpf:"", notes:"" });
  const [resCode]            = useState(`RES-0${Math.floor(Math.random()*9000)+1000}`);

  const nights   = (checkin && checkout) ? Math.max(1, Math.round((new Date(checkout).getTime()-new Date(checkin).getTime())/86400000)) : 1;
  const available = roomsData.filter(r => r.status==="disponivel" && r.capacity>=pax && (typeF==="Todos"||r.type===typeF));

  const SubHeader = () => (
    <div style={{ backgroundColor:NAVY }} className="px-6 py-4 mb-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"><ChevronLeft size={15}/>Voltar</button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor:GOLD }}><Building2 size={13} className="text-white"/></div>
          <span className="text-white font-bold text-sm" style={{ fontFamily:serif }}>Grand Palácio</span>
        </div>
        <button onClick={onDone} className="text-sm text-white/55 hover:text-white transition-colors">Minhas Reservas</button>
      </div>
    </div>
  );

  if (step==="done" && picked) {
    const total = picked.price * nights;
    return (
      <div style={{ backgroundColor:CREAM, fontFamily:sans }} className="min-h-screen">
        <SubHeader />
        <div className="flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor:"#e8f5ee" }}>
              <CheckCircle2 size={38} style={{ color:"#3d8c6e" }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily:serif, color:NAVY }}>Reserva Confirmada!</h2>
            <p className="text-sm text-muted-foreground mb-6">Obrigado, <strong>{form.name.split(" ")[0]}</strong>. Sua reserva foi recebida.</p>
            <div className="bg-card rounded-xl border border-border p-5 mb-6 text-left space-y-2.5">
              {[
                { l:"Nº da Reserva",  v:<span style={{ fontFamily:mono }}>{resCode}</span> },
                { l:"Quarto",         v:`${picked.number} — ${picked.type}` },
                { l:"Check-in",       v:checkin },
                { l:"Check-out",      v:checkout },
                { l:"Hóspedes",       v:`${pax}` },
              ].map(row => (
                <div key={row.l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.l}</span>
                  <span className="font-semibold">{row.v}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2.5 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold" style={{ color:GOLD, fontFamily:serif }}>R$ {total.toLocaleString("pt-BR")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Confirmação enviada para <strong>{form.email}</strong></p>
            <div className="flex gap-3 justify-center">
              <GoldBtn onClick={onDone}>Ver Minhas Reservas</GoldBtn>
              <OutlineBtn onClick={onBack}>Voltar ao Início</OutlineBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Busca","Escolha","Dados"];
  const stepIdx = ["search","select","form"].indexOf(step);

  return (
    <div style={{ backgroundColor:CREAM, fontFamily:sans }} className="min-h-screen">
      <SubHeader />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s,i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i<stepIdx?"opacity-60":""}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor:i===stepIdx?GOLD:i<stepIdx?"#3d8c6e":"#E8E4DC", color:(i<=stepIdx)?"white":"#6B6655" }}>
                  {i<stepIdx ? <CheckCheck size={12}/> : i+1}
                </div>
                <span className="text-sm font-medium" style={{ color:i===stepIdx?NAVY:"#6B6655" }}>{s}</span>
              </div>
              {i<2 && <ChevronRight size={13} className="text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step: search */}
        {step==="search" && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily:serif, color:NAVY }}>Verificar Disponibilidade</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Check-in</label>
                  <input type="date" value={checkin} onChange={e=>setCI(e.target.value)}
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Check-out</label>
                  <input type="date" value={checkout} onChange={e=>setCO(e.target.value)}
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Número de Hóspedes</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5,6].map(n => (
                    <button key={n} onClick={()=>setPax(n)}
                      className="w-10 h-10 rounded-lg text-sm font-medium border transition-colors"
                      style={{ borderColor:pax===n?GOLD:"#E8E4DC", backgroundColor:pax===n?GOLD:"transparent", color:pax===n?"white":"#6B6655" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <GoldBtn onClick={()=>setStep("select")} full>
                <Search size={15}/>Buscar Quartos
              </GoldBtn>
            </div>
          </div>
        )}

        {/* Step: select */}
        {step==="select" && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily:serif, color:NAVY }}>Quartos Disponíveis</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{checkin} → {checkout} · {pax} hóspede{pax>1?"s":""} · {nights} noite{nights>1?"s":""}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["Todos","Standard","Luxo","Suite","Presidencial"] as const).map(f => (
                  <button key={f} onClick={()=>setTypeF(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={{ borderColor:typeF===f?GOLD:"#E8E4DC", backgroundColor:typeF===f?GOLD:"transparent", color:typeF===f?"white":"#6B6655" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {available.length===0 ? (
              <div className="text-center py-16">
                <BedDouble size={40} className="mx-auto mb-4 text-muted-foreground opacity-30"/>
                <p className="text-lg font-medium text-muted-foreground">Nenhum quarto disponível para os critérios.</p>
                <button onClick={()=>setStep("search")} className="mt-3 text-sm underline" style={{ color:GOLD }}>Alterar busca</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {available.map(room => (
                  <div key={room.id} onClick={()=>{setPicked(room);setStep("form");}}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                    <div className="relative h-44 bg-neutral-200 overflow-hidden">
                      <img src={room.img} alt={`Quarto ${room.type}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg" style={{ fontFamily:serif }}>{room.type} — {room.number}</h3>
                          <p className="text-xs text-muted-foreground">Andar {room.floor} · Cap. {room.capacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold" style={{ color:GOLD }}>R$ {room.price}</p>
                          <p className="text-xs text-muted-foreground">/noite</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {room.amenities.slice(0,4).map(a => <span key={a} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{a}</span>)}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">Total: <strong className="text-foreground">R$ {(room.price*nights).toLocaleString("pt-BR")}</strong></span>
                        <GoldBtn sm>Selecionar</GoldBtn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: form */}
        {step==="form" && picked && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily:serif, color:NAVY }}>Dados do Hóspede</h2>
            <p className="text-sm text-muted-foreground mb-5">Preencha seus dados. Informações protegidas conforme a LGPD.</p>
            <div className="bg-card rounded-xl border border-border p-4 mb-4 flex gap-4 items-center">
              <div className="w-20 h-16 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                <img src={picked.img} alt="" className="w-full h-full object-cover"/>
              </div>
              <div>
                <p className="font-semibold" style={{ fontFamily:serif }}>{picked.type} — Quarto {picked.number}</p>
                <p className="text-xs text-muted-foreground">{checkin} → {checkout} · {nights} noite{nights>1?"s":""}</p>
                <p className="text-base font-bold mt-1" style={{ color:GOLD }}>R$ {(picked.price*nights).toLocaleString("pt-BR")}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Nome Completo *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Seu nome completo"
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">E-mail *</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="seu@email.com"
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Telefone *</label>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(11) 99999-9999"
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">CPF *</label>
                  <input value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value})} placeholder="000.000.000-00"
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Pedidos Especiais</label>
                  <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2}
                    placeholder="Alergias, preferências de andar, cama extra..."
                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"/>
                </div>
              </div>
              <div className="p-3 rounded-lg text-xs text-muted-foreground" style={{ backgroundColor:"rgba(184,145,74,0.06)", border:"1px solid rgba(184,145,74,0.2)" }}>
                <Shield size={11} className="inline mr-1" style={{ color:GOLD }}/>
                Dados criptografados e protegidos pela <strong>Lei 13.709/2018 (LGPD)</strong>. Cancelamento gratuito em até 48h antes do check-in.
              </div>
              <div className="flex gap-3">
                <OutlineBtn onClick={()=>setStep("select")}>Voltar</OutlineBtn>
                <button onClick={()=>{if(form.name&&form.email)setStep("done");}}
                  className="flex-1 py-3 rounded font-semibold text-sm text-white transition-all hover:brightness-110"
                  style={{ backgroundColor:GOLD, fontFamily:sans }}>
                  Confirmar — R$ {(picked.price*nights).toLocaleString("pt-BR")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GUEST PORTAL (Minhas Reservas)
// ════════════════════════════════════════════════════════════════════════════
function GuestPortal({ onBack }: { onBack:()=>void }) {
  const [email,    setEmail]   = useState("");
  const [found,    setFound]   = useState(false);
  const [canceling,setCanceling] = useState<string|null>(null);
  const [canceled, setCanceled]  = useState<string[]>([]);

  const myRes = reservationsData.slice(0,3);

  return (
    <div style={{ backgroundColor:CREAM, fontFamily:sans }} className="min-h-screen">
      <div style={{ backgroundColor:NAVY }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"><ChevronLeft size={15}/>Voltar</button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor:GOLD }}><Building2 size={13} className="text-white"/></div>
            <span className="text-white font-bold text-sm" style={{ fontFamily:serif }}>Grand Palácio</span>
          </div>
          <div style={{ width:80 }}/>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily:serif, color:NAVY }}>Minhas Reservas</h2>
          <p className="text-sm text-muted-foreground">Consulte e gerencie suas reservas no Grand Palácio</p>
        </div>

        {!found ? (
          <div className="max-w-sm mx-auto bg-card rounded-xl border border-border p-6">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor:"#EFEBE3" }}>
              <User size={24} style={{ color:GOLD }}/>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-5">Informe seu e-mail para acessar suas estadias.</p>
            <div className="space-y-3">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"
                className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
              <GoldBtn onClick={()=>{if(email)setFound(true);}} full>Buscar Reservas</GoldBtn>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">Demo: qualquer e-mail funciona</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Reservas para <strong className="text-foreground">{email}</strong></p>
              <button onClick={()=>{setFound(false);setEmail("");}} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sair</button>
            </div>
            <div className="space-y-3">
              {myRes.map(r => {
                const isCanceled = canceled.includes(r.id)||r.status==="cancelada";
                const status: ResStatus = isCanceled?"cancelada":r.status;
                return (
                  <div key={r.id} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ fontFamily:mono }}>{r.id}</span>
                          <ResBadge status={status}/>
                        </div>
                        <p className="font-semibold" style={{ fontFamily:serif }}>{r.roomType} — Quarto {r.room}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>In: <strong className="text-foreground">{r.checkin}</strong></span>
                          <ChevronRight size={12}/>
                          <span>Out: <strong className="text-foreground">{r.checkout}</strong></span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.nights} noite{r.nights>1?"s":""} · {r.guests} hóspede{r.guests>1?"s":""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color:GOLD, fontFamily:serif }}>R$ {r.total.toLocaleString("pt-BR")}</p>
                        {!isCanceled && status!=="checkout" && (
                          <button onClick={()=>setCanceling(r.id)}
                            className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto transition-colors">
                            <CalendarX2 size={11}/>Cancelar reserva
                          </button>
                        )}
                      </div>
                    </div>

                    {canceling===r.id && (
                      <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor:"#fdecea", border:"1px solid rgba(184,50,50,0.15)" }}>
                        <p className="text-sm font-semibold text-red-700 mb-1">Cancelar esta reserva?</p>
                        <p className="text-xs text-red-600 mb-3">Esta ação não poderá ser desfeita. Verifique nossa política de cancelamento.</p>
                        <div className="flex gap-2">
                          <button onClick={()=>{setCanceled(p=>[...p,r.id]);setCanceling(null);}}
                            className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                            Confirmar Cancelamento
                          </button>
                          <button onClick={()=>setCanceling(null)}
                            className="px-4 py-1.5 rounded text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                            Manter Reserva
                          </button>
                        </div>
                      </div>
                    )}
                    {isCanceled && canceled.includes(r.id) && (
                      <div className="mt-3 p-3 rounded-lg bg-muted text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 size={12} style={{ color:"#3d8c6e" }}/>
                        Reserva cancelada com sucesso. Confirmação enviada por e-mail.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAFF LOGIN
// ════════════════════════════════════════════════════════════════════════════
function StaffLogin({ onLogin, onBack }: { onLogin:()=>void; onBack:()=>void }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState(false);

  return (
    <div className="min-h-screen flex" style={{ fontFamily:sans }}>
      {/* Left panel with image */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-900">
        <img src="https://images.unsplash.com/photo-1730367019960-9906d9cbbf05?w=1000&h=1200&fit=crop&auto=format"
          alt="Grand Palácio Hotel" className="w-full h-full object-cover opacity-65"/>
        <div className="absolute inset-0" style={{ background:"linear-gradient(135deg, rgba(22,32,54,0.88) 0%, rgba(22,32,54,0.4) 100%)" }}/>
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor:GOLD }}><Building2 size={18} className="text-white"/></div>
            <div>
              <p className="text-xl font-bold text-white" style={{ fontFamily:serif }}>Grand Palácio</p>
              <p className="text-xs text-white/45 tracking-widest uppercase">Hotel &amp; Resorts</p>
            </div>
          </div>
          <div>
            <p className="text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily:serif }}>
              Sistema de<br/><span style={{ color:GOLD }}>Gestão</span><br/>Hoteleira
            </p>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Plataforma completa para recepcionistas, gerentes e toda a equipe do Grand Palácio.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 max-w-md" style={{ backgroundColor:CREAM }}>
        <div className="w-full max-w-sm">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ChevronLeft size={14}/>Voltar ao site
          </button>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily:serif, color:NAVY }}>Acesso da Equipe</h2>
            <p className="text-sm text-muted-foreground">Entre com suas credenciais institucionais.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr(false);}} placeholder="usuario@grandpalacio.com.br"
                className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Senha</label>
              <input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr(false);}} placeholder="••••••••"
                className="w-full bg-card border border-border rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
            </div>
            {err && <p className="text-xs text-red-500">Preencha todos os campos para continuar.</p>}
            <GoldBtn onClick={()=>{if(email&&pass)onLogin();else setErr(true);}} full>Entrar no Sistema</GoldBtn>
          </div>
          <div className="mt-5 p-3 rounded-lg bg-muted text-xs text-muted-foreground">
            <p className="font-semibold mb-0.5">Acesso demonstração</p>
            <p>Email: qualquer endereço institucional</p>
            <p>Senha: qualquer senha</p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield size={11}/><span>Acesso criptografado. Conformidade LGPD.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAFF PORTAL
// ════════════════════════════════════════════════════════════════════════════
const sideNav = [
  { id:"dashboard"     as StaffView, label:"Dashboard",    icon:<LayoutDashboard size={15}/> },
  { id:"quartos"       as StaffView, label:"Quartos",      icon:<BedDouble size={15}/> },
  { id:"hospedes"      as StaffView, label:"Hóspedes",     icon:<Users size={15}/> },
  { id:"reservas"      as StaffView, label:"Reservas",     icon:<CalendarCheck size={15}/> },
  { id:"funcionarios"  as StaffView, label:"Funcionários", icon:<UserCog size={15}/> },
  { id:"financeiro"    as StaffView, label:"Financeiro",   icon:<DollarSign size={15}/> },
  { id:"relatorios"    as StaffView, label:"Relatórios",   icon:<BarChart3 size={15}/> },
  { id:"servicos"      as StaffView, label:"Serviços",     icon:<Wrench size={15}/> },
  { id:"configuracoes" as StaffView, label:"Config.",      icon:<Settings size={15}/> },
];

function StaffPortal({ onLogout }: { onLogout:()=>void }) {
  const [view,     setView]     = useState<StaffView>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  const renderView = () => {
    switch(view){
      case "dashboard":    return <SDash />;
      case "quartos":      return <SRooms />;
      case "hospedes":     return <SGuests />;
      case "reservas":     return <SRes />;
      case "funcionarios": return <SStaff />;
      case "financeiro":   return <SFin />;
      case "relatorios":   return <SReports />;
      case "servicos":     return <SServices />;
      case "configuracoes":return <SConfig />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily:sans }}>
      {/* Sidebar */}
      <aside className={`flex flex-col w-52 flex-shrink-0 z-20 fixed inset-y-0 left-0 lg:relative transition-transform duration-300 ${sideOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0`}
        style={{ backgroundColor:NAVY }}>
        <div className="px-4 py-4 border-b border-white/5 flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor:GOLD }}><Building2 size={13} className="text-white"/></div>
          <div>
            <p className="text-sm font-bold text-white" style={{ fontFamily:serif }}>Grand Palácio</p>
            <p className="text-[10px] text-white/35 uppercase tracking-widest">Staff</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {sideNav.map(item => (
            <button key={item.id} onClick={()=>{setView(item.id);setSideOpen(false);}}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor:view===item.id?"#1E2D4A":"transparent", color:view===item.id?"white":"rgba(200,194,180,0.65)" }}>
              <span style={{ color:view===item.id?GOLD:undefined }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-2 py-3 border-t border-white/5">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor:GOLD }}>AP</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Ana Paula</p>
              <p className="text-[10px] text-white/35">Administrador</p>
            </div>
            <button onClick={onLogout} className="p-1 rounded hover:bg-white/10 text-white/35 hover:text-white transition-colors"><LogOut size={13}/></button>
          </div>
        </div>
      </aside>

      {sideOpen && <div className="fixed inset-0 bg-black/40 z-10 lg:hidden" onClick={()=>setSideOpen(false)}/>}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 py-3 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded hover:bg-muted transition-colors" onClick={()=>setSideOpen(true)}><Menu size={16} className="text-foreground"/></button>
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <input placeholder="Buscar..." className="pl-8 pr-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-48"/>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={15} className="text-muted-foreground"/>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"/>
            </button>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor:GOLD }}>AP</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">{renderView()}</main>
      </div>
    </div>
  );
}

// ─── Staff sub-views ──────────────────────────────────────────────────────────
function SDash() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily:serif }}>Painel de Controle</h1>
        <p className="text-xs text-muted-foreground">Terça-feira, 22 de julho de 2025</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Ocupação" value="75%" sub="9/12 quartos" icon={<BedDouble size={16}/>} trend="+4%" up/>
        <StatCard title="Receita Jul" value="R$ 211k" icon={<DollarSign size={16}/>} trend="+8%" up/>
        <StatCard title="Reservas" value="5" sub="2 confirmadas hoje" icon={<CalendarCheck size={16}/>} trend="+2" up/>
        <StatCard title="Hóspedes" value="12" sub="3 saem amanhã" icon={<Users size={16}/>}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-lg p-4 border border-border">
          <p className="text-sm font-medium text-foreground mb-3">Receita vs Despesas 2025</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.2}/><stop offset="95%" stopColor={GOLD} stopOpacity={0}/></linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2D5F8A" stopOpacity={0.15}/><stop offset="95%" stopColor="#2D5F8A" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)"/>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"#6B6655" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:"#6B6655" }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v:number)=>[`R$ ${v.toLocaleString("pt-BR")}`,""]} contentStyle={{ fontSize:11, borderRadius:6 }}/>
              <Area type="monotone" dataKey="receita" name="Receita" stroke={GOLD} strokeWidth={2} fill="url(#gR)"/>
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#2D5F8A" strokeWidth={2} fill="url(#gD)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm font-medium text-foreground mb-3">Ocupação Semanal</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={occupancyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:"#6B6655" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:"#6B6655" }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`}/>
              <Tooltip formatter={(v:number)=>[`${v}%`,"Ocupação"]} contentStyle={{ fontSize:11, borderRadius:6 }}/>
              <Bar dataKey="v" fill={GOLD} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor:p.color }}/><span className="text-muted-foreground">{p.name}</span></div>
                <span className="font-medium text-foreground">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-card rounded-lg p-4 border border-border">
        <p className="text-sm font-medium text-foreground mb-3">Reservas Recentes</p>
        <div className="space-y-2">
          {reservationsData.slice(0,5).map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div><p className="text-sm font-medium text-foreground">{r.guestName}</p><p className="text-xs text-muted-foreground">Qto {r.room} · {r.checkin} → {r.checkout}</p></div>
              <div className="text-right"><ResBadge status={r.status}/><p className="text-xs text-muted-foreground mt-0.5">R$ {r.total.toLocaleString("pt-BR")}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SRooms() {
  const [filter, setFilter] = useState<RoomStatus|"todos">("todos");
  const filtered = filter==="todos" ? roomsData : roomsData.filter(r=>r.status===filter);
  return (
    <div>
      <SHeader title="Quartos" sub={`${roomsData.length} quartos`} action={<AddBtn label="Novo Quarto"/>}/>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["todos","disponivel","ocupado","reservado","manutencao"] as const).map(s => (
          <button key={s} onClick={()=>setFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ borderColor:filter===s?GOLD:"#E8E4DC", backgroundColor:filter===s?GOLD:"transparent", color:filter===s?"white":"#6B6655" }}>
            {s==="todos"?"Todos":roomStatusCfg[s].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(room => (
          <div key={room.id} className="bg-card rounded-lg border border-border p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <p className="text-lg font-semibold text-foreground" style={{ fontFamily:serif }}>{room.number}</p>
              <RoomBadge status={room.status}/>
            </div>
            <p className="text-sm font-medium text-foreground">{room.type}</p>
            <p className="text-xs text-muted-foreground mb-2">Andar {room.floor} · Cap. {room.capacity}</p>
            <div className="flex flex-wrap gap-1 mb-2">{room.amenities.slice(0,3).map(a=><span key={a} className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{a}</span>)}</div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold text-foreground">R$ {room.price}<span className="text-xs font-normal text-muted-foreground">/n</span></span>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Eye size={12}/></button>
                <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SGuests() {
  const [q, setQ] = useState("");
  const filtered = guestsData.filter(g=>g.name.toLowerCase().includes(q.toLowerCase())||g.email.includes(q));
  return (
    <div>
      <SHeader title="Hóspedes" sub={`${guestsData.length} registrados`} action={<AddBtn label="Novo Hóspede"/>}/>
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar hóspede..."
          className="w-full pl-8 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
      </div>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Hóspede</span><span>Contato</span><span>Estadas</span><span>Última visita</span><span>Ações</span>
        </div>
        {filtered.map(g => (
          <div key={g.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 items-center">
            <div><p className="text-sm font-medium text-foreground">{g.name}</p><p className="text-xs text-muted-foreground">{g.city}</p></div>
            <div><p className="text-xs text-muted-foreground">{g.email}</p><p className="text-xs text-muted-foreground">{g.phone}</p></div>
            <div><p className="text-sm font-medium text-foreground">{g.stays}x</p><div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={9} fill={i<g.rating?GOLD:"none"} stroke={i<g.rating?GOLD:"#ccc"}/>)}</div></div>
            <span className="text-xs text-muted-foreground">{g.lastStay}</span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Eye size={12}/></button>
              <button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12}/></button>
              <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SRes() {
  const [tab, setTab] = useState<ResStatus|"todas">("todas");
  const filtered = tab==="todas" ? reservationsData : reservationsData.filter(r=>r.status===tab);
  return (
    <div>
      <SHeader title="Reservas" sub="Gestão completa" action={<AddBtn label="Nova Reserva"/>}/>
      <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
        {(["todas","confirmada","pendente","cancelada","checkout"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
            {t==="todas"?"Todas":resStatusCfg[t as ResStatus]?.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(r => (
          <div key={r.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor:NAVY }}>{r.room}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-foreground text-sm">{r.guestName}</p><span className="text-xs text-muted-foreground" style={{ fontFamily:mono }}>{r.id}</span><ResBadge status={r.status}/></div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.roomType} · {r.guests} hóspede{r.guests>1?"s":""} · {r.nights} noites</p>
                  <div className="flex items-center gap-2 mt-1"><span className="text-xs text-muted-foreground">In: <strong className="text-foreground">{r.checkin}</strong></span><ChevronRight size={11} className="text-muted-foreground"/><span className="text-xs text-muted-foreground">Out: <strong className="text-foreground">{r.checkout}</strong></span></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right"><p className="text-base font-bold text-foreground" style={{ fontFamily:serif }}>R$ {r.total.toLocaleString("pt-BR")}</p></div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"><Eye size={13}/></button>
                  <button className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={13}/></button>
                  {r.status!=="cancelada"&&r.status!=="checkout"&&<button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><X size={13}/></button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SStaff() {
  return (
    <div>
      <SHeader title="Funcionários" sub={`${staffData.length} colaboradores`} action={<AddBtn label="Novo Funcionário"/>}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {staffData.map(s => (
          <div key={s.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor:NAVY }}>
                {s.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between"><p className="font-medium text-foreground text-sm truncate">{s.name}</p><span className={`text-xs px-1.5 py-0.5 rounded-full ${s.status==="ativo"?"bg-emerald-50 text-emerald-600":"bg-muted text-muted-foreground"}`}>{s.status==="ativo"?"Ativo":"Inativo"}</span></div>
                <p className="text-xs font-medium" style={{ color:GOLD }}>{s.role}</p>
                <p className="text-xs text-muted-foreground">{s.department}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail size={10}/><span className="truncate">{s.email}</span></div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone size={10}/>{s.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SFin() {
  const totR = revenueData.reduce((s,d)=>s+d.receita,0);
  const totD = revenueData.reduce((s,d)=>s+d.despesas,0);
  return (
    <div>
      <SHeader title="Financeiro" sub="Receitas e despesas"/>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard title="Receita 2025" value={`R$ ${(totR/1000).toFixed(0)}k`} icon={<TrendingUp size={16}/>} trend="+8%" up/>
        <StatCard title="Despesas 2025" value={`R$ ${(totD/1000).toFixed(0)}k`} icon={<TrendingDown size={16}/>}/>
        <StatCard title="Lucro Líquido" value={`R$ ${((totR-totD)/1000).toFixed(0)}k`} sub="margem 37%" icon={<DollarSign size={16}/>} trend="+12%" up/>
      </div>
      <div className="bg-card rounded-lg border border-border p-4 mb-4">
        <p className="text-sm font-medium mb-3">Receita vs Despesas</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize:10, fill:"#6B6655" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize:10, fill:"#6B6655" }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={(v:number)=>[`R$ ${v.toLocaleString("pt-BR")}`,""]} contentStyle={{ fontSize:11, borderRadius:6 }}/>
            <Bar dataKey="receita" name="Receita" fill={GOLD} radius={[3,3,0,0]}/>
            <Bar dataKey="despesas" name="Despesas" fill="#2D5F8A" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Mês</span><span>Receita</span><span>Despesas</span><span>Margem</span>
        </div>
        {revenueData.map(d => (
          <div key={d.month} className="grid grid-cols-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 text-sm items-center">
            <span className="font-medium">{d.month}/2025</span>
            <span className="text-emerald-600">R$ {d.receita.toLocaleString("pt-BR")}</span>
            <span className="text-red-500">R$ {d.despesas.toLocaleString("pt-BR")}</span>
            <span className="text-muted-foreground">{((d.receita-d.despesas)/d.receita*100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SReports() {
  const rpts = [
    { name:"Ocupação",    desc:"Taxa por período",   icon:<BedDouble size={17}/>,    last:"21/07" },
    { name:"Financeiro",  desc:"Receitas e lucro",   icon:<DollarSign size={17}/>,   last:"21/07" },
    { name:"Reservas",    desc:"Histórico completo", icon:<CalendarCheck size={17}/>,last:"20/07" },
    { name:"Hóspedes",    desc:"Perfil e histórico", icon:<Users size={17}/>,        last:"18/07" },
    { name:"Serviços",    desc:"Mais solicitados",   icon:<Wrench size={17}/>,       last:"15/07" },
    { name:"Equipe",      desc:"Escala e dados",     icon:<UserCog size={17}/>,      last:"01/07" },
  ];
  return (
    <div>
      <SHeader title="Relatórios" sub="Gere e exporte"/>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {rpts.map(r => (
          <div key={r.name} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor:"#EFEBE3", color:GOLD }}>{r.icon}</div>
            <h3 className="font-medium text-foreground text-sm mb-0.5">{r.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{r.last}</span>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"><Download size={10}/>Gerar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SServices() {
  return (
    <div>
      <SHeader title="Serviços Adicionais" action={<AddBtn label="Novo Serviço"/>}/>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span>Serviço</span><span>Categoria</span><span>Preço</span><span>Usos</span><span>Status</span><span>Ações</span>
        </div>
        {servicesData.map(s => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 items-center">
            <p className="text-sm font-medium text-foreground">{s.name}</p>
            <span className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground w-fit">{s.category}</span>
            <div><p className="text-sm font-medium">R$ {s.price}</p><p className="text-xs text-muted-foreground">{s.unit}</p></div>
            <p className="text-sm text-foreground">{s.used}x</p>
            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${s.available?"bg-emerald-50 text-emerald-600":"bg-muted text-muted-foreground"}`}>{s.available?"Disponível":"Indisponível"}</span>
            <div className="flex gap-1"><button className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"><Edit2 size={12}/></button><button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={12}/></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SConfig() {
  return (
    <div>
      <SHeader title="Configurações"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><Shield size={15} style={{ color:GOLD }}/><h3 className="font-medium text-sm">Segurança</h3></div>
          <div className="space-y-4">
            {[
              { label:"Autenticação 2FA",      sub:"Login com código adicional",         on:true },
              { label:"Sessão expira em 8h",   sub:"Logout automático por inatividade",  on:true },
              { label:"Log de acessos",        sub:"Auditoria de entradas no sistema",   on:true },
              { label:"Criptografia LGPD",     sub:"CPF e dados sensíveis cifrados",     on:true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
                <div className="w-9 h-5 rounded-full relative" style={{ backgroundColor:item.on?GOLD:"#E8E4DC" }}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${item.on?"translate-x-4":"translate-x-0.5"}`}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><Building2 size={15} style={{ color:GOLD }}/><h3 className="font-medium text-sm">Dados do Hotel</h3></div>
          <div className="space-y-3">
            {[
              { label:"Nome",     value:"Grand Palácio Hotel" },
              { label:"CNPJ",     value:"12.345.678/0001-99" },
              { label:"Endereço", value:"Av. Paulista, 1000 — São Paulo, SP" },
              { label:"Telefone", value:"(11) 3344-5500" },
              { label:"E-mail",   value:"contato@grandpalacio.com.br" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                <input defaultValue={f.value} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"/>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><RefreshCw size={15} style={{ color:GOLD }}/><h3 className="font-medium text-sm">Backup & Recuperação</h3></div>
          <div className="p-3 bg-muted rounded-lg mb-3"><p className="text-xs font-medium text-foreground">Último backup</p><p className="text-sm font-semibold mt-0.5">22/07/2025 às 03:00</p><p className="text-xs text-muted-foreground">Automático diário ativo</p></div>
          <button className="w-full py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"><Download size={13}/>Exportar Backup</button>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><Users size={15} style={{ color:GOLD }}/><h3 className="font-medium text-sm">Perfis de Acesso</h3></div>
          <div className="space-y-2">
            {[
              { role:"Administrador", perms:"Acesso total",                   count:2 },
              { role:"Gerente",       perms:"Reservas, financeiro, relatórios",count:3 },
              { role:"Recepcionista", perms:"Reservas, hóspedes, quartos",    count:5 },
              { role:"Governanta",    perms:"Quartos e serviços",             count:4 },
            ].map(r => (
              <div key={r.role} className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                <div><p className="text-sm font-medium text-foreground">{r.role}</p><p className="text-xs text-muted-foreground">{r.perms}</p></div>
                <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor:"rgba(22,32,54,0.08)", color:NAVY }}>{r.count} usuários</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<AppPage>("landing");
  switch(page) {
    case "landing":      return <LandingPage onBook={()=>setPage("guest-book")} onPortal={()=>setPage("guest-portal")} onStaff={()=>setPage("staff-login")}/>;
    case "guest-book":   return <GuestBooking onBack={()=>setPage("landing")} onDone={()=>setPage("guest-portal")}/>;
    case "guest-portal": return <GuestPortal onBack={()=>setPage("landing")}/>;
    case "staff-login":  return <StaffLogin onLogin={()=>setPage("staff-portal")} onBack={()=>setPage("landing")}/>;
    case "staff-portal": return <StaffPortal onLogout={()=>setPage("landing")}/>;
    default:             return <LandingPage onBook={()=>setPage("guest-book")} onPortal={()=>setPage("guest-portal")} onStaff={()=>setPage("staff-login")}/>;
  }
}
