import { createFileRoute } from "@tanstack/react-router";
import { DeviceArea } from "@/components/hangar/DeviceArea";

export const Route = createFileRoute("/android")({
  head: () => ({ meta: [
    { title: "Área Android — Hangar One" },
    { name: "description", content: "Central técnica Android: conexão USB, diagnóstico, bateria e ferramentas ADB/Fastboot." },
    { property: "og:title", content: "Área Android — Hangar One" },
    { property: "og:description", content: "Módulo técnico dedicado a aparelhos Android." },
  ] }),
  component: () => <DeviceArea platform="android" />,
});
