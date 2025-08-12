
'use server';

import { Trainee, getAllTrainees } from './trainee-service';
import { Submission, getAllSubmissions } from './submission-service';

export interface Assignment {
  id: string; // Composite key for uniqueness
  traineeId: string;
  traineeName: string;
  assignmentTitle: string;
  department: string;
  status: 'Submitted' | 'Pending';
  submissionId?: string; // ID of the submission if it exists
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const [trainees, submissions] = await Promise.all([
    getAllTrainees(),
    getAllSubmissions(),
  ]);

  const submissionMap = new Map<string, Submission>();
  submissions.forEach(sub => {
    // Create a key based on traineeId and assignmentTitle
    const key = `${sub.traineeId}-${sub.assignmentTitle}`;
    submissionMap.set(key, sub);
  });

  const allAssignments: Assignment[] = [];

  trainees.forEach(trainee => {
    if (trainee.onboardingPlan && trainee.onboardingPlan.length > 0) {
      trainee.onboardingPlan.forEach((planItem, planIndex) => {
        planItem.tasks.forEach((task, taskIndex) => {
          const submissionKey = `${trainee.id}-${task}`;
          // The key for React must be unique for each element.
          const uniqueAssignmentId = `${trainee.id}-${planIndex}-${taskIndex}-${task}`;
          const submission = submissionMap.get(submissionKey);

          allAssignments.push({
            id: uniqueAssignmentId,
            traineeId: trainee.id,
            traineeName: trainee.name,
            assignmentTitle: task,
            department: trainee.department,
            status: submission ? 'Submitted' : 'Pending',
            submissionId: submission ? submission.id : undefined,
          });
        });
      });
    }
  });

  // Sort by trainee name, then by status
  allAssignments.sort((a, b) => {
    if (a.traineeName < b.traineeName) return -1;
    if (a.traineeName > b.traineeName) return 1;
    if (a.status === 'Pending' && b.status === 'Submitted') return -1;
    if (a.status === 'Submitted' && b.status === 'Pending') return 1;
    return 0;
  });

  return allAssignments;
}
