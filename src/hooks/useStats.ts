import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalActions: number;
  totalCO2Saved: number;
  currentStreak: number;
  isLoading: boolean;
}

interface RecentActivity {
  id: string;
  action_type: string;
  description: string;
  co2_saved: number;
  action_date: string;
  created_at: string;
}

export const useStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalActions: 0,
    totalCO2Saved: 0,
    currentStreak: 0,
    isLoading: true,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const calculateStreak = (actions: any[]) => {
    if (actions.length === 0) return 0;

    // Sort actions by date in descending order
    const sortedActions = actions.sort((a, b) => 
      new Date(b.action_date).getTime() - new Date(a.action_date).getTime()
    );

    // Get unique dates
    const uniqueDates = [...new Set(sortedActions.map(action => action.action_date))];
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const actionDate = new Date(uniqueDates[i]);
      actionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (actionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all user actions
      const { data: actions, error } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('action_date', { ascending: false });

      if (error) throw error;

      if (actions) {
        const totalActions = actions.length;
        const totalCO2Saved = actions.reduce((sum, action) => sum + Number(action.co2_saved), 0);
        const currentStreak = calculateStreak(actions);

        setStats({
          totalActions,
          totalCO2Saved,
          currentStreak,
          isLoading: false,
        });

        // Set recent activities (last 5)
        setRecentActivities(actions.slice(0, 5));
      } else {
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, recentActivities, refetchStats: fetchStats };
};