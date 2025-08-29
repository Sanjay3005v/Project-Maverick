
'use server';
import { db } from '@/lib/firebase';
import { getAdminApp, initializeAdminApp } from '@/lib/firebase-admin';
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

const dummyTrainees: Omit<Trainee, 'id' | 'status' | 'quizCompletions'>[] = [
    { name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'Engineering', progress: 85, dob: '1998-04-12', batch: 'A1' },
    { name: 'Fiona Glenanne', email: 'fiona.g@example.com', department: 'Product', progress: 72, dob: '1999-08-20', batch: 'B2' },
    { name: 'Diana Prince', email: 'diana.p@example.com', department: 'Design', progress: 95, dob: '1997-03-15', batch: 'A1' },
    { name: 'Neo Anderson', email: 'neo.a@example.com', department: 'Engineering', progress: 60, dob: '1996-11-30', batch: 'C3' },
    { name: 'George Costanza', email: 'george.c@example.com', department: 'Product', progress: 45, dob: '1998-07-22', batch: 'B2' },
    { name: 'Hannah Montana', email: 'hannah.m@example.com', department: 'Engineering', progress: 88, dob: '2000-01-10', batch: 'A1' },
    { name: 'Rachel Green', email: 'rachel.g@example.com', department: 'Product', progress: 92, dob: '1995-05-25', batch: 'C3' },
    { name: 'Alex Johnson', email: 'alex.j@example.com', department: 'Design', progress: 78, dob: '1999-12-01', batch: 'B2' },
    { name: 'Brenda Smith', email: 'brenda.s@example.com', department: 'Engineering', progress: 65, dob: '1997-09-05', batch: 'A1' },
    { name: 'Trainee User', email: 'trainee@example.com', department: 'Design', progress: 50, dob: '2001-06-18', batch: 'C3' },
    { name: 'Olivia Pope', email: 'olivia.p@example.com', department: 'Design', progress: 98, dob: '1994-02-14', batch: 'B2' },
    { name: 'Monica Geller', email: 'monica.g@example.com', department: 'Engineering', progress: 91, dob: '1996-08-08', batch: 'A1' },
    { name: 'Ethan Hunt', email: 'ethan.h@example.com', department: 'Product', progress: 82, dob: '1995-10-10', batch: 'C3' },
    { name: 'Kate Austen', email: 'kate.a@example.com', department: 'Design', progress: 77, dob: '1998-11-03', batch: 'B2' },
    { name: 'Quinn Fabray', email: 'quinn.f@example.com', department: 'Engineering', progress: 89, dob: '2000-04-09', batch: 'A1' },
    { name: 'Indiana Jones', email: 'indy.j@example.com', department: 'Design', progress: 93, dob: '1993-07-07', batch: 'C3' },
    { name: 'Peter Parker', email: 'peter.p@example.com', department: 'Engineering', progress: 84, dob: '2002-08-10', batch: 'B2' },
    { name: 'Admin User', email: 'admin@example.com', department: 'Product', progress: 100, dob: '1970-01-01', batch: 'ADMIN' },
];

const getStatusForProgress = (progress: number) => {
    if (progress >= 70) return 'On Track';
    if (progress >= 40) return 'At Risk';
    return 'Need Attention';
}

const traineesCollection = collection(db, 'trainees');

async function seedTrainees() {
    const traineesSnapshot = await getDocs(query(traineesCollection, limit(1)));
    if (traineesSnapshot.empty) {
        console.log("Seeding initial trainees and creating auth users...");
        
        const app = getAdminApp();
        const auth = getAuth(app);
        
        const batch = writeBatch(db);
        const defaultPassword = 'demo123';

        for (const trainee of dummyTrainees) {
            try {
                // Create user in Firebase Authentication
                const userRecord = await auth.createUser({
                    email: trainee.email,
                    password: defaultPassword,
                    displayName: trainee.name,
                });
                
                // Add user to Firestore
                const docRef = doc(traineesCollection);
                batch.set(docRef, {
                    ...trainee,
                    status: getStatusForProgress(trainee.progress),
                    dob: new Date(trainee.dob as string),
                    quizCompletions: [],
                    assignedQuizIds: [],
                    assignedChallengeIds: [],
                    completedChallengeIds: [],
                    authUid: userRecord.uid // Optionally store auth UID
                });

            } catch (error: any) {
                if (error.code === 'auth/email-already-exists') {
                    console.log(`Auth user for ${trainee.email} already exists. Skipping auth creation.`);
                    // Find existing trainee doc to avoid duplicates if possible
                     const q = query(traineesCollection, where("email", "==", trainee.email), limit(1));
                     const existingTrainee = await getDocs(q);
                     if(existingTrainee.empty){
                         const docRef = doc(traineesCollection);
                         batch.set(docRef, {
                            ...trainee,
                            status: getStatusForProgress(trainee.progress),
                         });
                     }
                } else {
                    console.error(`Error creating auth user for ${trainee.email}:`, error);
                }
            }
        }
        await batch.commit();
        console.log("Initial seeding process complete.");
    }
}


export async function getAllTrainees(): Promise<Trainee[]> {
    await seedTrainees(); // Ensure DB is seeded on first load
    
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

    

    


