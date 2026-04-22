# Gym Logger 🏋️‍♂️

A minimal, mobile-first Progressive Web App (PWA) for logging your gym sessions with speed and precision.

Built for the gym, by lifters who value their time between sets.

## ✨ Features

- **Mobile-First Design**: Optimized for one-handed use with large touch targets.
- **Minimal Taps**: Log a set in under 5 seconds.
- **Optimistic UI**: Instant feedback on all actions, syncing to the cloud in the background.
- **Workout Templates**: Load your favorite routines with a single tap.
- **Progress Tracking**: Full workout history with volume summaries and exercise library.
- **PWA Ready**: Install it on your home screen for a native app experience.
- **Theme Support**: Beautiful light and dark modes that respect your system settings.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Google Auth)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ollimatiskainen/gym_app.git
   cd gym_app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📱 PWA Support

This app is configured as a PWA. To install it:
- **iOS**: Open in Safari, tap the 'Share' button, and select 'Add to Home Screen'.
- **Android**: Open in Chrome, tap the menu icon, and select 'Install app'.

## 📄 License

This project is licensed under the MIT License.
