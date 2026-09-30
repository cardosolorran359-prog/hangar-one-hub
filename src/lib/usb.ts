import { useSyncExternalStore } from "react";

export type UsbPhase = "idle" | "connecting" | "detecting" | "connected" | "error" | "unsupported";
export interface UsbInfo {
  manufacturer: string | null;
  product: string | null;
  serial: string | null;
  vendorId: number;
  productId: number;
  platform: "android" | "apple" | "outro";
  brand: string;
}
interface UsbState { phase: UsbPhase; info: UsbInfo | null; error?: string }

const VENDORS: Record<number, [string, "android" | "apple"]> = {
  0x05ac: ["Apple", "apple"],
  0x04e8: ["Samsung", "android"],
  0x18d1: ["Google", "android"],
  0x2717: ["Xiaomi", "android"],
  0x22b8: ["Motorola", "android"],
  0x12d1: ["Huawei", "android"],
  0x2a70: ["OnePlus", "android"],
  0x0bb4: ["HTC", "android"],
  0x1004: ["LG", "android"],
  0x0fce: ["Sony", "android"],
  0x2d95: ["Vivo", "android"],
  0x22d9: ["Oppo", "android"],
  0x0e8d: ["MediaTek", "android"],
  0x05c6: ["Qualcomm", "android"],
};

let s: UsbState = { phase: "idle", info: null };
const ls = new Set<() => void>();
const set = (n: UsbState) => { s = n; ls.forEach((l) => l()); };

export function useUsb() {
  return useSyncExternalStore((l) => { ls.add(l); return () => ls.delete(l); }, () => s, () => s);
}

type USBDeviceLike = { manufacturerName?: string; productName?: string; serialNumber?: string; vendorId: number; productId: number };

export async function connectUsb(): Promise<UsbInfo | null> {
  const nav = navigator as Navigator & { usb?: { requestDevice: (o: { filters: unknown[] }) => Promise<USBDeviceLike> } };
  if (!nav.usb) {
    set({ phase: "unsupported", info: null, error: "Este navegador não oferece acesso USB. Use o Chrome ou Edge no computador com o app instalado." });
    return null;
  }
  set({ phase: "connecting", info: null });
  try {
    const dev = await nav.usb.requestDevice({ filters: [] });
    set({ phase: "detecting", info: null });
    await new Promise((r) => setTimeout(r, 700));
    const v = VENDORS[dev.vendorId];
    const info: UsbInfo = {
      manufacturer: dev.manufacturerName || null,
      product: dev.productName || null,
      serial: dev.serialNumber || null,
      vendorId: dev.vendorId,
      productId: dev.productId,
      platform: v ? v[1] : "outro",
      brand: v ? v[0] : dev.manufacturerName || "Fabricante desconhecido",
    };
    set({ phase: "connected", info });
    return info;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/No device selected/i.test(msg)) { set({ phase: "idle", info: null }); return null; }
    set({ phase: "error", info: null, error: "Falha na comunicação com o dispositivo." });
    return null;
  }
}

export function disconnectUsb() { set({ phase: "idle", info: null }); }

export const hex = (n: number) => "0x" + n.toString(16).padStart(4, "0");
