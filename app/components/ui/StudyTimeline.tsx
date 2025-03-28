"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Brain,
  FileText,
  Lightbulb,
  Zap,
  Lock,
  CheckSquare,
  XSquare
} from 'lucide-react';

interface StudyNode {
  id: string;
  type: 'topic' | 'practice' | 'review' | 'test';
  title: string;
  description?: string;
  duration?: number; // in minutes
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  locked?: boolean;
  chapterName?: string; // Added chapter name field
}

interface StudyTimelineProps {
  nodes: StudyNode[];
  onNodeClick?: (node: StudyNode) => void;
  onNodeComplete?: (nodeId: string, completed: boolean) => void; // Added callback for completion toggle
}

const nodeIcons = {
  topic: <BookOpen className="h-5 w-5" />,
  practice: <FileText className="h-5 w-5" />,
  review: <Brain className="h-5 w-5" />,
  test: <Lightbulb className="h-5 w-5" />
};

const priorityColors = {
  low: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  medium: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  high: "bg-red-500/10 text-red-300 border-red-500/30"
};

export function StudyTimeline({ nodes, onNodeClick, onNodeComplete }: StudyTimelineProps) {
  return (
    <div className="w-full">
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-pink-500">
        {nodes.map((node, index) => (
          <div key={node.id} className="relative flex items-start">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 border-2 ${
              node.locked ? 'border-gray-600' : node.completed ? 'border-green-500' : 'border-blue-500'
            } shadow z-10`}>
              {node.locked ? 
                <Lock className="h-5 w-5 text-gray-500" /> : 
                node.completed ? 
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                  nodeIcons[node.type]
              }
            </div>
            
            <Card 
              className={`ml-6 flex-grow border-gray-700/50 ${
                node.locked 
                  ? 'bg-gray-800/10 opacity-70 cursor-not-allowed' 
                  : node.completed 
                    ? 'bg-gray-800/30 border-green-500/30 hover:bg-gray-800/50 transition-all cursor-pointer' 
                    : 'bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer'
              }`}
              onClick={() => !node.locked && onNodeClick?.(node)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-medium text-white flex items-center">
                      {node.title}
                    </CardTitle>
                    {node.chapterName && node.chapterName !== node.title && (
                      <p className="text-sm text-blue-400 mt-1">{node.chapterName}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {node.priority && (
                      <Badge className={priorityColors[node.priority]}>
                        {node.priority.charAt(0).toUpperCase() + node.priority.slice(1)}
                      </Badge>
                    )}
                    
                    {!node.locked && onNodeComplete && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm text-gray-400">Mark as done</span>
                        <Switch 
                          checked={node.completed} 
                          onCheckedChange={(checked) => onNodeComplete(node.id, checked)}
                          className={node.completed ? "bg-green-600" : ""}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {node.description && (
                    <p className="text-sm text-gray-300">{node.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4">
                    {node.duration && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {node.duration} minutes
                      </div>
                    )}
                    
                    {!node.locked && (
                      <div className="flex items-center text-sm">
                        <Badge variant="outline" className={node.completed ? "border-green-500 text-green-400" : "border-gray-600 text-gray-400"}>
                          {node.completed ? "Completed" : "Not completed"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {index < nodes.length - 1 && (
              <div className="absolute left-5 top-10 -ml-0.5 h-8 w-0.5 bg-gray-700" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// A more compact version for smaller spaces
export function CompactStudyTimeline({ nodes, onNodeClick, onNodeComplete }: StudyTimelineProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex space-x-4 p-2">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <Card 
              className={`min-w-[220px] border-gray-700/50 ${
                node.locked 
                  ? 'bg-gray-800/10 opacity-70 cursor-not-allowed' 
                  : node.completed 
                    ? 'bg-gray-800/30 border-green-500/30 hover:bg-gray-800/50 transition-all cursor-pointer' 
                    : 'bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer'
              }`}
              onClick={() => !node.locked && onNodeClick?.(node)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`mr-2 p-1.5 rounded-full ${
                      node.locked ? 'bg-gray-700' : node.completed ? 'bg-green-900/30' : 'bg-gray-700'
                    }`}>
                      {node.locked ? 
                        <Lock className="h-4 w-4 text-gray-500" /> : 
                        node.completed ? 
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          nodeIcons[node.type]
                      }
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-white">
                        {node.title}
                      </CardTitle>
                      {node.chapterName && node.chapterName !== node.title && (
                        <p className="text-xs text-blue-400">{node.chapterName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2">
                  {node.duration && (
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {node.duration} min
                    </div>
                  )}
                  
                  {!node.locked && onNodeComplete && (
                    <div 
                      className="flex items-center gap-1 text-xs" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNodeComplete(node.id, !node.completed);
                      }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-6 px-2 ${node.completed ? 'text-green-500' : 'text-gray-400'}`}
                      >
                        {node.completed ? 
                          <CheckSquare className="h-3 w-3 mr-1" /> : 
                          <XSquare className="h-3 w-3 mr-1" />
                        }
                        {node.completed ? 'Done' : 'Mark Done'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {index < nodes.length - 1 && (
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// A component that shows study progress
export function StudyProgress({ nodes }: { nodes: StudyNode[] }) {
  const totalNodes = nodes.length;
  const completedNodes = nodes.filter(node => node.completed).length;
  const progressPercentage = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
  
  return (
    <Card className="border-gray-700/50 bg-gray-800/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-white flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-400" />
          Study Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{completedNodes} of {totalNodes} completed</span>
            <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 