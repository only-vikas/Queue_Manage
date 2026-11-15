# Queue_Manage

# QueueOS — Rugas Technologies Queue Management System

A high-performance, real-time Queue Management System built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB Atlas (Mongoose), and JOSE JWT authentication following the Swiss Triage design system.

## Features
- **Swiss Triage Interface**: Clean, zero-fluff 44–48px rows, 1px hairlines, and Signal Vermilion operational focus.
- **Queue Workspace**: Real-time waiting line with gap-indexed positioning (`1000, 2000, 3000...`), instant reordering (`UP` / `DOWN`), quick-add bar, and active serving banner with live timer.
- **Atomic Operations**: MongoDB `$inc` token counters and transactional promote/complete flows.
- **Analytics & Triage Metrics**: Aggregated `$facet` pipeline reporting average wait times, throughput, cancellation rates, and hourly volume trends.
- **Secure Authentication**: Manager workspace management with `bcryptjs` password hashing and `httpOnly` JWT cookies via `jose`.

## Getting Started

1. Set up your environment in `.env.local`:
```env
MONGODB_URI="your-mongodb-atlas-uri"
JWT_SECRET="your-jwt-secret"
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the desk.
