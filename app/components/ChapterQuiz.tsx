"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, BookOpen, Brain } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  conceptTested: string;
  recommendedStudyTopic: string;
}

interface QuizProps {
  examId?: string;
  subject: string;
  chapter: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onComplete?: (results: any) => void;
}

export default function ChapterQuiz({ examId, subject, chapter, difficulty = 'medium', onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch quiz questions when component mounts
  useEffect(() => {
    const fetchQuiz = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/quizzes/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            examId,
            subject,
            chapter,
            difficulty,
            questionCount: 5
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate quiz');
        }
        
        const data = await response.json();
        setQuestions(data.questions);
        if (data.quizId) {
          setQuizId(data.quizId);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while generating the quiz');
        toast({
          title: "Error",
          description: "Failed to generate quiz questions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuiz();
  }, [examId, subject, chapter, difficulty, toast]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare answers data
      const answersData = questions.map(q => ({
        questionId: q.id,
        userAnswer: selectedAnswers[q.id],
        isCorrect: selectedAnswers[q.id] === q.correctAnswer,
        conceptTested: q.conceptTested,
        recommendedStudyTopic: q.recommendedStudyTopic
      }));
      
      // Submit answers
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          examId,
          subject,
          chapter,
          answers: answersData
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }
      
      const results = await response.json();
      setQuizResults(results);
      setQuizCompleted(true);
      
      if (onComplete) {
        onComplete(results);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the quiz');
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the card styling in the loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto bg-black-900/50 border-neutral-800 backdrop-blur-sm">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-400">Generating quiz questions...</p>
        </CardContent>
      </Card>
    );
  }

  // Update the card styling in the quiz results state
  if (quizCompleted && quizResults) {
    return (
      <Card className="w-full max-w-3xl mx-auto bg-gray-900/50 border-neutral-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white">Quiz Results</CardTitle>
          <CardDescription className="text-gray-400">
            Chapter: {chapter} | Subject: {subject}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2 text-white">{quizResults.score}%</div>
            <p className="text-gray-400">
              {quizResults.correctAnswers} out of {quizResults.totalQuestions} correct
            </p>
            <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  quizResults.score >= 70 ? "bg-green-500" : 
                  quizResults.score >= 40 ? "bg-yellow-500" : 
                  "bg-red-500"
                }`}
                style={{ width: `${quizResults.score}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-blue-500" />
              Areas to Focus On
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {quizResults.recommendations.weakAreas.map((area: string, i: number) => (
                <li key={i} className="text-gray-400">{area}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Personalized Study Plan
            </h3>
            <p className="text-gray-400 whitespace-pre-line">{quizResults.recommendations.studyPlan}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recommended Study Techniques</h3>
            <ul className="list-disc pl-5 space-y-1">
              {quizResults.recommendations.studyTechniques.map((technique: string, i: number) => (
                <li key={i} className="text-gray-400">{technique}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={() => {
              setQuizCompleted(false);
              setSelectedAnswers({});
              setCurrentQuestionIndex(0);
            }}
          >
            Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (questions.length === 0) {
      return null;
    }
  
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = selectedAnswers[currentQuestion?.id] !== undefined;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
    // Update the card styling in the quiz questions state
    return (
      <Card className="w-full max-w-3xl mx-auto bg-gray-900/50 border-neutral-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-white">Chapter Quiz</CardTitle>
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          <CardDescription className="text-gray-400">
            {chapter} | {subject}
          </CardDescription>
          <Progress 
            value={(currentQuestionIndex / questions.length) * 100} 
            className="h-1 mt-2 bg-gray-800" 
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium text-white">{currentQuestion?.question}</div>
          
          <RadioGroup 
            value={selectedAnswers[currentQuestion?.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 border border-neutral-800 p-3 rounded-md bg-gray-900/30 hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-300">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {isLastQuestion ? (
            <Button 
              onClick={handleSubmitQuiz}
              disabled={!isAnswered || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}