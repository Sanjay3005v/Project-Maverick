
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
const dummyTrainees: Omit<Trainee, 'id'>[] = [
    { name: 'Alex Johnson', email: 'alex.j@example.com', department: 'Engineering', progress: 85, status: 'On Track', dob: '1998-05-15' },
    { name: 'Brenda Smith', email: 'brenda.s@example.com', department: 'Product', progress: 100, status: 'On Track', dob: '1999-02-20' },
    { name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'Design', progress: 60, status: 'On Track', dob: '2000-11-30' },
    { name: 'Diana Prince', email: 'diana.p@example.com', department: 'Engineering', progress: 40, status: 'At Risk', dob: '1997-07-22' },
    { name: 'Ethan Hunt', email: 'ethan.h@example.com', department: 'Product', progress: 95, status: 'On Track', dob: '1998-09-01' },
    { name: 'Fiona Glenanne', email: 'fiona.g@example.com', department: 'Design', progress: 75, status: 'On Track', dob: '1999-03-12' },
    { name: 'George Costanza', email: 'george.c@example.com', department: 'Engineering', progress: 50, status: 'Need Attention', dob: '1996-08-19' },
    { name: 'Hannah Montana', email: 'hannah.m@example.com', department: 'Product', progress: 88, status: 'On Track', dob: '2001-01-05' },
    { name: 'Indiana Jones', email: 'indy.j@example.com', department: 'Design', progress: 100, status: 'On Track', dob: '1995-06-10' },
    { name: 'Jack Sparrow', email: 'jack.s@example.com', department: 'Engineering', progress: 20, status: 'At Risk', dob: '1997-12-25' },
    { name: 'Kate Austen', email: 'kate.a@example.com', department: 'Product', progress: 92, status: 'On Track', dob: '1999-04-18' },
    { name: 'Leo DiCaprio', email: 'leo.d@example.com', department: 'Design', progress: 78, status: 'On Track', dob: '1998-08-25' },
    { name: 'Monica Geller', email: 'monica.g@example.com', department: 'Engineering', progress: 98, status: 'On Track', dob: '1997-11-03' },
    { name: 'Neo Anderson', email: 'neo.a@example.com', department: 'Product', progress: 35, status: 'At Risk', dob: '2000-01-15' },
    { name: 'Olivia Pope', email: 'olivia.p@example.com', department: 'Design', progress: 81, status: 'On Track', dob: '1996-09-12' },
    { name: 'Peter Parker', email: 'peter.p@example.com', department: 'Engineering', progress: 65, status: 'On Track', dob: '2001-07-30' },
    { name: 'Quinn Fabray', email: 'quinn.f@example.com', department: 'Product', progress: 72, status: 'On Track', dob: '1999-10-21' },
    { name: 'Rachel Green', email: 'rachel.g@example.com', department: 'Design', progress: 55, status: 'Need Attention', dob: '1998-02-14' },
    { name: 'trainee@example.com', email: 'trainee@example.com', department: 'Engineering', progress: 75, status: 'On Track', dob: '1999-01-01' },
    { name: 'admin@example.com', email: 'admin@example.com', department: 'Administration', progress: 100, status: 'On Track', dob: '1990-01-01' },
];

async function seedTrainees() {
    console.log("Seeding trainees...");
    const existingTraineesSnapshot = await getDocs(traineesCollection);
    const deleteBatch = writeBatch(db);
    existingTraineesSnapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();

    const addBatch = writeBatch(db);
    dummyTrainees.forEach(trainee => {
        const docRef = doc(collection(db, 'trainees')); // Create a new doc reference
        addBatch.set(docRef, {
            ...trainee,
            dob: new Date(trainee.dob as string),
            assessmentScore: Math.floor(Math.random() * 41) + 60,
        });
    });
    await addBatch.commit();
    console.log("Seeding complete.");
}


export async function getAllTrainees(): Promise<Trainee[]> {
    let traineeSnapshot = await getDocs(traineesCollection);

    if (traineeSnapshot.empty || traineeSnapshot.docs.length < dummyTrainees.length) {
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
        // For development, if specific test users don't exist, create them.
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
    await updateDoc(traineeRef, updateData);
}
