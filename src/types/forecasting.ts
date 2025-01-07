export interface ForecastEntry {
    id: string;
    projectId: string;
    userId: string;
    roleId: string;
    month: string; // YYYY-MM format
    forecastedHours: number;
    actualHours: number;
    forecastedCost: number;
    actualCost: number;
    forecastedRevenue: number;
    actualRevenue: number;
  }
  
  export interface ProjectForecast {
    id: string;
    projectId: string;
    month: string;
    totalForecastedHours: number;
    totalActualHours: number;
    totalForecastedCost: number;
    totalActualCost: number;
    totalForecastedRevenue: number;
    totalActualRevenue: number;
    grossMargin: number;
    actualGrossMargin: number;
    variance: {
      hours: number;
      cost: number;
      revenue: number;
      grossMargin: number;
    };
  }
  
  export interface WorkingDays {
    month: string;
    totalDays: number;
    workingDays: number;
    holidays: Array<{
      date: string;
      name: string;
    }>;
  }