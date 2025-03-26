"use client";

import React, { useCallback } from 'react';
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
import { Card, CardContent } from "../../../card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ArrowRight } from "lucide-react";

interface TopicNodeProps {
  data: {
    label: string;
    description?: string;
    estimatedHours: number;
  };
}

const TopicNode = ({ data }: TopicNodeProps) => {
  // Add default values to prevent undefined errors
  const label = data?.label || 'Untitled Topic';
  const description = data?.description || '';
  const estimatedHours = data?.estimatedHours || 0;
  
  return (
    <Card className="w-64 shadow-lg border-blue-500/20 bg-white/95 backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <h3 className="font-semibold text-sm text-blue-950">{label}</h3>
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{estimatedHours}h</span>
          </Badge>
          <ArrowRight className="h-3 w-3 text-blue-500" />
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </Card>
  );
};

const SubtopicNode = ({ data }: TopicNodeProps) => {
  // Add default values to prevent undefined errors
  const label = data?.label || 'Untitled Subtopic';
  const description = data?.description || '';
  const estimatedHours = data?.estimatedHours || 0;
  
  return (
    <Card className="w-64 shadow-lg border-green-500/20 bg-white/95 backdrop-blur-sm">
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-green-500" />
          <h3 className="font-semibold text-sm text-green-950">{label}</h3>
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{estimatedHours}h</span>
          </Badge>
          <ArrowRight className="h-3 w-3 text-green-500" />
        </div>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </Card>
  );
};

const nodeTypes = {
  topic: TopicNode,
  subtopic: SubtopicNode,
};

interface ExamFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
}

export default function ExamFlow({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange,
  onConnect 
}: ExamFlowProps) {
  return (
    <div className="h-[600px] w-full bg-gradient-to-br from-gray-950 to-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        defaultEdgeOptions={{
          style: { stroke: '#64748b', strokeWidth: 2 },
          animated: true,
        }}
      >
        <Controls className="bg-gray-800/80 backdrop-blur-sm text-white border border-gray-700 rounded-lg shadow-lg" />
        <Background color="#334155" gap={24} size={1.5} />
      </ReactFlow>
    </div>
  );
} 