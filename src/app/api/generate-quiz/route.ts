import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

// Define expected request body structure
interface GenerateQuizRequestBody {
    inputText: string;
    numQuestions: number;
    questionFormat: 'multiple_choice' | 'restricted_response' | 'mixed';
    language: string;
}

// Define the structure of a single quiz question based on the Python prompt
export interface QuizQuestion {
    question: string;
    type: 'multiple_choice' | 'restricted_response';
    options?: { [key: string]: string }; // Optional, only for multiple_choice
    answer: string;
}

// Type for the expected API response (a list of questions)
export type QuizData = QuizQuestion[];

const MODEL_NAME = "gemini-2.5-pro-preview-03-25"; // Or your preferred model
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    // We can't throw here at the top level, but requests will fail later
}

export async function POST(request: NextRequest) {
    if (!API_KEY) {
        return NextResponse.json({ error: "API Key not configured on the server." }, { status: 500 });
    }

    try {
        const body = await request.json() as GenerateQuizRequestBody;
        const { inputText, numQuestions, questionFormat, language } = body;

        if (!inputText || !numQuestions || !questionFormat || !language) {
            return NextResponse.json({ error: "Missing required fields in request body." }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9, // Adjust as needed
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192, // Adjust based on expected quiz size
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        // Construct format instructions based on the Python code
        let formatInstruction = "";
        if (questionFormat === 'multiple_choice') {
            formatInstruction = "Ensure all questions are multiple_choice type.";
        } else if (questionFormat === 'restricted_response') {
            formatInstruction = "Ensure all questions are restricted_response type.";
        } else { // mixed
            formatInstruction = "Include a mix of multiple_choice and restricted_response questions if possible.";
        }

        const prompt = `
        Generate a quiz in ${language} based on the following text.
        The quiz should have exactly ${numQuestions} questions.
        ${formatInstruction}
        For each question, provide:
        1.  The question text.
        2.  The type of question ('multiple_choice' or 'restricted_response').
        3.  If 'multiple_choice', provide 3-4 distinct options labeled A, B, C, D (or equivalent in ${language}).
        4.  The correct answer. For 'multiple_choice', provide the letter of the correct option (e.g., 'A'). For 'restricted_response', provide a concise correct answer in ${language}.

        Output the quiz strictly in JSON format as a list of objects, where each object represents a question. Use English for the JSON keys ("question", "type", "options", "answer"). Example format:
        \`\`\`json
        [
          {
            "question": "What is the capital of France?",
            "type": "multiple_choice",
            "options": { "A": "Berlin", "B": "Madrid", "C": "Paris", "D": "Rome" },
            "answer": "C"
          },
          {
            "question": "Explain photosynthesis.",
            "type": "restricted_response",
            "answer": "Conversion of light energy into chemical energy."
          }
        ]
        \`\`\`

        Here is the text:
        ---
        ${inputText}
        ---
        `;

        const parts = [{ text: prompt }];

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        if (!result.response) {
             console.error("API Error: No response object found.", result);
             throw new Error("API Error: No response object found.");
        }

        const responseText = result.response.text();
        // Clean the response text to extract JSON
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;

        try {
            const quizData: QuizData = JSON.parse(jsonString);
            // Basic validation
            if (!Array.isArray(quizData) || !quizData.every(q => typeof q === 'object' && q !== null && 'question' in q && 'type' in q && 'answer' in q)) {
                console.error("API Error: Invalid JSON structure received.", jsonString);
                throw new Error("API Error: Invalid JSON structure received from API.");
            }
            return NextResponse.json(quizData);
        } catch (parseError) {
            console.error("API Error: Failed to parse JSON response.", parseError);
            console.error("--- Raw API Response Text ---");
            console.error(responseText);
            console.error("-----------------------------");
            return NextResponse.json({ error: "Failed to parse quiz data from API response." }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error("Error in /api/generate-quiz:", error);
        // Provide a more specific error message if possible
        let errorMessage = "An unexpected error occurred during quiz generation.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
