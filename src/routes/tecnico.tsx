import { createFileRoute } from "@tanstack/react-router";
import { TechnicalCenter } from "@/components/hangar/TechnicalCenter";

export const Route = createFileRoute("/tecnico")({
  head: () => ({
    meta: [
      { title: "Central Técnica — Hangar One" },
      { name: "description", content: "Busca técnica, diagnóstico, procedimentos e ferramentas de bancada." },
    ],
  }),
  component: TechnicalCenter,
});
