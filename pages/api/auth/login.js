import { signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebaseAdmin'; // Adjust the path to your Firestore Admin setup
import { auth } from '../firebaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User data not found in Firestore' });
      }

      const userData = userDoc.data();

      // Generate a custom Firebase Admin token
      const token = await auth.currentUser.getIdToken();

      return res.status(200).json({
        userId: user.uid,
        token,
        ...userData, // Include Firestore data (e.g., name, profile info)
      });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
