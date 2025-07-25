
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

    