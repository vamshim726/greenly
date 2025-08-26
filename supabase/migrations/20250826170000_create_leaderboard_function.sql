-- Create a function to get leaderboard data that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  total_co2_saved DECIMAL,
  action_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.full_name,
    COALESCE(SUM(ea.co2_saved), 0) as total_co2_saved,
    COALESCE(COUNT(ea.id), 0) as action_count
  FROM profiles p
  LEFT JOIN eco_actions ea ON p.id = ea.user_id
  GROUP BY p.id, p.full_name
  ORDER BY total_co2_saved DESC, action_count DESC
  LIMIT 20;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
