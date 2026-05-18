# AtomQuest Hackathon 1.0

AtomQuest is a full-stack Goal Setting and Tracking Portal for employees, managers, and admins. The project is split into one Express/MongoDB API and two Next.js 14 frontends:

- `employee-portal`: employee and manager workflows for goal sheets, approvals, check-ins, notifications, and team progress.
- `admin-portal`: separate admin interface for users, cycles, audit logs, reports, escalation rules, and organization-level analytics.
- `backend`: authentication, goal management, reporting, notifications, email hooks, scheduled jobs, and escalation APIs.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Frontend | Next.js 14 App Router, React, Tailwind CSS |
| Auth | JWT access tokens, refresh token cookie, bcryptjs, optional Azure AD login |
| Forms and UI | React Hook Form, Zod, Lucide React, React Hot Toast, Recharts |
| HTTP | Axios |
| Jobs and Integrations | node-cron, Nodemailer, optional Teams webhook |

## Project Structure

```text
.
|-- admin-portal/       # Separate Next.js admin portal
|-- backend/            # Express API, models, routes, controllers, jobs
|-- docs/               # Supporting documentation
|-- employee-portal/    # Next.js employee and manager portal
|-- shared/             # Shared project assets or helpers
|-- package.json        # Root scripts for running all apps together
`-- run.sh              # Convenience runner
```

## Local Setup

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB running locally or a MongoDB connection string

### Install Dependencies

```bash
npm install
cd backend && npm install
cd ../employee-portal && npm install
cd ../admin-portal && npm install
cd ..
```

### Configure Environment

Create `backend/.env` from `backend/.env.example`, then update values for your local machine:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/atomquest
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_refresh
JWT_EXPIRES_IN=15m
EMPLOYEE_PORTAL_URL=http://localhost:3000
ADMIN_PORTAL_URL=http://localhost:3001
```

The frontend apps should point to the backend API. Use each portal's `.env.local` for local frontend environment variables.

### Seed Demo Data

```bash
npm run seed
```

### Run Locally

Start all three apps from the repository root:

```bash
npm run dev
```

Default local URLs:

| App | URL |
| --- | --- |
| Backend API | `http://localhost:5000` |
| Employee/Manager Portal | `http://localhost:3000` |
| Admin Portal | `http://localhost:3001` |

The employee and manager roles share the Employee/Manager Portal. Admin users use the separate Admin Portal.

You can also run each app separately:

```bash
npm run backend
npm run employee
npm run admin
```

## Deployed Links

- **Admin Portal**: https://atom-quest-admin.vercel.app/
- **Employee/Manager Portal**: https://atom-quest-emp.vercel.app/
- **Microsoft Teams Channel**: https://teams.cloud.microsoft/l/team/19%3A-ZzFXCk2-LWLh60sLilrxkCEwG1kZge3WTMkEselbqs1%40thread.tacv2/conversations?groupId=d5297cc7-24b4-495d-92e3-5e80a9c48b03&tenantId=bad12864-913e-4b99-87d6-b8d2ad459e27

## Demo Credentials

| Role     | Email                  | Password     |
| -------- | ---------------------- | ------------ |
| Employee | employee@atomquest.com | Employee@123 |
| Manager  | manager@atomquest.com  | Manager@123  |
| Admin    | admin@atomquest.com    | Admin@123    |

## Core Features

- Role-based login for employees, managers, and admins.
- Employee goal-sheet creation, submission, quarterly progress updates, and achievement tracking.
- Manager review flows for approving, returning, updating, and checking in on team goal sheets.
- Admin user management, performance cycles, goal-sheet unlocks, audit logs, dashboards, and org hierarchy.
- Reports for achievement, CSV export, goal distribution, manager effectiveness, analytics, and quarter-over-quarter trends.
- Notifications, email wrapper support, scheduled jobs, escalation rules, and escalation logs.

## Architecture

```text
Employee Portal (:3000) --\
Admin Portal (:3001)    ----> Express API (:5000) --> MongoDB
                                |
                                +--> Nodemailer / SMTP
                                +--> node-cron scheduled jobs
                                +--> Optional Teams webhook
                                +--> Optional Azure AD auth
```

## API Overview

All API routes are mounted under `/api/v1`.

| Module | Main Routes |
| --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/azure/login`, `/auth/azure/callback` |
| Users | `/users/employees` |
| Goals | `/goals/sheets/mine`, `/goals/sheets/team`, `/goals/sheets/:sheetId/submit`, `/goals/sheets/:sheetId/approve`, `/goals/goals`, `/goals/goals/shared` |
| Check-ins | `/checkin/quarterly`, `/checkin/progress`, `/checkin/conduct`, `/checkin/:sheetId/history`, `/checkin/team/status` |
| Admin | `/admin/users`, `/admin/cycles`, `/admin/dashboard`, `/admin/audit-logs`, `/admin/org-hierarchy`, `/admin/goalsheets/:sheetId/unlock` |
| Reports | `/reports/completion-dashboard`, `/reports/achievement`, `/reports/export-csv`, `/reports/analytics`, `/reports/analytics/qoq-trend`, `/reports/analytics/goal-distribution`, `/reports/analytics/heatmap`, `/reports/analytics/managers` |
| Notifications | `/notifications`, `/notifications/read-all`, `/notifications/:id/read` |
| Escalations | `/escalations/rules`, `/escalations/logs`, `/escalations/logs/:id/resolve` |

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run backend, employee portal, and admin portal together |
| `npm run backend` | Run only the Express API |
| `npm run employee` | Run only the employee portal on port 3000 |
| `npm run admin` | Run only the admin portal on port 3001 |
| `npm run seed` | Seed demo data through the backend script |
| `cd backend && npm run start` | Start the backend without nodemon |
| `cd employee-portal && npm run build` | Build the employee portal |
| `cd admin-portal && npm run build` | Build the admin portal |
