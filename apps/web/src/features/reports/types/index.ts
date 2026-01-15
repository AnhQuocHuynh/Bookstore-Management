// Định nghĩa Metric Item trong Cards
export interface MetricItem {
    value?: number;    // Dùng cho revenue, profit
    count?: number;    // Dùng cho orders
    total?: number;    // Dùng cho itemsSold, purchaseSpend
    currency?: string;
    growthPercent?: number | null;
    growthAbs?: number;
}

// 1. Cards
export interface DashboardCards {
    revenue: MetricItem;
    profit: MetricItem;
    orders: MetricItem;
    itemsSold: MetricItem;
    purchaseSpend: MetricItem;
    serviceFee: MetricItem;
}

// 2. Pie Chart
export interface PieItem {
    productId: string;
    name: string;
    sku: string;
    imageUrl?: string;
    value: number;
    percent: number;
}

export interface PieChartData {
    total: number;
    items: PieItem[];
}

// 3. Line Chart
export interface LineDataset {
    name: string;
    values: number[];
}

export interface LineChartData {
    labels: string[];
    datasets: LineDataset[];
}

// 4. Top Product
export interface TopProduct {
    productId: string;
    name: string;
    sku: string;
    imageUrl?: string;
    revenue: number;
    percent: number;
}

// --- RESPONSE CHÍNH ---
export interface RevenueReportResponse {
    meta: { generatedAt: string; lastDataAt: string };
    cards: DashboardCards;
    pie: PieChartData;
    line: LineChartData;
    top: TopProduct[];
}

// Params giữ nguyên
export interface RevenueReportParams {
    from?: string;
    to?: string;
    period?: 'day' | 'week' | 'month'; // Đã sửa theo backend
    topN?: number;
}