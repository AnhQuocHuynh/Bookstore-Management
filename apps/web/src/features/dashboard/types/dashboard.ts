// file: types/dashboard.ts

export interface DashboardOverview {
    timestamp: string;
    range: {
        current: { start: string; end: string };
        previous: { start: string; end: string };
    };
    overview: {
        revenue: MetricItem;
        profit: MetricItem;
        purchase_cost: MetricItem;
        service_fee: MetricItem;
    };
}

export interface MetricItem {
    value: number;
    growth_percent: number;
    currency: string;
}

export interface ChartResponse {
    labels: string[];
    datasets: {
        name: string;
        values: number[];
    }[];
}

export interface DashboardParams {
    from?: string;
    to?: string;
    period?: 'day' | 'week' | 'month';
    productType?: string;
}