import { db } from "./firebaseAdmin";

export default async function handler(req, res) {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required." });
    }

    try {
        // Search Posts
        const postsSnapshot = await db
            .collection("posts")
            .where('description', '>=', query)
            .where('description', '<=', query + '\uf8ff')
            .get();

        const posts = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));



        // Search Users
        const usersSnapshot = await db
            .collection("users")
            .where("name", ">=", query)
            .where("name", "<=", query + "\uf8ff") // Search for names starting with the query
            .get();

        const users = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));


        res.status(200).json({'users': [...users], 'posts': [...posts]});
    } catch (error) {
        console.error("Error in search:", error);
        res.status(500).json({ error: "Search failed." });
    }
}
