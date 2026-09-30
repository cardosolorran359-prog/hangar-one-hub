import { createFileRoute } from "@tanstack/react-router";
import { DeviceArea } from "@/components/hangar/DeviceArea";

export const Route = createFileRoute("/apple")({
  head: () => ({ meta: [
    { title: "Área Apple — Hangar One" },
    { name: "description", content: "Central técnica Apple: conexão USB, diagnóstico, bateria, recovery e DFU." },
    { property: "og:title", content: "Área Apple — Hangar One" },
    { property: "og:description", content: "Módulo técnico dedicado a iPhone e iPad." },
  ] }),
  component: () => <DeviceArea platform="apple" />,
});
