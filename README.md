# Taskly

Project management system for teams, built with Angular and Supabase.

**Live Demo:** https://managetask-alpha.vercel.app/auth/login

**Repository:** https://github.com/mohanademad643/Managetask

---

## Overview

Taskly helps teams organize work with a clear hierarchy: **Projects, Epics, and Tasks**. Teams can break large goals into manageable pieces, assign ownership, and track progress on a Kanban board.

### Objectives

- Manage multiple projects in one place
- Break down large objectives into epics and tasks
- Assign responsibilities and track progress visually
- Collaborate with team members through invitations

## Preview

<!-- Add screenshots here, for example: -->
<!-- ![Board view](docs/board.png) -->

## Features

### Authentication
- User signup and secure login
- Secure session management
- Forgot password and reset flow

### Project and Epic Management
- Create, edit, and list projects
- Manage epics inside each project, with deadlines and owner assignment
- Hierarchical task organization: Project, Epic, Task

### Team Collaboration
- Invite members by email using a token-based invitation system

### Task Workflow
Each task moves through a defined lifecycle:

```
TO_DO -> IN_PROGRESS -> IN_REVIEW -> READY_FOR_QA -> READY_FOR_PRODUCTION -> DONE
```

Additional states: `BLOCKED` and `REOPENED`.

### Board View
- Kanban board with drag and drop
- Quick task creation directly from any column

### Search
- Search tasks by title

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17 |
| Styling | Tailwind CSS |
| Backend and Database | Supabase (Auth, PostgreSQL) |
| Package Manager | pnpm |
| Code Quality | ESLint, Prettier |

## Getting Started

### Prerequisites

- A [Supabase](https://supabase.com) project
- [pnpm](https://pnpm.io) (it runs on Node.js 18 or higher, which is needed only for the Angular tooling and is not part of the backend)

### Installation

```bash
git clone https://github.com/mohanademad643/Managetask.git
cd Managetask
pnpm install
```

### Configuration

Add your Supabase project URL and public anon key to the Angular environment file in `src/environments/`.

Use only the **anon** key in the frontend. Never commit the service role key.

### Run

```bash
pnpm dev
```

## Author

**Mohannad Emad** - Software Developer (Angular and .NET Core)

- GitHub: https://github.com/mohanademad643
- LinkedIn: https://www.linkedin.com/in/mohannad-emad-eldin-ramadan-499141263/
- Email: mohannad.emad535@gmail.com
- Phone: 01144244060
