"use client";

import React, { useState, useEffect } from 'react';
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
  GraduationCap
} from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
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
      const transformedData = {
        ...examData,
        class: examData.className,
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

  const upcomingExams = exams.filter(exam => new Date(exam.date) >= new Date());
  const pastExams = exams.filter(exam => new Date(exam.date) < new Date());

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.firstName || 'Student'}
            </h1>
          </div>
          <p className="text-white-400 mt-2 ml-11">
            Manage your upcoming exams and review past history.
          </p>
        </div>
        
        <Tabs defaultValue="upcoming" className="mb-12">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/60 backdrop-blur-sm rounded-lg">
            <TabsTrigger 
              value="upcoming" 
              className="text-lg font-semibold text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-700/60 rounded-md transition-colors"
            >
              Upcoming Exams
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-lg font-semibold text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700/60 rounded-md transition-colors"
            >
              Exam History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-8">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📘 Upcoming Exams
              </h2>
              <Dialog open={showAddExam} onOpenChange={setShowAddExam}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="h-4 w-4" />
                    Add New Exam
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-gray-900 border border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Exam Plan</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Our AI will generate a personalized study plan
                    </DialogDescription>
                  </DialogHeader>
                  <AddExamForm 
                    onSubmit={handleAddExam}
                    onCancel={() => setShowAddExam(false)}
                  />
                  <DialogFooter />
                </DialogContent>
              </Dialog>
            </div>

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
            ) : upcomingExams.length === 0 ? (
              <Card className="text-center py-12 bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Upcoming Exams</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first exam to get a personalized study plan.
                  </p>
                  <Dialog open={showAddExam} onOpenChange={setShowAddExam}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="h-4 w-4" />
                        Add Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-gray-900 border border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Exam Plan</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Our AI will generate a personalized study plan
                        </DialogDescription>
                      </DialogHeader>
                      <AddExamForm 
                        onSubmit={handleAddExam}
                        onCancel={() => setShowAddExam(false)}
                      />
                      <DialogFooter />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingExams.map(exam => {
                  const daysLeft = differenceInDays(new Date(exam.date), new Date());
                  return (
                    <Card 
                      key={exam.id}
                      className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-700/20 hover:border-blue-500/50 transition-all cursor-pointer"
                      onClick={() => router.push(`/exams/${exam.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-white">{exam.title}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {exam.board} Class {exam.class}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-300">{exam.subject}</div>
                        <div className="flex justify-between items-center mt-2 text-gray-400">
                          <span>{format(new Date(exam.date), 'MMM d, yyyy')}</span>
                          <span className={`text-sm ${daysLeft < 7 ? 'text-red-400' : 'text-blue-400'}`}>
                            {daysLeft} days left
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              🕓 Exam History
            </h2>
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
            ) : pastExams.length === 0 ? (
              <Card className="text-center py-12 bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Past Exams</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Once you complete exams, they will show up here for review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastExams.map(exam => (
                  <Card 
                    key={exam.id}
                    className="bg-gradient-to-br from-gray-800/30 to-gray-700/10 border-gray-700/20 hover:border-gray-500/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/exams/${exam.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-white">{exam.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {exam.board} Class {exam.class}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-300">{exam.subject}</div>
                      <div className="flex justify-between items-center mt-2 text-gray-400">
                        <span>{format(new Date(exam.date), 'MMM d, yyyy')}</span>
                        <span className="text-gray-500">Completed</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
