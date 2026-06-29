import { apiRequest } from "./api";

export type MoneyMethodTotals = {
  cash: number;
  momo: number;
  bank: number;
  card: number;
  other: number;
};

export type DailySummaryReport = {
  businessName: string;
  reportTitle: string;
  businessDate: string;
  fromTime: string | null;
  toTime: string | null;
  generatedAt: string;
  generatedBy: string;

  cashSession: {
    status: string;
    openingFloatRwf: number;
    expectedCashRwf: number;
    countedCashRwf: number | null;
    differenceRwf: number;
    openedAt: string | null;
    closedAt: string | null;
  } | null;

  summary: {
    totalSalesRwf: number;
    amountPaidOnSalesRwf: number;
    salesBalanceRwf: number;
    salesCount: number;

    estimatedCogsRwf: number;
    grossProfitRwf: number;
    netProfitRwf: number;
    profitMarginPercent: number;

    moneyInRwf: number;
    moneyOutRwf: number;
    netMoneyMovementRwf: number;

    approvedExpensesRwf: number;
    approvedExpensesCount: number;

    pendingExpensesRwf: number;
    pendingExpensesCount: number;

    newCustomerDebtRwf: number;
    debtPaymentsReceivedRwf: number;
    openCustomerDebtRwf: number;
    overdueDebtCount: number;

    stockValueRwf: number;
    lowStockCount: number;
    zeroStockCount: number;
  };

  methodTotals: {
    moneyIn: MoneyMethodTotals;
    moneyOut: MoneyMethodTotals;
  };

  salesRows: {
    saleNumber: string;
    customerName: string;
    totalAmountRwf: number;
    amountPaidRwf: number;
    balanceRwf: number;
    paymentStatus: string;
    soldByName: string;
    createdAt: string;
  }[];

  moneyRows: {
    time: string;
    direction: string;
    amountRwf: number;
    method: string;
    category: string;
    description: string;
    actorName: string;
  }[];

  expenseRows: {
    expenseNumber: string;
    title: string;
    category: string;
    amountRwf: number;
    method: string;
    status: string;
    createdByName: string;
    paidAt: string | null;
  }[];

  debtRows: {
    customerName: string;
    customerPhone: string;
    saleNumber: string;
    balanceRwf: number;
    status: string;
    expectedPaymentAt: string | null;
  }[];

  lowStockRows: {
    name: string;
    sku: string;
    currentStock: number;
    lowStockAlert: number;
    sellingPriceRwf: number;
  }[];
};

export type DailySummaryReportResponse = {
  ok: true;
  report: DailySummaryReport;
};

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:5000"
  ).replace(/\/$/, "");
}

function getFileNameFromContentDisposition(header: string | null) {
  if (!header) return null;

  const match = header.match(/filename="([^"]+)"/);

  if (match?.[1]) return match[1];

  return null;
}

export async function getDailySummaryReport(
  token: string,
  date: string,
  fromTime?: string,
  toTime?: string,
) {
  const query = new URLSearchParams();

  if (date) {
    query.set("date", date);
  }

  if (fromTime) {
    query.set("fromTime", fromTime);
  }

  if (toTime) {
    query.set("toTime", toTime);
  }

  return apiRequest<DailySummaryReportResponse>(
    `/reports/daily-summary?${query.toString()}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function downloadDailySummaryPdf(
  token: string,
  date: string,
  fromTime?: string,
  toTime?: string,
) {
  const query = new URLSearchParams();

  if (date) {
    query.set("date", date);
  }

  if (fromTime) {
    query.set("fromTime", fromTime);
  }

  if (toTime) {
    query.set("toTime", toTime);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/reports/daily-summary/pdf?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    let message = "Could not download report PDF.";

    try {
      const data = await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // PDF endpoint may not return JSON on every error.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  const filename =
    getFileNameFromContentDisposition(contentDisposition) ||
    `suparsale-daily-report-${date}.pdf`;

  return {
    blob,
    filename,
  };
}

export type ReportPeriod = "daily" | "weekly" | "monthly" | "custom";

export type BusinessSummaryReportResponse = {
  ok: true;
  period: {
    period: ReportPeriod;
    fromDate: string;
    toDate: string;
    title: string;
    label: string;
    filenamePart: string;
  };
  report: DailySummaryReport;
};

export async function getBusinessSummaryReport(
  token: string,
  input: {
    period: ReportPeriod;
    fromDate: string;
    toDate?: string;
    fromTime?: string;
    toTime?: string;
  },
) {
  const query = new URLSearchParams();

  query.set("period", input.period);
  query.set("fromDate", input.fromDate);

  if (input.toDate) query.set("toDate", input.toDate);
  if (input.period === "daily" && input.fromTime) {
    query.set("fromTime", input.fromTime);
  }
  if (input.period === "daily" && input.toTime) {
    query.set("toTime", input.toTime);
  }

  return apiRequest<BusinessSummaryReportResponse>(
    `/reports/business-summary?${query.toString()}`,
    {
      method: "GET",
      token,
    },
  );
}

export async function downloadBusinessSummaryPdf(
  token: string,
  input: {
    period: ReportPeriod;
    fromDate: string;
    toDate?: string;
    fromTime?: string;
    toTime?: string;
  },
) {
  const query = new URLSearchParams();

  query.set("period", input.period);
  query.set("fromDate", input.fromDate);

  if (input.toDate) query.set("toDate", input.toDate);
  if (input.period === "daily" && input.fromTime) {
    query.set("fromTime", input.fromTime);
  }
  if (input.period === "daily" && input.toTime) {
    query.set("toTime", input.toTime);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/reports/business-summary/pdf?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    let message = "Could not download report PDF.";

    try {
      const data = await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // PDF endpoint may not return JSON on every error.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  const filename =
    getFileNameFromContentDisposition(contentDisposition) ||
    `suparsale-${input.period}-report-${input.fromDate}.pdf`;

  return {
    blob,
    filename,
  };
}
