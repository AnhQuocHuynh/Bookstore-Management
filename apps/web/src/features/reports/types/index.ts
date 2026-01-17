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

// ... Các types cũ (Revenue) giữ nguyên

// --- STOCK REPORT TYPES ---

export interface StockTableItem {
    productId: string;
    sku: string;
    name: string;
    imageUrl?: string;
    stockQuantity: number;
    status: 'Lỗi tồn kho' | 'Sắp hết hàng' | 'Bình thường' | 'Dư hàng';
    statusPercent: number;
}

export interface StockChartData {
    productName: string;
    labels: string[];
    values: number[];
}

export interface StockTableResponse {
    total: number;
    page: number;
    limit: number;
    items: StockTableItem[];
}

export interface StockReportResponse {
    meta: { generatedAt: string; lastDataAt: string };
    table: StockTableResponse;
    salesChart?: StockChartData;
    importChart?: StockChartData;
}

export interface StockReportParams {
    page?: number;
    limit?: number;
    search?: string;
    productType?: string;
    categoryIds?: string[];
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';

    // Params cho Chart
    productId?: string;
    salesPeriod?: 'day' | 'week' | 'month';
    importPeriod?: 'day' | 'week' | 'month';
}

// --- EMPLOYEE REPORT TYPES ---

export interface EmployeePieItem {
    employeeId: string;
    employeeName: string;
    avatarUrl?: string;
    value: number;   // Số lượng đơn hàng
    percent: number; // % đóng góp
}

export interface EmployeeBarData {
    labels: string[];
    values: number[];
}

export interface EmployeeTableItem {
    transactionId: string;
    occurredAt: string;
    employeeId: string;
    employeeName: string;
    totalAmount: number;
    currency: string;
}

export interface EmployeeReportResponse {
    meta: { generatedAt: string; lastDataAt: string };
    pie: { total: number; items: EmployeePieItem[] };
    bar: EmployeeBarData;
    table: {
        total: number;
        page: number;
        limit: number;
        items: EmployeeTableItem[];
    };
}

export interface EmployeeReportParams {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}

export interface ReportCategory {
    id: string;
    name: string;
}