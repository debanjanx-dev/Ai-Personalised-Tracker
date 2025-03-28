"use client";

import React, { useState, useEffect } from 'react';
import { StudyTimeline, CompactStudyTimeline, StudyProgress } from './StudyTimeline';
import { Lock, Unlock } from 'lucide-react';

// Function to fetch chapter names from Gemini API
const fetchChapterNames = async (subject: string, examType: string, classLevel: string) => {
  try {
    console.log('Fetching chapters with:', { subject, examType, classLevel });
    
    const response = await fetch('/api/insights/chapters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        examType, // The API will handle this as 'board'
        classLevel // The API will handle this as 'grade'
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to fetch chapter names:', response.status, response.statusText);
      // Return fallback data instead of throwing an error
      return [
        "Introduction to " + subject,
        "Basic Concepts",
        "Advanced Topics",
        "Applications",
        "Review and Practice"
      ];
    }
    
    const data = await response.json();
    console.log('Fetched chapter names:', data.chapters);
    
    // If data.chapters is an array of objects with title property, extract titles
    if (Array.isArray(data.chapters) && data.chapters.length > 0 && data.chapters[0].title) {
      return data.chapters.map((chapter: { title: string }) => chapter.title);
    }
    
    // Otherwise return the chapters array directly
    return data.chapters || [];
  } catch (error) {
    console.error('Error fetching chapter names:', error);
    // Return fallback data on error
    return [
      "Introduction to " + subject,
      "Basic Concepts",
      "Advanced Topics",
      "Applications",
      "Review and Practice"
    ];
  }
};

// Function to fetch all topics for all chapters at once
const fetchAllTopics = async (subject: string, chapters: string[], classLevel: string) => {
  try {
    console.log('Fetching all topics with:', { subject, chapters, classLevel });
    
    // Create a fallback result in case of error
    const fallbackResult: Record<string, string[]> = {};
    chapters.forEach(chapter => {
      fallbackResult[chapter] = [`Topic 1 for ${chapter}`, `Topic 2 for ${chapter}`];
    });
    
    // If no chapters, return empty result
    if (!chapters || chapters.length === 0) {
      return fallbackResult;
    }
    
    const response = await fetch('/api/insights/all-topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        chapters,
        classLevel
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to fetch all topics:', response.status, response.statusText);
      return fallbackResult;
    }
    
    const data = await response.json();
    console.log('Fetched all topics:', data.topicsByChapter);
    return data.topicsByChapter || fallbackResult;
  } catch (error) {
    console.error('Error fetching all topics:', error);
    // Return fallback data on error
    const fallbackResult: Record<string, string[]> = {};
    chapters.forEach(chapter => {
      fallbackResult[chapter] = [`Topic 1 for ${chapter}`, `Topic 2 for ${chapter}`];
    });
    return fallbackResult;
  }
};

// Convert the existing React Flow data structure to our StudyNode format
const convertToStudyNodes = (flowData: any, chapterNames: string[] = [], topicNames: Record<string, string[]> = {}) => {
  if (!flowData || !flowData.nodes) return [];
  
  // Sort nodes by their position or id to ensure proper sequence
  const sortedNodes = [...flowData.nodes].sort((a, b) => {
    // Sort by position.y first, then by position.x
    if (a.position?.y !== b.position?.y) {
      return (a.position?.y || 0) - (b.position?.y || 0);
    }
    return (a.position?.x || 0) - (b.position?.x || 0);
  });
  
  // Determine which nodes should be locked based on completed status
  // A node is unlocked if it's the first one or if the previous node is completed
  let previousNodeCompleted = true; // First node is always unlocked
  
  return sortedNodes.map((node: any, index: number) => {
    // Get the chapter name for this node
    const chapterName = chapterNames[index] || `Chapter ${index + 1}`;
    
    // Get topic names for this chapter if available
    const chapterTopics = topicNames[chapterName] || [];
    
    // Use node label as title, or a topic name if available
    const title = node.data?.label || 
                 (chapterTopics.length > 0 ? chapterTopics[0] : `Topic ${index + 1}`);
    
    // Determine if this node should be locked
    const isLocked = index > 0 && !previousNodeCompleted;
    
    // Update the previousNodeCompleted for the next iteration
    previousNodeCompleted = node.data?.completed || false;
    
    return {
      id: node.id,
      type: node.type === 'input' ? 'topic' : 
            node.type === 'output' ? 'test' : 
            node.data?.nodeType || 'practice',
      title: title,
      chapterName: chapterName !== title ? chapterName : undefined, // Only include if different from title
      description: node.data?.description || '',
      duration: node.data?.duration || undefined,
      completed: node.data?.completed || false,
      priority: node.data?.priority || 'medium',
      locked: isLocked
    };
  });
};

// Define an interface for the study node structure
interface StudyNode {
  id: string;
  type: string;
  title: string;
  chapterName?: string;
  description: string;
  duration?: number;
  completed: boolean;
  priority: string;
  locked: boolean;
}

interface SchemaFlowProps {
  flowData: any;
  examSubject?: string;
  examType?: string;
  classLevel?: string;
  onNodeClick?: (node: any) => void;
  onNodeComplete?: (nodeId: string, completed: boolean) => void;
  compact?: boolean;
  showProgress?: boolean;
}

export default function SchemaFlow({ 
  flowData, 
  examSubject = '',
  examType = '',
  classLevel = '',
  onNodeClick, 
  onNodeComplete,
  compact = false,
  showProgress = true 
}: SchemaFlowProps) {
  // Update the state definition with the proper type
  const [studyNodes, setStudyNodes] = useState<StudyNode[]>([]);
  const [chapterNames, setChapterNames] = useState<string[]>([]);
  const [topicNames, setTopicNames] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch chapter names and all topics in a single effect
  useEffect(() => {
    if (examSubject && classLevel) {
      setIsLoading(true);
      
      // First fetch chapter names
      fetchChapterNames(examSubject, examType, classLevel)
        .then(names => {
          setChapterNames(names);
          
          // Then fetch all topics for all chapters at once
          return fetchAllTopics(examSubject, names, classLevel);
        })
        .then(topicsByChapter => {
          setTopicNames(topicsByChapter);
        })
        .catch(error => {
          console.error('Error in data fetching chain:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [examSubject, examType, classLevel]);
  
  // Update study nodes when flowData, chapterNames, or topicNames change
  useEffect(() => {
    setStudyNodes(convertToStudyNodes(flowData, chapterNames, topicNames));
  }, [flowData, chapterNames, topicNames]);
  
  const handleNodeClick = (node: any) => {
    if (node.locked) {
      // Show a message that this chapter is locked
      alert('Complete the previous chapter to unlock this one!');
      return;
    }
    
    if (onNodeClick) {
      // Find the original node to pass to the callback
      const originalNode = flowData.nodes.find((n: any) => n.id === node.id);
      onNodeClick(originalNode);
    }
  };
  
  const handleNodeComplete = (nodeId: string, completed: boolean) => {
    if (onNodeComplete) {
      onNodeComplete(nodeId, completed);
    }
    
    // Find the index of the completed node
    const nodeIndex = studyNodes.findIndex((node: any) => node.id === nodeId);
    
    // Update the local state to reflect the change and unlock the next node if needed
    setStudyNodes(prevNodes => {
      const updatedNodes = prevNodes.map((node: any, index) => {
        if (node.id === nodeId) {
          // Update the completed status of the current node
          return { ...node, completed };
        } else if (index === nodeIndex + 1 && completed) {
          // If the current node is completed, unlock the next node
          return { ...node, locked: false };
        }
        return node;
      });
      
      return updatedNodes;
    });
    
    // Update the original flowData to reflect the change
    if (flowData && flowData.nodes) {
      const updatedNodes = flowData.nodes.map((node: any) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              completed
            }
          };
        }
        return node;
      });
      
      // Update the flowData with the new nodes
      flowData.nodes = updatedNodes;
    }
  };
  
  if (!flowData || !studyNodes.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/50">
        <p className="text-gray-400">No study plan available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showProgress && <StudyProgress nodes={studyNodes as Array<StudyNode & { type: "topic" | "test" | "practice" | "review"; priority: "low" | "medium" | "high" }>} />}
      
      {compact ? (
        <CompactStudyTimeline 
          nodes={studyNodes as Array<StudyNode & { type: "topic" | "test" | "practice" | "review"; priority: "low" | "medium" | "high" }>}
          onNodeClick={handleNodeClick}
          onNodeComplete={handleNodeComplete}
        />
      ) : (
        <StudyTimeline 
          nodes={studyNodes as Array<StudyNode & { type: "topic" | "test" | "practice" | "review"; priority: "low" | "medium" | "high" }>}
          onNodeClick={handleNodeClick}
          onNodeComplete={handleNodeComplete}
        />
      )}
    </div>
  );
}