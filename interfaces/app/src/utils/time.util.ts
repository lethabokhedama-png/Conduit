export function timeAgo(date: Date | number): string {
    const ms = Date.now() - (typeof date === "number" ? date : date.getTime());
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "just now";
}

export function fmtTime(date: Date | number): string {
    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function fmtDate(date: Date | number): string {
    return new Date(date).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

export function fmtDateTime(date: Date | number): string {
    return `${fmtDate(date)} ${fmtTime(date)}`;
}

export function fmtDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

export function fmtCountdown(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60)
        .toString()
        .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}
