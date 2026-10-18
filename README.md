# 🌐 LingoSphere — Web Learning Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Interactive-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**An intelligent, immersive, and gamified language learning web platform designed to elevate English proficiency through AI mentoring and full-length TOEIC simulations.**

[Live Web Platform](https://lingosphere.online) • [Admin Console](https://admin.lingosphere.online) • [API Service](https://api.lingosphere.online)

</div>

---

## 📖 Overview

**LingoSphere Web** is the primary learner-facing application of the LingoSphere ecosystem. Engineered with **Next.js 16 (App Router)** and **React 19**, it blends cutting-edge web technologies, interactive 3D physics graphics, and real-time synchronization to deliver an engaging, gamified educational journey.

From diagnostic assessments and full-length timed **TOEIC simulations** to conversational **AI tutoring** and spaced repetition vocabulary drills, LingoSphere Web offers learners a complete, structured pathway from beginner to professional fluency.

---

## ✨ Key Features

- **🎯 Official TOEIC Test Simulator**:
  - Full-length and mini-tests adhering to official TOEIC formats (Listening Parts 1–4 and Reading Parts 5–7).
  - High-fidelity audio playback, synchronized transcripts, passage side-by-side reading, and automated score projection with comprehensive answer breakdowns.
- **🤖 AI-Driven Mentorship & Learning**:
  - Interactive conversational AI practice to simulate real-world English communication.
  - Real-time sentence correction, context-aware grammatical explanations, and tailored study recommendations.
- **🎥 Adaptive Video Learning**:
  - HLS adaptive bitrate streaming powered by `hls.js` and Cloudflare R2 for crystal-clear video lectures.
  - Interactive lecture player featuring timestamped bookmarks, note-taking, and resource downloads.
- **🃏 Spaced Repetition Vocabulary (SRS)**:
  - Scientific flashcard review algorithm designed to optimize long-term lexical retention.
  - IPA phonetics, native speaker pronunciation playback, and contextual example sentences.
- **🏆 Gamification, Streaks & Leaderboards**:
  - Dynamic XP awards, consecutive daily study streaks, milestone badges, and real-time competitive leaderboards.
- **🎨 Immersive 3D Interactive Visuals**:
  - WebGL/3D hero scenes and celebratory effects created with **Three.js**, **React Three Fiber (@react-three/fiber)**, and **Rapier Physics (@react-three/rapier)**.
- **💬 Social Community & Study Groups**:
  - Collaborative study forums, question discussions, peer solutions, and real-time notifications via **Socket.io**.
- **💳 Subscriptions & Cart Checkout**:
  - Streamlined course enrollment and premium tier upgrades with transparent cart and checkout workflows.
- **📊 Behavioral Telemetry**:
  - Integrated product analytics via **PostHog** for user experience optimization and learning curve analysis.

---

## 🛠️ Tech Stack & Architecture

| Category | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Route Handlers) |
| **Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **3D & Graphics** | [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/rapier](https://github.com/pmndrs/react-three-rapier) + `ogl` + `meshline` |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI Primitives](https://www.radix-ui.com/) + [Ant Design 6](https://ant.design/) |
| **Data Fetching** | [TanStack React Query v5](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/) |
| **Realtime Engine** | [Socket.io Client](https://socket.io/) |
| **Animations** | [Motion (Framer Motion v13)](https://motion.dev/) + `tw-animate-css` |
| **Auth & Social Login** | JWT Bearer Tokens + [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) |
| **Analytics & Telemetry** | [PostHog](https://posthog.com/) (`posthog-js`) |
| **Internationalization** | [i18next](https://www.i18next.com/) + `react-i18next` |

---

## 📁 Project Structure

```text
frontend-web/
├── public/                 # Static public assets, audio files, icons, and 3D models
├── src/
│   ├── app/                # Next.js App Router root
│   │   ├── (auth)/         # Sign-in, Sign-up, Forgot password, Google callback
│   │   ├── (courses)/      # Course catalog, Lecture player, Curriculum details
│   │   ├── (portal)/       # User profile, Dashboard, Settings, Upgrades
│   │   ├── (study)/        # TOEIC simulation test rooms, Practice modules, Flashcards
│   │   ├── layout.tsx      # Root application layout with theme and query providers
│   │   ├── page.tsx        # Immersive 3D interactive landing page
│   │   ├── robots.ts       # Automated SEO robots configuration
│   │   └── sitemap.ts      # Dynamic sitemap generator
│   ├── components/         # Reusable UI primitives (Buttons, Navbars, Dialogs, Cards)
│   ├── config/             # Application environment and API constants
│   ├── contexts/           # Global context providers (AuthContext, SocketContext)
│   ├── features/           # Domain-driven feature implementations
│   │   ├── ai-learning/    # AI tutor conversation room and feedback loop
│   │   ├── auth/           # Authentication state, login modals, OAuth flow
│   │   ├── cart/           # Shopping cart and checkout state
│   │   ├── community/      # Q&A forums, discussions, and thread voting
│   │   ├── courses/        # Video player, course outline, and resources
│   │   ├── dashboard/      # Daily streak tracking, progress summaries, agenda
│   │   ├── landing/        # Interactive 3D hero components and promotional sections
│   │   ├── leaderboard/    # Global and weekly learner ranking ladders
│   │   ├── notes/          # Personal student bookmarks and notes
│   │   ├── notifications/  # Live in-app alerts and notifications
│   │   ├── practice/       # Quick quizzes, fill-in-the-blank, and grammar drills
│   │   ├── progress/       # Mastery charts and learning path trackers
│   │   ├── settings/       # Account preferences, notifications, language settings
│   │   ├── toeic/          # Full 200-question timed TOEIC exam simulator
│   │   ├── upgrade/        # Subscription tiers, benefits, and checkout
│   │   ├── user/           # User bio, public profile, and study stats
│   │   └── vocabulary/     # SRS flashcard deck and word list manager
│   ├── hooks/              # Custom application hooks (useAuth, useSocket, useTimer)
│   ├── i18n/               # Multi-language dictionary files
│   ├── layouts/            # Page layouts (Header, Footer, Study Navigation)
│   ├── lib/                # Axios instance with interceptors, token helpers, audio helpers
│   ├── providers/          # QueryClientProvider, AuthProvider, PostHogProvider
│   ├── services/           # Typed API service clients communicating with the API Gateway
│   ├── store/              # Global client-side stores
│   ├── styles/             # Global CSS definitions
│   ├── types/              # Domain TypeScript types and API contracts
│   └── utils/              # Calculation helpers, score tables, date utilities
├── .env.example            # Environment variables blueprint
├── next.config.ts          # Next.js compiler and security headers configuration
├── package.json            # Dependencies and npm run scripts
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+), `yarn`, or `pnpm`

### 1. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/your-org/lingo-sphere.git
cd lingo-sphere/frontend-web
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root of `frontend-web` based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the environment variables:

```env
# Public API Gateway Endpoint
NEXT_PUBLIC_API_BASE_URL=https://api.lingosphere.online

# Admin Portal URL (for administrative redirection)
NEXT_PUBLIC_ADMIN_WEB_URL=https://admin.lingosphere.online

# Google OAuth Client ID (for Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Server configuration
NODE_ENV=development
PORT=5174
```

### 3. Launch Development Server

Start Next.js in development mode:

```bash
npm run dev
```

Visit the application in your browser at: `http://localhost:5174`.

---

## 📦 Scripts & Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port `5174`. |
| `npm run build` | Compiles and builds the production-ready application bundle. |
| `npm run start` | Boots the Next.js production server on port `5174`. |
| `npm run lint` | Runs Next.js ESLint verification across all source files. |

---

## 🌐 Deployment

The web frontend is deployed seamlessly on **Vercel**:
- Automatic production deployments trigger on every commit pushed to the `main` branch.
- Server-side rendering (SSR), incremental static regeneration (ISR), and Next.js Route Handlers run optimally on Vercel's Edge and Serverless Network.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

<div align="center">
  <sub>Built with ❤️ by the LingoSphere Engineering Team.</sub>
</div>
