
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp, query, where, limit, writeBatch, deleteDoc, arrayUnion } from 'firebase/firestore';
import type { OnboardingPlanItem } from '@/ai/flows/generate-onboarding-plan';

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
    assessmentScore?: number;
    onboardingPlan?: OnboardingPlanItem[];
    quizCompletions?: QuizCompletion[];
    avatarUrl?: string;
    assignedQuizIds?: string[];
    assignedChallengeIds?: string[];
    completedChallengeIds?: string[];
}

const DUMMY_COMPLETION_DATA: QuizCompletion[] = [
    { date: '2024-07-23', score: 85 }, { date: '2024-07-24', score: 92 },
    { date: '2024-07-25', score: 78 }, { date: '2024-07-26', score: 95 },
    { date: '2024-07-27', score: 60 }, { date: '2024-07-28', score: 72 },
    { date: '2024-07-29', score: 88 }, { date: '2024-01-05', score: 55 },
    { date: '2024-01-06', score: 90 }, { date: '2024-01-15', score: 68 },
    { date: '2024-01-20', score: 76 }, { date: '2024-02-01', score: 91 },
    { date: '2024-02-02', score: 82 }, { date: '2024-02-03', score: 79 },
    { date: '2024-02-10', score: 94 }, { date: '2024-02-11', score: 65 },
    { date: '2024-02-19', score: 81 }, { date: '2024-02-28', score: 70 },
    { date: '2024-03-01', score: 88 }, { date: '2024-03-05', score: 93 },
    { date: '2024-03-06', score: 77 }, { date: '2024-03-07', score: 85 },
    { date: '2024-03-12', score: 96 }, { date: '2024-03-13', score: 69 },
    { date: '2024-03-20', score: 80 }, { date: '2024-03-21', score: 89 },
    { date: '2024-03-30', score: 74 }, { date: '2024-04-04', score: 98 },
    { date: '2024-04-05', score: 81 }, { date: '2024-04-06', score: 73 },
    { date: '2024-04-07', score: 86 }, { date: '2024-04-14', score: 90 },
    { date: '2024-04-15', score: 66 }, { date: '2024-04-22', score: 79 },
    { date: '2024-04-23', score: 84 }, { date: '2024-04-24', score: 92 },
    { date: '2024-04-29', score: 71 }, { date: '2024-05-01', score: 87 },
    { date: '2024-05-02', score: 94 }, { date: '2024-05-05', score: 75 },
    { date: '2024-05-10', score: 83 }, { date: '2024-05-11', score: 91 },
    { date: '2024-05-12', score: 88 }, { date: '2024-05-18', score: 68 },
    { date: '2024-05-25', score: 95 }, { date: '2024-06-03', score: 80 },
    { date: '2024-06-04', score: 78 }, { date: '2024-06-09', score: 92 },
    { date: '2024-06-15', score: 85 }, { date: '2024-06-20', score: 89 },
    { date: '2024-06-21', score: 76 }, { date: '2024-06-22', score: 94 },
    { date: '2024-06-29', score: 70 }, { date: '2024-06-30', score: 81 },
    { date: '2024-07-01', score: 93 }, { date: '2024-07-05', score: 86 },
    { date: '2024-07-06', score: 79 }, { date: '2024-07-10', score: 97 },
    { date: '2024-07-13', score: 65 }, { date: '2024-07-14', score: 88 },
    { date: '2024-07-20', score: 91 }, { date: '2024-07-21', score: 84 },
    { date: '2024-07-22', score: 77 },
];

const dummyTrainees: Omit<Trainee, 'id' | 'status'>[] = [
    { name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'Engineering', progress: 85, dob: '1998-04-12' },
    { name: 'Fiona Glenanne', email: 'fiona.g@example.com', department: 'Product', progress: 72, dob: '1999-08-20' },
    { name: 'Diana Prince', email: 'diana.p@example.com', department: 'Design', progress: 95, dob: '1997-03-15' },
    { name: 'Neo Anderson', email: 'neo.a@example.com', department: 'Engineering', progress: 60, dob: '1996-11-30' },
    { name: 'George Costanza', email: 'george.c@example.com', department: 'Product', progress: 45, dob: '1998-07-22' },
    { name: 'George Costanza', email: 'george.c1@example.com', department: 'Product', progress: 48, dob: '1998-07-23' },
    { name: 'Hannah Montana', email: 'hannah.m@example.com', department: 'Engineering', progress: 88, dob: '2000-01-10' },
    { name: 'Rachel Green', email: 'rachel.g@example.com', department: 'Product', progress: 92, dob: '1995-05-25' },
    { name: 'Alex Johnson', email: 'alex.j@example.com', department: 'Design', progress: 78, dob: '1999-12-01' },
    { name: 'Brenda Smith', email: 'brenda.s@example.com', department: 'Engineering', progress: 65, dob: '1997-09-05' },
    { name: 'Neo Anderson', email: 'neo.a1@example.com', department: 'Engineering', progress: 62, dob: '1996-12-01' },
    { name: 'Trainee User', email: 'trainee@example.com', department: 'Design', progress: 50, dob: '2001-06-18' },
    { name: 'Rachel Green', email: 'rachel.g1@example.com', department: 'Product', progress: 93, dob: '1995-05-26' },
    { name: 'Brenda Smith', email: 'brenda.s1@example.com', department: 'Engineering', progress: 68, dob: '1997-09-06' },
    { name: 'Olivia Pope', email: 'olivia.p@example.com', department: 'Design', progress: 98, dob: '1994-02-14' },
    { name: 'Monica Geller', email: 'monica.g@example.com', department: 'Engineering', progress: 91, dob: '1996-08-08' },
    { name: 'Ethan Hunt', email: 'ethan.h@example.com', department: 'Product', progress: 82, dob: '1995-10-10' },
    { name: 'Kate Austen', email: 'kate.a@example.com', department: 'Design', progress: 77, dob: '1998-11-03' },
    { name: 'Quinn Fabray', email: 'quinn.f@example.com', department: 'Engineering', progress: 89, dob: '2000-04-09' },
    { name: 'Charlie Brown', email: 'charlie.b1@example.com', department: 'Engineering', progress: 87, dob: '1998-04-13' },
    { name: 'Indiana Jones', email: 'indy.j@example.com', department: 'Design', progress: 93, dob: '1993-07-07' },
    { name: 'Peter Parker', email: 'peter.p@example.com', department: 'Engineering', progress: 84, dob: '2002-08-10' },
    { name: 'Peter Parker', email: 'peter.p1@example.com', department: 'Engineering', progress: 86, dob: '2002-08-11' },
    { name: 'Diana Prince', email: 'diana.p1@example.com', department: 'Design', progress: 96, dob: '1997-03-16' },
    { name: 'Iron Man', email: 'iron@gmail.com', department: 'Engineering', progress: 100, dob: '1970-05-29' },
    { name: 'Leo DiCaprio', email: 'leo.d@example.com', department: 'Product', progress: 81, dob: '1974-11-11' },
    { name: 'Trainee User', email: 'trainee1@example.com', department: 'Design', progress: 55, dob: '2001-06-19' },
    { name: 'Kate Austen', email: 'kate.a1@example.com', department: 'Design', progress: 79, dob: '1998-11-04' },
    { name: 'Jack Sparrow', email: 'jack.s@example.com', department: 'Product', progress: 73, dob: '1963-06-09' },
    { name: 'Ethan Hunt', email: 'ethan.h1@example.com', department: 'Product', progress: 83, dob: '1995-10-11' },
    { name: 'Olivia Pope', email: 'olivia.p1@example.com', department: 'Design', progress: 99, dob: '1994-02-15' },
    { name: 'Admin User', email: 'admin@example.com', department: 'Product', progress: 100, dob: '1970-01-01' },
    { name: 'Quinn Fabray', email: 'quinn.f1@example.com', department: 'Engineering', progress: 90, dob: '2000-04-10' },
    { name: 'Monica Geller', email: 'monica.g1@example.com', department: 'Engineering', progress: 92, dob: '1996-08-09' },
    { name: 'Hannah Montana', email: 'hannah.m1@example.com', department: 'Engineering', progress: 89, dob: '2000-01-11' },
    { name: 'Admin User', email: 'admin1@example.com', department: 'Product', progress: 100, dob: '1970-01-02' },
    { name: 'Alex Johnson', email: 'alex.j1@example.com', department: 'Design', progress: 79, dob: '1999-12-02' },
    { name: 'Fiona Glenanne', email: 'fiona.g1@example.com', department: 'Product', progress: 74, dob: '1999-08-21' },
    { name: 'Indiana Jones', email: 'indy.j1@example.com', department: 'Design', progress: 94, dob: '1993-07-08' },
    { name: 'Leo DiCaprio', email: 'leo.d1@example.com', department: 'Product', progress: 82, dob: '1974-11-12' },
    { name: 'Jack Sparrow', email: 'jack.s1@example.com', department: 'Product', progress: 75, dob: '1963-06-10' },
];

const getStatusForProgress = (progress: number) => {
    if (progress >= 70) return 'On Track';
    if (progress >= 40) return 'At Risk';
    return 'Need Attention';
}

const generateRandomCompletionData = (): QuizCompletion[] => {
    const data: QuizCompletion[] = [];
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const totalDays = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const numberOfEntries = Math.floor(Math.random() * 80) + 20; // 20-100 entries

    for (let i = 0; i < numberOfEntries; i++) {
        const randomDay = Math.floor(Math.random() * totalDays);
        const date = new Date(yearStart.getTime());
        date.setDate(date.getDate() + randomDay);
        
        data.push({
            date: date.toISOString().split('T')[0],
            score: Math.floor(Math.random() * 61) + 40 // Score between 40 and 100
        });
    }
    // Remove duplicates by date
    const uniqueData = Array.from(new Map(data.map(item => [item.date, item])).values());
    return uniqueData;
}

const traineesCollection = collection(db, 'trainees');

async function seedTrainees() {
    console.log("Checking and seeding trainees...");
    const existingTraineesSnapshot = await getDocs(traineesCollection);
    const existingTraineesMap = new Map(existingTraineesSnapshot.docs.map(doc => [doc.data().email, {id: doc.id, ...doc.data()}]));

    const batch = writeBatch(db);
    let operationsPerformed = false;

    // Add new trainees who don't exist
    dummyTrainees.forEach(trainee => {
        if (!existingTraineesMap.has(trainee.email)) {
            const docRef = doc(traineesCollection);
            const completionData = trainee.email === 'trainee@example.com' 
                ? DUMMY_COMPLETION_DATA 
                : generateRandomCompletionData();

            batch.set(docRef, {
                ...trainee,
                status: getStatusForProgress(trainee.progress),
                dob: new Date(trainee.dob as string),
                // assessmentScore is not seeded here to avoid hydration mismatch
                quizCompletions: completionData,
                assignedQuizIds: [],
                assignedChallengeIds: [],
                completedChallengeIds: [],
            });
            operationsPerformed = true;
        }
    });

    // Update existing trainees if they are missing heatmap data or assigned quizzes
    existingTraineesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const updatePayload: Record<string, any> = {};

        if (!data.quizCompletions || data.quizCompletions.length === 0) {
            updatePayload.quizCompletions = data.email === 'trainee@example.com' 
                ? DUMMY_COMPLETION_DATA 
                : generateRandomCompletionData();
        }
        if (!data.assignedQuizIds) {
            updatePayload.assignedQuizIds = [];
        }
        if (!data.assignedChallengeIds) {
            updatePayload.assignedChallengeIds = [];
        }
        if (!data.completedChallengeIds) {
            updatePayload.completedChallengeIds = [];
        }

        if (Object.keys(updatePayload).length > 0) {
            batch.update(doc.ref, updatePayload);
            operationsPerformed = true;
        }
    });

    if (operationsPerformed) {
        await batch.commit();
        console.log("Database seeding/update completed successfully.");
    } else {
        console.log("All trainees already exist and have required data fields.");
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
    });
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
        // Don't auto-seed here anymore, as it can interfere with new user creation flow
        return null;
    }

    const traineeDoc = querySnapshot.docs[0];
    const data = traineeDoc.data();
    
    const updatePayload: Record<string, any> = {};
    if (!data.quizCompletions || data.quizCompletions.length === 0) {
        updatePayload.quizCompletions = data.email === 'trainee@example.com'
            ? DUMMY_COMPLETION_DATA
            : generateRandomCompletionData();
    }
     if (!data.assignedQuizIds) {
        updatePayload.assignedQuizIds = [];
    }
     if (!data.assignedChallengeIds) {
        updatePayload.assignedChallengeIds = [];
    }
    if (!data.completedChallengeIds) {
        updatePayload.completedChallengeIds = [];
    }

    if (Object.keys(updatePayload).length > 0) {
        await updateDoc(traineeDoc.ref, updatePayload);
        return {
            id: traineeDoc.id,
            ...data,
            ...updatePayload,
            dob: data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob,
        } as Trainee;
    }
    

    return {
        id: traineeDoc.id,
        ...data,
        dob: data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob,
    } as Trainee;
}

export async function addTrainee(traineeData: Omit<Trainee, 'id'>): Promise<string> {
    const docRef = await addDoc(traineesCollection, {
        ...traineeData,
        status: getStatusForProgress(traineeData.progress),
        dob: new Date(traineeData.dob as string),
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
