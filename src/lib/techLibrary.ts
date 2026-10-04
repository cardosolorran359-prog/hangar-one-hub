import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export type LibraryPage = { page: number; text: string };
export type IndexedTechDocument = {
  id: string; title: string; source: string; scope: "celular" | "computador"; brand: string; model: string; kind: string;
  tags: string[]; excerpt: string; page?: number; fileName: string; fileSize: number; pageCount: number; pages: LibraryPage[]; importedAt: string;
};

const DB_NAME = "hangar-one-tech-library";
const DB_VERSION = 1;
const STORE = "documents";

const openDb = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const dbRequest = <T,>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function saveIndexedDocument(doc: IndexedTechDocument) {
  const db = await openDb();
  await dbRequest(db.transaction(STORE, "readwrite").objectStore(STORE).put(doc));
  db.close();
}

export async function listIndexedDocuments() {
  const db = await openDb();
  const docs = await dbRequest(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
  db.close();
  return (docs || []) as IndexedTechDocument[];
}

export async function removeIndexedDocument(id: string) {
  const db = await openDb();
  await dbRequest(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
  db.close();
}

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function expandedTokens(query: string, aliases: Record<string, string[]>) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  const result = new Set(tokens);
  Object.entries(aliases).forEach(([key, values]) => {
    const group = [key, ...values].map(normalize);
    if (group.some((v) => tokens.some((t) => v === t || v.includes(t) || t.includes(v)))) group.forEach((v) => result.add(v));
  });
  return [...result];
}

export function searchIndexedDocuments(docs: IndexedTechDocument[], query: string, aliases: Record<string, string[]>, scope: "todos" | "celular" | "computador") {
  const q = normalize(query);
  const tokens = expandedTokens(query, aliases);
  return docs.filter((d) => scope === "todos" || d.scope === scope).map((d) => {
    const meta = normalize([d.title, d.source, d.brand, d.model, d.kind, d.tags.join(" ")].join(" "));
    let score = 0;
    if (q && normalize(d.title).includes(q)) score += 20;
    if (q && normalize(d.model).includes(q)) score += 12;
    tokens.forEach((token) => { if (meta.includes(token)) score += d.tags.some((t) => normalize(t).includes(token)) ? 7 : 3; });
    let bestPage = d.page;
    let bestText = d.excerpt;
    let bestPageScore = 0;
    for (const page of d.pages) {
      const text = normalize(page.text);
      let pageScore = 0;
      if (q && text.includes(q)) pageScore += 15;
      tokens.forEach((token) => { if (text.includes(token)) pageScore += 2; });
      if (pageScore > bestPageScore) {
        bestPageScore = pageScore; bestPage = page.page;
        const raw = page.text.replace(/\s+/g, " ").trim();
        const firstHit = q ? normalize(raw).indexOf(q) : -1;
        bestText = firstHit > 0 ? raw.slice(Math.max(0, firstHit - 110), firstHit + 250) + "…" : raw.slice(0, 360);
      }
    }
    return {
      d: { id: d.id, title: d.title, source: d.source, scope: d.scope, brand: d.brand, model: d.model, kind: d.kind, tags: d.tags, excerpt: bestText, page: bestPage },
      score: score + bestPageScore,
    };
  }).filter(({ score }) => score > 0 || !q).sort((a, b) => b.score - a.score).map(({ d }) => d);
}

export async function extractFilePages(file: File): Promise<LibraryPage[]> {
  const lower = file.name.toLowerCase();
  if (file.type === "text/plain" || lower.endsWith(".md") || lower.endsWith(".csv") || file.type === "text/csv") return [{ page: 1, text: await file.text() }];
  if (file.type === "text/html" || lower.endsWith(".html")) {
    const raw = await file.text(); const doc = new DOMParser().parseFromString(raw, "text/html");
    return [{ page: 1, text: doc.body?.innerText || raw }];
  }
  if (file.type === "application/json" || lower.endsWith(".json")) return [{ page: 1, text: await file.text() }];
  if (file.type !== "application/pdf" && !lower.endsWith(".pdf")) throw new Error("Formato não suportado. Use PDF, TXT, MD, HTML, JSON ou CSV.");
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pages: LibraryPage[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber); const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pages.push({ page: pageNumber, text });
  }
  return pages;
}

export async function indexTechFile(file: File, meta: { title: string; source: string; scope: "celular" | "computador"; brand: string; model: string; kind: string; tags: string[]; }) {
  const pages = await extractFilePages(file);
  const joined = pages.map((p) => p.text).join(" ");
  const firstText = joined.replace(/\s+/g, " ").trim();
  const doc: IndexedTechDocument = {
    id: crypto.randomUUID(), title: meta.title.trim() || file.name.replace(/\.[^.]+$/, ""), source: meta.source.trim() || "Acervo local",
    scope: meta.scope, brand: meta.brand.trim() || "Multimarca", model: meta.model.trim() || "—", kind: meta.kind.trim() || "Documento",
    tags: meta.tags.filter(Boolean), excerpt: firstText.slice(0, 360), ...(pages[0] ? { page: pages[0].page } : {}), fileName: file.name, fileSize: file.size,
    pageCount: pages.length, pages, importedAt: new Date().toISOString(),
  };
  await saveIndexedDocument(doc);
  return doc;
}