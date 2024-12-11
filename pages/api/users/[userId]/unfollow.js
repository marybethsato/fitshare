import { admin, db } from "../../firebaseAdmin";

export default async function handler(req, res) {
    const { userId } = req.query; // ID of the user being unfollowed
    const { currentUserId } = req.body; // ID of the user performing the unfollow action

    if (req.method === "POST") {
        try {
            // Reference to the user document being unfollowed
            const userRef = db.collection("users").doc(userId);

            // Update followers array using Firestore's arrayRemove
            await userRef.update({
                followers: admin.firestore.FieldValue.arrayRemove(currentUserId),
            });

            res.status(200).json({ message: "Unfollowed successfully." });
        } catch (error) {
            console.error("Error unfollowing user:", error);
            res.status(500).json({ error: "Failed to unfollow user." });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}