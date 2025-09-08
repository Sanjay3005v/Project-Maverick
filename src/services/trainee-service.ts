
'use server';
import { db } from '@/lib/firebase';
import { getAdminApp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp, query, where, limit, writeBatch, deleteDoc, arrayUnion } from 'firebase/firestore';
import type { OnboardingPlanItem, Task } from '@/lib/plan-schema';

export interface QuizCompletion {
    date: string;
    score: number; // e.g., percentage score
}

export interface Trainee {
    id: string;
    name: string;
    email: string;
    department: string;
    progress: number;
    status: string;
    dob: string | Date;
    batch?: string;
    assessmentScore?: number;
    onboardingPlan?: OnboardingPlanItem[];
    quizCompletions?: QuizCompletion[];
    avatarUrl?: string;
    assignedQuizIds?: string[];
    assignedChallengeIds?: string[];
    completedChallengeIds?: string[];
}

const getStatusForProgress = (progress: number, planExists: boolean) => {
    if (!planExists) return 'Not Started';
    if (progress >= 70) return 'On Track';
    if (progress >= 40) return 'At Risk';
    return 'Need Attention';
}

const calculateProgress = (plan: OnboardingPlanItem[] | undefined): number => {
    if (!plan || plan.length === 0) {
        return 0;
    }
    const allTasks = plan.flatMap(week => week.tasks);
    if (allTasks.length === 0) {
        return 0;
    }
    const completedTasks = allTasks.filter(task => task.status === 'Completed').length;
    return Math.round((completedTasks / allTasks.length) * 100);
}


const traineesCollection = collection(db, 'trainees');


export async function getAllTrainees(): Promise<Trainee[]> {
    const traineeSnapshot = await getDocs(traineesCollection);
    
    const traineeList = traineeSnapshot.docs.map(doc => {
        const data = doc.data();
        const progress = calculateProgress(data.onboardingPlan);
        const planExists = data.onboardingPlan && data.onboardingPlan.length > 0;
        return {
            id: doc.id,
            ...data,
            progress: progress,
            status: getStatusForProgress(progress, planExists),
            dob: data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob,
        } as Trainee;
    }).filter(trainee => !trainee.email.includes('admin'));
    return traineeList;
}

export async function getTraineeById(id: string): Promise<Trainee | null> {
    const traineeDoc = await getDoc(doc(db, 'trainees', id));
    if (!traineeDoc.exists()) {
        return null;
    }
    const data = traineeDoc.data();
     const progress = calculateProgress(data.onboardingPlan);
     const planExists = data.onboardingPlan && data.onboardingPlan.length > 0;
    return {
        id: traineeDoc.id,
        ...data,
        progress: progress,
        status: getStatusForProgress(progress, planExists),
        dob: data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob,
    } as Trainee;
}

export async function getTraineeByEmail(email: string): Promise<Trainee | null> {
    const q = query(traineesCollection, where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        if(email.includes('admin')) {
            return {
                id: 'admin-user',
                name: 'Admin User',
                email: email,
                department: 'Administration',
                progress: 100,
                status: 'On Track',
                dob: new Date().toISOString().split('T')[0],
            }
        }
        return null;
    }

    const traineeDoc = querySnapshot.docs[0];
    const data = traineeDoc.data();
     const progress = calculateProgress(data.onboardingPlan);
     const planExists = data.onboardingPlan && data.onboardingPlan.length > 0;
    
    return {
        id: traineeDoc.id,
        ...data,
        progress: progress,
        status: getStatusForProgress(progress, planExists),
        dob: data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob,
        quizCompletions: data.quizCompletions || [],
        assignedQuizIds: data.assignedQuizIds || [],
        assignedChallengeIds: data.assignedChallengeIds || [],
        completedChallengeIds: data.completedChallengeIds || [],
    } as Trainee;
}

export async function addTrainee(traineeData: Omit<Trainee, 'id'>): Promise<string> {
    const q = query(traineesCollection, where("email", "==", traineeData.email), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }

    const docRef = await addDoc(traineesCollection, {
        ...traineeData,
        status: getStatusForProgress(traineeData.progress, false),
        dob: traineeData.dob ? new Date(traineeData.dob as string) : new Date(),
        assessmentScore: traineeData.assessmentScore || null,
        quizCompletions: [],
        assignedQuizIds: [],
        assignedChallengeIds: [],
        completedChallengeIds: [],
        onboardingPlan: [],
        avatarUrl: ''
    });
    return docRef.id;
}

export async function updateTrainee(id: string, traineeData: Partial<Omit<Trainee, 'id'>>): Promise<void> {
    const traineeRef = doc(db, 'trainees', id);
    const updateData: Record<string, any> = { ...traineeData };
    if (traineeData.dob) {
        updateData.dob = new Date(traineeData.dob as string);
    }
    // Progress and status are now dynamic, so we don't need to set them here
    if (updateData.hasOwnProperty('progress')) {
        delete updateData.progress;
    }
     if (updateData.hasOwnProperty('status')) {
        delete updateData.status;
    }
    await updateDoc(traineeRef, updateData);
}

export async function deleteTrainee(traineeId: string): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await deleteDoc(traineeRef);
}


export async function updateTraineeProgress(traineeId: string, newProgress: number): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    // This function is now less critical as progress is calculated dynamically.
    // However, it could be used for manual overrides if needed in the future.
    // For now, we'll keep the logic simple, but in a real app, this might be removed.
    await updateDoc(traineeRef, {
        // We no longer store progress directly, but we might want to store some other metric
    });
}

export async function addQuizCompletion(traineeId: string, completionData: QuizCompletion): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await updateDoc(traineeRef, {
        quizCompletions: arrayUnion(completionData)
    });
}

export async function saveOnboardingPlan(traineeId: string, plan: OnboardingPlanItem[]): Promise<void> {
  const traineeRef = doc(db, 'trainees', traineeId);
  await updateDoc(traineeRef, {
    onboardingPlan: plan,
  });
}

export async function updateUserAvatar(traineeId: string, avatarUrl: string): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await updateDoc(traineeRef, { avatarUrl });
}

export async function assignQuizToTrainees(quizId: string, traineeIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    traineeIds.forEach(traineeId => {
        const traineeRef = doc(db, 'trainees', traineeId);
        batch.update(traineeRef, {
            assignedQuizIds: arrayUnion(quizId)
        });
    });
    await batch.commit();
}

export async function assignChallengeToTrainees(challengeId: string, traineeIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    traineeIds.forEach(traineeId => {
        const traineeRef = doc(db, 'trainees', traineeId);
        batch.update(traineeRef, {
            assignedChallengeIds: arrayUnion(challengeId)
        });
    });
    await batch.commit();
}

export async function markChallengeAsCompleted(traineeId: string, challengeId: string): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await updateDoc(traineeRef, {
        completedChallengeIds: arrayUnion(challengeId)
    });
}

export async function updateTaskStatus(traineeId: string, weekIndex: number, taskIndex: number, status: 'Completed' | 'Pending', submittedLink?: string): Promise<void> {
    const trainee = await getTraineeById(traineeId);
    if (!trainee || !trainee.onboardingPlan) {
        throw new Error("Trainee or onboarding plan not found.");
    }

    const updatedPlan = [...trainee.onboardingPlan];
    if (updatedPlan[weekIndex] && updatedPlan[weekIndex].tasks[taskIndex]) {
        updatedPlan[weekIndex].tasks[taskIndex].status = status;
        if (submittedLink) {
            updatedPlan[weekIndex].tasks[taskIndex].submittedLink = submittedLink;
        }
    } else {
        throw new Error("Task not found in plan.");
    }
    
    await saveOnboardingPlan(traineeId, updatedPlan);
}
