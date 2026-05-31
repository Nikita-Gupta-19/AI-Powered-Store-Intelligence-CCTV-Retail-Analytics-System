import { clsx, type ClassValue } from "clsx";import { twMerge } from "tailwind-merge";export function cn(...inputs: ClassValue[]){return twMerge(clsx(inputs))}
export const formatDate=(v:string|Date)=>new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));

export const timestampToSeconds = (ts: string): number => {
  if (!ts || !ts.includes(':')) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

export const formatTimestamp = (ts: string) => {
  if (!ts) return "00:00";
  // If it's already MM:SS or HH:MM:SS, just return it
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(ts)) return ts;
  
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return ts;
  }
};

