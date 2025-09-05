
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please create a .env file with your Gemini API key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const generateImageFromPose = async (
  base64Image: string,
  mimeType: string,
  posePrompt: string,
  ratio: string = '1:1'
): Promise<string> => {
  // Try different models for swimming prompts
  const model = 'gemini-2.5-flash-image-preview';
  console.log("🔍 DEBUG: Using model:", model);
  
  console.log("🔍 DEBUG: Starting image generation");
  console.log("🔍 DEBUG: API Key exists:", !!API_KEY);
  console.log("🔍 DEBUG: API Key length:", API_KEY?.length || 0);
  console.log("🔍 DEBUG: Model:", model);
  console.log("🔍 DEBUG: Pose prompt:", posePrompt);
  console.log("🔍 DEBUG: Image ratio:", ratio);
  console.log("🔍 DEBUG: Image size:", base64Image.length, "characters");
  console.log("🔍 DEBUG: MIME type:", mimeType);
  
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  // Try different prompt variations for swimming
  let finalPrompt = posePrompt;
  if (posePrompt.toLowerCase().includes('swimming')) {
    console.log("🔍 DEBUG: Detected swimming prompt, trying alternative formulations");
    // Try a more descriptive swimming prompt
    finalPrompt = "a character in a swimming pose, arms extended forward, body horizontal, as if gliding through water";
  }
  
  const textPart = { text: `Recreate the character in this image in a new image, with the character in the following pose: ${finalPrompt}. Maintain the character's appearance and style. Generate the image with ${ratio} aspect ratio (${ratio === '9:16' ? 'portrait/vertical' : ratio === '16:9' ? 'landscape/horizontal' : 'square'} format).` };
  
  console.log("🔍 DEBUG: Final prompt being sent:", finalPrompt);

  try {
    console.log("🔍 DEBUG: Sending request to Gemini API...");
    console.log("🔍 DEBUG: Aspect ratio:", ratio);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        parameters: {
          aspectRatio: ratio
        }
      },
    });

    console.log("🔍 DEBUG: Received response from Gemini API");
    console.log("🔍 DEBUG: Response structure:", {
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length || 0,
      firstCandidate: response.candidates?.[0] ? {
        hasContent: !!response.candidates[0].content,
        hasParts: !!response.candidates[0].content?.parts,
        partsLength: response.candidates[0].content?.parts?.length || 0
      } : null
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      console.log("🔍 DEBUG: Processing part:", {
        hasInlineData: !!part.inlineData,
        hasText: !!part.text,
        partType: part.inlineData ? 'image' : part.text ? 'text' : 'unknown'
      });
      
      if (part.inlineData) {
        console.log("🔍 DEBUG: Found image data, size:", part.inlineData.data.length);
        return part.inlineData.data;
      }
    }
    
    console.error("🔍 DEBUG: No image data found in response parts");
    throw new Error("No image was generated in the API response.");

  } catch (error) {
    console.error("🔍 DEBUG: Error generating image with Gemini:", error);
    console.error("🔍 DEBUG: Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // If it's a swimming prompt and the first attempt failed, try a simpler approach
    if (posePrompt.toLowerCase().includes('swimming')) {
      console.log("🔍 DEBUG: Swimming prompt failed, trying simpler approach...");
      try {
        const simplePrompt = "a character in a horizontal swimming position";
        const simpleTextPart = { text: `Recreate the character in this image in a new image, with the character in the following pose: ${simplePrompt}. Maintain the character's appearance and style. Generate the image with ${ratio} aspect ratio (${ratio === '9:16' ? 'portrait/vertical' : ratio === '16:9' ? 'landscape/horizontal' : 'square'} format).` };
        
        const simpleResponse = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [imagePart, simpleTextPart],
          },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
          },
        });

        for (const part of simpleResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            console.log("🔍 DEBUG: Success with simplified swimming prompt!");
            return part.inlineData.data;
          }
        }
      } catch (fallbackError) {
        console.error("🔍 DEBUG: Fallback also failed:", fallbackError);
      }
    }
    
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};
