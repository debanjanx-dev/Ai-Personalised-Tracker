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

export interface Exam {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  board: 'CBSE' | 'ICSE';
  class: '11' | '12';
  date: string;
  userId: string;
}

export interface StudyNode {
  id: string;
  type: 'topic' | 'subtopic';
  label: string;
  description?: string;
  estimatedHours: number;
  position: { x: number; y: number };
}

export interface StudyEdge {
  id: string;
  source: string;
  target: string;
}

export interface StudyPlan {
  id: string;
  examId: string;
  nodes: StudyNode[];
  edges: StudyEdge[];
  createdAt: Date;
} 