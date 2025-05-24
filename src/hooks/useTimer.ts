import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerHookProps {
  initialDuration: number; // in minutes
  autoStart?: boolean;
  onComplete?: () => void;
  playSound?: boolean;
}

interface TimerHookReturn {
  timeRemaining: number; // in seconds
  progress: number; // percentage 0-100
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (minutes: number) => void;
}

export const useTimer = ({
  initialDuration,
  autoStart = false,
  onComplete,
  playSound = true,
}: TimerHookProps): TimerHookReturn => {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDuration] = useState(initialDuration * 60);
  
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/timer-complete.mp3');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setTimeRemaining(initialDuration * 60);
  }, [initialDuration]);
  
  const pause = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
    setIsRunning(false);
  }, []);
  
  const resume = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);
  
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeRemaining(initialDuration * 60);
    setIsRunning(false);
    setIsPaused(false);
  }, [initialDuration]);
  
  const addTime = useCallback((minutes: number) => {
    setTimeRemaining(prev => prev + minutes * 60);
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer complete
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsRunning(false);
            
            // Play sound if enabled
            if (playSound && audioRef.current) {
              audioRef.current.play().catch(e => console.error('Error playing sound:', e));
            }
            
            // Call onComplete callback if provided
            if (onComplete) {
              onComplete();
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, onComplete, playSound]);
  
  // Calculate progress percentage
  const progress = Math.round(((totalDuration - timeRemaining) / totalDuration) * 100);
  
  return {
    timeRemaining,
    progress,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
    addTime,
  };
};

export default useTimer;
