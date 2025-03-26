"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import ExamFlow from '@/app/components/ExamFlow';
import { StudyPlan } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Save, Calendar, Clock, BookOpen, School } from "lucide-react";
import { format, differenceInDays } from 'date-fns';

export default function ExamPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [examData, setExamData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        const response = await fetch(`/api/exams/${params.id}`);
        
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
  }, [params.id]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      // Apply changes to nodes
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
      // Apply changes to edges
      return changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((e) => e.id !== change.id);
        }
        return acc;
      }, eds);
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => {
      // Add new edge
      return [
        ...eds,
        {
          id: `e-${connection.source}-${connection.target}`,
          source: connection.source!,
          target: connection.target!,
        },
      ];
    });
  }, []);

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
        
        <Tabs defaultValue="flow" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="flow">Visual Flow</TabsTrigger>
            <TabsTrigger value="stats">Study Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="flow" className="mt-4">
            <ExamFlow 
              nodes={nodes} 
              edges={edges} 
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            />
          </TabsContent>
          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Study Time</CardTitle>
                  <CardDescription>Estimated hours needed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-500">{totalHours} hours</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Daily Target</CardTitle>
                  <CardDescription>To complete before exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">
                    {daysUntilExam > 0 ? Math.ceil(totalHours / daysUntilExam) : totalHours} hours/day
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Topics</CardTitle>
                  <CardDescription>Total study areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-500">{nodes.length}</div>
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