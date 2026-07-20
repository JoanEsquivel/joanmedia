export const CURIOSITIES_TOPICS = {
  music: { label: "Music", icon: "🎵", description: "Albums, live shows, and playlists worth remembering." },
  food: { label: "Food", icon: "🍳", description: "Recipes, restaurants, and cooking experiments." },
  exercise: { label: "Exercise", icon: "🏋️", description: "Training, running, and staying healthy." },
  travel: { label: "Travel", icon: "✈️", description: "Places I've been and places I want to go." },
  books: { label: "Books", icon: "📚", description: "What I'm reading and what stuck with me." },
  history: { label: "History", icon: "🏛️", description: "Moments and stories from the past." },
  psychology: { label: "Psychology", icon: "🧠", description: "How the mind works." },
  games: { label: "Games", icon: "🎮", description: "Video games and board games I enjoy." },
  science: { label: "Science", icon: "🔬", description: "Curiosities from the natural world." },
  brainstorming: { label: "Brainstorming", icon: "💡", description: "Half-formed ideas and thinking out loud." },
} as const;

export type CuriositiesTopic = keyof typeof CURIOSITIES_TOPICS;
