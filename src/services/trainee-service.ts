
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp, query, where, limit, writeBatch, deleteDoc } from 'firebase/firestore';

export interface Trainee {
    id: string;
    name: string;
    email: string;
    department: string;
    progress: number;
    status: string;
    dob: string | Date; 
    assessmentScore?: number;
}

const traineesCollection = collection(db, 'trainees');

// Dummy data for seeding
const dummyTrainees: Omit<Trainee, 'id' | 'status'>[] = [
    { name: 'Alex Johnson', email: 'alex.j@example.com', department: 'Engineering', progress: 85, dob: '1998-05-15' },
    { name: 'Brenda Smith', email: 'brenda.s@example.com', department: 'Product', progress: 100, dob: '1999-02-20' },
    { name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'Design', progress: 60, dob: '2000-11-30' },
    { name: 'Diana Prince', email: 'diana.p@example.com', department: 'Engineering', progress: 35, dob: '1997-07-22' },
    { name: 'Ethan Hunt', email: 'ethan.h@example.com', department: 'Product', progress: 95, dob: '1998-09-01' },
    { name: 'Fiona Glenanne', email: 'fiona.g@example.com', department: 'Design', progress: 75, dob: '1999-03-12' },
    { name: 'George Costanza', email: 'george.c@example.com', department: 'Engineering', progress: 50, dob: '1996-08-19' },
    { name: 'Hannah Montana', email: 'hannah.m@example.com', department: 'Product', progress: 88, dob: '2001-01-05' },
    { name: 'Indiana Jones', email: 'indy.j@example.com', department: 'Design', progress: 100, dob: '1995-06-10' },
    { name: 'Jack Sparrow', email: 'jack.s@example.com', department: 'Engineering', progress: 20, dob: '1997-12-25' },
    { name: 'Kate Austen', email: 'kate.a@example.com', department: 'Product', progress: 92, dob: '1999-04-18' },
    { name: 'Leo DiCaprio', email: 'leo.d@example.com', department: 'Design', progress: 78, dob: '1998-08-25' },
    { name: 'Monica Geller', email: 'monica.g@example.com', department: 'Engineering', progress: 98, dob: '1997-11-03' },
    { name: 'Nathan Drake', email: 'nathan.d@example.com', department: 'Product', progress: 38, dob: '2000-01-15' },
    { name: 'Olivia Pope', email: 'olivia.p@example.com', department: 'Design', progress: 81, dob: '1996-09-12' },
    { name: 'Peter Parker', email: 'peter.p@example.com', department: 'Engineering', progress: 65, dob: '2001-07-30' },
    { name: 'Peter Parker II', email: 'peter.parker@example.com', department: 'Engineering', progress: 45, dob: '2001-08-10' },
    { name: 'Quinn Fabray', email: 'quinn.f@example.com', department: 'Product', progress: 72, dob: '1999-10-21' },
    { name: 'Rachel Green', email: 'rachel.g@example.com', department: 'Design', progress: 55, dob: '1998-02-14' },
    { name: 'Steven Rogers', email: 'steven.r@example.com', department: 'Engineering', progress: 75, dob: '1999-01-01' },
    { name: 'Bucky Barnes', email: 'bucky.b@example.com', department: 'Administration', progress: 100, dob: '1990-01-01' },
    { name: 'Sam Wilson', email: 'sam.wilson@example.com', department: 'Engineering', progress: 78, dob: '2000-03-03' },
    { name: 'Nick Fury', email: 'nick.fury@example.com', department: 'Administration', progress: 100, dob: '1990-01-01' },
];

const getStatusForProgress = (progress: number) => {
    if (progress >= 70) return 'On Track';
    if (progress >= 40) return 'At Risk';
    return 'Need Attention';
}

async function seedTrainees() {
    console.log("Seeding trainees...");
    const existingTraineesSnapshot = await getDocs(traineesCollection);
    if(existingTraineesSnapshot.docs.length >= dummyTrainees.length) {
        console.log("Database already has sufficient data. Skipping seed.");
        return;
    }

    const emailSet = new Set(existingTraineesSnapshot.docs.map(doc => doc.data().email));

    const addBatch = writeBatch(db);
    dummyTrainees.forEach(trainee => {
        if (!emailSet.has(trainee.email)) {
            const docRef = doc(collection(db, 'trainees')); // Create a new doc reference
            addBatch.set(docRef, {
                ...trainee,
                status: getStatusForProgress(trainee.progress),
                dob: new Date(trainee.dob as string),
                assessmentScore: Math.floor(Math.random() * 41) + 60,
            });
            emailSet.add(trainee.email); // Add to set to prevent duplicates within the batch
        }
    });
    await addBatch.commit();
    console.log("Seeding complete.");
}


export async function getAllTrainees(): Promise<Trainee[]> {
    let traineeSnapshot = await getDocs(traineesCollection);

    if (traineeSnapshot.empty) {
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
        if (email === 'trainee@example.com' || email === 'admin@example.com') {
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
