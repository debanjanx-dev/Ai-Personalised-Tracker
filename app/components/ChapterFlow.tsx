"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Handle,
  Position,
  NodeChange,
  EdgeChange,
  Connection,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, ArrowRight, AlertCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import StudyInsights from './StudyInsights';

interface ChapterNodeProps {
  data: {
    label: string;
    description?: string;
    estimatedHours: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

const ChapterNode = ({ data }: ChapterNodeProps) => {
  // Add default values to prevent undefined errors
  const label = data?.label || 'Untitled Chapter';
  const description = data?.description || '';
  const estimatedHours = data?.estimatedHours || 0;
  const difficulty = data?.difficulty || 'medium';
  
  // Define colors based on difficulty
  const difficultyColors = {
    easy: {
      bg: 'bg-green-500/10',
      text: 'text-green-300',
      border: 'border-green-500/30',
      handle: '!bg-green-500'
    },
    medium: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-300',
      border: 'border-yellow-500/30',
      handle: '!bg-yellow-500'
    },
    hard: {
      bg: 'bg-red-500/10',
      text: 'text-red-300',
      border: 'border-red-500/30',
      handle: '!bg-red-500'
    }
  };
  
  const colors = difficultyColors[difficulty];
  
  return (
    <Card className={`w-64 shadow-lg ${colors.border} bg-white/95 backdrop-blur-sm`}>
      <Handle type="target" position={Position.Top} className={colors.handle} />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className={`h-4 w-4 ${colors.text}`} />
          <h3 className="font-semibold text-sm text-gray-900">{label}</h3>
        </div>
        
        {description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className={`${colors.bg} ${colors.text} flex items-center gap-1`}>
            <Clock className="h-3 w-3" />
            <span>{estimatedHours}h</span>
          </Badge>
          <Badge variant="outline" className={`${colors.bg} ${colors.text}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className={colors.handle} />
    </Card>
  );
};

const nodeTypes = {
  topic: ChapterNode,
};

interface ChapterFlowProps {
  examId: string;
  subject: string;
  examType?: string;
  classLevel?: string;
}

export default function ChapterFlow({ 
  examId,
  subject,
  examType = '',
  classLevel = ''
}: ChapterFlowProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [studyInsightsData, setStudyInsightsData] = useState<any>(null);
  
  // Fetch chapter flow data when component mounts
  useEffect(() => {
    const fetchChapterFlow = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching chapter flow for:', { subject, examType, classLevel });
        
        const response = await fetch('/api/insights/chapter-flow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject,
            examType,
            classLevel
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to fetch chapter flow: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Chapter flow API response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.flowData && data.flowData.nodes && data.flowData.edges) {
          console.log('Setting nodes and edges:', {
            nodes: data.flowData.nodes,
            edges: data.flowData.edges
          });
          setNodes(data.flowData.nodes);
          setEdges(data.flowData.edges);
        } else {
          console.error('Invalid flow data structure:', data);
          throw new Error('Invalid flow data structure');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching chapter flow');
        console.error('Chapter flow error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (subject) {
      fetchChapterFlow();
    }
  }, [subject, examType, classLevel]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      return changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((n) => n.id !== change.id);
        }
        if (change.type === 'position' && change.position && change.id) {
          return acc.map((n) => {
            if (n.id === change.id) {
              return { ...n, position: change.position! };
            }
            return n;
          });
        }
        return acc;
      }, nds);
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      return changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((e) => e.id !== change.id);
        }
        return acc;
      }, eds);
    });
  }, []);

  // Add this useEffect to set study insights data when nodes are available
  useEffect(() => {
    if (nodes.length > 0) {
      setStudyInsightsData({
        nodes: nodes,
        overallStudyStrategy: {
          recommendedApproach: "Start with fundamentals and build up to complex topics",
          timeManagement: "Allocate time based on topic difficulty and your strengths/weaknesses",
          examPreparation: "Review all topics and focus on practice tests in the final weeks",
          practiceRecommendations: "Solve a variety of problems to build confidence"
        }
      });
    }
  }, [nodes]);

  if (loading) {
    return (
      <div className="h-[600px] w-full bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] w-full bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!nodes.length) {
    return (
      <div className="h-[600px] w-full bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">No chapter flow data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2" 
          onClick={() => setShowInsights(!showInsights)}
        >
          <Lightbulb className="h-4 w-4" />
          {showInsights ? 'Hide Study Insights' : 'Show Study Insights'}
        </Button>
      </div>
      
      <div className="h-[600px] w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          defaultEdgeOptions={{
            style: { stroke: '#64748b', strokeWidth: 2 },
            animated: true,
          }}
        >
          <Controls className="bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200 rounded-lg shadow-sm" />
          <Background color="#e2e8f0" gap={24} size={1.5} />
        </ReactFlow>
      </div>
      
      {showInsights && studyInsightsData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Study Insights</h2>
          <StudyInsights 
            chapterInsights={studyInsightsData.nodes.map((node: any) => ({
              id: node.id,
              label: node.data?.label || 'Untitled Chapter',
              difficulty: node.data?.difficulty || 'medium',
              estimatedHours: node.data?.estimatedHours || 3,
              studyInsights: node.data?.studyInsights || {
                bestPractices: ["Focus on understanding concepts", "Practice regularly"],
                commonMistakes: ["Memorizing without understanding", "Not practicing enough"],
                studyTechniques: ["Use flashcards", "Teach concepts to others"],
                resourceRecommendations: ["Textbook", "Online practice problems"]
              }
            }))}
            overallStrategy={studyInsightsData.overallStudyStrategy}
          />
        </div>
      )}
    </div>
  );
}