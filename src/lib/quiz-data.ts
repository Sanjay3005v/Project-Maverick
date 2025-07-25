
export interface Question {
    question: string;
    options: string[];
    answer: string;
}

export interface Quiz {
    id: string;
    title: string;
    topic: string;
    questions: Question[];
    isDailyQuiz: boolean;
}

export const quizData: Quiz[] = [
    {
        id: 'quiz-1',
        title: 'React Fundamentals',
        topic: 'Frontend Development',
        isDailyQuiz: true,
        questions: [
            {
                question: 'What is the primary purpose of a "key" prop in a list of React components?',
                options: [
                'To provide a unique style to the component.',
                'To identify which items have changed, are added, or are removed.',
                'To link to another route in the application.',
                'To set the component\'s accessibility label.',
                ],
                answer: 'To identify which items have changed, are added, or are removed.',
            },
            {
                question: 'Which hook would you use to perform side effects in a function component?',
                options: ['useState', 'useReducer', 'useEffect', 'useContext'],
                answer: 'useEffect',
            },
            {
                question: 'What command is used to create a new React app with Create React App?',
                options: ['npm new react-app', 'npx create-react-app', 'react-create-app', 'npm init react-app'],
                answer: 'npx create-react-app',
            },
        ],
    },
    {
        id: 'quiz-2',
        title: 'CSS Basics',
        topic: 'Web Styling',
        isDailyQuiz: false,
        questions: [
            {
                question: 'What does CSS stand for?',
                options: ['Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'],
                answer: 'Cascading Style Sheets',
            },
            {
                question: 'Which property is used to change the background color of an element?',
                options: ['color', 'bgcolor', 'background-color', 'background'],
                answer: 'background-color',
            },
        ],
    },
];
