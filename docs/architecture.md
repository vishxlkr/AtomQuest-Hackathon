# AtomQuest Architecture

```text
Browser (Employee Portal :3000) --\
Browser (Admin Portal :3001)    ----> Express API (:5000) --> MongoDB
                                           |
                                           +--> Nodemailer (SMTP)
                                           +--> Node-cron (scheduled jobs)
```

The backend is a stateless Express REST API. Access tokens are sent as `Authorization: Bearer <token>`, while refresh tokens are stored as httpOnly cookies and hashed in the user document.

Two independent Next.js App Router frontends call the same API:

- `employee-portal` for employees creating goals and logging quarterly achievements, and managers reviewing goals, conducting check-ins, and tracking team progress.
- `admin-portal` for the separate admin interface covering cycles, users, audit logs, reports, analytics, and escalations.

MongoDB collections include users, cycles, goal sheets, goals, check-ins, audit logs, notifications, escalation rules, and escalation logs. Cron jobs run reminder and escalation checks for goal submission, goal approval, and quarterly check-in completion.
