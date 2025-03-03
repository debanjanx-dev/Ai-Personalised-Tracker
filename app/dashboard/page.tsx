"use client";

import React, { useState } from 'react';
import { Spotlight } from '../components/ui/spotlight-new';
import { useTasksAndInsights } from '../hooks/useTasksAndInsights';
import { format, isPast } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { Spinner } from '@heroui/react';


export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { tasks, insights, loading, error, addTask, deleteTask } = useTasksAndInsights();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask(newTask);
      setNewTask({ title: '', description: '', due_date: '' });
      setShowAddTask(false);
    } catch (err) {
      console.error('Failed to add task:', err);
      // You might want to show an error message to the user here
    }
  };

  if (!isLoaded || loading) return (
    <div className="flex items-center justify-center h-screen bg-black">
       <Spinner classNames={{label: "text-white mt-4"}} label="Loading..." variant="wave" color="primary" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black">
      
      {/* Dashboard Header */}
      <section className="pt-28 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative">
              <Spotlight>
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                  {user ? `${user.firstName}'s Dashboard` : 'Your Learning Dashboard'}
                </h1>
              </Spotlight>
            </div>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showAddTask ? 'Cancel' : 'Add New Task'}
            </button>
          </div>
        </div>
      </section>

      {/* Add Task Form */}
      {showAddTask && (
        <section className="px-4 mb-8">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleAddTask} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Your Tasks</h3>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No tasks yet. Click "Add New Task" to get started.
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id}
                    className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{task.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                        <p className={`text-sm mt-2 ${isPast(new Date(task.due_date)) ? 'text-red-400' : 'text-blue-400'}`}>
                          Due: {format(new Date(task.due_date), 'PPP')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">AI Insights</h3>
            <div className="prose prose-invert">
              {insights ? (
                <div className="text-gray-300 whitespace-pre-line">
                  {insights}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  No insights available yet. Add some tasks to get AI-powered recommendations.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}