import { admin, db } from "../../firebaseAdmin";


export default async function handler(req, res) {
    const { userId } = req.query; // ID of the user being followed
    const { currentUserId } = req.body; // ID of the user performing the follow action

    if (req.method === "POST") {
        try {
            // Reference to the user document being followed
            const userRef = db.collection("users").doc(userId);

            // Update followers array using Firestore's arrayUnion
            await userRef.update({
                followers: admin.firestore.FieldValue.arrayUnion(currentUserId),
            });

            res.status(200).json({ message: "Followed successfully." });
        } catch (error) {
            console.error("Error following user:", error);
            res.status(500).json({ error: "Failed to follow user." });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
