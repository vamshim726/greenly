-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that allows all authenticated users to view all profiles (for leaderboard)
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Keep the update policy restrictive (users can only update their own profile)
-- This should already exist from the previous migration