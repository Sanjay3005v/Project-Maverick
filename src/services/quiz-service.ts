
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, writeBatch, query, where, limit, addDoc } from 'firebase/firestore';

export interface Question {
    question: string;
    options: string[];
    answer: string;
}

export interface Quiz {
    id: string;
    title: string;
    topic: string;
    questions: Question[];
    isDailyQuiz: boolean;
}

const quizzesCollection = collection(db, 'quizzes');

export async function getAllQuizzes(): Promise<Quiz[]> {
    const quizSnapshot = await getDocs(quizzesCollection);
    const quizList = quizSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
    return quizList;
}

export async function getDailyQuiz(): Promise<Quiz | null> {
    const q = query(quizzesCollection, where("isDailyQuiz", "==", true), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Quiz;
}

export async function addQuiz(quizData: Omit<Quiz, 'id' | 'isDailyQuiz'>): Promise<string> {
    const docRef = await addDoc(quizzesCollection, {
        ...quizData,
        isDailyQuiz: false
    });
    return docRef.id;
}

export async function setDailyQuiz(quizId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Find the current daily quiz and set it to false
    const q = query(quizzesCollection, where("isDailyQuiz", "==", true));
    const currentDailySnapshot = await getDocs(q);
    currentDailySnapshot.forEach(document => {
        batch.update(doc(db, 'quizzes', document.id), { isDailyQuiz: false });
    });

    // Set the new daily quiz
    const newDailyRef = doc(db, 'quizzes', quizId);
    batch.update(newDailyRef, { isDailyQuiz: true });
    
    await batch.commit();
}

    