i# Maverick Mindset - AI-Powered Onboarding

Maverick Mindset is a modern, AI-driven platform designed to revolutionize the onboarding experience for new trainees. It provides personalized training plans, progress tracking, and interactive learning modules, all managed through a clean and intuitive interface for both trainees and administrators.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **AI/Generative:** [Genkit (Google's Generative AI Toolkit)](https://firebase.google.com/docs/genkit)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)

## Features

### For Administrators (`/admin/dashboard`)
- **Trainee Management:** View a list of all trainees, their progress, and status.
- **Progress Monitoring:** At-a-glance dashboard with key metrics like total trainees and average progress.
- **AI-Powered Reporting:** Generate comprehensive performance reports for the entire trainee cohort with a single click.
- **AI Onboarding Planner:** Create personalized onboarding plans for new freshers by providing their profile and a training schedule.

### For Trainees (`/trainee/dashboard`)
- **Personalized Dashboard:** A central hub to view overall progress and access learning modules.
- **AI-Generated Onboarding Plan:** Generate a personalized learning plan tailored to individual skills and company schedules.
- **Interactive Modules:**
    - **Daily Quiz:** Test knowledge with interactive quizzes.
    - **Coding Challenges:** Sharpen skills with practical coding exercises.
    - **Assignments:** Submit work and track feedback.
    - **Certifications:** View and download earned certificates.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Firebase Configuration

1.  Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2.  In your project, go to **Project settings** > **General**.
3.  Under "Your apps", create a new **Web app**.
4.  Copy the `firebaseConfig` object provided.
5.  Create a new file named `.env.local` in the root of this project.
6.  Add the configuration values to your `.env.local` file, prefixing each key with `NEXT_PUBLIC_`:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
    ```

7.  In the Firebase Console, go to **Authentication** > **Sign-in method** and enable the **Email/Password** provider.
8.  Create at least one admin user (e.g., `admin@example.com`) and one trainee user (e.g., `trainee@example.com`).

### Genkit (AI) Configuration

1.  In the Google AI Platform Console, enable the **Vertex AI API**.
2.  Create an API key.
3.  Add the API key to your `.env.local` file:
    ```env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    The application requires both the Next.js frontend and the Genkit AI backend to be running.

    - **In your first terminal, run the Next.js app:**
      ```bash
      npm run dev
      ```
      This will start the web application, typically on `http://localhost:9002`.

    - **In a second terminal, run the Genkit development server:**
      ```bash
      npm run genkit:dev
      ```
      This starts the local server that handles the AI flow executions.

## Deployment

This application is configured for easy deployment to **Firebase App Hosting**. Once you have the [Firebase CLI](https://firebase.google.com/docs/cli) installed and configured, you can deploy the application by running the deploy command from your project's root directory.
