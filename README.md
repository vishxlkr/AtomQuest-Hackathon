# AtomQuest Hackathon 1.0

AtomQuest is a full-stack Goal Setting & Tracking Portal for employees, managers, and HR admins. It uses one Express/MongoDB API with two separate Next.js 14 frontends: an Employee Portal and a Manager/Admin Portal.

## Tech Stack used

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Backend         | Node.js, Express.js                               |
| Database        | MongoDB, Mongoose                                 |
| Employee Portal | Next.js 14 App Router, React, Tailwind CSS        |
| Admin Portal    | Next.js 14 App Router, React, Tailwind CSS        |
| Auth            | JWT access tokens, refresh token cookie, bcryptjs |
| HTTP            | Axios                                             |
| Background Jobs | node-cron, Nodemailer                             |

## Local Setup

1. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../employee-portal && npm install
   cd ../admin-portal && npm install
   cd .. && npm install
   ```
2. Start MongoDB locally at `mongodb://localhost:27017/atomquest`.
3. Seed demo data:
   ```bash
   npm run seed
   ```
4. Run all apps:
   ```bash
   npm run dev
   ```

## Demo Credentials

| Role     | Email                  | Password     |
| -------- | ---------------------- | ------------ |
| Employee | employee@atomquest.com | Employee@123 |
| Manager  | manager@atomquest.com  | Manager@123  |
| Admin    | admin@atomquest.com    | Admin@123    |

## Architecture

```text
Browser (Employee Portal :3000) --\
Browser (Admin Portal :3001)    ----> Express API (:5000) --> MongoDB
                                           |
                                           +--> Nodemailer (SMTP)
                                           +--> Node-cron (scheduled jobs)
```

## API Reference

| Module        | Endpoints                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | `POST /api/v1/auth/register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /me`                                                        |
| Goals         | `POST /goals/sheet/create`, `GET /goals/sheet/my`, `POST /goals/sheet/:id/submit`, `PATCH /goals/sheet/:id/approve`, `POST /goals/shared/push` |
| Check-ins     | `PATCH /checkin/quarterly`, `GET /checkin/progress`, `POST /checkin/conduct`, `GET /checkin/team/status`                                       |
| Admin         | `GET /admin/users`, `POST /admin/cycles`, `GET /admin/dashboard`, `GET /admin/audit-logs`, `PATCH /admin/goalsheets/:id/unlock`                |
| Reports       | `GET /reports/achievement`, `GET /reports/export-csv`, `GET /reports/goal-distribution`, `GET /reports/manager-effectiveness`                  |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`                                                         |

## Evaluation Checklist

- [x] Node/Express API scaffold
- [x] Mongoose models and indexes
- [x] JWT authentication
- [x] Goal sheet business rules
- [x] Quarterly check-ins
- [x] Admin APIs
- [x] Reports and CSV export
- [x] Employee Next.js portal
- [x] Manager/Admin Next.js portal
- [x] Notifications, email wrapper, cron jobs
- [x] Bonus analytics page
- [x] Bonus escalation rules
