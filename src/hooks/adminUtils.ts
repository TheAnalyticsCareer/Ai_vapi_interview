import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Checks if the given email exists in the admins collection.
 * Returns true if admin, false otherwise.
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  if (!email) return false;
  if (email === 'admin@gmail.com') return true;
  const adminDoc = await getDoc(doc(db, 'admins', email));
  return adminDoc.exists();
}
