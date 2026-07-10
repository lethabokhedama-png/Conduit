export type Tab = "health" | "stats" | "usage" | "jobs";

export interface HealthResp {
    status: "ok" | "degraded";
    redis: boolean;
    postgres: boolean;
}

export interface UsageStat {
    provider: string;
    request_count: number;
    error_count: number;
    rate_limit_hits: number;
    total_latency_ms: number;
    total_tokens: number;
    total_cost_usd: number;
}

export interface Job {
    id: string;
    name: string;
    next_run: string | null;
}

export interface StatsResp {
    usage: UsageStat[];
    health_scores: Record<string, number>;
    jobs: Job[];
}
