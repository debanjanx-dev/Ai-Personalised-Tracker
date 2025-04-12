"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BookOpen, Brain, BarChart } from 'lucide-react';
import ChapterQuiz from '@/app/components/ChapterQuiz';
import { useToast } from '@/hooks/use-toast';

// Create a client component that uses useSearchParams
function QuizzesContent() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('take-quiz');
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Check for exam ID in URL params
  useEffect(() => {
    const examId = searchParams.get('examId');
    if (examId) {
      setSelectedExam(examId);
    }
  }, [searchParams]);

  // Fetch exams when component mounts
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
      }
    };
    
    fetchExams();
  }, []);

  // Fetch chapters when exam and subject are selected
  useEffect(() => {
    if (selectedExam && selectedSubject) {
      const fetchChapters = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/insights/chapters', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subject: selectedSubject
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setChapters(data.chapters || []);
          }
        } catch (error) {
          console.error('Error fetching chapters:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchChapters();
    }
  }, [selectedExam, selectedSubject]);

  // Fetch study recommendations when exam is selected
  useEffect(() => {
    if (selectedExam) {
      const fetchRecommendations = async () => {
        try {
          const response = await fetch(`/api/study-recommendations?examId=${selectedExam}`);
          if (response.ok) {
            const data = await response.json();
            setRecommendations(data.recommendations || []);
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      };
      
      fetchRecommendations();
    }
  }, [selectedExam]);

  const handleExamChange = (value: string) => {
    setSelectedExam(value);
    setSelectedSubject(null);
    setSelectedChapter(null);
    
    // Find the selected exam to get its subject
    const exam = exams.find(e => e.id === value);
    if (exam) {
      setSelectedSubject(exam.subject);
    }
  };

  const handleChapterChange = (value: string) => {
    setSelectedChapter(value);
  };

  const handleQuizComplete = (results: any) => {
    toast({
      title: "Quiz Completed",
      description: `You scored ${results.score}% on this quiz.`,
    });
    
    // Refresh recommendations
    if (selectedExam) {
      const fetchRecommendations = async () => {
        try {
          const response = await fetch(`/api/study-recommendations?examId=${selectedExam}`);
          if (response.ok) {
            const data = await response.json();
            setRecommendations(data.recommendations || []);
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      };
      
      fetchRecommendations();
    }
    
    // Switch to recommendations tab
    setActiveTab('recommendations');
  };

  return (
    <div className="min-h-screen bg-black w-full">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Chapter Quizzes & Study Recommendations</h1>
        
        <Card className="mb-6 bg-gray-900/50 border-neutral-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Select Exam and Chapter</CardTitle>
            <CardDescription className="text-gray-400">Choose an exam and chapter to take a quiz or view recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Exam</label>
                <Select value={selectedExam || ''} onValueChange={handleExamChange}>
                  <SelectTrigger className="border-gray-700 bg-gray-900/70 text-gray-300">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id} className="text-gray-300">
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Chapter</label>
                <Select 
                  value={selectedChapter || ''} 
                  onValueChange={handleChapterChange}
                  disabled={!selectedSubject || isLoading}
                >
                  <SelectTrigger className="border-gray-700 bg-gray-900/70 text-gray-300">
                    <SelectValue placeholder={isLoading ? "Loading chapters..." : "Select a chapter"} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.title} className="text-gray-300">
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 backdrop-blur-sm">
            <TabsTrigger value="take-quiz" className="flex items-center gap-2 data-[state=active]:bg-blue-600 text-gray-300 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4" />
              Take Quiz
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 data-[state=active]:bg-blue-600 text-gray-300 data-[state=active]:text-white">
              <Brain className="h-4 w-4" />
              Study Recommendations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="take-quiz" className="space-y-4">
            {selectedExam && selectedSubject && selectedChapter ? (
              <ChapterQuiz 
                examId={selectedExam}
                subject={selectedSubject}
                chapter={selectedChapter}
                onComplete={handleQuizComplete}
              />
            ) : (
              <Card className="bg-gray-900/50 border-neutral-800 backdrop-blur-sm">
                <CardContent className="pt-6 text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400">Select an exam and chapter to take a quiz</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="bg-gray-900/50 border-neutral-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Brain className="h-5 w-5 text-blue-500" />
                        {rec.chapter} Study Recommendations
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Based on your quiz performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Areas to Focus On:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {rec.weakAreas?.map((area: string, i: number) => (
                            <li key={i} className="text-gray-400">{area}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Study Plan:</h3>
                        <p className="text-gray-400 whitespace-pre-line">{rec.studyPlan}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 text-gray-300">Recommended Techniques:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {rec.studyTechniques?.map((technique: string, i: number) => (
                            <li key={i} className="text-gray-400">{technique}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedChapter(rec.chapter);
                            setActiveTab('take-quiz');
                          }}
                          className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          <BookOpen className="h-4 w-4" />
                          Take Quiz on {rec.chapter}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900/50 border-neutral-800 backdrop-blur-sm">
                <CardContent className="pt-6 text-center py-12">
                  <Brain className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {selectedExam 
                      ? "No study recommendations available yet. Take a quiz to get personalized recommendations."
                      : "Select an exam to view study recommendations"}
                  </p>
                  {selectedExam && (
                    <Button 
                      variant="outline" 
                      className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setActiveTab('take-quiz')}
                    >
                      Take a Quiz
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function QuizzesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <QuizzesContent />
    </Suspense>
  );
}