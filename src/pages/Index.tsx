import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Leaf, Target, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Leaf className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl  md:text-6xl font-bold mb-6 pb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Greenly
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your eco-friendly actions and see your positive impact on the environment. 
            Every small step counts towards a greener future.
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6"
          >
            Get Started
          </Button>
        </div>
        
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Actions</h3>
            <p className="text-muted-foreground">
              Log your daily eco-actions like transport choices, energy usage, and waste reduction.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">See Impact</h3>
            <p className="text-muted-foreground">
              View your estimated CO₂ reduction and understand your environmental contribution.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Join Challenges</h3>
            <p className="text-muted-foreground">
              Participate in community challenges and motivate each other to live greener.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
