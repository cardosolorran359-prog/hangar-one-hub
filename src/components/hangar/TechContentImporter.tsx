import { useEffect, useRef, useState } from "react";
import { FileText, FolderOpen, Loader2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "./ui";
import { indexTechFile, listIndexedDocuments, removeIndexedDocument, type IndexedTechDocument } from "@/lib/techLibrary";

type Props = { open: boolean; onClose: () => void; onChanged: () => void; };

export function TechContentImporter({ open, onClose, onChanged }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [scope, setScope] = useState<"celular" | "computador">("celular");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [kind, setKind] = useState("Documento");
  const [tags, setTags] = useState("");
  const [docs, setDocs] = useState<IndexedTechDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const refresh = async () => setDocs(await listIndexedDocuments());
  useEffect(() => { if (open) refresh(); }, [open]);
  if (!open) return null;

  const importFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true); setProgress(0);
    try {
      for (let i = 0; i < list.length; i++) {
        const file = list[i]!;
        const currentTitle = title.trim() || (list.length === 1 ? "" : file.name.replace(/\.[^.]+$/, ""));
        await indexTechFile(file, { title: currentTitle, source, scope, brand, model, kind, tags: tags.split(",").map((x) => x.trim()).filter(Boolean) });
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      await refresh();
      onChanged();
      toast.success(list.length === 1 ? "Conteúdo indexado com sucesso." : list.length + " conteúdos indexados com sucesso.");
      setTitle(""); setSource(""); setBrand(""); setModel(""); setTags("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível indexar o conteúdo.";
      toast.error(message);
    } finally { setBusy(false); }
  };

  const drop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!busy) void importFiles(event.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="label-tech text-primary">Acervo técnico</div>
            <h2 className="mt-1 text-xl font-semibold">Adicionar e indexar conteúdo</h2>
            <p className="mt-1 text-xs text-muted-foreground">PDFs são lidos página por página para a busca encontrar o trecho relevante.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Fechar"><X className="size-5" /></button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.25fr]">
          <div className="space-y-4">
            <Panel title="Metadados do conteúdo" icon={<FileText className="size-3.5 text-primary" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Título" value={title} onChange={setTitle} placeholder="Ex.: Samsung A15 — Power" className="sm:col-span-2" />
                <Field label="Fonte" value={source} onChange={setSource} placeholder="Curso, manual, apostila..." className="sm:col-span-2" />
                <label className="block"><span className="mb-1.5 block text-xs text-muted-foreground">Área</span><select value={scope} onChange={(e) => setScope(e.target.value as "celular" | "computador")} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"><option value="celular">Celular</option><option value="computador">Computador</option></select></label>
                <Field label="Tipo" value={kind} onChange={setKind} placeholder="Manual, curso, esquema..." />
                <Field label="Marca" value={brand} onChange={setBrand} placeholder="Samsung, Apple..." />
                <Field label="Modelo / família" value={model} onChange={setModel} placeholder="A15, iPhone 11..." />
                <Field label="Tags" value={tags} onChange={setTags} placeholder="power, curto, consumo..." className="sm:col-span-2" />
              </div>
            </Panel>

            <div onDragOver={(e) => e.preventDefault()} onDrop={drop} className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
              {busy ? <><Loader2 className="mx-auto size-8 animate-spin text-primary" /><div className="mt-3 text-sm font-medium">Indexando conteúdo…</div><div className="mt-1 font-mono text-xs text-muted-foreground">{progress}%</div><div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: progress + "%" }} /></div></> : <><Upload className="mx-auto size-8 text-primary" /><div className="mt-3 text-sm font-medium">Arraste seus arquivos aqui</div><div className="mt-1 text-xs text-muted-foreground">PDF, TXT, MD, HTML, JSON ou CSV</div><button onClick={() => inputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/15"><FolderOpen className="size-4" /> Selecionar arquivos</button><input ref={inputRef} type="file" multiple accept=".pdf,.txt,.md,.html,.json,.csv,application/pdf,text/plain,text/html,application/json,text/csv" className="hidden" onChange={(e) => { if (e.target.files) void importFiles(e.target.files); e.currentTarget.value = ""; }} /></>}
            </div>
          </div>

          <Panel title={"Conteúdos indexados · " + docs.length} icon={<FileText className="size-3.5 text-success" />}>
            <div className="space-y-2">
              {docs.map((d) => <div key={d.id} className="rounded-lg border border-border bg-muted/20 p-3"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-medium">{d.title}</div><div className="mt-1 text-xs text-muted-foreground">{d.fileName} · {d.pageCount} pág. · {Math.max(1, Math.round(d.fileSize / 1024))} KB</div><div className="mt-2 flex flex-wrap gap-1.5">{[d.brand, d.model, ...d.tags].filter((x) => x && x !== "—").slice(0, 7).map((tag) => <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">{tag}</span>)}</div></div><button onClick={async () => { await removeIndexedDocument(d.id); await refresh(); onChanged(); toast.success("Conteúdo removido do índice local."); }} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Remover do índice"><Trash2 className="size-4" /></button></div></div>)}
              {!docs.length && <div className="py-12 text-center text-sm text-muted-foreground">Nenhum arquivo indexado ainda.<br />O conteúdo que você adicionar aparecerá aqui.</div>}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <label className={"block " + className}><span className="mb-1.5 block text-xs text-muted-foreground">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50" /></label>;
}