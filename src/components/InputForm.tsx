import React from 'react';

// Define a type for the translation object structure expected from props
interface TranslationSet {
    pasteNotesLabel: string;
    pasteNotesPlaceholder: string;
    generatingButton: string;
    generateQuizButton: string;
    settingsButton: string;
    savedQuizzesButton: string;
    // Add other keys as needed
}

interface InputFormProps {
    lang: 'en' | 'es'; // Language prop
    t: TranslationSet; // Translation object prop
    inputText: string;
    setInputText: (text: string) => void;
    onGenerate: () => void;
    onGoToSettings: () => void;
    onGoToSaved: () => void;
    isLoading: boolean;
    error: string | null;
    // savedQuizCount: number; // Removed - count will be handled in SavedQuizzesView
}

const InputForm: React.FC<InputFormProps> = ({
    lang, // Destructure lang
    t,    // Destructure t
    inputText,
    setInputText,
    onGenerate,
    onGoToSettings,
    onGoToSaved,
    isLoading,
    error,
    // savedQuizCount // Removed
}) => {
    return (
        <div className="space-y-4">
             {/* Use translated label */}
            <label htmlFor="materialInput" className="block text-lg font-medium text-gray-700">
                {t.pasteNotesLabel}
            </label>
            <textarea
                id="materialInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                 // Use translated placeholder
                placeholder={t.pasteNotesPlaceholder}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black bg-white"
            />
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !inputText.trim()}
                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                        isLoading || !inputText.trim()
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                >
                     {/* Use translated button text */}
                    {isLoading ? t.generatingButton : t.generateQuizButton}
                </button>
                <button
                    onClick={onGoToSettings}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                     {/* Use translated button text */}
                    {t.settingsButton}
                </button>
                <button
                     onClick={onGoToSaved}
                     className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                     {/* Use translated button text */}
                    {t.savedQuizzesButton} {/* ({savedQuizCount}) Removed */}
                </button>
            </div>
             {/* Error message is now translated in page.tsx before being passed */}
            {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
        </div>
    );
};

export default InputForm;
