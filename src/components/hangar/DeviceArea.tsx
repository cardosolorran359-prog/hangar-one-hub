import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity, Archive, BatteryCharging, Camera, Cpu, Download, FileText, HardDriveDownload, Info, MonitorSmartphone,
  Package, Power, RefreshCcw, RotateCcw, ShieldAlert, Terminal, Wrench, Zap, AlertTriangle,
} from "lucide-react";
import { UsbPanel } from "./UsbPanel";
import { Field, PageHeader, Panel, Pill } from "./ui";
import { Button } from "@/components/ui/button";
import { useUsb } from "@/lib/usb";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tool = { id: string; label: string; icon: React.ElementType; critical?: boolean; desc: string };

const ANDROID_TOOLS: Tool[] = [
  { id: "info", label: "Informações", icon: Info, desc: "Fabricante, modelo, codinome, versão e IMEI via ADB." },
  { id: "bat", label: "Bateria", icon: BatteryCharging, desc: "Nível, temperatura, tensão e saúde (dumpsys battery)." },
  { id: "backup", label: "Backup", icon: Archive, desc: "Cópia de dados do usuário autorizada." },
  { id: "restore", label: "Restaurar", icon: RotateCcw, desc: "Restaurar backup para o aparelho." },
  { id: "apk", label: "Instalar APK", icon: Package, desc: "Instalar aplicativo a partir de arquivo." },
  { id: "shot", label: "Captura de tela", icon: Camera, desc: "Capturar a tela atual do aparelho." },
  { id: "mirror", label: "Espelhamento", icon: MonitorSmartphone, desc: "Espelhar a tela na bancada." },
  { id: "reboot", label: "Reiniciar", icon: Power, desc: "Reinicialização normal." },
  { id: "recovery", label: "Recovery", icon: RefreshCcw, desc: "Reiniciar em modo recovery." },
  { id: "bootloader", label: "Bootloader", icon: Cpu, desc: "Reiniciar no bootloader." },
  { id: "fastboot", label: "Fastboot", icon: Zap, desc: "Comandos fastboot compatíveis." },
  { id: "reset", label: "Factory Reset", icon: ShieldAlert, critical: true, desc: "Apaga todos os dados. Exige confirmação." },
  { id: "logs", label: "Logs", icon: Terminal, desc: "Logcat em tempo real." },
];
const APPLE_TOOLS: Tool[] = [
  { id: "info", label: "Informações", icon: Info, desc: "Modelo, iOS, serial e IMEI via protocolo Apple." },
  { id: "bat", label: "Bateria", icon: BatteryCharging, desc: "Saúde, ciclos, capacidade e temperatura." },
  { id: "backup", label: "Backup", icon: Archive, desc: "Backup local do aparelho." },
  { id: "restore", label: "Restauração", icon: RotateCcw, desc: "Restaurar firmware ou backup." },
  { id: "update", label: "Atualização", icon: Download, desc: "Atualizar para o iOS assinado." },
  { id: "recovery", label: "Recovery", icon: RefreshCcw, desc: "Entrar/sair do modo recovery." },
  { id: "dfu", label: "DFU", icon: HardDriveDownload, critical: true, desc: "Modo DFU para restauração profunda." },
  { id: "tools", label: "Ferramentas", icon: Wrench, desc: "Utilitários adicionais por plugin." },
  { id: "logs", label: "Logs", icon: FileText, desc: "Syslog do dispositivo." },
];

export function DeviceArea({ platform }: { platform: "android" | "apple" }) {
  const usb = useUsb();
  const connected = usb.phase === "connected" && usb.info?.platform === platform;
  const tools = platform === "android" ? ANDROID_TOOLS : APPLE_TOOLS;
  const allDevices = useStore((s) => s.devices);
  const devices = useMemo(() => allDevices.filter((d) => d.platform === platform), [allDevices, platform]);
  const orders = useStore((s) => s.orders);
  const [fail, setFail] = useState<string | null>(null);
  const isApple = platform === "apple";

  const run = (t: Tool) => {
    if (!connected) { toast.error("Conecte um aparelho " + (isApple ? "Apple" : "Android") + " para usar esta ferramenta."); return; }
    if (t.critical && !confirm(`${t.label}: operação crítica. Confirmar?`)) return;
    setFail(t.label);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Central técnica" title={isApple ? "Área Apple" : "Área Android"}
        desc={isApple ? "Módulo dedicado a iPhone e iPad: protocolos, diagnóstico e ferramentas próprias." : "Módulo dedicado a Android: ADB, Fastboot, Recovery e ferramentas próprias."}
        actions={<Pill tone={isApple ? "violet" : "green"}>{isApple ? "Apple Engine" : "Android Engine"}</Pill>} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <UsbPanel filter={platform} />
        <Panel title="Diagnóstico automático" icon={<Activity className="size-3.5 text-primary" />}>
          <div className="label-tech mb-1 mt-1 text-[10px]">Conectividade</div>
          {(isApple ? ["USB", "Recovery", "DFU"] : ["USB", "ADB", "Fastboot", "Recovery"]).map((k) => (
            <Field key={k} label={k} value={k === "USB" ? (connected ? <span className="text-success">Ativo</span> : <span className="text-muted-foreground">Inativo</span>) : null} />
          ))}
          <div className="label-tech mb-1 mt-4 text-[10px]">Bateria</div>
          {["Nível", "Temperatura", "Tensão", "Saúde", "Ciclos"].map((k) => <Field key={k} label={k} value={null} />)}
          <p className="mt-3 text-xs text-muted-foreground">Leituras aparecem quando o conector de bancada estiver ativo. O Hangar One nunca estima dados técnicos.</p>
        </Panel>
      </div>

      {fail && (
        <div className="panel flex flex-wrap items-start gap-4 border-warning/40 p-5">
          <AlertTriangle className="mt-0.5 size-5 text-warning" />
          <div className="flex-1">
            <div className="font-medium">Não foi possível executar “{fail}”.</div>
            <p className="mt-1 text-sm text-muted-foreground">Motivo: o navegador identifica o aparelho, mas comandos {isApple ? "do protocolo Apple" : "ADB/Fastboot"} exigem o conector de bancada Hangar One, ainda não instalado neste computador.</p>
          </div>
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setFail(null)}>Continuar diagnóstico</Button><Button size="sm" onClick={() => toast.info("Tentando novamente…")}>Tentar novamente</Button></div>
        </div>
      )}

      <Panel title="Ferramentas" action={<span className="text-xs text-muted-foreground">{connected ? "Disponíveis conforme o aparelho" : "Conecte um aparelho para liberar"}</span>}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
          {tools.map((t) => (
            <button key={t.id} onClick={() => run(t)} title={t.desc}
              className={cn("group flex flex-col items-start gap-3 rounded-xl border bg-panel p-4 text-left transition-all",
                connected ? "border-border hover:-translate-y-0.5 hover:border-primary/40" : "border-border/60 opacity-60",
                t.critical && "hover:border-destructive/50")}>
              <span className={cn("grid size-9 place-items-center rounded-lg border", t.critical ? "border-destructive/30 bg-destructive/10 text-destructive" : isApple ? "border-violet/30 bg-violet/10 text-violet" : "border-success/30 bg-success/10 text-success")}><t.icon className="size-4" /></span>
              <span className="text-sm font-medium">{t.label}</span>
              <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{t.desc}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title={`Aparelhos ${isApple ? "Apple" : "Android"} cadastrados`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((d) => {
            const active = orders.find((o) => o.deviceId === d.id && !["Entregue", "Cancelado"].includes(o.status));
            return (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border/70 p-3">
                <div><div className="text-sm font-medium">{d.brand} {d.model}</div><div className="font-mono text-xs text-muted-foreground">{d.os || "—"} · {d.imei || d.serial}</div></div>
                {active ? <Pill tone="blue">Em bancada</Pill> : <Pill>Arquivado</Pill>}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
