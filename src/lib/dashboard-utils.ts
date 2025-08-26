import { format, subDays, isWithinInterval } from "date-fns";

export interface TimelineEntry {
  id: string;
  date: string;
  action_type: string;
  description: string;
  co2_saved: number;
  value: number;
}

export interface ChartData {
  date: string;
  co2_saved: number;
  actions: number;
}

export interface CommunityImpact {
  totalUsers: number;
  totalCO2Saved: number;
  totalActions: number;
  userRank: number;
  userPercentile: number;
}

export const generateTimelineData = (activities: any[]): TimelineEntry[] => {
  return activities.map((activity) => ({
    id: activity.id,
    date: activity.action_date,
    action_type: activity.action_type,
    description: activity.description,
    co2_saved: Number(activity.co2_saved),
    value: Number(activity.value),
  }));
};

export const generateChartData = (
  activities: any[],
  days: number = 30
): ChartData[] => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const chartData: ChartData[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = subDays(endDate, days - 1 - i);
    const dateString = format(currentDate, "yyyy-MM-dd");

    const dayActivities = activities.filter(
      (activity) => activity.action_date === dateString
    );

    const co2Saved = dayActivities.reduce(
      (sum, activity) => sum + Number(activity.co2_saved),
      0
    );
    const actionCount = dayActivities.length;

    chartData.push({
      date: format(currentDate, "MMM d"),
      co2_saved: co2Saved,
      actions: actionCount,
    });
  }

  return chartData;
};

export const getActionTypeColor = (actionType: string): string => {
  switch (actionType) {
    case "transport":
      return "text-blue-600 bg-blue-100";
    case "energy":
      return "text-green-600 bg-green-100";
    case "waste":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getActionTypeIcon = (actionType: string): string => {
  switch (actionType) {
    case "transport":
      return "🚲";
    case "energy":
      return "💡";
    case "waste":
      return "♻️";
    default:
      return "🌱";
  }
};
