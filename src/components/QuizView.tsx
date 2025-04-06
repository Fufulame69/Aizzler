import React from 'react';
import { QuizQuestion } from '@/types/quiz'; // Adjusted import path

// Define a type for the translation object structure expected from props
interface TranslationSet {
    questionLabel: string;
    ofLabel: string;
    timeLeftLabel: string;
    submitButton: string;
    prevButton: string;
    nextButton: string;
    // Add other keys as needed, e.g., for answer labels/placeholders
    yourAnswerLabel?: string; // Optional for restricted response
    answerPlaceholder?: string; // Optional for restricted response
}

interface QuizViewProps {
    lang: 'en' | 'es'; // Language prop
    t: TranslationSet; // Translation object prop
    quizData: QuizQuestion[];
    currentQuestionIndex: number;
    userAnswers: (string | null)[];
    timerSeconds: number;
    onAnswerChange: (index: number, answer: string | null) => void;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
    lang, // Destructure lang
    t,    // Destructure t
    quizData,
    currentQuestionIndex,
    userAnswers,
    timerSeconds,
    onAnswerChange,
    onNext,
    onPrev,
    onSubmit,
}) => {
    const currentQuestion = quizData[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestionIndex];

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Header: Timer and Question Number */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                 {/* Title could also be translated if added to uiText */}
                <h2 className="text-xl font-semibold text-gray-800">Quiz in Progress</h2>
                <div className="text-lg font-medium text-indigo-600">
                     {/* Use translated time label */}
                    {t.timeLeftLabel} {formatTime(timerSeconds)}
                </div>
            </div>

            {/* Question Display */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                 {/* Use translated question counter */}
                <p className="text-sm font-medium text-gray-500 mb-2">
                    {t.questionLabel} {currentQuestionIndex + 1} {t.ofLabel} {quizData.length}
                </p>
                <p className="text-lg font-medium text-gray-900">{currentQuestion.question}</p>
            </div>

            {/* Answer Area */}
            <div className="space-y-4">
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <fieldset>
                        <legend className="sr-only">Options</legend>
                        <div className="space-y-3">
                            {Object.entries(currentQuestion.options).map(([key, value]) => (
                                <div key={key} className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors">
                                    <input
                                        id={`option-${key}`}
                                        name={`question-${currentQuestionIndex}`}
                                        type="radio"
                                        value={key}
                                        checked={currentAnswer === key}
                                        onChange={(e) => onAnswerChange(currentQuestionIndex, e.target.value)}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                    <label htmlFor={`option-${key}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                        {key}: {value}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                )}

                {currentQuestion.type === 'restricted_response' && (
                    <div>
                         {/* Use translated label (optional, check if t.yourAnswerLabel exists) */}
                        <label htmlFor="restrictedAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.yourAnswerLabel || 'Your Answer:'}
                        </label>
                        <input
                            id="restrictedAnswer"
                            type="text"
                            value={currentAnswer ?? ''}
                            onChange={(e) => onAnswerChange(currentQuestionIndex, e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black bg-white"
                             // Use translated placeholder (optional)
                            placeholder={t.answerPlaceholder || "Type your answer here"}
                        />
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                    onClick={onPrev}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                        currentQuestionIndex === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                >
                    {t.prevButton}
                </button>

                {currentQuestionIndex < quizData.length - 1 ? (
                    <button
                        onClick={onNext}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {t.nextButton}
                    </button>
                ) : (
                    <button
                        onClick={onSubmit}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        {t.submitButton}
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizView;
