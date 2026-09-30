import { useSyncExternalStore } from "react";

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
export interface BudgetItem { id: string; desc: string; kind: "servico" | "peca" | "mao"; qty: number; price: number }
export type Approval = "Pendente" | "Aprovado" | "Recusado" | "Expirado";
export interface WorkOrder {
  id: string; number: number; customerId: string; deviceId: string; createdAt: string; dueAt: string; tech: string;
  problem: string; diagnosis: string; status: OsStatus; service: string;
  budget: { items: BudgetItem[]; discount: number; warrantyDays: number; approval: Approval };
  checklist: Record<string, TestResult>;
  repair: { procedure: string; notes: string };
  history: { at: string; status: OsStatus; note?: string; user: string }[];
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
const d = (daysAgo: number, h = 10, m = 0) => {
  const x = new Date(); x.setDate(x.getDate() - daysAgo); x.setHours(h, m, 0, 0); return x.toISOString();
};

function seed(): State {
  const customers: Customer[] = [
    { id: "c1", name: "João Silva", cpf: "123.456.789-00", phone: "(11) 98765-4321", email: "joao@email.com", address: "Rua das Flores, 120 — São Paulo", notes: "", createdAt: d(60) },
    { id: "c2", name: "Maria Oliveira", cpf: "987.654.321-00", phone: "(11) 91234-5678", email: "maria@email.com", address: "Av. Paulista, 900", notes: "Prefere contato via WhatsApp", createdAt: d(40) },
    { id: "c3", name: "Carlos Mendes", cpf: "456.789.123-00", phone: "(21) 99876-1122", email: "carlos@email.com", address: "Rua Chile, 45 — RJ", notes: "", createdAt: d(22) },
    { id: "c4", name: "Ana Costa", cpf: "321.654.987-00", phone: "(31) 98111-2233", email: "ana@email.com", address: "Rua Bahia, 300 — BH", notes: "", createdAt: d(10) },
  ];
  const devices: Device[] = [
    { id: "d1", customerId: "c1", brand: "Samsung", model: "Galaxy A25", platform: "android", imei: "356789104512345", imei2: "356789104512352", serial: "R58W21ABCDE", os: "Android 15", color: "Azul", storage: "128 GB", notes: "" },
    { id: "d2", customerId: "c1", brand: "Apple", model: "iPhone 13", platform: "apple", imei: "353912110987654", imei2: "", serial: "F2LXK9Q1N7", os: "iOS 18.4", color: "Meia-noite", storage: "128 GB", notes: "" },
    { id: "d3", customerId: "c2", brand: "Xiaomi", model: "Redmi Note 13", platform: "android", imei: "861234050998877", imei2: "", serial: "XM13N0098", os: "Android 14", color: "Preto", storage: "256 GB", notes: "" },
    { id: "d4", customerId: "c3", brand: "Apple", model: "iPhone 14 Pro", platform: "apple", imei: "359876543210987", imei2: "", serial: "G7HQP2X9M1", os: "iOS 18.2", color: "Roxo", storage: "256 GB", notes: "Face ID intermitente" },
    { id: "d5", customerId: "c4", brand: "Motorola", model: "Moto G84", platform: "android", imei: "352233445566778", imei2: "", serial: "ZY22GH7K", os: "Android 14", color: "Magenta", storage: "256 GB", notes: "" },
  ];
  const mk = (n: number, c: string, dev: string, service: string, status: OsStatus, days: number, tech: string, items: [string, BudgetItem["kind"], number][], problem: string, approval: Approval = "Aprovado"): WorkOrder => ({
    id: "o" + n, number: n, customerId: c, deviceId: dev, createdAt: d(days, 10, 31), dueAt: d(days - 3, 18), tech, service,
    problem, diagnosis: "", status,
    budget: { items: items.map(([desc, kind, price]) => ({ id: uid(), desc, kind, qty: 1, price })), discount: 0, warrantyDays: 90, approval },
    checklist: {}, repair: { procedure: "", notes: "" },
    history: [{ at: d(days, 10, 31), status: "Aberta", user: tech }, ...(status !== "Aberta" ? [{ at: d(days, 11, 18), status, user: tech }] : [])],
  });
  const orders: WorkOrder[] = [
    mk(125, "c1", "d1", "Troca de tela", "Em reparo", 1, "Joceilton", [["Troca de tela", "servico", 350], ["Mão de obra", "mao", 100], ["Adesivo", "peca", 20]], "Tela trincada após queda, touch falhando no canto inferior."),
    mk(124, "c3", "d4", "Reparo Face ID", "Em diagnóstico", 2, "Marina", [], "Face ID não configura após troca de tela em outra loja.", "Pendente"),
    mk(123, "c2", "d3", "Troca de bateria", "Pronto", 3, "Lorran", [["Bateria Redmi Note 13", "peca", 180], ["Mão de obra", "mao", 80]], "Bateria descarregando rápido."),
    mk(122, "c4", "d5", "Conector de carga", "Aguardando peça", 4, "Joceilton", [["Conector de carga", "peca", 90], ["Mão de obra", "mao", 90]], "Não carrega, só com cabo em posição específica."),
    mk(121, "c1", "d2", "Troca de bateria", "Entregue", 9, "Marina", [["Bateria iPhone 13", "peca", 320], ["Mão de obra", "mao", 100]], "Saúde da bateria em 71%."),
    mk(120, "c2", "d3", "Atualização de software", "Entregue", 14, "Lorran", [["Atualização / reinstalação", "servico", 120]], "Travado na logo."),
    mk(119, "c3", "d4", "Troca de vidro traseiro", "Orçamento enviado", 5, "Joceilton", [["Vidro traseiro", "peca", 280], ["Mão de obra", "mao", 150]], "Vidro traseiro quebrado.", "Pendente"),
  ];
  const parts: Part[] = [
    { id: "p1", code: "TL-A25", desc: "Tela Samsung A25 OLED", category: "Tela", compat: "Galaxy A25", supplier: "MobParts", cost: 190, price: 350, qty: 4, min: 2, location: "A1-03" },
    { id: "p2", code: "BT-IP13", desc: "Bateria iPhone 13", category: "Bateria", compat: "iPhone 13", supplier: "iSupply", cost: 140, price: 320, qty: 1, min: 3, location: "B2-01" },
    { id: "p3", code: "CC-G84", desc: "Conector de carga Moto G84", category: "Conector", compat: "Moto G84", supplier: "MobParts", cost: 35, price: 90, qty: 0, min: 2, location: "C1-07" },
    { id: "p4", code: "BT-RN13", desc: "Bateria Redmi Note 13", category: "Bateria", compat: "Redmi Note 13", supplier: "XiParts", cost: 70, price: 180, qty: 6, min: 2, location: "B2-04" },
    { id: "p5", code: "AD-UNI", desc: "Adesivo de vedação universal", category: "Consumível", compat: "Universal", supplier: "MobParts", cost: 4, price: 20, qty: 42, min: 10, location: "D1-01" },
    { id: "p6", code: "VT-14P", desc: "Vidro traseiro iPhone 14 Pro", category: "Carcaça", compat: "iPhone 14 Pro", supplier: "iSupply", cost: 110, price: 280, qty: 2, min: 1, location: "A3-02" },
  ];
  const activity: Activity[] = [
    { id: uid(), at: d(0, 15, 24), text: "OS #00125 movida para Em reparo", kind: "info" },
    { id: uid(), at: d(0, 15, 21), text: "Backup do Galaxy A25 registrado", kind: "ok" },
    { id: uid(), at: d(0, 15, 10), text: "iPhone 14 Pro entrou em diagnóstico", kind: "apple" },
    { id: uid(), at: d(0, 14, 52), text: "Redmi Note 13 pronto para retirada", kind: "android" },
    { id: uid(), at: d(0, 14, 5), text: "Estoque baixo: Bateria iPhone 13", kind: "warn" },
  ];
  return { customers, devices, orders, parts, activity, user: { name: "Lorran", role: "Admin" } };
}

const KEY = "hangar-one:v1";
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

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => sel(state),
    () => sel(state),
  );
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
