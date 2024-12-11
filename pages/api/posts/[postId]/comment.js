import { admin, db } from "../../../firebaseAdmin";

export default async function handler(req, res) {
  const { postId } = req.query;

  console.log(`POST ID: ${postId}`);

  if (req.method === "POST") {
    // Adding a comment
    const { userId, userName, commentText } = req.body;

    if (!userId || !userName || !commentText) {
      return res.status(400).json({ error: "User ID, User Name, and comment text are required." });
    }

    try {
      const commentId = admin.firestore().collection('_').doc().id; // Generate unique comment ID
      const comment = { id: commentId, userId: userId, userName: userName, commentText: commentText, createdAt: new Date().toISOString() };

      await db.collection("posts").doc(postId).update({
        comments: admin.firestore.FieldValue.arrayUnion(comment),
      });

      res.status(200).json({ message: "Comment added successfully!", comment });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment." });
    }
  } else if (req.method === "DELETE") {
    // Deleting a comment
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required." });
    }

    try {
      const postRef = db.collection("posts").doc(postId);

      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found." });
      }

      const post = postDoc.data();
      const updatedComments = post.comments.filter((comment) => comment.id !== commentId);

      await postRef.update({ comments: updatedComments });

      res.status(200).json({ message: "Comment deleted successfully!" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Failed to delete comment." });
    }
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
