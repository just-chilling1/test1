import { brand } from "@/config/brand.config";

const KEY = `${brand.storagePrefix}_b2b_active_offer`;

export function getActiveOfferId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setActiveOfferId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
}
