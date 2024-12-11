import { admin, db } from "../../firebaseAdmin";

export default async function handler(req, res) {
  const { postId } = req.query;
  const { userId, userName } = req.body; // Include user details in the request body

  if (req.method === "POST") {
    if (!userId || !userName) {
      return res.status(400).json({ error: "User ID and User Name are required." });
    }

    try {
      const postRef = db.collection("posts").doc(postId);

      // Decrement the like count and remove the user from the likedBy array
      await postRef.update({
        likes: admin.firestore.FieldValue.increment(-1), // Decrement like count
        likedBy: admin.firestore.FieldValue.arrayRemove({ userId, userName }), // Remove user info
      });

      res.status(200).json({ message: "Post unliked successfully!" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ error: "Failed to unlike post." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
