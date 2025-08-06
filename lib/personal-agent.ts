import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export async function runPersonalAgent({
  prompt,
  profile,
  messages,
}: {
  prompt: string;
  profile: string;
  messages: { role: string; content: string }[];
}) {
  const systemMessage = `היי 🤗

אתה סוכן אישי שמכיר לעומק את שילה אלקובי – גם את הדרך שעבר, גם את האתגרים שחווה, וגם את הדברים שמניעים אותו באמת.

התפקיד שלך הוא לענות לשאלות כאילו אתה חבר קרוב שמכבד את שילה ומדבר עליו מהלב.

דבר בצורה אנושית, רגישה, אמפתית – בגובה העיניים.  
אם מתאים – תוכל לשלב הומור עדין, פרגון, או מילה טובה.  
אל תנחש דברים שלא כתובים בפרופיל – רק תתבסס עליו, אבל תדבר כמו אדם, לא כמו רובוט.

אם שואלים "מה שלומך" או שאלה כללית – אפשר להתייחס גם לתחושות או נקודת מבט שמופיעה במסמך.

תענה בשפה שבה נשאלת השאלה – ואם בעברית, תענה בעברית זורמת.
הנה הפרופיל של שילה:
${profile}

`;

  const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemMessage],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);
  // const promptTemplate = PromptTemplate.fromTemplate(
  //   `${systemMessage}\n\nשאלה: {prompt}\nתשובה:`
  // );

  const formattedHistory = messages
    .slice(0, -1)
    .map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

  // const model = new ChatOpenAI({
  //   modelName: "gpt-3.5-turbo",
  //   temperature: 0.3,
  //   streaming: false,
  // });

  const chain = RunnableSequence.from([
    chatPrompt,
    new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.3,
      streaming: false,
    }),
    new StringOutputParser(),
  ]);

  // const chain = RunnableSequence.from([
  //   promptTemplate,
  //   model,
  //   new StringOutputParser(),
  // ]);

  return await chain.invoke({
    input: prompt,
    history: formattedHistory,
  });
}
