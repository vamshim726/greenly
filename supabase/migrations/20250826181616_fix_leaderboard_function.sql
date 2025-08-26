-- Fix leaderboard function to ensure proper counting
DROP FUNCTION IF EXISTS public.get_leaderboard();

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  total_co2_saved DECIMAL(10,2),
  action_count BIGINT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ea.user_id,
    COALESCE(SUM(ea.co2_saved), 0::decimal(10,2)) as total_co2_saved,
    COUNT(ea.id) as action_count,
    COALESCE(p.full_name, 'Anonymous User') as full_name
  FROM public.eco_actions ea
  LEFT JOIN public.profiles p ON ea.user_id = p.id
  GROUP BY ea.user_id, p.full_name
  HAVING COUNT(ea.id) > 0  -- Only return users with actions
  ORDER BY total_co2_saved DESC, action_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
