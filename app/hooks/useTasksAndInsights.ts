"use client";

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface InsightResponse {
  tasks: Task[];
  analysis: string;
}

export function useTasksAndInsights() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch tasks with error handling
      const tasksResponse = await fetch('/api/tasks');
      if (!tasksResponse.ok) {
        throw new Error(`Tasks API error: ${tasksResponse.statusText}`);
      }
      const tasksData = await tasksResponse.json();
      console.log('Tasks response:', tasksData); // Debug log
      
      // Fetch insights with error handling
      const insightsResponse = await fetch('/api/insights');
      if (!insightsResponse.ok) {
        throw new Error(`Insights API error: ${insightsResponse.statusText}`);
      }
      const insightsData = await insightsResponse.json();
      console.log('Insights response:', insightsData); // Debug log
      
      // Set state only if we have valid data
      if (tasksData?.tasks) {
        setTasks(tasksData.tasks);
      }
      if (insightsData?.analysis) {
        setInsights(insightsData.analysis);
      }
    } catch (err) {
      console.error('Error fetching data:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Initialize empty states on error
      setTasks([]);
      setInsights('');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to add task');
      }
      
      await fetchData(); // Refresh data after successful add
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (id: number, task: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      fetchData(); // Refresh data
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete task');
      }
      
      await fetchData(); // Refresh data after successful delete
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    tasks,
    insights,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refreshData: fetchData
  };
} 