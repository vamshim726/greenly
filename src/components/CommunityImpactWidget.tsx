import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Globe, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CommunityImpact } from "@/lib/dashboard-utils";

interface CommunityImpactWidgetProps {
  userStats: {
    totalActions: number;
    totalCO2Saved: number;
  };
}

const CommunityImpactWidget: React.FC<CommunityImpactWidgetProps> = ({
  userStats,
}) => {
  const [communityData, setCommunityData] = useState<CommunityImpact | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, [userStats]);

  const fetchCommunityData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Use the leaderboard function to get community stats
      const { data: leaderboardData, error } = await supabase.rpc(
        "get_leaderboard"
      );

      if (error) throw error;

      if (leaderboardData) {
        const totalUsers = leaderboardData.length;
        const totalCO2Saved = leaderboardData.reduce(
          (sum, entry) => sum + Number(entry.total_co2_saved),
          0
        );
        const totalActions = leaderboardData.reduce(
          (sum, entry) => sum + Number(entry.action_count),
          0
        );

        // Find user's rank
        const userEntry = leaderboardData.find(
          (entry) => entry.user_id === user.id
        );
        const userRank = userEntry
          ? leaderboardData.indexOf(userEntry) + 1
          : totalUsers;
        const userPercentile =
          totalUsers > 0
            ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100)
            : 0;

        setCommunityData({
          totalUsers,
          totalCO2Saved,
          totalActions,
          userRank,
          userPercentile,
        });
      }
    } catch (error) {
      console.error("Failed to fetch community data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!communityData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Community data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankBadgeColor = (rank: number, total: number) => {
    const percentile = ((total - rank + 1) / total) * 100;
    if (percentile >= 90)
      return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (percentile >= 70)
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-black";
    if (percentile >= 50)
      return "bg-gradient-to-r from-orange-400 to-red-500 text-white";
    return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Community Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Rank */}
        <div className="text-center">
          <Badge
            className={`text-lg px-4 py-2 ${getRankBadgeColor(
              communityData.userRank,
              communityData.totalUsers
            )}`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Rank #{communityData.userRank}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Top {communityData.userPercentile}% of eco-warriors
          </p>
          <Progress value={communityData.userPercentile} className="mt-2" />
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{communityData.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </div>

          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Globe className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">
              {communityData.totalCO2Saved.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              Total CO₂ Saved (kg)
            </p>
          </div>

          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{communityData.totalActions}</p>
            <p className="text-xs text-muted-foreground">Total Actions</p>
          </div>
        </div>

        {/* Your Contribution */}
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h4 className="font-semibold mb-3 text-primary">Your Contribution</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">CO₂ Impact</p>
              <p className="text-lg font-bold">
                {userStats.totalCO2Saved.toFixed(2)} kg
              </p>
              <p className="text-xs text-muted-foreground">
                {(
                  (userStats.totalCO2Saved / communityData.totalCO2Saved) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actions</p>
              <p className="text-lg font-bold">{userStats.totalActions}</p>
              <p className="text-xs text-muted-foreground">
                {(
                  (userStats.totalActions / communityData.totalActions) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityImpactWidget;
