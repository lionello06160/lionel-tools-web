import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const TAG_COLORS = [
    {
        name: 'red',
        badge: 'text-red-400 border-red-500/30 bg-red-500/10 hover:bg-red-500/20',
        solid: 'bg-red-600 border-red-600 text-white shadow-red-500/25',
        border: 'border-red-500/50 text-red-400 hover:bg-red-500/10'
    },
    {
        name: 'orange',
        badge: 'text-orange-400 border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20',
        solid: 'bg-orange-500 border-orange-500 text-white shadow-orange-500/25',
        border: 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
    },
    {
        name: 'amber',
        badge: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20',
        solid: 'bg-amber-500 border-amber-500 text-white shadow-amber-500/25',
        border: 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
    },
    {
        name: 'green',
        badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20',
        solid: 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/25',
        border: 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
    },
    {
        name: 'cyan',
        badge: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20',
        solid: 'bg-cyan-600 border-cyan-600 text-white shadow-cyan-500/25',
        border: 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
    },
    {
        name: 'blue',
        badge: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20',
        solid: 'bg-blue-600 border-blue-600 text-white shadow-blue-500/25',
        border: 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
    },
    {
        name: 'indigo',
        badge: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20',
        solid: 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/25',
        border: 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10'
    },
    {
        name: 'violet',
        badge: 'text-violet-400 border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20',
        solid: 'bg-violet-600 border-violet-600 text-white shadow-violet-500/25',
        border: 'border-violet-500/50 text-violet-400 hover:bg-violet-500/10'
    },
    {
        name: 'fuchsia',
        badge: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10 hover:bg-fuchsia-500/20',
        solid: 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-fuchsia-500/25',
        border: 'border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10'
    },
    {
        name: 'rose',
        badge: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20',
        solid: 'bg-rose-600 border-rose-600 text-white shadow-rose-500/25',
        border: 'border-rose-500/50 text-rose-400 hover:bg-rose-500/10'
    }
];

export function getTagStyles(tag: string) {
    // Robust MurmurHash3-like algorithm for excellent distribution
    // This ensures tags like "PAS" and "web" get different colors purely by math
    let hash = 0; // Seed
    for (let i = 0; i < tag.length; i++) {
        hash = Math.imul(hash ^ tag.charCodeAt(i), 0x5bd1e995);
        hash ^= hash >>> 15;
    }
    hash = Math.imul(hash, 0x5bd1e995);
    hash ^= hash >>> 15;

    // Ensure positive index
    const index = (hash >>> 0) % TAG_COLORS.length;
    return TAG_COLORS[index];
}
