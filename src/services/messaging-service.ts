
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export interface Message {
  id: string;
  senderId: string; // 'admin' or trainee's ID
  content: string;
  createdAt: Timestamp;
}

export interface Conversation {
  id: string; // traineeId
  traineeId: string;
  traineeName: string;
  lastMessage: string;
  lastMessageAt: Timestamp;
  isReadByAdmin: boolean;
  isReadByTrainee: boolean;
}

const conversationsCollection = collection(db, 'conversations');

/**
 * Sends a message from either an admin or a trainee.
 * It will create a new conversation if one doesn't exist.
 */
export async function sendMessage(
  traineeId: string,
  traineeName: string,
  senderId: 'admin' | string,
  content: string
) {
  const conversationRef = doc(db, 'conversations', traineeId);
  const messagesCollectionRef = collection(conversationRef, 'messages');

  // Add the new message
  await addDoc(messagesCollectionRef, {
    senderId,
    content,
    createdAt: serverTimestamp(),
  });

  // Update or create the conversation document
  const conversationData: Omit<Conversation, 'id'> = {
    traineeId,
    traineeName,
    lastMessage: content,
    lastMessageAt: Timestamp.now(),
    isReadByAdmin: senderId === 'admin',
    isReadByTrainee: senderId === traineeId,
  };

  await setDoc(conversationRef, conversationData, { merge: true });
}

/**
 * Fetches all conversations for the admin dashboard.
 */
export async function getConversations(): Promise<Conversation[]> {
  const q = query(conversationsCollection, orderBy('lastMessageAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Conversation)
  );
}

/**
 * Fetches the conversation for a specific trainee.
 */
export async function getConversationForTrainee(
  traineeId: string
): Promise<Conversation | null> {
  const conversationRef = doc(db, 'conversations', traineeId);
  const docSnap = await getDoc(conversationRef);
  if (!docSnap.exists()) {
    return null;
  }
  return { id: docSnap.id, ...docSnap.data() } as Conversation;
}

/**
 * Fetches all messages within a specific conversation.
 */
export async function getMessages(
  conversationId: string
): Promise<Message[]> {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Message)
  );
}

/**
 * Marks a conversation as read by the admin.
 */
export async function markAsReadByAdmin(conversationId: string) {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, { isReadByAdmin: true });
}

/**
 * Marks a conversation as read by the trainee.
 */
export async function markAsReadByTrainee(conversationId: string) {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, { isReadByTrainee: true });
}
