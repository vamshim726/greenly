import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Leaf } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  TimelineEntry,
  getActionTypeColor,
  getActionTypeIcon,
} from "@/lib/dashboard-utils";

interface TimelineProps {
  activities: TimelineEntry[];
  isLoading?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No activities yet</p>
            <p className="text-sm text-muted-foreground">
              Start logging your eco-actions to see your timeline!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="relative flex items-start space-x-4"
              >
                {/* Timeline line */}
                {index < sortedActivities.length - 1 && (
                  <div className="absolute left-5 top-10 w-px h-8 bg-muted"></div>
                )}

                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                  {getActionTypeIcon(activity.action_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={`${getActionTypeColor(
                        activity.action_type
                      )} text-xs`}
                    >
                      {activity.action_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(activity.date), "MMM d, yyyy")}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-foreground mb-1">
                    {activity.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      {activity.co2_saved.toFixed(2)} kg CO₂ saved
                    </span>
                    <span>Value: {activity.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Timeline;
