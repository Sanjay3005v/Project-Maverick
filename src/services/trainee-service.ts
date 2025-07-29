
'use server';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp, query, where, limit, writeBatch, deleteDoc, arrayUnion } from 'firebase/firestore';
import type { OnboardingPlanItem } from '@/ai/flows/generate-onboarding-plan';

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
    quizCompletionDates?: string[];
}

const DUMMY_COMPLETION_DATES = ['2024-07-23', '2024-07-24', '2024-07-25', '2024-07-26', '2024-07-27', '2024-07-28', '2024-07-29', '2024-01-05', '2024-01-06', '2024-01-15', '2024-01-20', '2024-02-01', '2024-02-02', '2024-02-03', '2024-02-10', '2024-02-11', '2024-02-19', '2024-02-28', '2024-03-01', '2024-03-05', '2024-03-06', '2024-03-07', '2024-03-12', '2024-03-13', '2024-03-20', '2024-03-21', '2024-03-30', '2024-04-04', '2024-04-05', '2024-04-06', '2024-04-07', '2024-04-14', '2024-04-15', '2024-04-22', '2024-04-23', '2024-04-24', '2024-04-29', '2024-05-01', '2024-05-02', '2024-05-05', '2024-05-10', '2024-05-11', '2024-05-12', '2024-05-18', '2024-05-25', '2024-06-03', '2024-06-04', '2024-06-09', '2024-06-15', '2024-06-20', '2024-06-21', '2024-06-22', '2024-06-29', '2024-06-30', '2024-07-01', '2024-07-05', '2024-07-06', '2024-07-10', '2024-07-13', '2024-07-14', '2024-07-20', '2024-07-21', '2024-07-23', '2024-07-24', '2024-07-25'];

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
    { name: 'Trainee User', email: 'trainee@example.com', department: 'Design', progress: 50, dob: '2001-06-18', quizCompletionDates: DUMMY_COMPLETION_DATES },
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

async function seedTrainees() {
    console.log("Seeding trainees...");
    const existingTraineesSnapshot = await getDocs(traineesCollection);
    const emailSet = new Set(existingTraineesSnapshot.docs.map(doc => doc.data().email));

    // Special handling for the main trainee user to ensure heatmap data
    const mainTraineeQuery = query(traineesCollection, where("email", "==", "trainee@example.com"));
    const mainTraineeSnapshot = await getDocs(mainTraineeQuery);

    if (!mainTraineeSnapshot.empty) {
        const traineeDoc = mainTraineeSnapshot.docs[0];
        const currentData = traineeDoc.data() as Trainee;
        if (!currentData.quizCompletionDates || currentData.quizCompletionDates.length < DUMMY_COMPLETION_DATES.length) {
            await updateDoc(traineeDoc.ref, { quizCompletionDates: DUMMY_COMPLETION_DATES });
            console.log("Updated main trainee with heatmap data.");
        }
    }


    if(existingTraineesSnapshot.docs.length >= dummyTrainees.length) {
        console.log("Database already has sufficient data. Skipping rest of seed.");
        return;
    }

    const addBatch = writeBatch(db);
    dummyTrainees.forEach(trainee => {
        if (!emailSet.has(trainee.email)) {
            const docRef = doc(collection(db, 'trainees')); // Create a new doc reference
            addBatch.set(docRef, {
                ...trainee,
                status: getStatusForProgress(trainee.progress),
                dob: new Date(trainee.dob as string),
                assessmentScore: Math.floor(Math.random() * 41) + 60,
                quizCompletionDates: trainee.quizCompletionDates || [],
            });
            emailSet.add(trainee.email); // Add to set to prevent duplicates within the batch
        }
    });
    await addBatch.commit();
    console.log("Seeding complete.");
}


export async function getAllTrainees(): Promise<Trainee[]> {
    let traineeSnapshot = await getDocs(traineesCollection);

    if (traineeSnapshot.empty && dummyTrainees.length > 0) {
        await seedTrainees();
        traineeSnapshot = await getDocs(traineesCollection);
    } else {
        // Even if not empty, we might need to update the main trainee for the heatmap
        await seedTrainees(); 
        traineeSnapshot = await getDocs(traineesCollection);
    }
    
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
        // For development, if specific test users don't exist, seed the DB.
        if (email === 'trainee@example.com' || email === 'ad@example.com' || email === 'admin@example.com') {
             await getAllTrainees(); // This will trigger seeding if needed
             const retrySnapshot = await getDocs(q);
             if (!retrySnapshot.empty) {
                 const traineeDoc = retrySnapshot.docs[0];
                 const data = traineeDoc.data();
                 return {
                    id: traineeDoc.id,
                    ...data,
                    dob: data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob,
                } as Trainee;
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
    } as Trainee;
}

export async function addTrainee(traineeData: Omit<Trainee, 'id'>): Promise<string> {
    const docRef = await addDoc(traineesCollection, {
        ...traineeData,
        status: getStatusForProgress(traineeData.progress),
        dob: new Date(traineeData.dob as string),
        assessmentScore: traineeData.assessmentScore || null,
        quizCompletionDates: [],
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

export async function addQuizCompletionDate(traineeId: string, date: string): Promise<void> {
    const traineeRef = doc(db, 'trainees', traineeId);
    await updateDoc(traineeRef, {
        quizCompletionDates: arrayUnion(date)
    });
}

export async function saveOnboardingPlan(traineeId: string, plan: OnboardingPlanItem[]): Promise<void> {
  const traineeRef = doc(db, 'trainees', traineeId);
  await updateDoc(traineeRef, {
    onboardingPlan: plan,
  });
}
