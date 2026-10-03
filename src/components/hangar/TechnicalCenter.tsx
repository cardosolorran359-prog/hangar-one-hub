import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, Calculator, CheckCircle2, Clock3, Cpu, FileText, Filter,
  History, Laptop, Lightbulb, Search, Smartphone, Star, Stethoscope, Upload, Wrench, X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Panel } from "./ui";
import { TechContentImporter } from "./TechContentImporter";
import { listIndexedDocuments, searchIndexedDocuments, type IndexedTechDocument } from "@/lib/techLibrary";

type Mode = "buscar" | "diagnostico" | "procedimentos" | "calculadoras" | "favoritos" | "historico";
type Scope = "todos" | "celular" | "computador";

type Doc = {
  id: string;
  title: string;
  source: string;
  scope: Exclude<Scope, "todos">;
  brand: string;
  model: string;
  kind: string;
  tags: string[];
  excerpt: string;
  page?: number;
};

type Procedure = {
  id: string;
  title: string;
  scope: Exclude<Scope, "todos">;
  symptom: string;
  description: string;
  steps: string[];
  tags: string[];
};

const DOCS: Doc[] = [
  { id: "d1", title: "Diagnóstico de aparelhos sem power", source: "Base demonstrativa", scope: "celular", brand: "Multimarca", model: "—", kind: "Procedimento", tags: ["não liga", "no power", "consumo", "fonte", "curto"], excerpt: "Sequência de testes para diferenciar bateria, alimentação, curto e falha de inicialização.", page: 18 },
  { id: "d2", title: "Análise de consumo na fonte assimétrica", source: "Base demonstrativa", scope: "celular", brand: "Multimarca", model: "—", kind: "Guia de bancada", tags: ["consumo", "fonte", "curto", "boot"], excerpt: "Leitura do comportamento de corrente antes, durante e depois do acionamento.", page: 42 },
  { id: "d3", title: "Samsung Galaxy A15 — sequência de power", source: "Base demonstrativa", scope: "celular", brand: "Samsung", model: "Galaxy A15", kind: "Service guide", tags: ["a15", "samsung", "power", "não liga", "alimentação"], excerpt: "Pontos de verificação para a sequência de alimentação e inicialização do A15.", page: 127 },
  { id: "d4", title: "iPhone — diagnóstico de não carga", source: "Base demonstrativa", scope: "celular", brand: "Apple", model: "iPhone", kind: "Procedimento", tags: ["iphone", "não carrega", "carga", "usb", "conector"], excerpt: "Verificações de entrada, conector, linhas de carga e comunicação.", page: 76 },
  { id: "d5", title: "Fundamentos de curto em placas", source: "Base demonstrativa", scope: "computador", brand: "Multimarca", model: "—", kind: "Aula técnica", tags: ["curto", "placa", "mosfet", "diodo", "resistência"], excerpt: "Método de localização de curto usando resistência, diodo e injeção controlada.", page: 31 },
  { id: "d6", title: "Notebook sem vídeo — roteiro de diagnóstico", source: "Base demonstrativa", scope: "computador", brand: "Multimarca", model: "Notebook", kind: "Roteiro", tags: ["sem vídeo", "não dá imagem", "ram", "bios", "display"], excerpt: "Checklist de bancada para notebooks que ligam sem apresentar imagem.", page: 12 },
  { id: "d7", title: "BIOS/UEFI — diagnóstico e recuperação", source: "Base demonstrativa", scope: "computador", brand: "Multimarca", model: "Desktop / Notebook", kind: "Referência", tags: ["bios", "uefi", "boot", "firmware"], excerpt: "Roteiro de verificação para falhas de POST e inicialização relacionadas ao firmware.", page: 90 },
  { id: "d8", title: "Lei de Ohm aplicada à bancada", source: "Base demonstrativa", scope: "computador", brand: "Multimarca", model: "—", kind: "Referência", tags: ["ohm", "tensão", "corrente", "resistência", "potência"], excerpt: "Relações básicas para medições e cálculos durante o diagnóstico.", page: 4 },
];

const PROCEDURES: Procedure[] = [
  { id: "p1", title: "Celular não liga", scope: "celular", symptom: "Não liga / no power", description: "Fluxo básico de triagem antes de partir para análise de placa.", steps: ["Confirmar estado da bateria e tensão de entrada.", "Conectar à fonte e observar o consumo em repouso.", "Acionar o aparelho e registrar o comportamento da corrente.", "Separar falha de alimentação, curto ou sequência de boot.", "Abrir o procedimento/documento específico do modelo."], tags: ["não liga", "no power", "consumo"] },
  { id: "p2", title: "Liga, mas não dá imagem", scope: "computador", symptom: "Sem vídeo", description: "Roteiro para diferenciar RAM, firmware, GPU e caminho de vídeo.", steps: ["Confirmar sinais de inicialização e alimentação.", "Testar memória e configuração mínima.", "Verificar saída de vídeo e cabo/monitor.", "Checar POST/BIOS quando aplicável.", "Documentar a etapa em que o sintoma muda."], tags: ["sem vídeo", "ram", "bios"] },
  { id: "p3", title: "Aparelho não carrega", scope: "celular", symptom: "Não carrega", description: "Triagem de alimentação, conector e circuito de carga.", steps: ["Confirmar carregador, cabo e fonte de teste.", "Inspecionar conector e sinais de oxidação/dano.", "Verificar tensão de entrada.", "Comparar consumo e comportamento com uma condição conhecida.", "Usar o esquema correspondente antes de substituir componentes."], tags: ["carga", "não carrega", "usb"] },
];

const SYNONYMS: Record<string, string[]> = {
  "não liga": ["no power", "dead", "sem power", "não inicializa"],
  "não carrega": ["carga", "no charge", "charging", "usb"],
  "sem vídeo": ["não dá imagem", "sem imagem", "no display", "black screen"],
  "curto": ["short", "short circuit", "consumo anormal"],
  "fonte": ["fonte assimétrica", "power supply", "bench supply"],
  "memória": ["ram"],
};

const SUGGESTIONS = [
  "celular não liga",
  "a15 não liga",
  "iphone não carrega",
  "celular em curto",
  "notebook sem vídeo",
  "bios não inicia",
  "consumo na fonte",
  "teste de ram",
];

const norm = (value: string) =>
  value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();

const expand = (term: string) => {
  const n = norm(term);
  const values = [n];
  Object.entries(SYNONYMS).forEach(([key, aliases]) => {
    const group = [key, ...aliases].map(norm);
    if (group.some((v) => v === n || v.includes(n) || n.includes(v))) values.push(...group);
  });
  return [...new Set(values)];
};

function searchDocs(query: string, scope: Scope) {
  const q = norm(query);
  if (!q && scope === "todos") return DOCS;
  const tokens = q.split(" ").filter(Boolean);
  const expandedTokens = [...new Set(tokens.flatMap(expand))];
  return DOCS
    .filter((d) => scope === "todos" || d.scope === scope)
    .map((d) => {
      const hay = norm([d.title, d.source, d.brand, d.model, d.kind, d.tags.join(" "), d.excerpt].join(" "));
      let score = 0;
      if (q && norm(d.title).includes(q)) score += 12;
      if (q && norm(d.model).includes(q)) score += 9;
      expandedTokens.forEach((t) => {
        if (hay.includes(t)) score += 2 + (norm(d.tags.join(" ")).includes(t) ? 4 : 0);
        if (norm(d.title).includes(t)) score += 5;
      });
      return { d, score };
    })
    .filter(({ score }) => score > 0 || !q)
    .sort((a, b) => b.score - a.score)
    .map(({ d }) => d);
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function TechnicalCenter() {
  const [mode, setMode] = useState<Mode>("buscar");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [voltage, setVoltage] = useState("5");
  const [current, setCurrent] = useState("2");
  const [resistance, setResistance] = useState("2.5");
  const [importOpen, setImportOpen] = useState(false);
  const [libraryDocs, setLibraryDocs] = useState<IndexedTechDocument[]>([]);

  useEffect(() => {
    setFavorites(loadJson("hangar-one-tech-favorites", []));
    setHistory(loadJson("hangar-one-tech-history", []));
    void refreshLibrary();
  }, []);

  const refreshLibrary = async () => {
    try { setLibraryDocs(await listIndexedDocuments()); } catch { toast.error("Não foi possível carregar o índice local."); }
  };

  useEffect(() => {
    localStorage.setItem("hangar-one-tech-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("hangar-one-tech-history", JSON.stringify(history));
  }, [history]);

  const indexedAsDocs = useMemo<Doc[]>(() => libraryDocs.map((d) => ({
    id: d.id, title: d.title, source: d.source, scope: d.scope, brand: d.brand, model: d.model, kind: d.kind,
    tags: d.tags, excerpt: d.excerpt, page: d.page,
  })), [libraryDocs]);
  const allDocs = useMemo(() => [...DOCS, ...indexedAsDocs], [indexedAsDocs]);
  const results = useMemo(() => {
    const base = searchDocs(query, scope);
    const indexed = searchIndexedDocuments(libraryDocs, query, SYNONYMS, scope) as Doc[];
    return [...base, ...indexed];
  }, [query, scope, libraryDocs]);
  const suggestions = useMemo(() => {
    const q = norm(query);
    return SUGGESTIONS.filter((item) => !q || norm(item).includes(q)).slice(0, 6);
  }, [query]);

  const saveSearch = (value: string) => {
    const q = value.trim();
    if (!q) return;
    setHistory((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 12));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]);
  };

  const onSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) saveSearch(value);
  };

  const modeItems: [Mode, string, typeof Search][] = [
    ["buscar", "Busca", Search],
    ["diagnostico", "Diagnóstico", Stethoscope],
    ["procedimentos", "Procedimentos", Wrench],
    ["calculadoras", "Calculadoras", Calculator],
    ["favoritos", "Favoritos", Star],
    ["historico", "Histórico", History],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-tech text-primary">Módulo técnico</div>
          <h1 className="mt-1 font-display text-3xl font-semibold">Central de bancada</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Busca rápida por sintomas, modelos, componentes e procedimentos — sem depender de IA.</p>
        </div>
        <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/15">
          <Upload className="size-4" /> Adicionar conteúdo
        </button>
      </div>

      <div className="grid gap-2 rounded-xl border border-border bg-panel p-2 lg:grid-cols-6">
        {modeItems.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setMode(key)} className={cn("flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm", mode === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {mode === "buscar" && (
        <>
          <Panel className="overflow-hidden">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.15)]">
                <Search className="size-5 text-primary" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveSearch(query)} placeholder="Ex.: A15 não liga, iPhone não carrega, notebook sem vídeo…" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" autoFocus />
                {query && <button onClick={() => setQuery("")} className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Filter className="mr-1 size-3.5 text-muted-foreground" />
                {(["todos", "celular", "computador"] as Scope[]).map((v) => (
                  <button key={v} onClick={() => setScope(v)} className={cn("rounded-full border px-3 py-1.5 text-xs capitalize", scope === v ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40")}>
                    {v === "todos" ? "Todos" : v}
                  </button>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">{results.length} resultados</span>
              </div>

              {query && suggestions.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="label-tech mb-2">Sugestões</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => onSearch(s)} className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:border-primary/30 hover:text-primary">{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <div className="grid gap-4">
            {results.map((d) => {
              const fav = favorites.includes(d.id);
              return (
                <div key={d.id} className="group rounded-xl border border-border bg-panel p-5 transition-colors hover:border-primary/30">
                  <div className="flex gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      {d.scope === "celular" ? <Smartphone className="size-5" /> : <Laptop className="size-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="label-tech text-muted-foreground">{d.kind} · {d.source}</div>
                          <h2 className="mt-1 text-lg font-semibold">{d.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{d.excerpt}</p>
                        </div>
                        <button onClick={() => toggleFavorite(d.id)} className={cn("rounded-lg border p-2", fav ? "border-warning/30 bg-warning/10 text-warning" : "border-border text-muted-foreground hover:text-warning")} title="Favorito"><Star className={cn("size-4", fav && "fill-current")} /></button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {[d.brand, d.model, ...d.tags].filter((x) => x && x !== "—").slice(0, 8).map((tag) => <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">{tag}</span>)}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground"><FileText className="size-3.5" /> {d.source}</span>
                        {d.page && <span className="inline-flex items-center gap-1.5 font-mono text-muted-foreground">pág. {d.page}</span>}
                        <button onClick={() => toast.info("O visualizador de documento será ligado ao arquivo/indexador do acervo.")} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-primary hover:bg-primary/15">Abrir conteúdo <ArrowRight className="size-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!results.length && <Panel><div className="py-10 text-center text-sm text-muted-foreground">Nenhum conteúdo encontrado. Tente outro termo, modelo ou sintoma.</div></Panel>}
          </div>
        </>
      )}

      {mode === "diagnostico" && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Panel title="Começar pelo sintoma" icon={<Stethoscope className="size-3.5 text-primary" />}>
            <div className="space-y-2">
              {PROCEDURES.map((p) => (
                <button key={p.id} onClick={() => { setQuery(p.symptom); saveSearch(p.symptom); }} className="w-full rounded-lg border border-border p-3 text-left hover:border-primary/30 hover:bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium"><span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary"><Stethoscope className="size-3.5" /></span>{p.symptom}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.title}</div>
                </button>
              ))}
            </div>
          </Panel>
          <div className="space-y-4">
            {PROCEDURES.map((p) => (
              <Panel key={p.id} title={p.title} icon={<Wrench className="size-3.5 text-success" />}>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 grid gap-2">
                  {p.steps.map((step, i) => <div key={step} className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3"><span className="grid size-6 shrink-0 place-items-center rounded-full border border-primary/30 text-xs font-mono text-primary">{i + 1}</span><span className="text-sm">{step}</span></div>)}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">{p.tags.map((tag) => <span key={tag} className="rounded-md bg-primary/10 px-2 py-1 text-[11px] text-primary">{tag}</span>)}</div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {mode === "procedimentos" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {PROCEDURES.map((p) => (
            <Panel key={p.id} title={p.title} icon={<Wrench className="size-3.5 text-primary" />}>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 space-y-2">{p.steps.map((s, i) => <div key={s} className="flex gap-3 text-sm"><span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span><span>{s}</span></div>)}</div>
            </Panel>
          ))}
        </div>
      )}

      {mode === "calculadoras" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Lei de Ohm" icon={<Calculator className="size-3.5 text-primary" />}>
            <div className="space-y-3">
              <Field label="Tensão (V)" value={voltage} setValue={setVoltage} />
              <Field label="Corrente (A)" value={current} setValue={setCurrent} />
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4"><div className="label-tech text-primary">Resistência calculada</div><div className="mt-1 font-mono text-2xl">{((Number(voltage) || 0) / (Number(current) || 1)).toFixed(3)} Ω</div></div>
            </div>
          </Panel>
          <Panel title="Potência" icon={<Lightbulb className="size-3.5 text-warning" />}>
            <div className="space-y-3">
              <Field label="Tensão (V)" value={voltage} setValue={setVoltage} />
              <Field label="Corrente (A)" value={current} setValue={setCurrent} />
              <div className="rounded-lg border border-warning/20 bg-warning/10 p-4"><div className="label-tech text-warning">Potência calculada</div><div className="mt-1 font-mono text-2xl">{((Number(voltage) || 0) * (Number(current) || 0)).toFixed(3)} W</div></div>
            </div>
          </Panel>
          <Panel title="Corrente por resistência" icon={<Cpu className="size-3.5 text-violet" />}>
            <div className="space-y-3">
              <Field label="Tensão (V)" value={voltage} setValue={setVoltage} />
              <Field label="Resistência (Ω)" value={resistance} setValue={setResistance} />
              <div className="rounded-lg border border-violet/20 bg-violet/10 p-4"><div className="label-tech text-violet">Corrente calculada</div><div className="mt-1 font-mono text-2xl">{((Number(voltage) || 0) / (Number(resistance) || 1)).toFixed(3)} A</div></div>
            </div>
          </Panel>
        </div>
      )}

      {mode === "favoritos" && (
        <Panel title="Meus conteúdos salvos" icon={<Star className="size-3.5 text-warning" />}>
          <div className="space-y-2">
            {allDocs.filter((d) => favorites.includes(d.id)).map((d) => <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border p-3"><Star className="size-4 fill-current text-warning" /><div className="flex-1"><div className="text-sm font-medium">{d.title}</div><div className="text-xs text-muted-foreground">{d.brand} · {d.model}</div></div><button onClick={() => toggleFavorite(d.id)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button></div>)}
            {!favorites.length && <div className="py-10 text-center text-sm text-muted-foreground">Você ainda não salvou nenhum conteúdo.</div>}
          </div>
        </Panel>
      )}

      {mode === "historico" && (
        <Panel title="Pesquisas recentes" icon={<History className="size-3.5 text-primary" />}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((h) => <button key={h} onClick={() => { setQuery(h); setMode("buscar"); }} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-primary/30 hover:bg-muted/20"><Clock3 className="size-4 text-muted-foreground" /><span className="flex-1 text-sm">{h}</span><ArrowRight className="size-3.5 text-muted-foreground" /></button>)}
            {!history.length && <div className="py-10 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">As pesquisas feitas aqui aparecerão neste histórico.</div>}
          </div>
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={<BookOpen className="size-4" />} title="Acervo pesquisável" text="Documentos, páginas e termos serão indexados para localizar o trecho certo sem abrir centenas de páginas." />
        <InfoCard icon={<Stethoscope className="size-4" />} title="Diagnóstico guiado" text="Fluxos por sintoma ajudam a chegar ao próximo teste antes de trocar componentes." />
        <InfoCard icon={<CheckCircle2 className="size-4" />} title="Sem dependência de IA" text="Sinônimos, filtros, pesos e histórico fazem a busca funcionar de forma rápida e previsível." />
      </div>
      <TechContentImporter open={importOpen} onClose={() => setImportOpen(false)} onChanged={refreshLibrary} />
    </div>
  );
}

function Field({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-xs text-muted-foreground">{label}</span><input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono outline-none focus:border-primary/50" /></label>;
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-xl border border-border bg-panel p-4"><div className="mb-3 grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</div></div>;
}
