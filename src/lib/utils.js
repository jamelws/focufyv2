// utils/cn.js (o donde lo uses)
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  // clsx combina condicionales; twMerge resuelve conflictos de Tailwind
  return twMerge(clsx(inputs));
}
