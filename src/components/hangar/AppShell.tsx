import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { HangarLogo } from "./Logo";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Smartphone, Apple, Users, Tablet, ClipboardList, Stethoscope, Receipt, Package,
  BarChart3, Shield, ChevronsLeft, Search, Bell, Settings, Usb, Circle, Wrench, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { digits, hydrate, indexById, osNum, statusTone, useStore } from "@/lib/store";
import { canAccessModule, signOut, useTenant } from "@/lib/tenant";
import { useUsb } from "@/lib/usb";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Pill } from "./ui";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { module: "dashboard", to: "/", label: "Dashboard", icon: LayoutDashboard },
  { module: "android", to: "/android", label: "Android", icon: Smartphone },
  { module: "apple", to: "/apple", label: "Apple", icon: Apple },
  { module: "clientes", to: "/clientes", label: "Clientes", icon: Users },
  { module: "aparelhos", to: "/aparelhos", label: "Aparelhos", icon: Tablet },
  { module: "ordens", to: "/ordens", label: "Ordens de serviço", icon: ClipboardList },
  { module: "diagnostico", to: "/diagnostico", label: "Diagnóstico", icon: Stethoscope },
  { module: "tecnico", to: "/tecnico", label: "Central Técnica", icon: Wrench },
  { module: "orcamentos", to: "/orcamentos", label: "Orçamentos", icon: Receipt },
  { module: "estoque", to: "/estoque", label: "Estoque", icon: Package },
  { module: "relatorios", to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { module: "admin", to: "/admin", label: "Administração", icon: Shield },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useStore((s) => s.user);
  const tenant = useTenant();
  const visibleNav = NAV.filter((item) => canAccessModule(item.module, tenant?.role) && tenant?.modules[item.module] !== false);
  const currentModule = NAV.find((item) => item.to === "/" ? path === "/" : path.startsWith(item.to))?.module;
  const allowed = !currentModule || (canAccessModule(currentModule, tenant?.role) && tenant?.modules[currentModule] !== false);
  const usb = useUsb();
  const parts = useStore((s) => s.parts);
  const lowStock = useMemo(() => parts.filter((p) => p.qty <= p.min).length, [parts]);

  useEffect(() => { hydrate(); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cn("flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200", collapsed ? "w-[68px]" : "w-60")}>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <HangarLogo size={34} className="shrink-0 drop-shadow-[0_0_6px_rgba(255,32,96,0.45)]" />
          {!collapsed && (
            <div className="leading-none">
              <div className="font-display text-base font-bold tracking-[0.18em]">HANGAR ONE</div>
              <div className="mt-1 text-[10px] tracking-[0.3em] text-muted-foreground">MOBILE REPAIR</div>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {visibleNav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link key={to} to={to} title={label}
                className={cn("group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />}
                <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => setCollapsed((c) => !c)} className="m-2 flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent/60">
          <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Recolher menu"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/70 px-6 backdrop-blur">
          <button onClick={() => setOpen(true)} className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-panel px-3 text-sm text-muted-foreground hover:border-primary/40">
            <Search className="size-4" />
            <span className="flex-1 text-left">Buscar cliente, CPF, telefone, IMEI, OS…</span>
            <kbd className="rounded border border-border px-1.5 font-mono text-[10px]">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-panel px-3 py-1.5 text-xs md:flex">
              <Usb className={cn("size-3.5", usb.phase === "connected" ? "text-success" : "text-muted-foreground")} />
              <span className="text-muted-foreground">{usb.phase === "connected" ? "Dispositivo conectado" : "USB livre"}</span>
            </div>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-panel px-3 py-1.5 text-xs md:flex">
              <Circle className="size-2 fill-success text-success" />
              <span className="text-muted-foreground">Sistema operacional</span>
            </div>
            <Link to="/estoque" className="relative grid size-9 place-items-center rounded-lg border border-border bg-panel hover:border-primary/40" title="Notificações">
              <Bell className="size-4" />
              {lowStock > 0 && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-warning font-mono text-[9px] font-bold text-primary-foreground">{lowStock}</span>}
            </Link>
            <Link to="/admin" className="grid size-9 place-items-center rounded-lg border border-border bg-panel hover:border-primary/40" title="Configurações"><Settings className="size-4" /></Link>
            <div className="hidden max-w-[220px] items-center rounded-lg border border-border bg-panel px-3 py-1.5 xl:flex">
              <div className="min-w-0">
                <div className="truncate text-[11px] font-medium">{tenant?.organization.name ?? "Workspace"}</div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Ambiente da empresa</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void signOut().then(() => window.location.reload())}
              className="group flex items-center gap-2 pl-1"
              title="Sair do Hangar One"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-primary/15 font-display font-bold text-primary">{user.name[0]}</div>
              <div className="hidden leading-tight lg:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-[11px] text-muted-foreground">{tenant?.role === "Owner" ? "Owner" : tenant?.role ?? user.role}</div>
              </div>
              <LogOut className="ml-1 hidden size-3.5 text-muted-foreground transition-colors group-hover:text-primary lg:block" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] p-6">
            {!allowed ? (
              <section className="flex min-h-[60vh] items-center justify-center">
                <div className="max-w-md rounded-xl border border-border bg-panel p-8 text-center">
                  <Shield className="mx-auto size-9 text-primary" />
                  <h1 className="mt-4 font-display text-xl font-semibold">Acesso restrito</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Seu perfil não possui permissão para acessar este módulo.</p>
                </div>
              </section>
            ) : children}
          </div>
        </main>
      </div>
      <GlobalSearch open={open} setOpen={setOpen} />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

function GlobalSearch({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const nav = useNavigate();
  const customers = useStore((s) => s.customers);
  const devices = useStore((s) => s.devices);
  const orders = useStore((s) => s.orders);
  const items = useMemo(() => {
    const cs = indexById(customers); const ds = indexById(devices);
    return orders.map((o) => {
      const c = cs.get(o.customerId); const dv = ds.get(o.deviceId);
      return { o, c, dv, key: [osNum(o.number), o.number, c?.name, c?.cpf, c?.phone, digits(c?.phone), dv?.imei, dv?.serial, dv?.model].join(" ") };
    });
  }, [orders, customers, devices]);
  const go = (fn: () => void) => { setOpen(false); fn(); };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Nome, CPF, telefone, IMEI, serial, OS ou modelo…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Ordens de serviço">
          {items.map(({ o, c, dv, key }) => (
            <CommandItem key={o.id} value={key} onSelect={() => go(() => nav({ to: "/ordens/$id", params: { id: o.id } }))}>
              <span className="font-mono text-primary">{osNum(o.number)}</span>
              <span className="truncate">{c?.name} · {dv?.brand} {dv?.model}</span>
              <span className="ml-auto"><Pill tone={statusTone(o.status)}>{o.status}</Pill></span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Clientes">
          {customers.map((c) => (
            <CommandItem key={c.id} value={`${c.name} ${c.cpf} ${c.phone} ${digits(c.phone)}`} onSelect={() => go(() => nav({ to: "/clientes", search: { id: c.id } }))}>
              <Users className="size-4" /> {c.name} <span className="ml-auto font-mono text-xs text-muted-foreground">{c.phone}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
