"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Image, Lightbulb, ListOrdered } from 'lucide-react';

interface ExplanationResponse {
  conceptual: string;
  visual: string;
  analogical: string;
  stepByStep: string;
  visualUrl?: string; // URL to generated diagram
}

export default function ConceptExplainer() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInterests(e.target.value);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question about a concept you find difficult.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question, 
          interests: interests.trim() || undefined 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }
      
      const data = await response.json();
      setExplanation(data);
    } catch (err) {
      console.error('Error getting explanation:', err);
      setError('Failed to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setExplanation(null);
    setError('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full bg-gray-900 border border-gray-800">
        <CardHeader className="py-3">
          <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Concept Explainer
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Ask about any difficult concept and get personalized explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!explanation ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-1">
                  What concept are you struggling with?
                </label>
                <Textarea
                  id="question"
                  ref={textareaRef}
                  placeholder="E.g., Explain the concept of quantum superposition..."
                  value={question}
                  onChange={handleQuestionChange}
                  className="w-full bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-300 mb-1">
                  Your interests (optional)
                </label>
                <Textarea
                  id="interests"
                  placeholder="E.g., sports, music, gaming, cooking..."
                  value={interests}
                  onChange={handleInterestsChange}
                  className="w-full bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                  rows={2}
                />
                <p className="text-xs text-gray-400 mt-1">
                  This helps us create analogies that connect to your background
                </p>
              </div>
              
              {error && <p className="text-red-400 text-sm">{error}</p>}
              
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !question.trim()} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating explanations...
                  </>
                ) : (
                  'Explain This Concept'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Tabs defaultValue="conceptual" className="w-full">
                <TabsList className="grid grid-cols-4 bg-gray-800">
                  <TabsTrigger value="conceptual" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Conceptual</span>
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    <span className="hidden sm:inline">Visual</span>
                  </TabsTrigger>
                  <TabsTrigger value="analogical" className="flex items-center gap-1">
                    <Lightbulb className="h-4 w-4" />
                    <span className="hidden sm:inline">Analogies</span>
                  </TabsTrigger>
                  <TabsTrigger value="stepByStep" className="flex items-center gap-1">
                    <ListOrdered className="h-4 w-4" />
                    <span className="hidden sm:inline">Steps</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="conceptual" className="mt-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">Conceptual Understanding</h3>
                    <div className="text-sm text-gray-300 whitespace-pre-line">
                      {explanation.conceptual}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="visual" className="mt-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">Visual Explanation</h3>
                    {explanation.visualUrl && (
                      <div className="mb-3 flex justify-center">
                        <img 
                          src={explanation.visualUrl} 
                          alt="Visual explanation" 
                          className="max-w-full rounded-lg border border-gray-700 max-h-64 object-contain"
                        />
                      </div>
                    )}
                    <div className="text-sm text-gray-300 whitespace-pre-line">
                      {explanation.visual}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analogical" className="mt-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">Analogies & Connections</h3>
                    <div className="text-sm text-gray-300 whitespace-pre-line">
                      {explanation.analogical}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stepByStep" className="mt-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">Step-by-Step Breakdown</h3>
                    <div className="text-sm text-gray-300 whitespace-pre-line">
                      {explanation.stepByStep}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Ask Another Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}