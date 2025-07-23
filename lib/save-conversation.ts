// lib/save-conversation.ts
import clientPromise from "./mongo";

export async function saveConversation(
  messages: { role: string; content: string }[],
  mode: string
) {
  try {
    const client = await clientPromise;
    const db = client.db("chat_db"); // ודא שזה השם של הדאטאבייס שלך
    const collection = db.collection("conversations");

    await collection.insertOne({
      messages,
      mode,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("❌ Failed to save conversation:", err);
  }
}
