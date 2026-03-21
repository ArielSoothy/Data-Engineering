import { useState, useCallback, useEffect, useRef } from 'react';

interface UseStepAnimationProps {
  totalSteps: number;
  onStepChange?: (step: number) => void;
}

interface UseStepAnimationReturn {
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  goToStep: (n: number) => void;
  goToStart: () => void;
  goToEnd: () => void;
  setSpeed: (s: number) => void;
}

export function useStepAnimation({ totalSteps, onStepChange }: UseStepAnimationProps): UseStepAnimationReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToStep = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(n, totalSteps - 1));
    setCurrentStep(clamped);
    onStepChange?.(clamped);
  }, [totalSteps, onStepChange]);

  const stepForward = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, totalSteps - 1);
      if (next === totalSteps - 1) {
        setIsPlaying(false);
        clearAutoPlay();
      }
      onStepChange?.(next);
      return next;
    });
  }, [totalSteps, onStepChange, clearAutoPlay]);

  const stepBack = useCallback(() => {
    setCurrentStep(prev => {
      const next = Math.max(prev - 1, 0);
      onStepChange?.(next);
      return next;
    });
  }, [onStepChange]);

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      goToStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps, goToStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearAutoPlay();
  }, [clearAutoPlay]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const goToStart = useCallback(() => {
    pause();
    goToStep(0);
  }, [pause, goToStep]);

  const goToEnd = useCallback(() => {
    pause();
    goToStep(totalSteps - 1);
  }, [pause, goToStep, totalSteps]);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
  }, []);

  // Auto-advance when playing
  useEffect(() => {
    clearAutoPlay();
    if (isPlaying && totalSteps > 0) {
      intervalRef.current = setInterval(() => {
        stepForward();
      }, 1500 / speed);
    }
    return clearAutoPlay;
  }, [isPlaying, speed, stepForward, clearAutoPlay, totalSteps]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBack();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToEnd();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBack, goToStart, goToEnd]);

  // Reset when totalSteps changes (new question selected)
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    clearAutoPlay();
  }, [totalSteps, clearAutoPlay]);

  return {
    currentStep,
    isPlaying,
    speed,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBack,
    goToStep,
    goToStart,
    goToEnd,
    setSpeed,
  };
}
