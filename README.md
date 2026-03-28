# Mein Tagebuch (My Diary)

A modern, secure, and feature-rich diary application built with React, Vite, and Firebase.

## Features
- **Rich Text Diary Entries**: Write and save your daily thoughts.
- **File Uploads**: Attach documents to your diary.
- **AI Summaries**: Generate summaries of your entries using Gemini AI.
- **Cloud Sync**: Real-time synchronization with Firebase Firestore.
- **Local Backup**: Offline support and local caching.
- **PDF & JSON Export**: Export your data easily.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

This project is fully optimized for deployment on Vercel.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Vercel will automatically detect that this is a Vite project.
4. **Important**: Add the following Environment Variables in your Vercel project settings:
   - `GEMINI_API_KEY`: Your Google Gemini API Key (required for AI features).
5. Click **Deploy**.

### SPA Routing
The included `vercel.json` file ensures that client-side routing works correctly on Vercel by rewriting all requests to `index.html`.

## Firebase Configuration
Your Firebase configuration is stored in `firebase-applet-config.json`. Since these are public client keys, they can be safely committed to your repository. However, ensure your Firestore Security Rules (`firestore.rules`) are properly deployed to protect your data.
