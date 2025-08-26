export interface Quote {
  text: string;
  author: string;
}

export const motivationalQuotes: Quote[] = [
  {
    text: "Every eco-action you log today creates a greener tomorrow.",
    author: "GreenSteps Community",
  },
  {
    text: "Small steps in your daily routine can lead to giant leaps for the planet.",
    author: "Environmental Impact Initiative",
  },
  {
    text: "Your carbon footprint reduction today is future generations' cleaner air.",
    author: "Climate Action Network",
  },
  {
    text: "Track your impact, transform your habits, treasure your planet.",
    author: "Eco Warriors United",
  },
  {
    text: "Every kilogram of CO₂ saved counts towards a sustainable future.",
    author: "Carbon Footprint Alliance",
  },
  {
    text: "Progress is measured not just in steps, but in the green footprints we leave behind.",
    author: "Sustainability Champions",
  },
  {
    text: "The best time to start tracking your environmental impact was yesterday. The second best time is now.",
    author: "Green Living Guide",
  },
  {
    text: "Your daily eco-actions are votes for the kind of world you want to live in.",
    author: "Environmental Democracy Project",
  },
  {
    text: "Consistency in small green actions creates extraordinary environmental results.",
    author: "Sustainable Habits Institute",
  },
  {
    text: "Every transport choice, energy saving, and waste reduction adds up to real change.",
    author: "Individual Impact Coalition",
  },
  {
    text: "Track your green journey - every action logged is a step towards sustainability.",
    author: "Eco-Tracking Movement",
  },
  {
    text: "Your environmental streak isn't just a number - it's a commitment to our planet's future.",
    author: "Green Streak Society",
  },
  {
    text: "When you measure your impact, you can manage your footprint.",
    author: "Carbon Consciousness Collective",
  },
  {
    text: "Be the eco-warrior your data shows you can be.",
    author: "Personal Environment Analytics",
  },
  {
    text: "Your leaderboard position reflects your planet's gratitude.",
    author: "Community Climate Champions",
  },
];

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};
