"use client";

import React, { useState, useEffect } from 'react';
import { useTasksAndInsights } from '../hooks/useTasksAndInsights';
import { format, differenceInDays } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import AddExamForm from '../components/AddExamForm';
import { Exam } from '../types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PlusCircle, 
  BookOpen, 
  Calendar, 
  School, 
  Clock, 
  Sparkles,
  GraduationCap,
  BrainCircuit
} from 'lucide-react';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { tasks, insights, loading, error, addTask, deleteTask } = useTasksAndInsights();
  const [showAddExam, setShowAddExam] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/exams');
        if (response.ok) {
          const data = await response.json();
          setExams(data.exams || []);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  const handleAddExam = async (examData: any) => {
    try {
      // Transform the data to match what the backend expects
      // The form uses 'className' but the backend expects 'class'
      const transformedData = {
        ...examData,
        class: examData.className // Map className to class as expected by backend
      };
      
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns the exam directly, not wrapped in an exam property
        setExams([data, ...exams]);
        setShowAddExam(false);
        router.push(`/exams/${data.id}`);
      } else {
        console.error('Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-20 pb-10">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-7xl mx-auto">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute top-1/3 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.firstName || 'Student'}</h1>
          </div>
          <p className="text-white-400 mt-2 ml-11">Your personalized AI study assistant is ready to help you excel</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className='text-white'>Study Plans</span>
              </CardTitle>
              <CardDescription>AI-generated study roadmaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{exams.length}</div>
              <p className="text-gray-400 text-sm">Active study plans</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className='text-white'>Upcoming Exams</span>
              </CardTitle>
              <CardDescription>Track your exam schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {exams.filter(exam => new Date(exam.date) > new Date()).length}
              </div>
              <p className="text-gray-400 text-sm">Exams scheduled</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 border-indigo-700/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-indigo-400" />
                <span className='text-white'>AI Insights</span>
              </CardTitle>
              <CardDescription>Personalized learning tips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{insights?.length || 0}</div>
              <p className="text-gray-400 text-sm">Custom recommendations</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="exams" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="exams" className="text-white data-[state=active]:bg-blue-900/50">Exam Prep</TabsTrigger>
            <TabsTrigger value="insights" className="text-white data-[state=active]:bg-indigo-900/50">AI Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exams" className="mt-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Your Exam Preparations
              </h2>
              <Button 
                onClick={() => setShowAddExam(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4" />
                Add New Exam
              </Button>
            </div>
            
            {showAddExam && (
              <Card className="mb-8 border-blue-500/20 bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Create New Exam Plan</CardTitle>
                  <CardDescription>Our AI will generate a personalized study plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddExamForm 
                    onSubmit={handleAddExam}
                    onCancel={() => setShowAddExam(false)}
                  />
                </CardContent>
              </Card>
            )}
            
            {loadingExams ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <Skeleton className="h-6 w-2/3 bg-gray-800/50" />
                      <Skeleton className="h-4 w-1/2 bg-gray-800/50 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full bg-gray-800/50" />
                      <Skeleton className="h-4 w-3/4 bg-gray-800/50 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : exams.length === 0 ? (
              <Card className="text-center py-12 bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Exams Added Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">Create your first exam to get a personalized study plan generated with AI.</p>
                  <Button 
                    onClick={() => setShowAddExam(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Your First Exam
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => {
                  const daysLeft = differenceInDays(new Date(exam.date), new Date());
                  const isUpcoming = daysLeft >= 0;
                  
                  return (
                    <Card 
                      key={exam.id}
                      className={`
                        border transition-all duration-300 cursor-pointer backdrop-blur-sm
                        ${isUpcoming 
                          ? "bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-700/20 hover:border-blue-500/50" 
                          : "bg-gradient-to-br from-gray-800/30 to-gray-700/10 border-gray-700/20 hover:border-gray-500/50"
                        }
                      `}
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-white">{exam.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-400">
                          <School className="h-3 w-3" />
                          {exam.board} Class {exam.class}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{exam.subject}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(exam.date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className={`
                            flex items-center gap-1 text-sm px-2 py-0.5 rounded-full
                            ${isUpcoming 
                              ? daysLeft < 7 
                                ? "bg-red-950/30 text-red-400" 
                                : "bg-blue-950/30 text-blue-400"
                              : "bg-gray-800/50 text-gray-400"
                            }
                          `}>
                            <Clock className="h-3 w-3" />
                            <span>
                              {isUpcoming 
                                ? `${daysLeft} days left` 
                                : "Completed"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className={`
                            w-full border-0 
                            ${isUpcoming 
                              ? "bg-blue-950/30 text-blue-400 hover:bg-blue-900/50" 
                              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                            }
                          `}
                        >
                          View Study Plan
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="mt-6">
            <Card className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/10 border-indigo-700/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BrainCircuit className="h-5 w-5 text-indigo-400" />
                  AI Learning Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your study patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(insights) && insights.length > 0 ? (
                  <div className="space-y-4">
                    {insights.map((insight: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/30">
                        <h3 className="font-medium text-indigo-300 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-300">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-indigo-500/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">No insights yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Create and interact with study plans to receive personalized AI insights.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}