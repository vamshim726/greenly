-- Add sample data for testing leaderboard functionality

-- Insert sample profiles (these would normally be created via auth signup)
-- Note: In a real app, these would be created through the auth system
-- This is just for testing purposes

-- First, let's create some sample eco_actions for existing users
-- We'll need to check if there are any users first

-- Insert sample eco_actions for testing
-- Note: user_id should correspond to actual authenticated users in the system
-- For demo purposes, we'll add some data only if there are users

-- Create a temporary function to add sample data only if users exist
DO $$
DECLARE
    user_count INTEGER;
    sample_user_id UUID;
BEGIN
    -- Check if there are any users in the auth.users table
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    IF user_count > 0 THEN
        -- Get the first user ID for sample data
        SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
        
        -- Insert sample eco_actions for the first user
        INSERT INTO public.eco_actions (user_id, action_type, description, value, co2_saved, action_date) VALUES
        (sample_user_id, 'transport', 'Biked to work instead of driving', 10.0, 4.5, CURRENT_DATE - INTERVAL '1 day'),
        (sample_user_id, 'energy', 'Switched to LED bulbs', 50.0, 12.5, CURRENT_DATE - INTERVAL '2 days'),
        (sample_user_id, 'waste', 'Used reusable bags for shopping', 5.0, 2.0, CURRENT_DATE - INTERVAL '3 days'),
        (sample_user_id, 'transport', 'Took public transport', 15.0, 8.2, CURRENT_DATE - INTERVAL '4 days'),
        (sample_user_id, 'energy', 'Unplugged devices when not in use', 25.0, 5.5, CURRENT_DATE - INTERVAL '5 days');
        
        RAISE NOTICE 'Sample eco_actions added for user: %', sample_user_id;
    ELSE
        RAISE NOTICE 'No users found. Please sign up first to see leaderboard data.';
    END IF;
END $$;

-- Add a comment explaining how to add more sample data
-- To add more sample users and actions, you would:
-- 1. Sign up users through the auth system (which creates profiles automatically)
-- 2. Log eco_actions through the app interface or directly in the database
