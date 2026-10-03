import { useMemo, useState } from "react";
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, FileText, Hash, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndexedTechDocument } from "@/lib/techLibrary";
import { Panel } from "./ui";

type DocMeta = { id: string; title: string; source: string; scope: "celular" | "computador"; brand: string; model: string; kind: string; tags: string[]; excerpt: string; page?: number; };
type Props = { doc: IndexedTechDocument | DocMeta; onBack: () => void; onFavorite: () => void; favorite: boolean; };

type Block = { kind: "heading" | "subheading" | "paragraph" | "list"; text: string; index: number; };

function makeBlocks(text: string) {
  const lines = text.split(/\r?\n/).map((x) => x.replace(/\s+/g, " ").trim()).filter(Boolean);
  return lines.map((line, index): Block => {
    const numbered = /^(?:\d+[.)]|[-•*])\s+/.test(line);
    const clean = numbered ? line.replace(/^(?:\d+[.)]|[-•*])\s+/, "") : line;
    const upper = clean === clean.toLocaleUpperCase("pt-BR") && /[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ]/i.test(clean);
    if (/^(?:\d+\.|\d+\)|cap[ií]tulo|chapter|se[cç][aã]o|section)\b/i.test(clean) || upper || (clean.length < 90 && /:$/.test(clean))) return { kind: "heading", text: clean.replace(/:$/, ""), index };
    if (numbered) return { kind: "list", text: clean, index };
    if (clean.length < 110 && (/^[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ][^.!?]{2,70}$/.test(clean) || /^[A-Z0-9][A-Za-z0-9 /_-]{2,70}$/.test(clean))) return { kind: "subheading", text: clean, index };
    return { kind: "paragraph", text: clean, index };
  });
}

export function TechDocumentReader({ doc, onBack, onFavorite, favorite }: Props) {
  const indexed = "pages" in doc;
  const [page, setPage] = useState(0);
  const [find, setFind] = useState("");
  const pages = indexed ? doc.pages : [{ page: 1, text: doc.excerpt }];
  const current = pages[Math.min(page, pages.length - 1)];
  const blocks = useMemo(() => makeBlocks(current?.text || ""), [current?.text]);
  const headings = useMemo(() => pages.flatMap((p) => makeBlocks(p.text).filter((b) => b.kind === "heading").map((b) => ({ page: p.page, text: b.text }))).slice(0, 40), [pages]);
  const highlight = (value: string) => {
    const q = find.trim(); if (!q) return value;
    const parts = value.split(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"));
    return parts.map((part, i) => part.toLocaleLowerCase("pt-BR") === q.toLocaleLowerCase("pt-BR") ? <mark key={i} className="rounded bg-primary/20 px-0.5 text-primary">{part}</mark> : part);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm hover:border-primary/30"><ArrowLeft className="size-4" /> Voltar à busca</button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onFavorite} className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", favorite ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-panel text-muted-foreground")}><Bookmark className={cn("size-4", favorite && "fill-current")} /> {favorite ? "Salvo" : "Salvar"}</button>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-panel p-1">
            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="rounded-md p-1.5 disabled:opacity-30"><ChevronLeft className="size-4" /></button>
            <span className="px-2 font-mono text-xs text-muted-foreground">{current?.page ?? page + 1} / {pages.length}</span>
            <button disabled={page >= pages.length - 1} onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} className="rounded-md p-1.5 disabled:opacity-30"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Panel title="Índice técnico" icon={<Hash className="size-3.5 text-primary" />} className="sticky top-4">
            <div className="max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto pr-1">
              {headings.map((h, i) => <button key={i} onClick={() => setPage(Math.max(0, h.page - 1))} className={cn("w-full rounded-md px-2.5 py-2 text-left text-xs leading-snug hover:bg-muted/50", h.page === current?.page ? "bg-primary/10 text-primary" : "text-muted-foreground")}>p.{h.page} · {h.text}</button>)}
              {!headings.length && <div className="py-3 text-xs text-muted-foreground">Este conteúdo ainda não possui títulos detectáveis.</div>}
            </div>
          </Panel>
        </aside>

        <main className="min-w-0">
          <Panel className="overflow-hidden">
            <div className="border-b border-border px-6 py-6 sm:px-8">
              <div className="label-tech text-primary">{doc.kind} · CONHECIMENTO TÉCNICO</div>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                <div><h1 className="font-display text-3xl font-semibold tracking-tight">{doc.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{doc.excerpt}</p></div>
                <div className="grid min-w-[180px] gap-1 rounded-lg border border-border bg-muted/20 p-3 text-xs">
                  <span><b className="text-foreground">Área:</b> {doc.scope === "celular" ? "Celulares" : "Computadores"}</span>
                  <span><b className="text-foreground">Marca:</b> {doc.brand}</span>
                  <span><b className="text-foreground">Modelo:</b> {doc.model}</span>
                  <span><b className="text-foreground">Fonte:</b> {doc.source}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">{doc.tags.filter(Boolean).map((t) => <span key={t} className="rounded-md bg-primary/10 px-2 py-1 text-[10px] text-primary">{t}</span>)}</div>
            </div>

            <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-6 py-3 sm:px-8">
              <FileText className="size-4 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">PÁGINA {current?.page ?? page + 1}</span>
              <div className="ml-auto flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5">
                <Search className="size-3.5 text-muted-foreground" /><input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Localizar neste conteúdo" className="w-40 bg-transparent text-xs outline-none" />
                {find && <button onClick={() => setFind("")}><X className="size-3.5 text-muted-foreground" /></button>}
              </div>
            </div>

            <article className="px-6 py-8 sm:px-12 sm:py-10">
              <div className="mx-auto max-w-3xl space-y-5 text-[15px] leading-7 text-foreground/90">
                {blocks.map((b) => b.kind === "heading" ? <h2 key={b.index} className="pt-3 font-display text-xl font-semibold tracking-tight text-foreground">{highlight(b.text)}</h2> : b.kind === "subheading" ? <h3 key={b.index} className="pt-2 text-sm font-semibold uppercase tracking-[0.08em] text-primary">{highlight(b.text)}</h3> : b.kind === "list" ? <div key={b.index} className="flex gap-3 rounded-lg border border-border/60 bg-muted/20 px-4 py-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span>{highlight(b.text)}</span></div> : <p key={b.index}>{highlight(b.text)}</p>)}
                {!blocks.length && <p className="text-muted-foreground">Nenhum texto extraído nesta página.</p>}
              </div>
            </article>
          </Panel>
        </main>
      </div>
    </div>
  );
}