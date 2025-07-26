import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { isAdminEmail } from './adminUtils';
import { getUserAttemptsByEmail } from './subscriptionUtils';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user && user.email) {
      const attemptsLeft = await getUserAttemptsByEmail(user.uid, user.email); // Pass UID and email
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        attemptsLeft,
        totalInterviews: 0,
        completed: 0,
        averageScore: 0
      }, { merge: true });
      // Only add to admins collection if the email is already an admin
      const isAdmin = await isAdminEmail(user.email);
      if (isAdmin) {
        await setDoc(doc(db, 'admins', user.email), { email: user.email }, { merge: true });
      }
    }
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};
