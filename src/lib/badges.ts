
import type { Trainee } from '@/services/trainee-service';
import { Award, BrainCircuit, Code, Rocket, Sparkles, Trophy } from 'lucide-react';

export interface Badge {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const badgeCriteria: ((trainee: Trainee, totalChallenges: number) => Badge | null)[] = [
  (trainee) => {
    if (trainee.progress >= 90) {
      return {
        name: 'High Flyer',
        description: 'Achieved 90% or more overall progress.',
        icon: Rocket,
        color: '#ffffff',
        bgColor: '#2563eb', // blue-600
      };
    }
    return null;
  },
  (trainee) => {
    if ((trainee.quizCompletions?.length || 0) >= 20) {
      return {
        name: 'Quiz Whiz',
        description: 'Completed 20 or more daily quizzes.',
        icon: BrainCircuit,
        color: '#ffffff',
        bgColor: '#db2777', // pink-600
      };
    }
    return null;
  },
  (trainee, totalChallenges) => {
    if (totalChallenges > 0 && (trainee.completedChallengeIds?.length || 0) >= totalChallenges / 2) {
       return {
        name: 'Code Samurai',
        description: 'Completed at least half of all coding challenges.',
        icon: Code,
        color: '#ffffff',
        bgColor: '#4d7c0f', // green-800
      };
    }
    return null;
  },
   (trainee) => {
    if (trainee.quizCompletions?.some(c => c.score === 100)) {
      return {
        name: 'Perfect Scorer',
        description: 'Achieved a perfect 100% on a daily quiz.',
        icon: Sparkles,
        color: '#ca8a04', // yellow-500
        bgColor: '#fef9c3', // yellow-100
      };
    }
    return null;
  },
  (trainee, totalChallenges) => {
     if ((trainee.completedChallengeIds?.length || 0) === totalChallenges && totalChallenges > 0) {
      return {
        name: 'Challenge Champion',
        description: 'Completed all available coding challenges!',
        icon: Trophy,
        color: '#ffffff',
        bgColor: '#f59e0b', // amber-500
      };
    }
    return null;
  },
  (trainee) => {
    if (trainee.progress === 100) {
      return {
        name: 'Trailblazer',
        description: '100% completion of the onboarding program!',
        icon: Award,
        color: '#ffffff',
        bgColor: '#7c3aed', // violet-600
      };
    }
    return null;
  }
];

export function getBadgesForTrainee(trainee: Trainee, totalChallenges: number): Badge[] {
  return badgeCriteria
    .map(criterion => criterion(trainee, totalChallenges))
    .filter((badge): badge is Badge => badge !== null);
}
