import { GoogleGenAI, Modality } from "@google/genai";

const getGenAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("لم يتم تعيين متغير البيئة API_KEY");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCaption = async (prompt: string): Promise<string> => {
  const ai = getGenAIClient();
  const fullPrompt = `أنشئ تعليقًا قصيرًا وجذابًا واحترافيًا لمنشور على وسائل التواصل الاجتماعي حول: "${prompt}". قم بتضمين وسوم (هاشتاجات) ذات صلة. يجب أن يكون التعليق مثيرًا ويشجع على الإعجابات والمشاركات.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
    config: {
      temperature: 0.8,
      topP: 0.95,
    },
  });
  
  // FIX: Per @google/genai guidelines, access `response.text` directly and handle empty responses.
  const text = response.text;
  const trimmedText = text?.trim();
  if (!trimmedText) {
      throw new Error("فشل في إنشاء التعليق. لم يُرجع النموذج أي استجابة.");
  }
  return trimmedText;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getGenAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `صورة واقعية وعالية الجودة لمنشور على وسائل التواصل الاجتماعي حول: ${prompt}` }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // FIX: Iterate through parts of the first candidate to find the image data, as it's not guaranteed to be the first part.
  const firstCandidate = response.candidates?.[0];
  if (firstCandidate) {
    for (const part of firstCandidate.content.parts) {
      if (part.inlineData?.data) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
  }
  
  throw new Error("فشل في إنشاء الصورة. لم يتم العثور على بيانات الصورة في الاستجابة.");
};


export const generateVideo = async (prompt: string): Promise<string> => {
  // IMPORTANT: Create a new instance to ensure the latest key from the dialog is used.
  const ai = getGenAIClient(); 
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `فيديو سينمائي ديناميكي مدته 5 ثوانٍ، مناسب لوسائل التواصل الاجتماعي، حول: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    if (!operation.name) {
      throw new Error("فشل في استرداد حالة الفيديو. اسم العملية غير موجود.");
    }
    // FIX: To address the persistent "404 Not Found" error, we are reverting the polling strategy.
    // Instead of passing only the operation's name, we will pass the entire operation object.
    // This may provide more context to the API and resolve the issue of not finding the entity.
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error("فشل في إنشاء الفيديو. لم يتم العثور على رابط التنزيل.");
  }

  // The download link requires the API key to be appended.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
      const errorBody = await response.text();
      console.error("Video download failed:", errorBody);
      throw new Error(`فشل في جلب بيانات الفيديو. الحالة: ${response.status}`);
  }
  
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};