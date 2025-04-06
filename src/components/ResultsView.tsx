import React, { useState } from 'react'; // Add useState
import { QuizQuestion } from '@/types/quiz'; // Adjusted import path
import { QuizSettings } from '@/types/quiz'; // Import QuizSettings type
import { User } from '@supabase/supabase-js'; // Import Supabase User type
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

// Define a type for the translation object structure expected from props
interface TranslationSet {
    resultsTitle: string;
    yourScoreLabel: string;
    correctAnswerLabel: string;
    yourAnswerLabel: string;
    saveQuizButton: string;
    savingQuizButton: string;
    saveError: string;
    saveSuccess: string;
    newQuizButton: string;
    // Add other keys as needed
    notAnswered?: string; // Optional
    correctResult?: string; // Optional
    incorrectResult?: string; // Optional
    loginToSaveError?: string; // Optional
}

interface ResultsViewProps {
    lang: 'en' | 'es'; // Language prop
    t: TranslationSet; // Translation object prop
    quizData: QuizQuestion[]; // Ensure QuizQuestion structure matches what's needed for saving
    userAnswers: (string | null)[];
    score: number;
    user: User | null; // Add user prop
    quizSettings: QuizSettings; // Add quizSettings prop
    // onSaveQuiz: () => void; // Removed - handled internally
    onNewQuiz: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
    lang, // Destructure lang
    t,    // Destructure t
    quizData,
    userAnswers,
    score,
    user, // Add user
    quizSettings, // Add quizSettings
    // onSaveQuiz, // Removed
    onNewQuiz,
}) => {
    const totalQuestions = quizData.length;
    const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    // Function to handle saving the quiz result to Supabase
    const handleSaveQuiz = async () => {
        if (!user) {
            setSaveError(t.loginToSaveError || "You must be logged in to save a quiz.");
            return;
        }
        if (saveSuccess || isSaving) { // Prevent double saving or saving while already in progress
             // Optionally provide feedback or just ignore
             // setSaveError("Quiz already saved or save in progress.");
             return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const timestamp = new Date().toISOString();
        // Ensure the structure matches the DB table columns (quiz_data, user_answers, settings are JSONB)
        const quizRecordToSave = {
            user_id: user.id,
            name: `Quiz taken on ${new Date(timestamp).toLocaleString()}`, // Generate a default name
            timestamp: timestamp,
            quiz_data: quizData,
            user_answers: userAnswers,
            score: score,
            total_questions: totalQuestions,
            settings: quizSettings,
            // 'id' and 'created_at' will be handled by the database
        };

        try {
            const { error: insertError } = await supabase
                .from('quizzes') // Use the same table name as in SQL and SavedQuizzesView
                .insert([quizRecordToSave]); // insert expects an array

            if (insertError) {
                throw insertError;
            }

            setSaveSuccess(true);
            // Optionally clear error on success: setSaveError(null);

        } catch (err: any) {
            console.error("Error saving quiz result:", err);
             // Use translated generic error prefix
            setSaveError(`${t.saveError}: ${err.message}`);
            setSaveSuccess(false); // Ensure success state is false on error
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="space-y-6">
            <div className="text-center border-b pb-4 mb-6">
                 {/* Use translated title */}
                <h2 className="text-2xl font-bold text-gray-800">{t.resultsTitle}</h2>
                 {/* Use translated score label */}
                <p className="text-xl font-semibold mt-2">
                    {t.yourScoreLabel} <span className="text-indigo-600">{score}</span> / {totalQuestions} ({percentage}%)
                </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {quizData.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer && question.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
                    const resultColor = isCorrect ? 'text-green-600' : 'text-red-600';
                    const resultBg = isCorrect ? 'bg-green-50' : 'bg-red-50';
                    const resultBorder = isCorrect ? 'border-green-200' : 'border-red-200';

                    return (
                        <div key={index} className={`p-4 border ${resultBorder} ${resultBg} rounded-md shadow-sm`}>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                                <span className="font-bold">Q{index + 1}:</span> {question.question}
                            </p>
                            <p className="text-sm">
                                 {/* Use translated label */}
                                <span className="font-semibold">{t.yourAnswerLabel}</span> {userAnswer ?? <span className="italic text-gray-500">{t.notAnswered || 'Not Answered'}</span>}
                            </p>
                            <p className="text-sm">
                                 {/* Use translated label */}
                                <span className="font-semibold">{t.correctAnswerLabel}</span> {question.answer}
                            </p>
                             {/* Optionally translate Correct/Incorrect */}
                            <p className={`text-sm font-bold ${resultColor}`}>
                                Result: {isCorrect ? (t.correctResult || 'Correct') : (t.incorrectResult || 'Incorrect')}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Action Buttons & Save Status */}
            <div className="pt-6 border-t border-gray-200 text-center">
                 {/* Error message is now translated in handleSaveQuiz */}
                 {saveError && <p className="text-red-600 text-sm mb-2">{saveError}</p>}
                 {/* Use translated success message */}
                 {saveSuccess && <p className="text-green-600 text-sm mb-2">{t.saveSuccess}</p>}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleSaveQuiz}
                        disabled={isSaving || saveSuccess || !user}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                            saveSuccess
                                ? 'bg-gray-400 cursor-not-allowed'
                                : isSaving
                                ? 'bg-green-400 cursor-wait'
                                : 'bg-green-600 hover:bg-green-700'
                        } disabled:opacity-70`}
                    >
                         {/* Use translated button text */}
                        {isSaving ? t.savingQuizButton : saveSuccess ? t.saveSuccess : t.saveQuizButton}
                    </button>
                    <button
                        onClick={onNewQuiz}
                        disabled={isSaving}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70" // Added disabled style
                    >
                         {/* Use translated button text */}
                        {t.newQuizButton}
                    </button>
                </div> {/* Close inner div */}
            </div>
        </div>
    );
};

export default ResultsView;
