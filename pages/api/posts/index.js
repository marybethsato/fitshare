import { db } from '../../firebaseAdmin';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const postsSnapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  if (req.method === 'POST') {
    const { imageUrl, description, userId, tags, author } = req.body;

    if (!imageUrl || !description || !userId) {
      return res.status(400).json({ error: 'Image URL, description, and userId are required' });
    }

    try {
      const postRef = db.collection('posts').doc();
      await postRef.set({
        imageUrl,
        description,
        userId,
        tags: tags ?? [] ,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
        commentsCount: 0,
        author
      });

      return res.status(201).json({ id: postRef.id, message: 'Post created successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
