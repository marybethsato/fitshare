import { auth, db } from '../../firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Create a new user in Firebase Authentication
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Store user data in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        createdAt: new Date().toISOString(),
        followers: []
      });

      return res.status(201).json({
        userId: userRecord.uid,
        name: name,
        message: 'User registered successfully',

      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to register user' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
