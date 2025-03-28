"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Save, Calendar, Clock, BookOpen, School, Lightbulb } from "lucide-react";
import { format, differenceInDays } from 'date-fns';
import StudyInsights from '@/app/components/StudyInsights';
import React from 'react';

export default function ExamPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [examData, setExamData] = useState<any>(null);
  const [studyInsights, setStudyInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const router = useRouter();
  
  // Unwrap params using React.use()
const unwrappedParams = params;
  const examId = unwrappedParams.id;

  // Fetch study plan data
  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch study plan');
        }
        
        const data = await response.json();
        setExamData(data);
        
        // Initialize with empty arrays if studyPlan is null
        if (!data.studyPlan) {
          setNodes([]);
          setEdges([]);
          return;
        }
        
        // Make sure nodes and edges exist and have the required properties
        const safeNodes = (data.studyPlan.nodes || []).map((node: any, index: number) => ({
          id: node.id || `node-${index}`,
          type: node.type || 'topic',
          position: node.position || { x: index * 200, y: index % 2 === 0 ? 0 : 100 },
          data: {
            label: node.label || 'Untitled Topic',
            description: node.description || '',
            estimatedHours: node.estimatedHours || 1
          }
        }));
        
        const safeEdges = (data.studyPlan.edges || []).map((edge: any) => ({
          id: edge.id || `edge-${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target
        }));
        
        setNodes(safeNodes);
        setEdges(safeEdges);
      } catch (err) {
        setError('Failed to load study plan. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyPlan();
  }, [examId]);

  // Fetch study insights when exam data is available
  useEffect(() => {
    const fetchStudyInsights = async () => {
      if (!examData) return;
      
      try {
        setInsightsLoading(true);
        const response = await fetch('/api/insights/chapter-flow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: examData.subject,
            examType: examData.board,
            classLevel: examData.class
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch study insights');
        }
        
        const data = await response.json();
        setStudyInsights(data.flowData);
      } catch (err) {
        console.error('Error fetching study insights:', err);
        // Don't set error state here to avoid disrupting the main UI
      } finally {
        setInsightsLoading(false);
      }
    };

    // Always fetch study insights when exam data is available
    if (examData) {
      fetchStudyInsights();
    }
  }, [examData]);

  // Calculate total study hours
  const totalHours = nodes.reduce((total, node) => {
    return total + (node.data?.estimatedHours || 0);
  }, 0);

  // Calculate days until exam
  const daysUntilExam = examData ? differenceInDays(new Date(examData.date), new Date()) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 px-4 pb-10">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Prepare study insights data for the component
  const chapterInsights = studyInsights?.nodes?.map((node: any) => ({
    id: node.id,
    label: node.label || node.data?.label,
    difficulty: node.difficulty || node.data?.difficulty || 'medium',
    estimatedHours: node.estimatedHours || node.data?.estimatedHours || 3,
    studyInsights: node.studyInsights || node.data?.studyInsights || {
      bestPractices: ["Focus on understanding concepts", "Practice regularly"],
      commonMistakes: ["Memorizing without understanding", "Not practicing enough"],
      studyTechniques: ["Use flashcards", "Teach concepts to others"],
      resourceRecommendations: ["Textbook", "Online practice problems"]
    }
  })) || [];

  const overallStrategy = studyInsights?.overallStudyStrategy || {
    recommendedApproach: "Start with fundamentals and build up to complex topics",
    timeManagement: "Allocate time based on topic difficulty and your strengths/weaknesses",
    examPreparation: "Review all topics and focus on practice tests in the final weeks",
    practiceRecommendations: "Solve a variety of problems to build confidence"
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{examData?.title} Study Plan</h1>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-400">
              <School className="h-4 w-4" />
              <span>{examData?.board} Class {examData?.class}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span>{examData?.subject}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{examData?.date ? format(new Date(examData.date), 'MMM d, yyyy') : 'No date'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{daysUntilExam} days remaining</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="insights" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="insights">Study Insights</TabsTrigger>
            <TabsTrigger value="stats">Study Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Study Insights</h2>
              {insightsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : chapterInsights.length > 0 ? (
                <StudyInsights 
                  chapterInsights={chapterInsights}
                  overallStrategy={overallStrategy}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <p className="text-gray-400">No study insights available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Study Time</CardTitle>
                  <CardDescription>Estimated hours needed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-500">
                    {chapterInsights.reduce((total: number, chapter: { estimatedHours: number }) => total + chapter.estimatedHours, 0)} hours
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Daily Target</CardTitle>
                  <CardDescription>To complete before exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">
                    {daysUntilExam > 0 ? 
                      Math.ceil(chapterInsights.reduce((total: number, chapter: { estimatedHours: number }) => total + chapter.estimatedHours, 0) / daysUntilExam) :
                      chapterInsights.reduce((total: number, chapter: { estimatedHours: number }) => total + chapter.estimatedHours, 0)} hours/day
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Topics</CardTitle>
                  <CardDescription>Total study areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-500">
                    {chapterInsights.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Button
            onClick={() => {
              // In a real app, you would save the updated study plan to your database
              alert('Study plan saved!');
            }}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}