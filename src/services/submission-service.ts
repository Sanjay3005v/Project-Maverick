
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, Timestamp, orderBy, query } from 'firebase/firestore';

export interface Submission {
    id: string;
    assignmentTitle: string;
    traineeId: string;
    traineeName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    submittedAt: Date | Timestamp;
}

const submissionsCollection = collection(db, 'submissions');

export async function addSubmission(submissionData: Omit<Submission, 'id'>): Promise<string> {
    const docRef = await addDoc(submissionsCollection, {
        ...submissionData,
        submittedAt: Timestamp.fromDate(new Date()),
    });
    return docRef.id;
}

export async function getAllSubmissions(): Promise<Submission[]> {
    const q = query(submissionsCollection, orderBy('submittedAt', 'desc'));
    const submissionSnapshot = await getDocs(q);
    const submissionList = submissionSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt.toDate(),
        } as Submission
    });
    return submissionList;
}
