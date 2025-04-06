// src/types/quiz.ts

// Structure for a single quiz question
export interface QuizQuestion {
    question: string;
    type: 'multiple_choice' | 'restricted_response';
    options?: { [key: string]: string }; // Optional, only for multiple_choice
    answer: string;
}

// Type for the quiz data (list of questions)
export type QuizData = QuizQuestion[];

// Structure for quiz settings
export interface QuizSettings {
    numQuestions: number;
    timeLimitMinutes: number;
    questionFormat: 'multiple_choice' | 'restricted_response' | 'mixed';
    language: string;
}

// Structure for a saved quiz record in localStorage
export interface SavedQuizRecord {
    id: string; // Unique ID for the saved quiz
    name: string;
    timestamp: string;
    quizData: QuizData;
    userAnswers?: (string | null)[]; // Optional: user answers if saved after taking
    score?: number; // Optional: score if saved after taking
    totalQuestions?: number; // Optional: total questions if saved after taking
    settings: QuizSettings; // Settings used for this quiz
}

// Possible views/states of the application
export type AppView = 'input' | 'settings' | 'quiz' | 'results' | 'saved' | 'loading';
