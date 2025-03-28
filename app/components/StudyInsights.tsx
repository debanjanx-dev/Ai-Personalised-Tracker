"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, AlertTriangle, Lightbulb, BookMarked, Calendar } from 'lucide-react';

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

export default function StudyInsights({ chapterInsights, overallStrategy }: StudyInsightsProps) {
  return (
    <div className="space-y-6">
      {overallStrategy && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Overall Study Strategy
            </CardTitle>
            <CardDescription className="text-gray-400">
              General approach to studying this subject effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommended Approach
                </h3>
                <p className="text-sm text-gray-300">{overallStrategy.recommendedApproach}</p>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Management
                </h3>
                <p className="text-sm text-gray-300">{overallStrategy.timeManagement}</p>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Exam Preparation
                </h3>
                <p className="text-sm text-gray-300">{overallStrategy.examPreparation}</p>
              </div>
              
              <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Practice Recommendations
                </h3>
                <p className="text-sm text-gray-300">{overallStrategy.practiceRecommendations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="chapter-0" className="w-full">
        <TabsList className="w-full overflow-x-auto flex-wrap justify-start h-auto py-2 bg-gray-800/80 backdrop-blur-sm">
          {chapterInsights.map((chapter, index) => (
            <TabsTrigger 
              key={chapter.id} 
              value={`chapter-${index}`}
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-blue-400 py-2 px-4 flex items-center gap-1"
            >
              <span className="truncate max-w-[150px]">{chapter.label}</span>
              <Badge 
                variant="outline" 
                className={`ml-1 ${
                  chapter.difficulty === 'easy' ? 'bg-green-900/30 text-green-400 border-green-700' : 
                  chapter.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 
                  'bg-red-900/30 text-red-400 border-red-700'
                }`}
              >
                {chapter.difficulty}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {chapterInsights.map((chapter, index) => (
          <TabsContent key={chapter.id} value={`chapter-${index}`} className="mt-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    {chapter.label}
                  </span>
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-900/30 text-blue-400 border-blue-700">
                    <Clock className="h-3 w-3" />
                    <span>{chapter.estimatedHours}h</span>
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Study insights and recommendations for this chapter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-900/50">
                    <h3 className="font-medium text-green-400 mb-2">Best Practices</h3>
                    <ul className="space-y-1">
                      {chapter.studyInsights.bestPractices.map((practice, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-900/50">
                    <h3 className="font-medium text-red-400 mb-2">Common Mistakes</h3>
                    <ul className="space-y-1">
                      {chapter.studyInsights.commonMistakes.map((mistake, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50">
                    <h3 className="font-medium text-blue-400 mb-2">Study Techniques</h3>
                    <ul className="space-y-1">
                      {chapter.studyInsights.studyTechniques.map((technique, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <BookMarked className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{technique}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-900/50">
                    <h3 className="font-medium text-purple-400 mb-2">Resource Recommendations</h3>
                    <ul className="space-y-1">
                      {chapter.studyInsights.resourceRecommendations.map((resource, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>{resource}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}