"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, BookOpen, Network, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface MultiStepLoaderProps {
  onComplete?: () => void;
  className?: string;
}

export function MultiStepLoader({ onComplete, className }: MultiStepLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps: Step[] = [
    {
      icon: <Brain className="h-10 w-10 text-blue-400" />,
      title: "Analyzing Subject",
      description: "Identifying key topics and concepts..."
    },
    {
      icon: <BookOpen className="h-10 w-10 text-indigo-400" />,
      title: "Creating Study Topics",
      description: "Organizing content into logical learning sequences..."
    },
    {
      icon: <Network className="h-10 w-10 text-purple-400" />,
      title: "Building Connections",
      description: "Mapping relationships between topics..."
    },
    {
      icon: <Sparkles className="h-10 w-10 text-amber-400" />,
      title: "Optimizing Plan",
      description: "Finalizing your personalized study roadmap..."
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000); // Each step takes 2 seconds
      
      return () => clearTimeout(timer);
    } else if (!completed) {
      setCompleted(true);
      if (onComplete) {
        // Give a little extra time on the last step before completing
        const timer = setTimeout(() => {
          onComplete();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, completed, steps.length, onComplete]);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min((currentStep / steps.length) * 100, 100)}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Steps */}
        <div className="pt-12 pb-8">
          <AnimatePresence mode="wait">
            {currentStep < steps.length ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 p-3 bg-gray-900/50 rounded-full border border-gray-800">
                  {steps[currentStep].icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {steps[currentStep].title}
                </h3>
                <p className="text-gray-400">
                  {steps[currentStep].description}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 p-3 bg-green-900/30 rounded-full border border-green-700/30">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Study Plan Ready!
                </h3>
                <p className="text-gray-400">
                  Your personalized study roadmap has been created
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
