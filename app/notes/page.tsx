"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  Palette,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  color: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const { user, isLoaded } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteColor, setNoteColor] = useState('#F3F4F6');
  
  const colorOptions = [
    '#F3F4F6', // Light gray
    '#FEE2E2', // Light red
    '#FEF3C7', // Light yellow
    '#D1FAE5', // Light green
    '#DBEAFE', // Light blue
    '#E0E7FF', // Light indigo
    '#EDE9FE', // Light purple
    '#FCE7F3', // Light pink
  ];

  // Get all unique tags from notes
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Filter notes based on search term and active tag
  const filteredNotes = React.useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = activeTag === null || note.tags.includes(activeTag);
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, activeTag]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchNotes();
    }
  }, [isLoaded, user]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        setError('Failed to load notes');
      }
    } catch (err) {
      setError('An error occurred while fetching notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      setError('Note title is required');
      return;
    }

    try {
      const tagsArray = noteTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const noteData = {
        title: noteTitle,
        content: noteContent,
        tags: tagsArray,
        color: noteColor
      };

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data.note, ...notes]);
        resetNoteForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create note');
      }
    } catch (err) {
      setError('An error occurred while creating the note');
      console.error(err);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    if (!noteTitle.trim()) {
      setError('Note title is required');
      return;
    }

    try {
      const tagsArray = noteTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const noteData = {
        title: noteTitle,
        content: noteContent,
        tags: tagsArray,
        color: noteColor
      };

      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(notes.map(note => 
          note.id === editingNote.id ? data.note : note
        ));
        resetNoteForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update note');
      }
    } catch (err) {
      setError('An error occurred while updating the note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete note');
      }
    } catch (err) {
      setError('An error occurred while deleting the note');
      console.error(err);
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
    setNoteColor(note.color);
    setShowNoteEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetNoteForm = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setNoteColor('#F3F4F6');
    setShowNoteEditor(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
              <StickyNote className="h-8 w-8 text-yellow-400" />
              Notes
            </h1>
            <p className="text-gray-400 mt-1">
              Capture your thoughts, ideas, and study notes
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notes..."
                className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setShowNoteEditor(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-800 text-red-200">
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="ghost" 
              className="p-0 h-auto absolute right-4 top-4 text-red-200 hover:text-white hover:bg-transparent"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
          {/* Tags sidebar */}
          <div className="bg-gray-800/30 rounded-lg p-4 h-fit border border-gray-700/50">
            <h2 className="text-lg font-medium mb-3 flex items-center gap-2 text-white">
              <Tag className="h-4 w-4 text-yellow-400" />
              Tags
            </h2>
            <div className="space-y-2">
              <button
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTag === null 
                    ? 'bg-yellow-600/20 text-yellow-400' 
                    : 'hover:bg-gray-700/50 text-gray-300'
                }`}
                onClick={() => setActiveTag(null)}
              >
                All Notes
              </button>
              
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                    activeTag === tag 
                      ? 'bg-yellow-600/20 text-yellow-400' 
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                >
                  <span className="truncate"># {tag}</span>
                  <Badge variant="outline" className="bg-gray-700/50 text-xs border-gray-600">
                    {notes.filter(note => note.tags.includes(tag)).length}
                  </Badge>
                </button>
              ))}
              
              {allTags.length === 0 && (
                <div className="text-gray-500 text-sm italic px-3 py-2">
                  No tags yet
                </div>
              )}
            </div>
          </div>

          {/* Notes content */}
          <div>
            {showNoteEditor ? (
              <Card className="bg-gray-800/30 border-gray-700/50 mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-white">
                    {editingNote ? 'Edit Note' : 'Create New Note'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-200">Title</label>
                      <Input
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Note title"
                        className="bg-gray-900/50 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-200">Content</label>
                      <Textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Write your note here..."
                        className="bg-gray-900/50 border-gray-700 text-white min-h-[200px]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-200">Tags (comma separated)</label>
                      <Input
                        value={noteTags}
                        onChange={(e) => setNoteTags(e.target.value)}
                        placeholder="study, math, important"
                        className="bg-gray-900/50 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1 text-gray-200">
                        <Palette className="h-4 w-4" />
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              noteColor === color ? 'border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNoteColor(color)}
                            aria-label={`Select ${color} color`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={resetNoteForm}
                    className="border-gray-700 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingNote ? handleUpdateNote : handleCreateNote}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingNote ? 'Update' : 'Save'}
                  </Button>
                </CardFooter>
              </Card>
            ) : null}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map(note => (
                  <Card 
                    key={note.id} 
                    className="border-gray-700/50 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                    style={{ backgroundColor: note.color + '20' }} // Adding more transparency
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium text-white">{note.title}</CardTitle>
                      <div className="text-xs text-gray-400">
                        {format(new Date(note.updated_at), 'MMM d, yyyy')}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                        {note.content || <span className="italic text-gray-500">No content</span>}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="bg-gray-800/50 text-xs cursor-pointer border-gray-700 text-white"
                            onClick={() => setActiveTag(tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-1 pt-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => startEditingNote(note)}
                      >
                        <Edit3 className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <Sparkles className="h-12 w-12 text-yellow-500/50 mx-auto mb-3" />
                <h3 className="text-xl font-medium text-white mb-2">No notes found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  {searchTerm || activeTag 
                    ? "No notes match your current filters. Try adjusting your search or tags."
                    : "You haven't created any notes yet. Start by adding your first note!"}
                </p>
                {(searchTerm || activeTag) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setActiveTag(null);
                    }}
                    className="border-gray-700 text-white hover:bg-gray-700"
                  >
                    Clear Filters
                  </Button>
                )}
                {!searchTerm && !activeTag && (
                  <Button 
                    onClick={() => setShowNoteEditor(true)}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Note
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 