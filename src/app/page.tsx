"use client"; // Required for hooks like useState, useEffect

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'; // Import Supabase types
// Import shared types
import { QuizData, QuizSettings, SavedQuizRecord, AppView } from '@/types/quiz';
import InputForm from '@/components/InputForm';
import SettingsForm from '@/components/SettingsForm';
import QuizView from '@/components/QuizView';
import ResultsView from '@/components/ResultsView';
import SavedQuizzesView from '@/components/SavedQuizzesView';

// Define simple translation structure
const uiText = {
    en: {
        title: "Aizzler - AI Quizzes and Flashcards",
        description: "This application uses AI to generate quizzes based on text you provide. Paste any text material, configure your quiz settings, and test your knowledge! Register or log in to save your generated quizzes and track your results over time.",
        logout: "Logout",
        loggingOut: "Logging out...",
        login: "Login",
        register: "Register",
        welcome: "Welcome to the AI Quiz Generator! Create an account or log in to save your quizzes and track your progress.",
        emailLabel: "Email (Username)",
        passwordLabel: "Password",
        processing: "Processing...",
        noAccount: "Don't have an account?",
        registerHere: "Register here",
        hasAccount: "Already have an account?",
        loginHere: "Login here",
        generatingQuiz: "Generating Quiz... Please wait.",
        invalidState: "Invalid application state.",
        toggleLang: "Español", // Button text when current lang is English
        // InputForm translations
        pasteNotesLabel: "Paste your notes/material here:",
        pasteNotesPlaceholder: "Enter the text you want to generate a quiz from...",
        generatingButton: "Generating...",
        generateQuizButton: "Generate Quiz",
        settingsButton: "Settings",
        savedQuizzesButton: "Saved Quizzes",
        errorPasteText: "Please paste some text material.", // Error message from page.tsx
        // SettingsForm translations
        settingsTitle: "Quiz Settings",
        numQuestionsLabel: "Number of Questions:",
        timeLimitLabel: "Time Limit (minutes):",
        questionFormatLabel: "Question Format:",
        formatMixed: "Mixed",
        formatMCQ: "Multiple Choice",
        formatOpen: "Open Ended",
        languageLabel: "Quiz Language:",
        saveButton: "Save Settings",
        cancelButton: "Cancel",
        // QuizView translations
        questionLabel: "Question",
        ofLabel: "of",
        timeLeftLabel: "Time Left:",
        submitButton: "Submit Quiz",
        prevButton: "Previous",
        nextButton: "Next",
        // ResultsView translations
        resultsTitle: "Quiz Results",
        yourScoreLabel: "Your Score:",
        correctAnswerLabel: "Correct Answer:",
        yourAnswerLabel: "Your Answer:",
        saveQuizButton: "Save Quiz",
        savingQuizButton: "Saving...",
        saveError: "Error saving quiz", // Keep short
        saveSuccess: "Quiz saved!", // Keep short
        newQuizButton: "Start New Quiz",
        // SavedQuizzesView translations
        savedQuizzesTitle: "Saved Quizzes",
        loadingSavedQuizzes: "Loading saved quizzes...",
        noSavedQuizzes: "You have no saved quizzes yet.",
        errorLoadingQuizzes: "Error loading quizzes", // Keep short
        quizTakenOn: "Quiz taken on", // Part of default name
        questionsLabel: "questions", // e.g., "5 questions"
        deleteButton: "Delete",
        retakeButton: "Retake",
        backButton: "Back",
        confirmDeleteTitle: "Confirm Deletion",
        confirmDeleteMessage: "Are you sure you want to delete this quiz?",
        deleteError: "Error deleting quiz", // Keep short
        // Add more translations as needed for other child components later
    },
    es: {
        title: "Aizzler - Cuestionarios y Tarjetas con IA",
        description: "Esta aplicación usa IA para generar cuestionarios basados en el texto que proporciones. ¡Pega cualquier material de texto, configura tu cuestionario y pon a prueba tus conocimientos! Regístrate o inicia sesión para guardar tus cuestionarios generados y seguir tus resultados.",
        logout: "Cerrar Sesión",
        loggingOut: "Cerrando sesión...",
        login: "Iniciar Sesión",
        register: "Registrarse",
        welcome: "¡Bienvenido al Generador de Cuestionarios con IA! Crea una cuenta o inicia sesión para guardar tus cuestionarios y seguir tu progreso.",
        emailLabel: "Correo Electrónico (Usuario)",
        passwordLabel: "Contraseña",
        processing: "Procesando...",
        noAccount: "¿No tienes una cuenta?",
        registerHere: "Regístrate aquí",
        hasAccount: "¿Ya tienes una cuenta?",
        loginHere: "Inicia sesión aquí",
        generatingQuiz: "Generando Cuestionario... Por favor espera.",
        invalidState: "Estado de aplicación inválido.",
        toggleLang: "English", // Button text when current lang is Spanish
        // InputForm translations
        pasteNotesLabel: "Pega tus apuntes/material aquí:",
        pasteNotesPlaceholder: "Introduce el texto del que quieres generar un cuestionario...",
        generatingButton: "Generando...",
        generateQuizButton: "Generar Cuestionario",
        settingsButton: "Ajustes",
        savedQuizzesButton: "Cuestionarios Guardados",
        errorPasteText: "Por favor pega algún material de texto.", // Error message from page.tsx
        // SettingsForm translations
        settingsTitle: "Ajustes del Cuestionario",
        numQuestionsLabel: "Número de Preguntas:",
        timeLimitLabel: "Límite de Tiempo (minutos):",
        questionFormatLabel: "Formato de Pregunta:",
        formatMixed: "Mixto",
        formatMCQ: "Opción Múltiple",
        formatOpen: "Respuesta Abierta",
        languageLabel: "Idioma del Cuestionario:",
        saveButton: "Guardar Ajustes",
        cancelButton: "Cancelar",
        // QuizView translations
        questionLabel: "Pregunta",
        ofLabel: "de",
        timeLeftLabel: "Tiempo Restante:",
        submitButton: "Enviar Cuestionario",
        prevButton: "Anterior",
        nextButton: "Siguiente",
        // ResultsView translations
        resultsTitle: "Resultados del Cuestionario",
        yourScoreLabel: "Tu Puntuación:",
        correctAnswerLabel: "Respuesta Correcta:",
        yourAnswerLabel: "Tu Respuesta:",
        saveQuizButton: "Guardar Cuestionario",
        savingQuizButton: "Guardando...",
        saveError: "Error al guardar", // Keep short
        saveSuccess: "¡Guardado!", // Keep short
        newQuizButton: "Iniciar Nuevo Cuestionario",
        // SavedQuizzesView translations
        savedQuizzesTitle: "Cuestionarios Guardados",
        loadingSavedQuizzes: "Cargando cuestionarios guardados...",
        noSavedQuizzes: "Aún no tienes cuestionarios guardados.",
        errorLoadingQuizzes: "Error al cargar cuestionarios", // Keep short
        quizTakenOn: "Cuestionario del", // Part of default name
        questionsLabel: "preguntas", // e.g., "5 preguntas"
        deleteButton: "Eliminar",
        retakeButton: "Repetir",
        backButton: "Volver",
        confirmDeleteTitle: "Confirmar Eliminación",
        confirmDeleteMessage: "¿Estás seguro de que quieres eliminar este cuestionario?",
        deleteError: "Error al eliminar", // Keep short
        // Add more translations as needed for other child components later
    }
};


export default function Home() {
    const [interfaceLanguage, setInterfaceLanguage] = useState<'en' | 'es'>('es'); // Default to Spanish
    const [currentView, setCurrentView] = useState<AppView>('input');
    const [inputText, setInputText] = useState<string>('');
    const [quizSettings, setQuizSettings] = useState<QuizSettings>({
        numQuestions: 5,
        timeLimitMinutes: 10,
        questionFormat: 'mixed',
        language: 'Spanish', // Default quiz generation language to Spanish
    });
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [timerSeconds, setTimerSeconds] = useState<number>(0);
    const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [score, setScore] = useState<number>(0);
    // const [savedQuizzes, setSavedQuizzes] = useState<SavedQuizRecord[]>([]); // Will be fetched from DB
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // --- Supabase Auth State ---
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState<string>(''); // Using email for Supabase Auth
    const [password, setPassword] = useState<string>('');
    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // --- Language Toggle Handler ---
    const handleToggleLanguage = () => {
        setInterfaceLanguage(prevLang => prevLang === 'en' ? 'es' : 'en');
    };

    // --- Timer Logic --- Moved up
    const stopTimer = useCallback(() => {
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            setTimerIntervalId(null);
        }
    }, [timerIntervalId]);

    const startTimer = useCallback((durationSeconds: number) => {
        stopTimer(); // Clear any existing timer
        setTimerSeconds(durationSeconds);
        const intervalId = setInterval(() => {
            setTimerSeconds((prevSeconds) => {
                if (prevSeconds <= 1) {
                    clearInterval(intervalId);
                    setTimerIntervalId(null);
                    // Auto-submit when timer runs out
                    // Need to ensure submitQuiz logic is accessible here or passed down
                    console.log("Time's up! Auto-submitting...");
                    // TODO: Implement auto-submit logic properly
                    // For now, just navigate to results (will show 0 score if not submitted)
                    setCurrentView('results');
                    return 0;
                }
                return prevSeconds - 1;
            });
        }, 1000);
        setTimerIntervalId(intervalId);
    }, [stopTimer]); // Add dependencies

    // Moved handleNewQuiz definition before the useEffect that uses it
    const handleNewQuiz = useCallback(() => {
        setQuizData(null);
        setInputText('');
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setError(null);
        setIsLoading(false);
        stopTimer();
        // Reset settings to default or keep current? Let's keep current for now.
        // setQuizSettings({ numQuestions: 5, timeLimitMinutes: 10, questionFormat: 'mixed', language: 'English' });
        setCurrentView('input');
    }, [stopTimer]); // Add stopTimer as dependency

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                setSession(session);
                setUser(session?.user ?? null);
                // Reset app state if user logs out
                if (event === 'SIGNED_OUT') {
                    handleNewQuiz(); // Reset quiz state
                    setCurrentView('input'); // Go back to input view
                }
            }
        );

        // Cleanup listener on component unmount
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [handleNewQuiz]); // Added handleNewQuiz


    // --- Auth Handlers ---
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthLoading(true);
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // Session update is handled by the listener
        } catch (error: unknown) {
            console.error("Login failed:", error);
            let message = "Login failed. Please check your credentials.";
            if (error instanceof Error && 'error_description' in error) {
                 message = (error as any).error_description || error.message || message; // Supabase might have error_description
            } else if (error instanceof Error) {
                 message = error.message || message;
            }
            setAuthError(message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAuthLoading(true);
        setAuthError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                // You can add options for email confirmation if needed
                // options: {
                //   emailRedirectTo: window.location.origin,
                // },
            });
            if (error) throw error;
            // User will be logged in automatically after successful sign up
            // Or prompt them to check email if confirmation is required
            alert('Registration successful! You are now logged in.'); // Simple feedback - TODO: Translate this alert
        } catch (error: unknown) {
            console.error("Registration failed:", error);
            let message = "Registration failed. Please try again.";
             if (error instanceof Error && 'error_description' in error) {
                 message = (error as any).error_description || error.message || message; // Supabase might have error_description
            } else if (error instanceof Error) {
                 message = error.message || message;
            }
            setAuthError(message);
        } finally {
            setAuthLoading(false);
        }
    };

     const handleLogout = async () => {
        setAuthLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
            setAuthError('Failed to log out.'); // TODO: Translate this error
        }
        // State updates (session=null, user=null) are handled by the listener
        setAuthLoading(false);
    };

    // --- Timer Cleanup Effect --- Moved down slightly
    useEffect(() => {
        // Cleanup timer on component unmount or view change away from quiz
        return () => {
            stopTimer();
        };
    }, [stopTimer]);


    // --- Quiz Generation ---
    // TODO: Associate generated quizzes with the logged-in user if needed immediately,
    // or handle saving later when results are shown.

    const handleGenerateQuiz = async () => {
        if (!inputText.trim()) {
             // Use translated error message
            setError(uiText[interfaceLanguage].errorPasteText);
            return;
        }
        setError(null);
        setIsLoading(true);
        setCurrentView('loading'); // Show loading state

        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inputText,
                    numQuestions: quizSettings.numQuestions,
                    questionFormat: quizSettings.questionFormat,
                    language: quizSettings.language,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }

            const generatedData: QuizData = await response.json();

            if (!Array.isArray(generatedData) || generatedData.length === 0) {
                 throw new Error("Received invalid or empty quiz data from API."); // TODO: Translate
            }

            setQuizData(generatedData);
            setUserAnswers(new Array(generatedData.length).fill(null)); // Initialize answers array
            setCurrentQuestionIndex(0);
            setIsLoading(false);
            setCurrentView('quiz');
            startTimer(quizSettings.timeLimitMinutes * 60);

        } catch (err: unknown) {
            console.error("Quiz generation failed:", err);
            let message = "An unknown error occurred during quiz generation.";
            if (err instanceof Error) {
                message = err.message;
            }
            setError(`Quiz generation failed: ${message}`); // TODO: Translate prefix
            setIsLoading(false);
            setCurrentView('input'); // Go back to input on error
        }
    };

    // --- Quiz Navigation and Submission ---
    const handleNextQuestion = () => {
        if (quizData && currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleAnswerChange = (index: number, answer: string | null) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[index] = answer;
            return newAnswers;
        });
    };

    const handleSubmitQuiz = () => {
        stopTimer();
        if (!quizData) return;

        let calculatedScore = 0;
        quizData.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            // Simple case-insensitive comparison for now
            if (userAnswer && question.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase()) {
                calculatedScore++;
            }
        });
        setScore(calculatedScore);
        setCurrentView('results');
    };

    // --- Settings Handling ---
    const handleSaveSettings = (newSettings: QuizSettings) => {
        setQuizSettings(newSettings);
        setCurrentView('input'); // Go back to input screen after saving
    };

    // --- Saved Quizzes Handling ---
    // handleSaveCurrentQuiz is now handled within ResultsView.tsx
    // handleDeleteQuiz is now handled within SavedQuizzesView.tsx

     const handleRetakeQuiz = (quizToRetake: SavedQuizRecord) => {
        setQuizData(quizToRetake.quizData);
        setQuizSettings(quizToRetake.settings); // Use settings from the saved quiz
        setUserAnswers(new Array(quizToRetake.quizData.length).fill(null));
        setCurrentQuestionIndex(0);
        setScore(0); // Reset score for retake
        setError(null);
        setIsLoading(false);
        setCurrentView('quiz');
        startTimer(quizToRetake.settings.timeLimitMinutes * 60);
    };

    // --- Render Logic ---
    const renderView = () => {
        // Pass language and translations down to children
        const langProps = { lang: interfaceLanguage, t: uiText[interfaceLanguage] };

        switch (currentView) {
            case 'loading':
                // Use translation for loading message
                return <div className="text-center p-10">{uiText[interfaceLanguage].generatingQuiz}</div>;
            case 'input':
                return (
                    <InputForm
                        {...langProps} // Pass language props
                        inputText={inputText}
                        setInputText={setInputText}
                        onGenerate={handleGenerateQuiz}
                        onGoToSettings={() => setCurrentView('settings')}
                        onGoToSaved={() => setCurrentView('saved')} // This view will fetch data
                        isLoading={isLoading}
                        error={error} // TODO: Translate error messages if needed
                        // savedQuizCount={savedQuizzes.length} // Count will come from DB fetch
                    />
                );
            case 'settings':
                return (
                    <SettingsForm
                        {...langProps} // Pass language props
                        initialSettings={quizSettings}
                        onSave={handleSaveSettings}
                        onCancel={() => setCurrentView('input')}
                    />
                );
            case 'quiz':
                if (!quizData) {
                    // TODO: Translate error
                    return <p className="text-center text-red-500">Error: Quiz data is not available.</p>;
                }
                return (
                    <QuizView
                        {...langProps} // Pass language props
                        quizData={quizData}
                        currentQuestionIndex={currentQuestionIndex}
                        userAnswers={userAnswers}
                        timerSeconds={timerSeconds}
                        onAnswerChange={handleAnswerChange}
                        onNext={handleNextQuestion}
                        onPrev={handlePrevQuestion}
                        onSubmit={handleSubmitQuiz}
                    />
                );
            case 'results':
                if (!quizData) {
                     // TODO: Translate error
                    return <p className="text-center text-red-500">Error: No quiz data available for results.</p>;
                }
                return (
                    <ResultsView
                        {...langProps} // Pass language props
                        quizData={quizData}
                        userAnswers={userAnswers}
                        score={score}
                        user={user} // Pass user
                        quizSettings={quizSettings} // Pass quizSettings
                        // onSaveQuiz={handleSaveCurrentQuiz} // Removed - handled internally
                        onNewQuiz={handleNewQuiz}
                    />
                );
             case 'saved':
                return (
                    <SavedQuizzesView
                        {...langProps} // Pass language props
                        user={user} // Pass user object for fetching
                        onRetake={handleRetakeQuiz} // Pass the handler directly
                        // onDelete={handleDeleteQuiz} // Removed - handled internally by SavedQuizzesView
                        onBack={() => setCurrentView('input')}
                    />
                );
            default:
                 // Use translation for invalid state message
                return <p>{uiText[interfaceLanguage].invalidState}</p>;
        }
    };


    // --- Auth UI ---
    const renderAuth = () => (
        <div className="w-full max-w-md mx-auto">
             {/* Use translation for Login/Register title */}
            <h2 className="text-2xl font-semibold text-center mb-6">
                {authView === 'login' ? uiText[interfaceLanguage].login : uiText[interfaceLanguage].register}
            </h2>
             {/* Use translation for welcome message */}
            <p className="text-center mb-4 text-gray-600">
                {uiText[interfaceLanguage].welcome}
            </p>
            <form onSubmit={authView === 'login' ? handleLogin : handleRegister} className="space-y-4">
                <div>
                     {/* Use translation for email label */}
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">{uiText[interfaceLanguage].emailLabel}</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                     {/* Use translation for password label */}
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">{uiText[interfaceLanguage].passwordLabel}</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6} // Supabase default minimum
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="••••••••"
                    />
                </div>
                {authError && <p className="text-red-500 text-sm">{authError}</p>} {/* TODO: Translate auth errors */}
                <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                     {/* Use translation for button text */}
                    {authLoading ? uiText[interfaceLanguage].processing : (authView === 'login' ? uiText[interfaceLanguage].login : uiText[interfaceLanguage].register)}
                </button>
            </form>
            <p className="mt-4 text-center text-sm">
                 {/* Use translation for toggle text */}
                {authView === 'login' ? uiText[interfaceLanguage].noAccount : uiText[interfaceLanguage].hasAccount}{' '}
                <button
                    onClick={() => {
                        setAuthView(authView === 'login' ? 'register' : 'login');
                        setAuthError(null); // Clear errors on view switch
                        setEmail('');
                        setPassword('');
                    }}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    disabled={authLoading}
                >
                     {/* Use translation for toggle link */}
                    {authView === 'login' ? uiText[interfaceLanguage].registerHere : uiText[interfaceLanguage].loginHere}
                </button>
            </p>
        </div>
    );

    // Note: Child components (InputForm, SettingsForm, etc.) still need to be updated
    // to accept and use the 'lang' and 't' props for full translation.


    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 bg-gray-100 text-gray-800">
             {/* Header - Using Flexbox for layout */}
            <div className="w-full max-w-5xl flex items-center justify-between font-mono text-sm mb-8">
                 {/* Language Toggle Button - Placed on the left */}
                 <button
                    onClick={handleToggleLanguage}
                    className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                 >
                    {uiText[interfaceLanguage].toggleLang}
                 </button>

                {/* Use translation for title - Centered */}
                {/* flex-grow allows it to take available space, text-center centers the text */}
                <h1 className="text-2xl font-bold flex-grow text-center mx-4">{uiText[interfaceLanguage].title}</h1>

                 {/* Logout Button - Placed on the right */}
                 {/* Wrap in a div to ensure consistent height/alignment if button isn't present */}
                 <div className="w-auto"> {/* Adjust width as needed or keep auto */}
                     {session && (
                        <button
                            onClick={handleLogout}
                            disabled={authLoading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                             {/* Use translation for logout button */}
                            {authLoading ? uiText[interfaceLanguage].loggingOut : uiText[interfaceLanguage].logout}
                        </button>
                    )}
                 </div>
            </div>

             {/* Description */}
             {/* Use translation for description */}
             {!session && (
                 <p className="text-center text-lg text-gray-700 mb-8 max-w-3xl">
                    {uiText[interfaceLanguage].description}
                 </p>
             )}


            {/* Main Content Area */}
            <div className="container mx-auto p-6 bg-white rounded-lg shadow-md w-full max-w-4xl">
                {session ? renderView() : renderAuth()}
            </div>

            {/* Footer is confirmed removed */}
        </main>
    );
}
