// lib/save-conversation.ts
import clientPromise from "./mongo";

export async function saveConversation(
  messages: { role: string; content: string }[],
  mode: string
) {
  try {
    console.log("✅ saveConversation called");
    console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔑 MONGODB_URI:", process.env.MONGODB_URI?.slice(0, 30));
    console.log("💬 Messages count:", messages.length);
    console.log("🎯 Mode:", mode);

    const client = await clientPromise;
    const db = client.db("chat_db"); // ודא שזה השם של הדאטאבייס שלך
    const collection = db.collection("conversations");

    const res = await collection.insertOne({
      messages,
      mode,
      createdAt: new Date(),
    });

    console.log("✅ Inserted to MongoDB:", res.insertedId);
  } catch (err) {
    console.error("❌ Failed to save conversation:", err);
  }
}
