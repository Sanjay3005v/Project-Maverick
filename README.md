# Maverick Mindset - AI-Powered Onboarding

Maverick Mindset is a modern, AI-driven platform designed to revolutionize the onboarding experience for new trainees. It provides personalized training plans, progress tracking, and interactive learning modules, all managed through a clean and intuitive interface for both trainees and administrators.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **AI/Generative:** [Genkit (Google's Generative AI Toolkit)](https://firebase.google.com/docs/genkit)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)

## Features

### For Administrators (`/admin/dashboard`)
- **Trainee Management:** View a list of all trainees, their progress, and status from a central database.
- **Progress Monitoring:** At-a-glance dashboard with key metrics like total trainees and average progress.
- **AI-Powered Reporting:** Generate comprehensive performance reports for the entire trainee cohort with a single click.
- **AI Onboarding Planner:** Create personalized onboarding plans for new freshers by providing their profile and a training schedule.
- **Dynamic Quiz Management:** Create and manage quizzes, and designate a "daily quiz" for trainees.

### For Trainees (`/trainee/dashboard`)
- **Personalized Dashboard:** A central hub to view overall progress and access learning modules.
- **AI-Generated Onboarding Plan:** Generate a personalized learning plan tailored to individual skills and company schedules.
- **Interactive Modules:**
    - **Daily Quiz:** Test knowledge with interactive daily quizzes set by the admin.
    - **Coding Challenges:** Sharpen skills with practical coding exercises.
    - **Assignments:** Submit work and track feedback.
    - **Certifications:** View and download earned certificates.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

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

7.  **Enable Authentication:** In the Firebase Console, go to **Authentication** > **Sign-in method** and enable the **Email/Password** provider.
8.  Create at least one admin user (e.g., `admin@example.com`) and one trainee user (e.g., `trainee@example.com`).

9.  **Enable Firestore:** In the Firebase Console, go to the **Firestore Database** section and click **Create database**.
    - Start in **test mode** for initial development. This will allow open access to your database.
    - **Important:** For a production application, you will need to set up [security rules](https://firebase.google.com/docs/firestore/security/get-started) to protect your data.

10. **Add Sample Data (Optional):**
    - Go to your Firestore Database.
    - Create a collection named `trainees`. Add a few documents with fields like `name` (string), `department` (string), `dob` (timestamp), `progress` (number), and `status` (string).
    - Create a collection named `quizzes`. Add documents with fields like `title` (string), `topic` (string), `isDailyQuiz` (boolean), and `questions` (array of objects).

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

## Deployment to Firebase App Hosting

This application is configured for easy deployment to **Firebase App Hosting**. Follow these steps to deploy your application.

### 1. Install and Log in to Firebase CLI
If you haven't already, install the Firebase Command Line Interface and log in.

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize App Hosting in Your Project
From your project's root directory, run the initialization command. This connects your local project to your Firebase project.

```bash
firebase init apphosting
```

- When prompted, select the Firebase project you created earlier.
- You will be asked to choose a backend service name (e.g., `maverick-mindset-backend`).
- When asked for the service account, you can select one or allow it to create one for you.
- For the region, choose the one closest to your users.
- When asked "Set up a GitHub repository for continuous deployment?", you can choose "No" for now to deploy manually.

### 3. Deploy Your Application
After initialization is complete, you can deploy the application with a single command:

```bash
firebase deploy
```

This command will build your Next.js application, bundle it with the server configuration, and deploy it to Firebase App Hosting. Once it's finished, the CLI will provide you with the URL to your live application!
