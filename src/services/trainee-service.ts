
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, Timestamp } from 'firebase/firestore';

export interface Trainee {
    id: string;
    name: string;
    department: string;
    progress: number;
    status: string;
    dob: string | Date; 
}

const traineesCollection = collection(db, 'trainees');

export async function getAllTrainees(): Promise<Trainee[]> {
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

export async function addTrainee(traineeData: Omit<Trainee, 'id'>): Promise<string> {
    const docRef = await addDoc(traineesCollection, {
        ...traineeData,
        dob: new Date(traineeData.dob as string),
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

    