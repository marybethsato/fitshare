// File: pages/api/posts/[postId]/like.js
import { admin, db } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  const { postId } = req.query;
  const { userId, userName } = req.body; // Include user details in the request body

  if (req.method === "POST") {
    if (!userId || !userName) {
      return res.status(400).json({ error: "User ID and User Name are required." });
    }

    try {
      const postRef = db.collection("posts").doc(postId);

      // Add the user to the list of likes if not already present
      await postRef.update({
        likes: admin.firestore.FieldValue.increment(1),
        likedBy: admin.firestore.FieldValue.arrayUnion({ userId, userName }), // Add user info
      });

      res.status(200).json({ message: "Post liked successfully!" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ error: "Failed to like post." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
