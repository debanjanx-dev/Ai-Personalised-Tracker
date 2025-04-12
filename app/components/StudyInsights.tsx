"use client";

import React from 'react';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import D3StudyGraph from '../components/D3Graph';
import ConceptExplainer from './ConceptExplainer';

interface StudyInsight {
  bestPractices: string[];
  commonMistakes: string[];
  studyTechniques: string[];
  resourceRecommendations: string[];
}

interface OverallStrategy {
  recommendedApproach: string;
  timeManagement: string;
  examPreparation: string;
  practiceRecommendations: string;
}

interface StudyInsightsProps {
  chapterInsights: {
    id: string;
    label: string;
    difficulty: string;
    estimatedHours: number;
    studyInsights: StudyInsight;
  }[];
  overallStrategy?: OverallStrategy;
}

// Custom node types
const nodeTypes = {
  topicNode: TopicNode,
};

// Custom node component
function TopicNode({ data }) {
  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  return (
    <div className="p-2 rounded-md shadow-md bg-gray-800 border border-gray-700 min-w-[200px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-white">{data.label}</h3>
        <Badge className={`${difficultyColors[data.difficulty] || 'bg-blue-500'}`}>
          {data.difficulty}
        </Badge>
      </div>
      <div className="text-xs text-gray-300">
        <p className="mb-1">Est. hours: {data.estimatedHours}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6">
                <Info className="h-3 w-3 mr-1" /> Study tips
              </Button>
            </TooltipTrigger>
            <TooltipContent className="w-64">
              <ul className="list-disc pl-4 text-xs">
                {data.studyInsights?.bestPractices?.slice(0, 2).map((practice, i) => (
                  <li key={i}>{practice}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default function StudyInsights({ chapterInsights, overallStrategy }: StudyInsightsProps) {
  return (
    <div className="space-y-4 sm:space-y-6 pb-8 px-4 sm:px-0">
      {/* Strategy Card - Updated background to match theme */}
      <Card className="w-full bg-gray-900 border border-gray-800">
        <CardHeader className="py-2 sm:py-3">
          <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Study Strategy Blueprint
          </CardTitle>
          <CardDescription className="text-xs text-gray-400">Your personalized roadmap to success</CardDescription>
        </CardHeader>
        <CardContent className="py-0 pb-3">
          <p className="text-xs text-gray-300 leading-relaxed">
            {overallStrategy?.recommendedApproach || "Focus on understanding core concepts before moving to advanced topics. Review regularly and practice with sample questions."}
          </p>
          {overallStrategy?.timeManagement && (
            <div className="mt-3 border-t border-gray-700 pt-2">
              <p className="text-xs text-gray-300">
                <strong className="text-blue-400 font-medium">⏱️ Time Management:</strong> {overallStrategy.timeManagement}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* D3 Graph Visualization - Already has matching background */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Knowledge Flow Map
        </h2>
        {chapterInsights?.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <div className="min-w-[800px] sm:min-w-0 w-full">
              <D3StudyGraph chapterInsights={chapterInsights} />
            </div>
          </div>
        ) : (
          <div className="w-full h-48 sm:h-64 flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/50">
            <p className="text-gray-400 text-sm px-4 text-center">No study insights available yet. Add topics to generate your personalized study map.</p>
          </div>
        )}
      </div>
      
      {/* Add the new ConceptExplainer component */}
      <ConceptExplainer />
      
      {/* Enhanced cards with updated background */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="w-full bg-gray-900 border border-gray-800">
          <CardHeader className="py-2 sm:py-3">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              Exam Day Preparation
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">Final steps to maximize your performance</CardDescription>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <ul className="text-xs text-gray-300 space-y-2 list-disc pl-4">
              {overallStrategy?.examPreparation ? (
                <li className="leading-relaxed">{overallStrategy.examPreparation}</li>
              ) : (
                <>
                  <li className="leading-relaxed">Review all key topics 1-2 days before the exam</li>
                  <li className="leading-relaxed">Get a good night's sleep and prepare materials the night before</li>
                  <li className="leading-relaxed">Use deep breathing to manage exam anxiety</li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="w-full bg-gray-900 border border-gray-800">
          <CardHeader className="py-2 sm:py-3">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Recommended Practice Methods
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">Evidence-based techniques for mastery</CardDescription>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="text-xs text-gray-300">
              {overallStrategy?.practiceRecommendations ? (
                <p className="leading-relaxed">{overallStrategy.practiceRecommendations}</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium text-blue-400">Active Recall:</p>
                  <p className="leading-relaxed pl-2">Test yourself regularly rather than passively re-reading material. Create flashcards for key concepts and quiz yourself frequently.</p>
                  <p className="font-medium text-blue-400 mt-1">Spaced Repetition:</p>
                  <p className="leading-relaxed pl-2">Review material at increasing intervals to strengthen memory retention and prevent forgetting.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add footer/credits section to properly complete the bottom area */}
      <div className="text-center text-xs text-gray-500 mt-4 sm:mt-6 pt-4 border-t border-gray-800">
        <p>Personalized study insights powered by AI • Updated based on your progress</p>
        <p className="mt-1">Reach your full potential with structured learning paths</p>
      </div>
    </div>
  );
}