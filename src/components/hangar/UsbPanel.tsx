import { Link } from "@tanstack/react-router";
import { Apple, Loader2, PlugZap, Smartphone, Usb, Unplug, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectUsb, disconnectUsb, hex, useUsb } from "@/lib/usb";
import { logActivity } from "@/lib/store";
import { Field, Pill } from "./ui";
import { cn } from "@/lib/utils";

const phaseLabel = { idle: "Aguardando", connecting: "Conectando…", detecting: "Detectando…", connected: "Conectado", error: "Falha na comunicação", unsupported: "USB indisponível" };

export function UsbPanel({ filter }: { filter?: "android" | "apple" }) {
  const usb = useUsb();
  const busy = usb.phase === "connecting" || usb.phase === "detecting";
  const onConnect = async () => {
    const info = await connectUsb();
    if (info) logActivity(`${info.brand} ${info.product ?? ""} conectado via USB`.trim(), info.platform === "apple" ? "apple" : "android");
  };
  const info = usb.info;
  const mismatch = info && filter && info.platform !== filter;

  return (
    <section className="panel relative overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(600px 220px at 50% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)" }} />
      <div className="relative flex items-center justify-between">
        <div className="label-tech flex items-center gap-2"><Usb className="size-3.5 text-primary" /> Conexão USB</div>
        <Pill tone={usb.phase === "connected" ? "green" : usb.phase === "error" || usb.phase === "unsupported" ? "red" : busy ? "blue" : "muted"}>{phaseLabel[usb.phase]}</Pill>
      </div>

      {info && !mismatch ? (
        <div className="relative mt-5 grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="grid size-28 place-items-center rounded-2xl border border-success/30 bg-success/10 text-success glow">
            {info.platform === "apple" ? <Apple className="size-12" /> : <Smartphone className="size-12" />}
          </div>
          <div>
            <div className="font-display text-2xl font-semibold uppercase tracking-wide">{info.brand} {info.product ?? ""}</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-success"><span className="size-2 animate-pulse rounded-full bg-success" /> Conectado</div>
            <div className="mt-4 grid gap-x-8 md:grid-cols-2">
              <Field label="Fabricante (USB)" value={info.manufacturer} />
              <Field label="Produto (USB)" value={info.product} />
              <Field label="Número de série" value={info.serial} mono />
              <Field label="Vendor / Product ID" value={`${hex(info.vendorId)} / ${hex(info.productId)}`} mono />
              <Field label="Sistema / versão" value={null} />
              <Field label="Bateria" value={null} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Dados de sistema, bateria e IMEI dependem do conector de bancada (ADB / protocolo Apple). Nada é estimado.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm"><Link to={info.platform === "apple" ? "/apple" : "/android"}>Abrir área {info.platform === "apple" ? "Apple" : "Android"}</Link></Button>
              <Button size="sm" variant="outline" onClick={disconnectUsb}><Unplug className="size-4" /> Desconectar</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center py-8 text-center">
          <div className="relative grid size-24 place-items-center overflow-hidden rounded-2xl border border-primary/30 bg-primary/10 text-primary glow">
            {busy ? <Loader2 className="size-10 animate-spin" /> : <PlugZap className="size-10" />}
            <div className="scanline absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
          </div>
          <div className="mt-5 font-display text-xl font-semibold">
            {mismatch ? `Dispositivo ${info?.platform === "apple" ? "Apple" : "Android"} conectado` : "Nenhum dispositivo conectado"}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {mismatch ? "Este aparelho pertence à outra área técnica." : "Conecte um aparelho via USB para iniciar a identificação."}
          </p>
          {(usb.phase === "error" || usb.phase === "unsupported") && (
            <div className="mt-4 flex max-w-md items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-left text-xs text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />{usb.error}
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={onConnect} disabled={busy}><Usb className="size-4" /> Detectar dispositivo</Button>
            {!filter && (
              <>
                <AreaLink to="/android" tone="green" icon={<Smartphone className="size-4" />}>Área Android</AreaLink>
                <AreaLink to="/apple" tone="violet" icon={<Apple className="size-4" />}>Área Apple</AreaLink>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function AreaLink({ to, children, icon, tone }: { to: "/android" | "/apple"; children: React.ReactNode; icon: React.ReactNode; tone: "green" | "violet" }) {
  return (
    <Link to={to} className={cn("inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
      tone === "green" ? "border-success/30 bg-success/10 text-success hover:bg-success/20" : "border-violet/30 bg-violet/10 text-violet hover:bg-violet/20")}>
      {icon}{children}
    </Link>
  );
}
