-- Create eco_actions table for logging user actions
CREATE TABLE public.eco_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('transport', 'energy', 'waste')),
  description TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  co2_saved DECIMAL(10,2) NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenges table for community challenges
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  target_co2 DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.eco_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for eco_actions
CREATE POLICY "Users can view their own actions" 
ON public.eco_actions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own actions" 
ON public.eco_actions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions" 
ON public.eco_actions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own actions" 
ON public.eco_actions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for challenges (public read, admin create/update)
CREATE POLICY "Anyone can view challenges" 
ON public.challenges 
FOR SELECT 
USING (true);

-- Create policies for challenge_participants
CREATE POLICY "Users can view challenge participants" 
ON public.challenge_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges" 
ON public.challenge_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_eco_actions_updated_at
BEFORE UPDATE ON public.eco_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample challenges
INSERT INTO public.challenges (name, description, target_co2, start_date, end_date) VALUES
('Green Commute Challenge', 'Use public transport, bike, or walk instead of driving for a week', 50.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Energy Saver Challenge', 'Reduce home energy consumption by 20% this month', 100.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Zero Waste Week', 'Minimize waste production for one week', 25.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days');