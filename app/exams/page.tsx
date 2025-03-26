"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface Exam {
  id: number;
  title: string;
  subject: string;
  date: string;
  duration: number;
  description: string;
  user_id: string;
  created_at: string;
}

export default function ExamsPage() {
  const { user, isLoaded } = useUser();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Get all unique subjects from exams
  const allSubjects = React.useMemo(() => {
    const subjectsSet = new Set<string>();
    exams.forEach(exam => {
      if (exam.subject) {
        subjectsSet.add(exam.subject);
      }
    });
    return Array.from(subjectsSet).sort();
  }, [exams]);

  // Filter exams based on search term and active subject
  const filteredExams = React.useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = searchTerm === '' || 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = activeSubject === null || exam.subject === activeSubject;
      
      return matchesSearch && matchesSubject;
    });
  }, [exams, searchTerm, activeSubject]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchExams();
    }
  }, [isLoaded, user]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      } else {
        setError('Failed to load exams');
      }
    } catch (err) {
      setError('An error occurred while fetching exams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExams(exams.filter(exam => exam.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete exam');
      }
    } catch (err) {
      setError('An error occurred while deleting the exam');
      console.error(err);
    }
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  // Get status of exam (upcoming, today, past)
  const getExamStatus = (examDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const examDay = new Date(examDate);
    examDay.setHours(0, 0, 0, 0);
    
    const diffTime = examDay.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'today';
    return 'upcoming';
  };

  return (
    <main className="pt-20 pb-16 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">Your Exams</h1>
            <p className="text-gray-400">Manage your upcoming exams and prepare effectively.</p>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex flex-col gap-6">
              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {activeSubject && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveSubject(null)}
                      className="border-gray-700 text-white hover:bg-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filter
                    </Button>
                  )}
                  
                  <Link href="/exams/add">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Exam
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Subject filters */}
              {allSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-400 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Subjects:
                  </span>
                  {allSubjects.map(subject => (
                    <Badge 
                      key={subject} 
                      variant={activeSubject === subject ? "default" : "outline"}
                      className={`cursor-pointer ${
                        activeSubject === subject 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-800/50 text-white border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setActiveSubject(subject === activeSubject ? null : subject)}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              )}
              
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Exams grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="bg-gray-800/30 border-gray-700/50">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-6 w-3/4 bg-gray-700" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full bg-gray-700 mb-2" />
                        <Skeleton className="h-4 w-2/3 bg-gray-700" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-6 w-20 bg-gray-700" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {filteredExams.map(exam => {
                    const status = getExamStatus(exam.date);
                    const statusColors = {
                      upcoming: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
                      today: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
                      past: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    };
                    
                    return (
                      <Card 
                        key={exam.id} 
                        className="border-gray-700/50 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-gray-800/30"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-medium text-white">{exam.title}</CardTitle>
                            <Badge className={statusColors[status]}>
                              {status === 'upcoming' ? 'Upcoming' : status === 'today' ? 'Today' : 'Past'}
                            </Badge>
                          </div>
                          <div className="text-sm text-blue-400 font-medium">
                            {exam.subject}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-300 line-clamp-2">
                              {exam.description || <span className="italic text-gray-500">No description</span>}
                            </p>
                            
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center text-sm text-gray-300">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {format(new Date(exam.date), 'MMMM d, yyyy')}
                              </div>
                              <div className="flex items-center text-sm text-gray-300">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDuration(exam.duration)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-1 pt-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteExam(exam.id)}
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                          </Button>
                          <Link href={`/exams/edit/${exam.id}`}>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50 mt-4">
                  <GraduationCap className="h-12 w-12 text-blue-500/50 mx-auto mb-3" />
                  <h3 className="text-xl font-medium text-white mb-2">No exams found</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    {searchTerm || activeSubject 
                      ? "No exams match your current filters. Try adjusting your search or subject filter."
                      : "You haven't created any exams yet. Start by adding your first exam!"}
                  </p>
                  {(searchTerm || activeSubject) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setActiveSubject(null);
                      }}
                      className="border-gray-700 text-white hover:bg-gray-700"
                    >
                      Clear Filters
                    </Button>
                  )}
                  {!searchTerm && !activeSubject && (
                    <Link href="/exams/add">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Exam
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 