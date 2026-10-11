export interface ExamplePromptCategory {
  id: string;
  name: string;
  prompts: string[];
}

export const EXAMPLE_PROMPTS: ExamplePromptCategory[] = [
  {
    id: "general",
    name: "General & Mindset",
    prompts: [
      "What energy or perspective should I embrace during this period of my life?",
      "What hidden strength or blind spot should I reflect upon today?",
      "What is the underlying theme of the transition I am currently experiencing?",
    ],
  },
  {
    id: "career",
    name: "Career & Ambition",
    prompts: [
      "What actionable steps should I take to advance toward my professional goals?",
      "How can I navigate the current challenges in my work environment constructively?",
      "What opportunities or untapped talents am I overlooking in my career?",
    ],
  },
  {
    id: "relationships",
    name: "Love & Relationships",
    prompts: [
      "How can I cultivate deeper understanding and harmony in my key relationships?",
      "What emotional pattern or barrier is calling for healing within me?",
      "What qualities should I nurture to build a balanced and genuine connection?",
    ],
  },
  {
    id: "decisions",
    name: "Decisions & Choices",
    prompts: [
      "What core principles should guide my judgment as I face this important decision?",
      "What unforeseen factors or lessons might unfold if I choose this path?",
      "How can I align my upcoming choices with my true personal values?",
    ],
  },
];
