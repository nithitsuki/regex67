# Regex67

A regex learning platform for classrooms. Teachers create classes with regex challenges; students solve them in linear order.

Built with Vite + React + TypeScript + Tailwind CSS + shadcn/ui + Supabase.

## Features

- **Username-only auth** — no passwords or emails required
- **Teacher dashboard** — create classes, author regex levels, track student progress
- **Student dashboard** — join classes, solve levels in linear order
- **Two challenge types:**
  - **Match challenges** — write a regex pattern to match (or not match) given strings with live highlighting
  - **Find & Replace challenges** — use find and replace in a Monaco Editor buffer to transform text to a required format
- **Regex cheatsheet** — quick reference for common regex patterns
- **Progress tracking** — per-class, per-student level completion with a histogram

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.2
- A [Supabase](https://supabase.com/) project

### Setup

```bash
git clone https://github.com/nithitsuki/regex67.git
cd regex67
bun install
```

### Environment

Copy `.env` to the project root (already provided — contains your Supabase project keys):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

### Database

1. Go to your Supabase project dashboard → **SQL Editor**
2. Paste and run `supabase-schema.sql`
3. Enable **Anonymous sign-ins** in **Auth > Settings** ("Allow anonymous sign-ins")

### Run

```bash
bun run dev
```

### Making Yourself a Teacher

Log in with your username, then run this in the Supabase SQL Editor:

```sql
update profiles set is_teacher = true where username = 'your-username';
```

Refresh the page — you'll see the Teacher Dashboard.

## Usage

### Teacher

1. Log in with any username
2. Click **Create Class**, give it a name
3. Click **Manage** on the class, go to the **Levels** tab
4. Click **Seed 13 sample levels** to auto-create the challenges
5. Go back and **Enable** the class so students can see it
6. The **Progress** tab shows a completion histogram per level

### Student

1. Log in with any username
2. Available enabled classes are listed — click **Join Class**
3. Solve levels in order (must pass level 1 to unlock level 2, etc.)
4. Click **Cheatsheet** anytime for a regex reference

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Vite + React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| UI Library | shadcn/ui (Base UI) |
| Editor | Monaco Editor |
| Backend | Supabase (Postgres + Auth) |
| Regex Engine | XRegExp |
| State | Zustand |
| Markdown | react-markdown + remark-gfm |
| Package Manager | Bun |

## Project Structure

```
src/
  components/
    ui/           shadcn components
    LoginScreen.tsx
    StudentDashboard.tsx
    TeacherDashboard.tsx
    LevelList.tsx
    LevelChallenge.tsx     match-type challenge
    FindReplaceChallenge.tsx  find+replace challenge
    Cheatsheet.tsx
  utils/
    supabase.ts   Supabase client
    regex.ts      XRegExp helpers
  store.ts        Zustand state
  levels.ts       Sample level definitions
  types.ts        TypeScript interfaces
  App.tsx         Root component
```
