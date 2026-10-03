import { useCallback, useRef, useSyncExternalStore } from "react";

export type Platform = "android" | "apple" | "outro";
export type TestResult = "ok" | "falha" | "nt" | "na";

export const OS_STATUSES = [
  "Aberta",
  "Aguardando diagnóstico",
  "Em diagnóstico",
  "Aguardando orçamento",
  "Orçamento enviado",
  "Aguardando aprovação",
  "Aprovado",
  "Aguardando peça",
  "Em reparo",
  "Em testes",
  "Pronto",
  "Entregue",
  "Cancelado",
] as const;
export type OsStatus = (typeof OS_STATUSES)[number];

export const CHECKLIST_ITEMS = [
  "Tela", "Touch", "Câmera frontal", "Câmera traseira", "Microfone", "Alto-falante",
  "Auricular", "Vibração", "Flash", "Wi-Fi", "Bluetooth", "GPS", "NFC", "Biometria",
  "Face ID", "Botões", "Carregamento", "SIM",
];

export const TECHS = ["Joceilton", "Lorran", "Marina"];

export interface Customer {
  id: string; name: string; cpf: string; phone: string; email: string; address: string; notes: string; createdAt: string;
}
export interface Device {
  id: string; customerId: string; brand: string; model: string; platform: Platform; imei: string; imei2: string;
  serial: string; os: string; color: string; storage: string; notes: string;
}
export interface BudgetItem { id: string; desc: string; kind: "servico" | "peca" | "mao"; qty: number; price: number; partId?: string }
export type Approval = "Pendente" | "Aprovado" | "Recusado" | "Expirado";
export interface WorkOrder {
  id: string; number: number; customerId: string; deviceId: string; createdAt: string; dueAt: string; tech: string;
  problem: string; diagnosis: string; status: OsStatus; service: string;
  budget: { items: BudgetItem[]; discount: number; warrantyDays: number; approval: Approval; stockApplied?: boolean };
  checklist: Record<string, TestResult>;
  repair: { procedure: string; notes: string };
  history: { at: string; status: OsStatus; note?: string | undefined; user: string }[];
}
export interface Part {
  id: string; code: string; desc: string; category: string; compat: string; supplier: string;
  cost: number; price: number; qty: number; min: number; location: string;
}
export interface Activity { id: string; at: string; text: string; kind: "android" | "apple" | "ok" | "info" | "warn" }

export interface State {
  customers: Customer[]; devices: Device[]; orders: WorkOrder[]; parts: Part[]; activity: Activity[];
  user: { name: string; role: "Admin" | "Gerente" | "Técnico" | "Atendente" };
}

export const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): State {
  return { customers: [], devices: [], orders: [], parts: [], activity: [], user: { name: "Lorran", role: "Admin" } };
}

const KEY = "hangar-one:v2";
let state: State = seed();
let hydrated = false;
const listeners = new Set<() => void>();

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { state = { ...seed(), ...JSON.parse(raw) }; listeners.forEach((l) => l()); }
  } catch { /* ignore */ }
}

export function setState(fn: (s: State) => State) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function resetData() { setState(() => seed()); }

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function useStore<T>(sel: (s: State) => T): T {
  const selRef = useRef(sel);
  selRef.current = sel;
  const cache = useRef<{ s: State; v: T } | null>(null);
  const get = useCallback(() => {
    if (!cache.current || cache.current.s !== state) cache.current = { s: state, v: selRef.current(state) };
    return cache.current.v;
  }, []);
  return useSyncExternalStore(subscribe, get, get);
}
export const getState = () => state;

export function logActivity(text: string, kind: Activity["kind"] = "info") {
  setState((s) => ({ ...s, activity: [{ id: uid(), at: new Date().toISOString(), text, kind }, ...s.activity].slice(0, 60) }));
}

export function budgetTotal(o: WorkOrder) {
  return o.budget.items.reduce((a, i) => a + i.qty * i.price, 0) - (o.budget.discount || 0);
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
export const osNum = (n: number) => "#" + String(n).padStart(5, "0");

export function statusTone(s: OsStatus): "blue" | "green" | "orange" | "violet" | "cyan" | "red" | "muted" {
  if (s === "Pronto" || s === "Entregue" || s === "Aprovado") return "green";
  if (s === "Cancelado") return "red";
  if (s === "Aguardando peça" || s === "Aguardando aprovação" || s === "Orçamento enviado") return "orange";
  if (s === "Em reparo") return "blue";
  if (s === "Em testes" || s === "Em diagnóstico") return "violet";
  if (s === "Aberta") return "cyan";
  return "muted";
}

/* ---------- Helpers compartilhados entre módulos ---------- */
export const CLOSED_STATUSES: OsStatus[] = ["Entregue", "Cancelado"];
export const isOpen = (o: WorkOrder) => !CLOSED_STATUSES.includes(o.status);
export const isLate = (o: WorkOrder) => new Date(o.dueAt) < new Date() && !["Pronto", ...CLOSED_STATUSES].includes(o.status);
export const digits = (s = "") => s.replace(/\D/g, "");

/** Índice por id — evita `.find` repetido em cada linha das tabelas. */
export function indexById<T extends { id: string }>(list: T[]): Map<string, T> {
  return new Map(list.map((x) => [x.id, x]));
}

export function nextOrderNumber() {
  return Math.max(0, ...state.orders.map((o) => o.number)) + 1;
}

/** Link do WhatsApp com DDI 55 quando o número não tem código de país. */
export function whatsappLink(phone: string, text: string) {
  let n = digits(phone);
  if (n.length <= 11) n = "55" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

/** Baixa as peças do estoque (uma única vez por OS). Retorna quantas unidades foram baixadas. */
export function applyStock(orderId: string): number {
  const o = state.orders.find((x) => x.id === orderId);
  if (!o || o.budget.stockApplied) return 0;
  const use = new Map<string, number>();
  o.budget.items.forEach((i) => { if (i.partId) use.set(i.partId, (use.get(i.partId) ?? 0) + i.qty); });
  let total = 0; use.forEach((q) => (total += q));
  setState((s) => ({
    ...s,
    parts: s.parts.map((p) => (use.has(p.id) ? { ...p, qty: Math.max(0, p.qty - (use.get(p.id) ?? 0)) } : p)),
    orders: s.orders.map((x) => (x.id === orderId ? { ...x, budget: { ...x.budget, stockApplied: true } } : x)),
  }));
  return total;
}
