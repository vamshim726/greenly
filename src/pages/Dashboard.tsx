import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Leaf,
  Plus,
  Activity,
  Target,
  TrendingUp,
  RefreshCw,
  Quote,
  Loader2,
  BarChart3,
  Clock,
  Globe,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import LogActionForm from "@/components/LogActionForm";
import Timeline from "@/components/Timeline";
import Charts from "@/components/Charts";
import CommunityImpactWidget from "@/components/CommunityImpactWidget";
import ImpactCertificate from "@/components/ImpactCertificate";
import { useStats } from "@/hooks/useStats";
import { format } from "date-fns";
import { getRandomQuote, Quote as QuoteType } from "@/data/quotes";
import { generateTimelineData, generateChartData } from "@/lib/dashboard-utils";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{
    full_name: string | null;
  } | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(getRandomQuote());
  const navigate = useNavigate();
  const {
    stats,
    recentActivities,
    allActivities,
    actionTypeData,
    refetchStats,
  } = useStats();

  useEffect(() => {
    // Get current user and their profile
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Fetch user profile for the full name
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          setUserProfile(profileData);
        } catch (error) {
          // Profile might not exist yet, which is fine
          console.log("Profile not found:", error);
        }
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleActionLogged = () => {
    refetchStats();
    setIsLogDialogOpen(false);
  };

  const refreshQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  // Generate data for timeline and charts
  const timelineData = generateTimelineData(allActivities);
  const chartData = generateChartData(allActivities, 30);

  if (!user || stats.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <Leaf className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              Loading your dashboard...
            </h2>
            <p className="mt-2 text-muted-foreground text-center max-w-md">
              We're gathering your eco-impact data and preparing your
              personalized experience.
            </p>

            {/* Loading skeleton cards */}
            <div className="w-full max-w-6xl mt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-0 pb-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-5 bg-muted rounded w-40 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-64"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back,{" "}
              {userProfile?.full_name?.split(" ")[0] || "Eco Warrior"}! 🌱
            </h1>
            <p className="text-muted-foreground">
              Track your environmental impact and continue making a difference
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <ImpactCertificate userProfile={userProfile} stats={stats} />
            <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Log Action
                </Button>
              </DialogTrigger>
              <DialogContent>
                <LogActionForm onActionLogged={handleActionLogged} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Motivational Quote */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Quote className="w-6 h-6 text-primary mb-3" />
                <blockquote className="text-lg font-medium  mb-2 text-green-700 ">
                  "{currentQuote.text}"
                </blockquote>
                <cite className="text-sm text-primary/70">
                  — {currentQuote.author}
                </cite>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshQuote}
                className="flex-shrink-0 text-primary hover:text-primary/80"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Actions
              </CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-muted-foreground">
                Eco-friendly actions taken
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
              <Leaf className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCO2Saved.toFixed(2)} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Carbon footprint reduction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Streak
              </CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                Days of consistent actions
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:border-orange-300"
            onClick={() => navigate("/challenges")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-orange-900">
                  Leaderboard
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-600 font-medium">
                  LIVE
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800 mb-1">
                View Rank
              </div>
              <p className="text-xs text-orange-600 mb-2">
                See community standings
              </p>

              {/* Compact preview */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">?</span>
                  </div>
                  <span className="text-orange-700 font-medium">Your rank</span>
                </div>
                <div className="flex items-center gap-1 text-orange-700">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">Compete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Timeline - Takes 1 column */}
          <div className="lg:col-span-1">
            <Timeline activities={timelineData} isLoading={stats.isLoading} />
          </div>

          {/* Charts - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Charts
              chartData={chartData}
              actionTypeData={actionTypeData}
              isLoading={stats.isLoading}
            />
          </div>
        </div>

        {/* Community Impact Widget */}
        <div className="mb-8">
          <CommunityImpactWidget
            userStats={{
              totalActions: stats.totalActions,
              totalCO2Saved: stats.totalCO2Saved,
            }}
          />
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest eco-friendly actions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No activities yet</p>
                <Button onClick={() => setIsLogDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log your first action
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Leaf className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(activity.action_date),
                            "MMM d, yyyy"
                          )}{" "}
                          • {activity.action_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">
                        {Number(activity.co2_saved).toFixed(2)} kg CO₂
                      </p>
                      <p className="text-sm text-muted-foreground">saved</p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsLogDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log another action
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
