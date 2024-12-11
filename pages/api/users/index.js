import { db } from '../firebaseAdmin.js';

export default async function handler(req, res) {
  const { userId } = req.query;

  // Ensure the HTTP method is GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    if (!userId) {
      // Fetch all users
      const usersSnapshot = await db.collection('users').get();

      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json(users);
    } else {
      // Fetch a single user by userId
      const [userDoc, postsSnapshot, usersSnapshot] = await Promise.all([
        db.collection('users').doc(userId).get(),
        db.collection('posts').where('userId', '==', userId).get(),
        db.collection('users').get(),
      ]);

      // Check if user exists
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      // Map posts data
      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get following details (users who follow the userId)
      const followingDetails = usersSnapshot.docs
        .filter((doc) => {
          const userData = doc.data();
          return userData.followers && userData.followers.includes(userId);
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      // Respond with combined data for the single user
      return res.status(200).json({
        id: userDoc.id,
        ...userData,
        posts,
        following: followingDetails,
      });
    }
  } catch (error) {
    console.error('Error fetching user(s):', error);
    return res.status(500).json({
      error: 'Failed to fetch user(s)',
      message: error.message || 'An unexpected error occurred',
    });
  }
}
