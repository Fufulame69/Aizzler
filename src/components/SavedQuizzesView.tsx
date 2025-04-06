import React, { useState, useEffect } from 'react'; // Add useState, useEffect
import { SavedQuizRecord } from '@/types/quiz'; // Import the shared type
import { User } from '@supabase/supabase-js'; // Import Supabase User type
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

// Define a type for the translation object structure expected from props
interface TranslationSet {
    savedQuizzesTitle: string;
    loadingSavedQuizzes: string;
    noSavedQuizzes: string;
    errorLoadingQuizzes: string;
    quizTakenOn: string; // Part of default name
    questionsLabel: string;
    deleteButton: string;
    retakeButton: string;
    backButton: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: string;
    deleteError: string;
    // Optional messages
    loginToViewError?: string;
    loginToDeleteError?: string;
    scoreLabel?: string; // e.g., "Score" for header
    actionsLabel?: string; // e.g., "Actions" for header
    nameTimestampLabel?: string; // e.g., "Quiz Name / Timestamp" for header
}

// Update the interface definition
interface SavedQuizzesViewProps {
    lang: 'en' | 'es'; // Language prop
    t: TranslationSet; // Translation object prop
    user: User | null; // Add user prop
    onRetake: (quiz: SavedQuizRecord) => void; // Keep onRetake
    // onDelete: (id: string) => void; // Removed - will handle deletion internally
    onBack: () => void; // Keep onBack
}

const SavedQuizzesView: React.FC<SavedQuizzesViewProps> = ({
    // lang, // Removed - Not used directly
    t,    // Destructure t
    user, // Add user prop
    onRetake,
    // onDelete: onDeleteProp, // Removed prop
    onBack,
}) => {

    // Add state for fetched quizzes, loading, and error
    const [savedQuizzes, setSavedQuizzes] = useState<SavedQuizRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    // Fetch saved quizzes for the current user
    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!user) {
                 // Use translated error
                setError(t.loginToViewError || "You must be logged in to view saved quizzes.");
                setIsLoading(false);
                setSavedQuizzes([]); // Clear quizzes if user logs out
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Assuming a 'quizzes' table with a 'user_id' column matching auth.users.id
                // And the quiz data is stored in appropriate columns (e.g., JSONB)
                // Adjust table/column names as needed based on your SQL schema
                const { data, error: dbError } = await supabase
                    .from('quizzes') // *** YOUR TABLE NAME HERE ***
                    .select('*') // Select all columns, or specify needed ones
                    .eq('user_id', user.id) // Filter by user ID
                    .order('timestamp', { ascending: false }); // Order by most recent

                if (dbError) {
                    throw dbError;
                }

                // Assuming the data structure from DB matches SavedQuizRecord
                // You might need to transform the data if the DB structure differs
                setSavedQuizzes(data as SavedQuizRecord[]);

            } catch (err: unknown) {
                console.error("Error fetching saved quizzes:", err);
                let message = "An unknown error occurred.";
                if (err instanceof Error) {
                    message = err.message;
                }
                 // Use translated error prefix
                setError(`${t.errorLoadingQuizzes}: ${message}`);
                setSavedQuizzes([]); // Clear quizzes on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, [user, t.errorLoadingQuizzes, t.loginToViewError]); // Added dependencies


    // Handle quiz deletion internally
    const handleDelete = async (idToDelete: string) => {
         if (!user) {
              // Use translated error
             setError(t.loginToDeleteError || "Cannot delete quiz: Not logged in.");
             return;
         }
         // Add confirmation dialog using translated message
         if (!window.confirm(t.confirmDeleteMessage || "Are you sure you want to delete this quiz?")) {
             return; // User cancelled
         }

         // Optimistic UI update (optional but good UX): remove immediately
         // setSavedQuizzes(prev => prev.filter(q => q.id !== idToDelete));

         try {
            const { error: deleteError } = await supabase
                .from('quizzes') // *** YOUR TABLE NAME HERE ***
                .delete()
                .match({ id: idToDelete, user_id: user.id }); // Ensure user owns the quiz

            if (deleteError) {
                throw deleteError;
            }
             // Confirm deletion by removing from state (if not done optimistically)
             setSavedQuizzes(prev => prev.filter(q => q.id !== idToDelete));
             setError(null); // Clear any previous errors

         } catch (err: unknown) {
             console.error("Error deleting quiz:", err);
             let message = "An unknown error occurred.";
             if (err instanceof Error) {
                 message = err.message;
             }
              // Use translated error prefix
             setError(`${t.deleteError}: ${message}`);
             // Optional: Re-fetch quizzes or revert optimistic update if it failed
         }
    };


    // Render logic based on loading/error/data state
    if (isLoading) {
         // Use translated loading message
        return <div className="text-center p-10">{t.loadingSavedQuizzes}</div>;
    }

    if (error) {
         // Error message is already translated in useEffect/handleDelete
        return <p className="text-center text-red-500 py-6">{error}</p>;
    }

    if (!user) {
          // Use translated login message
         return <p className="text-center text-gray-500 py-6">{t.loginToViewError || 'Please log in to manage your saved quizzes.'}</p>;
    }


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                 {/* Use translated title */}
                <h2 className="text-xl font-semibold text-gray-800">{t.savedQuizzesTitle}</h2>
                <button
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                     {/* Use translated button text */}
                    {t.backButton}
                </button>
            </div>

            {savedQuizzes.length === 0 ? (
                 // Use translated empty state message
                <p className="text-center text-gray-500 py-6">{t.noSavedQuizzes}</p>
            ) : (
                <ul className="space-y-3">
                    {/* Optional Header Row - Use translated labels */}
                    <li className="hidden sm:grid grid-cols-5 gap-4 items-center pb-2 border-b text-sm font-medium text-gray-500">
                        <span className="col-span-2">{t.nameTimestampLabel || 'Quiz Name / Timestamp'}</span>
                        <span className="text-center">{t.scoreLabel || 'Score'}</span>
                        <span className="col-span-2 text-center">{t.actionsLabel || 'Actions'}</span>
                    </li>
                    {savedQuizzes.map((quiz) => (
                        <li key={quiz.id} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center p-3 border rounded-md hover:bg-gray-50 transition-colors">
                            {/* Quiz Name/Timestamp */}
                            <div className="col-span-1 sm:col-span-2 text-sm text-gray-800">
                                <p className="font-medium truncate">{quiz.name}</p>
                                <p className="text-xs text-gray-500">{new Date(quiz.timestamp).toLocaleString()}</p>
                            </div>
                            {/* Score */}
                            <div className="col-span-1 text-center text-sm text-gray-600">
                                {quiz.score !== undefined && quiz.totalQuestions !== undefined
                                    ? `${quiz.score} / ${quiz.totalQuestions}`
                                    : 'N/A'}
                            </div>
                            {/* Actions */}
                            <div className="col-span-1 sm:col-span-2 flex justify-center sm:justify-end gap-2">
                                <button
                                    onClick={() => onRetake(quiz)}
                                    className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                     {/* Use translated button text */}
                                    {t.retakeButton}
                                </button>
                                <button
                                    onClick={() => handleDelete(quiz.id)} // Use the internal handleDelete function
                                    className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                     {/* Use translated button text */}
                                    {t.deleteButton}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SavedQuizzesView;
