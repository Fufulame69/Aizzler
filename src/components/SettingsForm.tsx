import React, { useState, useEffect } from 'react';

// Re-use the QuizSettings interface definition (or import if moved to a types file)
interface QuizSettings {
    numQuestions: number;
    timeLimitMinutes: number;
    questionFormat: 'multiple_choice' | 'restricted_response' | 'mixed';
    language: string;
}

// Define a type for the translation object structure expected from props
interface TranslationSet {
    settingsTitle: string;
    numQuestionsLabel: string;
    timeLimitLabel: string;
    questionFormatLabel: string;
    formatMixed: string;
    formatMCQ: string; // Maps to 'multiple_choice'
    formatOpen: string; // Maps to 'restricted_response'
    languageLabel: string;
    saveButton: string;
    cancelButton: string;
    // Error messages (optional keys, can be added to uiText in page.tsx)
    errorNumQuestions?: string;
    errorTimeLimit?: string;
    errorLanguage?: string;
}

interface SettingsFormProps {
    lang: 'en' | 'es'; // Language prop
    t: TranslationSet; // Translation object prop
    initialSettings: QuizSettings;
    onSave: (newSettings: QuizSettings) => void;
    onCancel: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ /* lang, // Removed - Not used directly */ t, initialSettings, onSave, onCancel }) => {
    const [settings, setSettings] = useState<QuizSettings>(initialSettings);
    const [error, setError] = useState<string | null>(null);

    // Update local state if initialSettings prop changes (e.g., loading from saved quiz)
    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    };

    const handleFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({
            ...prev,
            questionFormat: e.target.value as QuizSettings['questionFormat'],
        }));
    };

    const handleSaveClick = () => {
        setError(null);
        // Basic validation
        if (settings.numQuestions <= 0) {
            // Use translated error messages if available in 't'
            setError(t.errorNumQuestions || "Number of questions must be positive.");
            return;
        }
        if (settings.timeLimitMinutes <= 0) {
            setError(t.errorTimeLimit || "Time limit must be positive.");
            return;
        }
        if (!settings.language.trim()) {
            setError(t.errorLanguage || "Language cannot be empty.");
            return;
        }
        onSave(settings);
    };

    // Map internal format values to translated display text
    const formatLabels: { [key in QuizSettings['questionFormat']]: string } = {
        multiple_choice: t.formatMCQ,
        restricted_response: t.formatOpen,
        mixed: t.formatMixed,
    };


    return (
        <div className="space-y-6 p-4 md:p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
             {/* Use translated title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.settingsTitle}</h2>

            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {/* Number of Questions */}
                <div>
                     {/* Use translated label */}
                    <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700">
                        {t.numQuestionsLabel}
                    </label>
                    <input
                        type="number"
                        id="numQuestions"
                        name="numQuestions"
                        value={settings.numQuestions}
                        onChange={handleChange}
                        min="1"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black bg-white"
                    />
                </div>

                {/* Time Limit */}
                <div>
                     {/* Use translated label */}
                    <label htmlFor="timeLimitMinutes" className="block text-sm font-medium text-gray-700">
                        {t.timeLimitLabel}
                    </label>
                    <input
                        type="number"
                        id="timeLimitMinutes"
                        name="timeLimitMinutes"
                        value={settings.timeLimitMinutes}
                        onChange={handleChange}
                        min="1"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black bg-white"
                    />
                </div>

                {/* Language */}
                <div className="md:col-span-2">
                     {/* Use translated label */}
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        {t.languageLabel}
                    </label>
                    <input
                        type="text"
                        id="language"
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                        placeholder="e.g., English, Spanish"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black bg-white"
                    />
                </div>
            </div>

            {/* Question Format */}
            <fieldset className="mt-4">
                 {/* Use translated legend */}
                <legend className="block text-sm font-medium text-gray-700 mb-2">{t.questionFormatLabel}</legend>
                <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-6">
                    {(Object.keys(formatLabels) as Array<keyof typeof formatLabels>).map((format) => (
                        <div key={format} className="flex items-center">
                            <input
                                id={`format-${format}`}
                                name="questionFormat"
                                type="radio"
                                value={format}
                                checked={settings.questionFormat === format}
                                onChange={handleFormatChange}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                             {/* Use translated format label */}
                            <label htmlFor={`format-${format}`} className="ml-2 block text-sm text-gray-900">
                                {formatLabels[format]}
                            </label>
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {t.cancelButton}
                </button>
                <button
                    type="button"
                    onClick={handleSaveClick}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {t.saveButton}
                </button>
            </div>
        </div>
    );
};

export default SettingsForm;
