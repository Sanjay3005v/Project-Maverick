
'use server';
import { db } from '@/lib/firebase';
import { getAdminApp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp, query, where, limit, writeBatch, deleteDoc, arrayUnion } from 'firebase/firestore';
import type { OnboardingPlanItem } from '@/lib/plan-schema';

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

const getStatusForProgress = (progress: number) => {
    if (progress >= 70) return 'On Track';
    if (progress >= 40) return 'At Risk';
    return 'Need Attention';
}

const traineesCollection = collection(db, 'trainees');

// This function now acts as a one-time migration to create auth users for existing data.
async function migrateAndVerifyTrainees() {
    const app = getAdminApp();
    if (!app) {
        // Admin SDK not initialized, likely due to missing service account key.
        // We can't proceed with user creation, so we just return.
        return;
    }
    
    console.log("Checking for trainee auth migration...");
    const auth = getAuth(app);
    const traineesSnapshot = await getDocs(traineesCollection);
    const defaultPassword = 'demo123';

    if (traineesSnapshot.empty) {
        console.log("No trainees found in Firestore. Seeding is complete.");
        return;
    }

    for (const traineeDoc of traineesSnapshot.docs) {
        const trainee = traineeDoc.data() as Trainee;
        if (!trainee.email) continue;
        
        try {
            // Check if an auth user already exists for this email.
            await auth.getUserByEmail(trainee.email);
            // console.log(`Auth user for ${trainee.email} already exists. Skipping.`);
        } catch (error: any) {
            // If the user does not exist, create them.
            if (error.code === 'auth/user-not-found') {
                try {
                    await auth.createUser({
                        email: trainee.email,
                        password: defaultPassword,
                        displayName: trainee.name,
                    });
                    console.log(`Created auth user for ${trainee.email}.`);
                } catch (creationError) {
                    console.error(`Failed to create auth user for ${trainee.email}:`, creationError);
                }
            }
        }
    }
     console.log("Trainee auth migration check complete.");
}


export async function getAllTrainees(): Promise<Trainee[]> {
    await migrateAndVerifyTrainees(); // Ensure all trainees have an auth account.
    
    const traineeSnapshot = await getDocs(traineesCollection);
    
    const traineeList = traineeSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
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
    return {
        id: traineeDoc.id,
        ...data,
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
    
    return {
        id: traineeDoc.id,
        ...data,
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
        status: getStatusForProgress(traineeData.progress),
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
    if (typeof traineeData.progress === 'number') {
        updateData.status = getStatusForProgress(traineeData.progress);
    }
    await updateDoc(traineeRef, updateData);
}

export async function deleteTrainee(traineeId: string): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await deleteDoc(traineeRef);
}


export async function updateTraineeProgress(traineeId: string, newProgress: number): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await updateDoc(traineeRef, {
        progress: newProgress,
        status: getStatusForProgress(newProgress),
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
