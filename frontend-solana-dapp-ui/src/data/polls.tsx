// src/data/polls.ts fake backend data for polls

export type PollOption = {
  id: number;
  label: string;
};

export type Poll = {
  id: number;
  question: string;
  options: PollOption[];
};

export const MOCK_POLLS: Poll[] = [
  {
    id: 1,
    question: "What should our next club event be?",
    options: [
      { id: 0, label: "Hackathon workshop" },
      { id: 1, label: "Resume clinic" },
      { id: 2, label: "AI demo night" },
    ],
  },
  {
    id: 2,
    question: "Which blockchain should we explore next?",
    options: [
      { id: 0, label: "Solana" },
      { id: 1, label: "Ethereum L2s" },
      { id: 2, label: "Cosmos" },
    ],
  },
];
