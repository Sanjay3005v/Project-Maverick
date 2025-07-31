
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, limit } from 'firebase/firestore';
import { z } from 'zod';

export const ChallengeSchema = z.object({
  id: z.string(),
  title: z.string().describe("A concise and descriptive title for the challenge."),
  description: z.string().describe("A detailed problem statement for the coding challenge."),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("The difficulty level of the challenge."),
  tags: z.array(z.string()).describe("A list of relevant tags or keywords (e.g., 'Python', 'Arrays', 'Sorting')."),
  testCases: z.array(z.string()).describe("A list of test cases or requirements the solution must fulfill."),
});
export type Challenge = z.infer<typeof ChallengeSchema>;

const seedChallenges: Omit<Challenge, 'id'>[] = [
  {
    title: "Python List Comprehension",
    description: "Write a Python function to transform a list of numbers into a list of their squares using list comprehension.",
    difficulty: "Easy",
    tags: ["Python", "Data Structures"],
    testCases: [
      'Must be a function that accepts a list.',
      'Must use list comprehension syntax.',
      '[1, 2, 3] should return [1, 4, 9].',
      'Should handle an empty list correctly.'
    ],
  },
  {
    title: "Java Class Inheritance",
    description: "Create a 'Dog' class that inherits from an 'Animal' class, overriding a method to make a specific sound.",
    difficulty: "Medium",
    tags: ["Java", "OOP"],
     testCases: [
      'Must define an Animal base class.',
      'Dog class must extend Animal.',
      "Animal's `makeSound()` should be overridden in Dog.",
      "Dog's `makeSound()` should return 'Woof!'."
    ],
  },
  {
    title: "SQL Join Query",
    description: "Write a SQL query to join 'Orders' and 'Customers' tables, returning the order ID and customer name.",
    difficulty: "Medium",
    tags: ["SQL", "Database"],
     testCases: [
      'Must SELECT Orders.OrderID and Customers.CustomerName.',
      'Must JOIN the Orders and Customers tables.',
      'The JOIN condition must be `Orders.CustomerID = Customers.CustomerID`.',
    ],
  }
];

const challengesCollection = collection(db, 'challenges');

export async function seedInitialChallenges() {
    const challengesSnapshot = await getDocs(query(challengesCollection, limit(1)));
    if (challengesSnapshot.empty) {
        console.log("Seeding initial challenges...");
        const batch = writeBatch(db);
        seedChallenges.forEach(challengeData => {
            const docRef = doc(collection(db, 'challenges')); // Auto-generate ID
            batch.set(docRef, challengeData);
        });
        await batch.commit();
        console.log("Initial challenges seeded.");
    }
}

export async function getAllChallenges(): Promise<Challenge[]> {
    await seedInitialChallenges();
    const challengeSnapshot = await getDocs(challengesCollection);
    const challengeList = challengeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    return challengeList;
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
    const challengeDoc = await getDoc(doc(db, 'challenges', id));
    if (!challengeDoc.exists()) {
        return null;
    }
    return { id: challengeDoc.id, ...challengeDoc.data() } as Challenge;
}

export async function addChallenge(challengeData: Omit<Challenge, 'id'>): Promise<string> {
    const docRef = await addDoc(challengesCollection, challengeData);
    return docRef.id;
}

export async function updateChallenge(challengeId: string, challengeData: Partial<Omit<Challenge, 'id'>>): Promise<void> {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, challengeData);
}

export async function deleteChallenge(challengeId: string): Promise<void> {
    const challengeRef = doc(db, 'challenges', challengeId);
    await deleteDoc(challengeRef);
}
