"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, BookOpen, School, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { MultiStepLoader } from './ui/multi-step-loader';

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Title must be at least 3 characters.',
  }),
  subject: z.string().min(1, {
    message: 'Please select a subject.',
  }),
  board: z.string().min(1, {
    message: 'Please select a board.',
  }),
  className: z.string().min(1, {
    message: 'Please select a class.',
  }),
  date: z.date({
    required_error: 'Please select a date.',
  }),
});

interface AddExamFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

export default function AddExamForm({ onSubmit, onCancel }: AddExamFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subject: '',
      board: '',
      className: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    // We'll use the loader for 7 seconds before submitting
    setTimeout(() => {
      onSubmit(data);
    }, 7000);
  };

  if (isGenerating) {
    return (
      <div className="py-8">
        <MultiStepLoader 
          className="mb-6"
        />
        <p className="text-center text-sm text-gray-400 mt-4">
          This may take a moment as our AI creates your personalized study plan
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Exam Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Final Mathematics Exam" 
                    {...field} 
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="board"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Board</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select a board" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State">State Board</SelectItem>
                    <SelectItem value="IB">IB</SelectItem>
                    <SelectItem value="IGCSE">IGCSE</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="className"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="6">6th</SelectItem>
                    <SelectItem value="7">7th</SelectItem>
                    <SelectItem value="8">8th</SelectItem>
                    <SelectItem value="9">9th</SelectItem>
                    <SelectItem value="10">10th</SelectItem>
                    <SelectItem value="11">11th</SelectItem>
                    <SelectItem value="12">12th</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Exam Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal bg-gray-800/50 border-gray-700 text-white ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Generate Study Plan
          </Button>
        </div>
      </form>
    </Form>
  );
} 