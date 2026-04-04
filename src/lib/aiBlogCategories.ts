export const AI_BLOG_CATEGORIES = {
  qa: { label: "QA", icon: "🔍", description: "Quality Assurance & Testing" },
  ai: { label: "AI", icon: "🤖", description: "Artificial Intelligence" },
  frontend: { label: "FrontEnd", icon: "🎨", description: "Frontend Development" },
  backend: { label: "Backend", icon: "⚙️", description: "Backend Development" },
  "software-engineering": { label: "Software Engineering", icon: "🏗️", description: "Design Patterns & Software Architecture" },
  data: { label: "Data", icon: "📊", description: "Data Engineering & Science" },
  cloud: { label: "Cloud", icon: "☁️", description: "Cloud Computing" },
  "life-work-balance": { label: "Life-Work Balance", icon: "⚖️", description: "Wellness, productivity & work-life harmony" },
  softskills: { label: "Soft Skills", icon: "🤝", description: "Communication, leadership & interpersonal skills" },
} as const;

export type AIBlogCategory = keyof typeof AI_BLOG_CATEGORIES;
