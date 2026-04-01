# 🎯 Interview Questions – Admission Management & CRM Project

> **Target Level:** 1 Year Experience | **Project:** Full-stack Admission CRM  
> **Tech Stack:** React · Node.js · Express · MongoDB · Redis · Docker · TypeScript

---

## 📋 Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Backend – Node.js, Express & API Design](#2-backend--nodejs-express--api-design)
3. [Database – MongoDB & Mongoose](#3-database--mongodb--mongoose)
4. [Redis & Distributed Locking](#4-redis--distributed-locking)
5. [Authentication & Security](#5-authentication--security)
6. [Frontend – React, State Management & UI](#6-frontend--react-state-management--ui)
7. [DevOps – Docker, CI/CD & Deployment](#7-devops--docker-cicd--deployment)
8. [Problem-Solving & Scenario-Based](#8-problem-solving--scenario-based)
9. [AI Tools & Development Workflow](#9-ai-tools--development-workflow)
10. [Behavioral & Soft Skills](#10-behavioral--soft-skills)

---

## 1. Project Overview & Architecture

### Q1. Can you give a brief overview of your project?
> **Answer Hint:** It's a full-stack Admission Management & CRM system that manages the entire student admission lifecycle — from master configuration (Institution → Campus → Department → Program) to applicant registration, atomic seat allocation with quota compliance (KCET, COMEDK, Management), fee tracking, document verification, and real-time dashboard monitoring.

### Q2. What is the overall architecture of your application?
> **Answer Hint:** It's a classic 3-tier architecture:
> - **Frontend:** React SPA (Vite + TypeScript) deployed on Vercel
> - **Backend:** Node.js + Express REST API deployed on Render
> - **Database Layer:** MongoDB Atlas for persistence + Redis for caching, distributed locks, and atomic counters
> - **Infra:** Docker Compose for local development with Nginx as reverse proxy

### Q3. Why did you choose this tech stack (React, Node, MongoDB, Redis)?
> **Answer Hint:** React for its component-based architecture and ecosystem (TanStack Query for server state). Node.js + Express for fast JSON API development. MongoDB because the admission domain has semi-structured, nested data (quotas inside programs). Redis for solving the **concurrent seat allocation** problem with distributed locks.

### Q4. What are the main modules in your application?
> **Answer Hint:** 4 main modules —
> 1. **Master Setup** (Admin only): Institution, Campus, Department, Program CRUD
> 2. **Applicant Management**: Create, list, filter, search applicants
> 3. **Seat Allocation & Admission Workflow**: Applied → Seat Locked → Confirmed/Cancelled
> 4. **Dashboard**: Real-time analytics — intake vs admitted, quota matrix, fee/doc pending lists

### Q5. Can you walk me through the admission workflow (state machine)?
> **Answer Hint:** `Applied` → (allocate seat with Redis lock) → `Seat_Locked` → (pay fee + verify docs) → `Confirmed`. At any point before confirmation, it can be `Cancelled` (which releases the seat back). Confirmation generates an immutable admission number using Redis INCR.

---

## 2. Backend – Node.js, Express & API Design

### Q6. How did you structure your backend? Explain the folder structure.
> **Answer Hint:** MVC-like pattern: `config/` (DB, Redis), `models/` (Mongoose schemas), `routes/` (Express route handlers — acting as controllers), `services/` (business logic like seat allocation), `middleware/` (auth, RBAC, rate limiter, error handler), `utils/` (admission number generator, logger), `validators/`.

### Q7. Why did you put business logic directly in the routes instead of separate controllers?
> **Answer Hint:** For a project of this size, it kept things simpler and reduced indirection. In a larger project, I would extract the handlers into separate controller files to follow the Single Responsibility Principle.

### Q8. Explain how your error handling middleware works.
> **Answer Hint:** It's a centralized Express error handler that catches different error types — `ValidationError` (422), `CastError` (404 for invalid MongoDB IDs), `JsonWebTokenError` (401). It also hides the stack trace in production and logs every error using Winston.

### Q9. What is `express-mongo-sanitize` and why did you use it?
> **Answer Hint:** It prevents **NoSQL Injection attacks** by stripping MongoDB operators like `$gt`, `$ne` from `req.body` and `req.params`. Without it, an attacker could send `{"email": {"$ne": ""}}` to bypass authentication.

### Q10. Why did you set `app.set('trust proxy', 1)`?
> **Answer Hint:** When deployed behind a reverse proxy (Render, Heroku, Nginx), Express can't see the real client IP by default. This setting tells Express to trust the first entry of `X-Forwarded-For` header, which is essential for `express-rate-limit` to work correctly per-client.

### Q11. Explain the purpose of the health check endpoint.
> **Answer Hint:** `GET /api/health` returns a 200 OK if the server is running. It's used by deployment platforms (Render/Docker) to monitor uptime and for load balancers to check service health.

### Q12. What is graceful shutdown and why did you implement it?
> **Answer Hint:** On receiving `SIGTERM` (sent by cloud platforms during redeploy/scale-down), the server stops accepting new connections, finishes in-flight requests, and then exits cleanly. This prevents dropped connections and data corruption.

### Q13. How does your auto-seed logic work in `server.ts`?
> **Answer Hint:** After connecting to MongoDB, it checks `User.countDocuments()`. If zero (empty database — common on Render free tier which clears disk), it calls `runSeed()` to populate default admin/officer users and sample data. This makes the demo always work even after cold starts.

---

## 3. Database – MongoDB & Mongoose

### Q14. Explain your Mongoose schema design for the Program model.
> **Answer Hint:** The Program model has a **nested subdocument array** `quotas[]` (with `quotaType`, `seats`, `filled`), references to Institution/Campus/Department via `ObjectId`, a **virtual field** `availableSeats`, and a **pre-save hook** that validates `sum(quota.seats) === totalIntake`.

### Q15. What are Mongoose virtuals and where did you use them?
> **Answer Hint:** Virtuals are computed properties not stored in the DB. I used `availableSeats` on the Program model which calculates `totalIntake - sum(filled)` on-the-fly. Enabled via `toJSON: { virtuals: true }`.

### Q16. What are Mongoose pre-save hooks and where did you use them?
> **Answer Hint:** Two places:
> 1. **User model:** Hashes the password with bcrypt before saving (only if `password` is modified)
> 2. **Program model:** Validates that the sum of all quota seats equals the total intake — enforcing data integrity at the model level.

### Q17. Why did you set `select: false` on the password field in the User model?
> **Answer Hint:** It prevents the password hash from being included in query results by default. You must explicitly opt-in with `.select('+password')` when needed (like during login). This is a security best practice.

### Q18. Explain the `immutable: true` option on `admissionNumber`.
> **Answer Hint:** Once an admission number is generated and saved, it cannot be modified — even by an admin. This ensures audit-trail integrity and is a requirement for official academic records.

### Q19. You have `sparse: true` and `unique: true` on `admissionNumber`. Why both?
> **Answer Hint:** `unique: true` ensures no two applicants get the same admission number. `sparse: true` allows multiple documents to have `null/undefined` for this field (since only confirmed students get an admission number). Without sparse, all `null` values would violate the unique constraint.

### Q20. What indexes did you create and why?
> **Answer Hint:** 
> - `Applicant: { program: 1, status: 1 }` — optimizes the most common query (list applicants filtered by program and status)
> - `Program: { institution: 1, academicYear: 1 }` — speeds up program lookups per institution per year

### Q21. Explain the `$or` query you used for search functionality.
> **Answer Hint:** When a user searches, I search across multiple fields simultaneously: `firstName`, `lastName`, `email`, and `admissionNumber` using `$regex` with case-insensitive flag `$options: 'i'`. MongoDB evaluates all conditions and returns documents matching any.

### Q22. How does the MongoDB aggregation pipeline work in your dashboard?
> **Answer Hint:** I used `Applicant.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])` to get the count of applicants grouped by their status (Applied, Seat_Locked, Confirmed, Cancelled). This runs server-side in MongoDB and is more efficient than fetching all records.

---

## 4. Redis & Distributed Locking

### Q23. Why did you choose Redis for this project?
> **Answer Hint:** Three reasons:
> 1. **Distributed Locking** — prevents two officers from allocating the same seat simultaneously
> 2. **Atomic Counters** — `INCR` for generating sequential admission numbers
> 3. **Token Blacklisting** — invalidating JWT tokens on logout
> 4. **Caching** — caching seat counts with a 60-second TTL

### Q24. Explain how the Redis distributed lock works in seat allocation.
> **Answer Hint:** I use `SET lockKey "1" EX 10 NX` — this atomically creates a key only if it doesn't exist (`NX`) with a 10-second expiry (`EX`). If the key already exists, `SET NX` returns `null`, meaning another process holds the lock, so we throw "System busy, please retry". The lock is released in the `finally` block with `DEL`.

### Q25. What does `NX` mean in the Redis SET command?
> **Answer Hint:** `NX` = "Set if Not eXists". It's the foundation of Redis-based mutual exclusion. Only the first request gets the lock; others fail immediately.

### Q26. What happens if the server crashes while holding the lock?
> **Answer Hint:** The `EX 10` sets a 10-second TTL, so even if the server crashes and never releases the lock, Redis auto-expires it after 10 seconds. This prevents permanent deadlocks.

### Q27. How does Redis `INCR` help with admission number generation?
> **Answer Hint:** `INCR` atomically increments a counter stored per combination of institution, program, quota, and year. Even under high concurrency, each call gets a unique sequential number. The counter key format is `admno:INST:CSE:KCET:2026`.

### Q28. How are you caching seat data in Redis?
> **Answer Hint:** After each allocation, I cache the updated quota array with `SET seats:{programId} JSON EX 60`. This 60-second cache helps reduce DB reads for the dashboard's seat availability display.

### Q29. What is token blacklisting and how did you implement it?
> **Answer Hint:** When a user logs out, their JWT token is stored in Redis with key `blacklist:{token}` and a 1-hour TTL. On every authenticated request, the auth middleware checks Redis for this key. If found, the token is rejected even though it hasn't expired.

---

## 5. Authentication & Security

### Q30. Explain your JWT authentication flow.
> **Answer Hint:** 
> 1. **Login:** User sends email/password → server validates → generates `accessToken` (15min) and `refreshToken` (7 days) → both sent to client
> 2. **Request:** Client attaches `Authorization: Bearer {accessToken}` on every API call
> 3. **Refresh:** When access token expires, client sends refresh token to `POST /auth/refresh` to get a new access token
> 4. **Logout:** Access token is blacklisted in Redis

### Q31. Why two tokens (access + refresh)?
> **Answer Hint:** Access tokens are short-lived (15min) for security — if stolen, damage is limited. Refresh tokens are long-lived (7 days) for UX — users don't have to login repeatedly. The refresh token silently gets a new access token when needed.

### Q32. How does your Axios interceptor handle token refresh automatically?
> **Answer Hint:** The response interceptor catches `401` errors. If it's not a login request and we haven't already retried, it sends the refresh token to get a new access token, updates localStorage, and retries the original request. If refresh fails, it redirects to `/login`.

### Q33. How does your RBAC (Role-Based Access Control) work?
> **Answer Hint:** The `authorize(...roles)` middleware is a higher-order function that returns a middleware. It checks `req.user.role` (set by the auth middleware) against the allowed roles array. For example, `authorize('admin')` on master routes means only admins can manage institutions/programs.

### Q34. What security headers does Helmet set?
> **Answer Hint:** Helmet sets headers like `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-XSS-Protection`, etc. These prevent common web attacks like clickjacking, MIME sniffing, and XSS.

### Q35. Explain your rate limiting strategy.
> **Answer Hint:** Three different limiters:
> - **General:** 100 requests / 15 min (covers all API routes)
> - **Auth:** 10 requests / 15 min (stricter for login to prevent brute force)
> - **Seat allocation:** 30 requests / 1 min (prevents abuse of the locking mechanism)

### Q36. How does bcrypt password hashing work?
> **Answer Hint:** `bcrypt.genSalt(10)` generates a random salt with cost factor 10 (2^10 = 1024 iterations). `bcrypt.hash(password, salt)` produces a one-way hash. During login, `bcrypt.compare(input, hash)` re-hashes the input with the stored salt and compares. The salt is embedded in the hash string itself.

---

## 6. Frontend – React, State Management & UI

### Q37. Why did you use TanStack Query instead of plain `useEffect` + `useState`?
> **Answer Hint:** TanStack Query handles **server state** (caching, background refetching, deduplication, pagination, stale-while-revalidate). With `useEffect`, I'd need to manually manage loading states, caching, error states, and refetch logic. TanStack Query does it all declaratively.

### Q38. How does `refetchInterval: 10000` work on the dashboard?
> **Answer Hint:** TanStack Query automatically re-fetches the dashboard stats every 10 seconds, providing near-real-time updates without WebSockets. The UI updates seamlessly because React Query manages the cache diff.

### Q39. Explain the `useMutation` pattern in ApplicantDetail.
> **Answer Hint:** Each action (update docs, toggle fee, allocate seat, confirm, cancel) is a `useMutation`. On success, I call `queryClient.invalidateQueries({ queryKey: ['applicant', id] })` which refetches the applicant data, keeping the UI in sync with the server without manual state management.

### Q40. How did you implement protected routes?
> **Answer Hint:** A `PrivateRoute` wrapper component checks `isAuthenticated` from `AuthContext`. If not authenticated, it redirects to `/login`. It also checks `roles` — if a route requires `['admin']` and the user is an officer, it shows an "Unauthorized" page.

### Q41. Explain your AuthContext implementation.
> **Answer Hint:** It's a React Context that provides `user`, `loading`, `isAuthenticated`, `login()`, and `logout()`. On mount, it calls `/auth/me` with the stored token to validate the session. Login stores tokens in `localStorage` and sets the user state. Logout clears everything and redirects.

### Q42. Why did you store tokens in localStorage? What are the trade-offs?
> **Answer Hint:** **Pros:** Simple, persists across tabs/page refreshes. **Cons:** Vulnerable to XSS attacks (JavaScript can read localStorage). A more secure alternative is HTTP-only cookies (can't be read by JS), but those bring CSRF complexity. For this project scope, localStorage with short-lived access tokens + refresh flow is acceptable.

### Q43. How did you handle form validation?
> **Answer Hint:** Using `react-hook-form` with `zod` for schema-based validation via `@hookform/resolvers`. Zod defines the validation schema (required fields, email format, marks range), and react-hook-form connects it to form inputs with real-time error messages.

### Q44. What is Recharts and how did you use it?
> **Answer Hint:** Recharts is a React charting library built on D3. I used `BarChart` for the program-wise quota matrix (KCET/COMEDK/Management per program) and `PieChart` (donut style with `innerRadius`) for admission status distribution on the dashboard.

### Q45. How does the admission workflow UI update in real-time?
> **Answer Hint:** The `ApplicantDetail` page has a visual **step timeline** (Applied → Seat Locked → Fees & Docs → Confirmed). Each action triggers a mutation → invalidates the query → re-fetches applicant data → React re-renders with updated step statuses. The UI is driven entirely by the server state.

### Q46. How do you handle the conditional rendering for Government vs. Management quota?
> **Answer Hint:** Government quotas (KCET/COMEDK) require an allotment number before seat allocation. The UI conditionally shows an allotment number input field when `quotaType` is KCET or COMEDK, and the allocate button is disabled until the allotment number is filled.

---

## 7. DevOps – Docker, CI/CD & Deployment

### Q47. Explain your Docker Compose setup.
> **Answer Hint:** 5 services: `mongo` (MongoDB 7), `redis` (Redis 7 Alpine with append-only persistence), `backend` (Node.js with hot-reload volume mount), `frontend` (multi-stage build → Nginx serving static files), `nginx` (reverse proxy). Volumes for data persistence.

### Q48. What is a multi-stage Docker build and where did you use it?
> **Answer Hint:** In the frontend Dockerfile: Stage 1 (`build-stage`) uses Node.js to install deps and run `npm run build`. Stage 2 copies only the built `dist/` folder into an Nginx image. This keeps the production image tiny (no node_modules, no source code).

### Q49. How is your application deployed in production?
> **Answer Hint:** Frontend on **Vercel** (auto-deploys from GitHub, SPA routing via `vercel.json` rewrites) and Backend on **Render** (Docker-based deployment, connects to MongoDB Atlas and Redis Cloud).

### Q50. What is the purpose of `vercel.json` rewrites?
> **Answer Hint:** `{ "source": "/(.*)", "destination": "/index.html" }` ensures that all routes are handled by `index.html` (React Router). Without this, refreshing on `/applicants/123` would return a 404 because Vercel looks for a physical file at that path.

### Q51. How do volumes work in your Docker Compose?
> **Answer Hint:** Named volumes `mongo_data` and `redis_data` persist data across container restarts. The backend bind mount (`./backend:/app`) enables hot-reloading during development. The `/app/node_modules` anonymous volume prevents the host mount from overwriting container's node_modules.

---

## 8. Problem-Solving & Scenario-Based

### Q52. What happens if two officers try to allocate the last seat to different students at the same time?
> **Answer Hint:** Redis distributed lock prevents this. The first request acquires the lock (`SET NX`), checks quota availability, updates the seat count, and releases the lock. The second request fails to acquire the lock and gets a "System busy, please retry" error. **No overbooking is possible.**

### Q53. What if the server crashes between incrementing the seat count and updating the applicant?
> **Answer Hint:** This is a valid concern — the seat count would be incremented but the applicant wouldn't be updated. Currently, this could lead to a "phantom seat" being reserved. A solution would be to use **MongoDB transactions** (multi-document ACID) or implement a compensating transaction/saga pattern.

### Q54. How would you scale this application to handle 10,000 concurrent seat allocations?
> **Answer Hint:** 
> 1. Multiple backend instances behind a load balancer (Redis lock already works across instances)
> 2. Redis Cluster for high availability
> 3. MongoDB replica set with read replicas for dashboard queries
> 4. Queue-based seat allocation (Bull/BullMQ with Redis) instead of synchronous processing
> 5. Connection pooling for MongoDB

### Q55. If you had to add real-time notifications (e.g., "Seat allocated"), how would you do it?
> **Answer Hint:** Use **WebSocket** (via Socket.io) or **Server-Sent Events (SSE)**. After a seat allocation, emit an event to connected admin clients. TanStack Query's `refetchInterval` is a simpler polling alternative that I'm already using.

### Q56. How would you implement pagination differently for large datasets?
> **Answer Hint:** Current implementation uses **offset-based** pagination (`skip/limit`). For large datasets, **cursor-based** pagination (using `_id` or `createdAt` as cursor) is more efficient because `skip(N)` scans and discards N documents. Cursor-based is O(1).

### Q57. What if a student's admission is confirmed but their fee payment bounces the next day?
> **Answer Hint:** Currently, once confirmed, the status can't revert (admissionNumber is immutable). I would add a separate `paymentStatus` field and an "admission revocation" flow that marks the admission as `Revoked`, releases the seat, and soft-deletes the admission number for audit.

### Q58. How would you add file upload for document verification?
> **Answer Hint:** Use **Multer** middleware for file handling on the backend. Store files in a cloud service like **AWS S3** or **Cloudinary**. Save the file URL in the `documentStatus` object. Add file size/type validation and virus scanning.

### Q59. Your rate limiter uses in-memory store. What's the problem in production?
> **Answer Hint:** With multiple backend instances, each instance has its own counter. A user could hit Instance A's limit and then switch to Instance B, getting a fresh limit. The fix is to use a **Redis-based rate limit store** (`rate-limit-redis`), which is already in my dependencies.

---

## 9. AI Tools & Development Workflow

### Q60. How do you use AI tools in your development workflow?
> **Answer Hint:** I use AI assistants for: code scaffolding, debugging TypeScript errors, understanding library APIs (e.g., TanStack Query v5 migration from `isLoading` to `isPending`), generating boilerplate (Dockerfile, docker-compose), reviewing code for security issues, and brainstorming architectural decisions.

### Q61. Can you give an example where AI helped you solve a specific bug?
> **Answer Hint:** When upgrading to TanStack Query v5, mutations no longer had `isLoading` — it was renamed to `isPending`. The TypeScript error was unclear. AI helped identify the breaking change and I updated all mutation loading states across `ApplicantDetail.tsx` and `MasterSetup.tsx`.

### Q62. How do you verify that AI-generated code is correct?
> **Answer Hint:** I always: (1) read and understand the generated code, (2) check it against official documentation, (3) test it manually, (4) review edge cases, and (5) run TypeScript compilation to catch type issues. I never blindly copy-paste.

### Q63. What are the risks of using AI for coding?
> **Answer Hint:** Hallucinated APIs (functions that don't exist), outdated patterns (using deprecated features), security vulnerabilities (missing input validation), and over-reliance that stunts learning. The developer must always be the final reviewer.

### Q64. How do you decide when to use AI vs. when to code manually?
> **Answer Hint:** I use AI for: repetitive boilerplate, debugging, exploring unfamiliar APIs. I code manually for: core business logic (like the seat allocation flow), security-sensitive code, and any logic I need to deeply understand for maintenance.

---

## 10. Behavioral & Soft Skills

### Q65. What was the most challenging part of building this project?
> **Answer Hint:** Implementing the **atomic seat allocation** with Redis distributed locking. Understanding the race condition problem, choosing the right locking strategy (`SET NX EX`), and ensuring the lock is always released (even on errors via `finally`) was the most intellectually challenging part.

### Q66. If you had more time, what would you improve?
> **Answer Hint:**
> - Add unit and integration tests (Jest + Supertest)
> - Implement WebSocket for true real-time updates
> - Add proper file upload for document verification
> - Implement forgot password flow
> - Add audit logging for all admin actions
> - Use MongoDB transactions for seat allocation atomicity

### Q67. How do you approach debugging a production issue?
> **Answer Hint:** Check **Winston logs** (error.log, combined.log) first. Reproduce locally if possible. Use the health endpoint to verify service status. Check Render/Vercel deployment logs. Use `morgan` HTTP logs to trace the request flow. Check Redis and MongoDB connectivity.

### Q68. How do you handle scope creep or changing requirements?
> **Answer Hint:** I prioritize requirements using MoSCoW (Must have, Should have, Could have, Won't have). I build the core workflow first, then iterate. For example, I built the basic CRUD first, then layered Redis locking, then added analytics dashboard.

### Q69. Describe a time you had to learn a new technology quickly.
> **Answer Hint:** Redis was new to me. I learned about SET NX (distributed locking), INCR (atomic counters), and key expiry within a few days by reading the Redis documentation and building small proof-of-concepts before integrating it into the seat allocation service.

### Q70. How do you ensure code quality in your projects?
> **Answer Hint:** TypeScript for type safety, ESLint for code style, meaningful variable names, separation of concerns (services/middleware/routes), centralized error handling, and Winston logging. I also do self-code-review before committing.

---

## 🔥 Rapid-Fire Questions (Quick Answer Expected)

| # | Question | Answer Hint |
|---|----------|-------------|
| 71 | What is CORS? | Cross-Origin Resource Sharing — allows frontend (Vercel) to call backend (Render) API on a different domain |
| 72 | Difference between `PUT` and `PATCH`? | PUT replaces the entire resource, PATCH modifies specific fields |
| 73 | What is a JWT? | JSON Web Token — a compact, self-contained token with payload (user ID, role) signed by the server |
| 74 | What is middleware in Express? | Functions that execute between request and response — for auth, logging, rate limiting, error handling |
| 75 | What is `useContext`? | React hook that reads value from a Context provider without prop drilling |
| 76 | What is `populate()` in Mongoose? | Replaces ObjectId references with actual document data (like a JOIN in SQL) |
| 77 | Difference between `useQuery` and `useMutation`? | `useQuery` is for GET/read operations; `useMutation` is for POST/PUT/DELETE write operations |
| 78 | What is Docker? | Platform that packages apps + dependencies into lightweight, portable containers |
| 79 | What is `npm run build` doing in your frontend? | `tsc` (TypeScript compile) + `vite build` (bundles, tree-shakes, minifies into `/dist`) |
| 80 | What is Nginx? | A high-performance web server used as reverse proxy and static file server |
| 81 | What is the purpose of `.env` file? | Stores environment-specific secrets (DB URL, JWT secret) outside the codebase |
| 82 | How does `async/await` differ from `.then()`? | Both handle Promises; `async/await` is syntactic sugar that reads like synchronous code |

---

## 💡 Pro Tips for the Interview

> [!IMPORTANT]
> **Always connect theory to YOUR code.** Don't just say "Redis is a cache." Say: *"I used Redis for three things in my project: distributed locking for seat allocation, atomic counters for admission numbers, and token blacklisting for logout."*

> [!TIP]
> - **Draw the admission flow diagram** if they ask about architecture (Applied → Seat_Locked → Confirmed)
> - **Mention trade-offs** — e.g., "I chose localStorage for tokens which is simpler but less secure than HTTP-only cookies"
> - **Be honest about limitations** — e.g., "The seat allocation doesn't use MongoDB transactions, so there's a small window for inconsistency"
> - **Show growth mindset** — e.g., "If I were building this again, I'd add proper unit tests from day one"

> [!NOTE]
> Since the interview also covers **how you work with AI tools**, be prepared to demonstrate:
> - A specific bug AI helped you solve (TanStack Query v5 migration is a great example)
> - How you verify AI output (never blind trust)
> - When you choose NOT to use AI (core business logic, security code)

Good luck with the interview! 🚀
