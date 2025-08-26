import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Target, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { format } from "date-fns";

interface Challenge {
  id: string;
  name: string;
  description: string;
  target_co2: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participant_count?: number;
  user_joined?: boolean;
  total_co2_saved?: number;
}

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  total_co2_saved: number;
  action_count: number;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
  }, []);

  const fetchChallenges = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // This shouldn't happen since we're in a protected route
        toast({
          title: "Error",
          description: "User session not found",
          variant: "destructive",
        });
        return;
      }

      // Fetch all challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });

      if (challengesError) throw challengesError;

      // Fetch user's joined challenges
      const { data: participantData, error: participantError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id);

      if (participantError) throw participantError;

      const joinedChallengeIds =
        participantData?.map((p) => p.challenge_id) || [];

      // Fetch participant counts and CO2 totals for each challenge
      const challengesWithData = await Promise.all(
        challengesData?.map(async (challenge) => {
          // Get participant count
          const { count: participantCount } = await supabase
            .from("challenge_participants")
            .select("*", { count: "exact", head: true })
            .eq("challenge_id", challenge.id);

          // Get total CO2 saved by participants
          const { data: actionsData } = await supabase
            .from("eco_actions")
            .select("co2_saved, user_id")
            .in(
              "user_id",
              await supabase
                .from("challenge_participants")
                .select("user_id")
                .eq("challenge_id", challenge.id)
                .then((res) => res.data?.map((p) => p.user_id) || [])
            )
            .gte("action_date", challenge.start_date)
            .lte("action_date", challenge.end_date);

          const totalCO2Saved =
            actionsData?.reduce(
              (sum, action) => sum + Number(action.co2_saved),
              0
            ) || 0;

          return {
            ...challenge,
            participant_count: participantCount || 0,
            user_joined: joinedChallengeIds.includes(challenge.id),
            total_co2_saved: totalCO2Saved,
          };
        }) || []
      );

      // Separate joined and available challenges
      const joined = challengesWithData.filter((c) => c.user_joined);
      const available = challengesWithData.filter((c) => !c.user_joined);

      setChallenges(available);
      setUserChallenges(joined);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch challenges",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Use the custom function to get leaderboard data (bypasses RLS)
      // Force fresh data by avoiding cache
      const { data: leaderboardData, error: leaderboardError } =
        await supabase.rpc("get_leaderboard");

      if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);

        // Fallback: fetch data directly if function fails
        const { data: actionsData, error: actionsError } = await supabase.from(
          "eco_actions"
        ).select(`
            user_id,
            co2_saved,
            profiles!inner(full_name)
          `);

        if (actionsError) throw actionsError;

        // Aggregate data manually
        const userMap = new Map();
        actionsData?.forEach((action) => {
          const userId = action.user_id;
          if (!userMap.has(userId)) {
            userMap.set(userId, {
              user_id: userId,
              total_co2_saved: 0,
              action_count: 0,
              full_name: action.profiles?.full_name || "Anonymous User",
            });
          }
          const user = userMap.get(userId);
          user.total_co2_saved += Number(action.co2_saved);
          user.action_count += 1;
        });

        const fallbackData = Array.from(userMap.values())
          .filter((entry) => entry.action_count > 0)
          .sort((a, b) => b.total_co2_saved - a.total_co2_saved);

        setLeaderboard(fallbackData);
        return;
      }

      // Filter out users with zero actions and format the data
      const filteredLeaderboard = (leaderboardData || [])
        .filter((entry) => Number(entry.action_count) > 0)
        .map((entry) => ({
          user_id: entry.user_id,
          full_name: entry.full_name,
          total_co2_saved: Number(entry.total_co2_saved),
          action_count: Number(entry.action_count),
        }));

      setLeaderboard(filteredLeaderboard);
    } catch (error: any) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setJoinLoading(challengeId);

    try {
      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've joined the challenge!",
      });

      fetchChallenges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join challenge",
        variant: "destructive",
      });
    } finally {
      setJoinLoading(null);
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setJoinLoading(challengeId);

    try {
      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've left the challenge",
      });

      fetchChallenges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave challenge",
        variant: "destructive",
      });
    } finally {
      setJoinLoading(null);
    }
  };

  const ChallengeCard = ({
    challenge,
    showLeaveButton = false,
  }: {
    challenge: Challenge;
    showLeaveButton?: boolean;
  }) => (
    <Card key={challenge.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{challenge.name}</CardTitle>
            <CardDescription className="mt-1">
              {challenge.description}
            </CardDescription>
          </div>
          <Badge variant={challenge.is_active ? "default" : "secondary"}>
            {challenge.is_active ? "Active" : "Ended"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Target: {challenge.target_co2} kg CO₂
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {challenge.participant_count} participants
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(challenge.start_date), "MMM d")} -{" "}
              {format(new Date(challenge.end_date), "MMM d, yyyy")}
            </span>
          </div>

          {challenge.total_co2_saved !== undefined && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {challenge.total_co2_saved.toFixed(2)} kg CO₂ saved so far
              </span>
            </div>
          )}

          <div className="pt-2">
            {showLeaveButton ? (
              <Button
                onClick={() => leaveChallenge(challenge.id)}
                disabled={joinLoading === challenge.id}
                variant="outline"
                className="w-full"
              >
                {joinLoading === challenge.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  "Leave Challenge"
                )}
              </Button>
            ) : (
              <Button
                onClick={() => joinChallenge(challenge.id)}
                disabled={joinLoading === challenge.id}
                className="w-full"
              >
                {joinLoading === challenge.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Challenge"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Challenges</h1>
          <p className="text-muted-foreground">
            Join challenges and compete with others to maximize your
            environmental impact
          </p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="joined">My Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            {challenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    No available challenges at the moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="joined" className="space-y-6">
            {userChallenges.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    You haven't joined any challenges yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check out the available challenges to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    showLeaveButton
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Eco Warriors Leaderboard
                </CardTitle>
                <CardDescription>
                  Users ranked by their total CO₂ savings from all eco-actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      No data available yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0
                                ? "bg-primary text-primary-foreground"
                                : index === 1
                                ? "bg-muted text-muted-foreground"
                                : index === 2
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">
                              {entry.full_name ||
                                `User ${entry.user_id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.action_count === 0
                                ? "No actions yet"
                                : `${entry.action_count} actions`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {entry.total_co2_saved.toFixed(2)} kg
                          </p>
                          <p className="text-sm text-muted-foreground">
                            CO₂ saved
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Challenges;
