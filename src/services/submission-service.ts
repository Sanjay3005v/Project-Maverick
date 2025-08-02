
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, Timestamp, orderBy, query, doc, getDoc, updateDoc } from 'firebase/firestore';

export interface Submission {
    id: string;
    assignmentTitle: string;
    traineeId: string;
    traineeName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string; // URL to the file in Firebase Storage
    submittedAt: Date | Timestamp;
    review?: {
        feedback: string;
        score: number;
        reviewedAt: Date | Timestamp;
    }
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
        const review = data.review ? { ...data.review, reviewedAt: data.review.reviewedAt.toDate() } : undefined;
        return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt.toDate(),
            review,
        } as Submission
    });
    return submissionList;
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
    const submissionDoc = await getDoc(doc(db, 'submissions', id));
    if (!submissionDoc.exists()) {
        return null;
    }
    const data = submissionDoc.data();
    return {
        id: submissionDoc.id,
        ...data,
        submittedAt: data.submittedAt.toDate(),
        review: data.review ? {
            ...data.review,
            reviewedAt: data.review.reviewedAt.toDate(),
        } : undefined,
    } as Submission;
}

export async function addReviewToSubmission(submissionId: string, review: { score: number, feedback: string }): Promise<void> {
    const submissionRef = doc(db, 'submissions', submissionId);
    await updateDoc(submissionRef, {
        review: {
            ...review,
            reviewedAt: Timestamp.fromDate(new Date()),
        }
    });
}
