import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Checks all subscription collections for the given email and returns the correct attemptsLeft value.
 
 * Now fetches attemptsLeft from the user's document if available, so attempts persist across logins.
 */
export const getUserAttemptsByEmail = async (uid: string, email: string): Promise<number> => {
  if (!email) return 3;
  if (email === 'admin@gmail.com') return 100000;

  // Check user document for attemptsLeft first (by UID)
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists() && typeof userDoc.data().attemptsLeft === 'number') {
    return userDoc.data().attemptsLeft;
  }

  // Check admin
  const adminDoc = await getDoc(doc(db, 'admins', email));
  if (adminDoc.exists()) return 1000000;
  // Check monthly
  const monthlyDoc = await getDoc(doc(db, 'monthly', email));
  if (monthlyDoc.exists()) return 15;
  // Check yearly
  const yearlyDoc = await getDoc(doc(db, 'yearly', email));
  if (yearlyDoc.exists()) return 100;
  // Check academia_enterprises
  const academiaDoc = await getDoc(doc(db, 'academia_enterprises', email));
  if (academiaDoc.exists()) return 200;
  // Default
  return 3;
};
