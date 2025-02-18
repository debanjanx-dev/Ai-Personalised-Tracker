export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Progress {
  id: string;
  userId: string;
  topic: string;
  score: number;
  completedAt: Date;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  recommendation: string;
  category: 'learning' | 'practice' | 'review';
  createdAt: Date;
} 