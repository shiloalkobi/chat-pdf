import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function runPersonalAgent({
  prompt,
  profile,
}: {
  prompt: string;
  profile: string;
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

  const promptTemplate = PromptTemplate.fromTemplate(
    `${systemMessage}\n\nשאלה: {prompt}\nתשובה:`
  );

  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.3,
    streaming: false,
  });

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ prompt });
}
