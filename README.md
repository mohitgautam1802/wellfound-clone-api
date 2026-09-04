# wellfound-clone-api

Backend for a **Wellfound candidate-portal clone**, covering the three sections the
project focuses on: **Profile**, **Jobs** and **Applied**.

NestJS + Prisma + SQLite. No object storage, no third-party services, no real
data — everything runs from a seeded local database.

> This is a learning/portfolio project. It is not affiliated with Wellfound, and
> every company, job and person in the seed data is fictional.

Frontend lives in a separate repo: **wellfound-clone-web**.

---

## Quick start

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run setup             # prisma generate + db push + seed
npm run dev               # http://localhost:4000/api
```

Interactive API docs (Swagger): **http://localhost:4000/api/docs**

### Demo account

```
email:    demo@wellfound.dev
password: password123
```

The seed gives this account a complete profile, 7 saved jobs, 2 hidden jobs, a
saved search and 6 applications spread across the status pipeline — enough for
every screen to have something real to render.

---

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Start with watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run setup` | Generate client, create the DB, seed it |
| `npm run db:reset` | Wipe and re-seed (use when the seed changes) |
| `npm run db:studio` | Browse the data in Prisma Studio |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## API surface

All routes are prefixed with `/api`. Everything except `health`, `auth/register`
and `auth/login` requires `Authorization: Bearer <token>`.

### Auth
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create a candidate account |
| `POST` | `/auth/login` | Exchange credentials for a JWT |
| `GET` | `/auth/me` | Current user |

### Profile
| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/profile` | Full profile + completion breakdown |
| `PATCH` | `/profile` | Update the Profile tab |
| `POST/PUT/DELETE` | `/profile/experiences[/:id]` | Work experience |
| `POST/PUT/DELETE` | `/profile/educations[/:id]` | Education |
| `PUT` | `/profile/skills` | Replace the skill list |
| `PATCH` | `/profile/preferences` | Preferences tab |
| `PATCH` | `/profile/culture` | Culture tab |

### Jobs
| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/jobs` | Search (see filters below) |
| `GET` | `/jobs/saved` | Saved tab |
| `GET` | `/jobs/hidden` | Hidden tab |
| `GET` | `/jobs/:idOrSlug` | Job detail |
| `POST/DELETE` | `/jobs/:id/save` | Save / unsave |
| `POST/DELETE` | `/jobs/:id/hide` | Hide / unhide |

Search accepts `q`, `locations`, `roleTypes`, `locationTypes`, `companySizes`,
`fundingStages`, `skills`, `salaryMin`, `experience`, `remoteOnly`, `sort`
(`recommended` | `recent` | `salary`), `page`, `limit`.

`q` honours double-quoted phrases, so
`?q="associate product manager"` matches the phrase rather than three loose words.

### Applications
| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/applications` | Apply to a job |
| `GET` | `/applications` | Applied page (filter by `statuses`) |
| `GET` | `/applications/stats` | Counts per status, for tab badges |
| `GET` | `/applications/:id` | One application with its timeline |
| `POST` | `/applications/:id/withdraw` | Withdraw |

---

## Design notes

**SQLite shapes the schema.** Prisma cannot express `enum`s or scalar lists on
SQLite, so:

- Status/type columns are `String`, with the allowed values defined once in
  [`src/common/constants/domain.ts`](src/common/constants/domain.ts) and enforced
  at the edge by `@IsIn(...)` in the DTOs.
- Anything multi-valued that we filter on became a real relation table
  (`JobLocation`, `JobSkill`), so filtering stays a database query.
- Multi-valued blobs we never filter on (a candidate's desired locations, say)
  are JSON stored in a `String`, always read through `parseJsonArray` so a
  malformed value degrades to `[]` instead of throwing.

Moving to Postgres later is a `provider` swap plus converting those JSON string
columns to native `Json`. No service-layer rewrite.

**Case-insensitive search.** Prisma's `mode: 'insensitive'` is Postgres-only and
throws on SQLite. We rely on SQLite's `LIKE`, which is already case-insensitive
for ASCII — which is why no `mode` key appears in `jobs.service.ts`.

**`recommended` sort is scored in memory.** Ranking against a candidate's stated
preferences is not expressible in SQL here, so that one sort loads the matching
set, scores it and slices. Fine at this corpus size; the other sorts stay
entirely in the database. See `scoreJob` in
[`src/jobs/jobs.service.ts`](src/jobs/jobs.service.ts).

**Applications expire.** Wellfound expires an application after two weeks of
inactivity. `expiresAt` is stored rather than derived, so recruiter activity can
push the date out, and the Applied page can flag "expiring soon" without
recomputing on every render.

**No file storage.** Résumés are a file *name* only. There is deliberately no S3.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: branch off `main`, open a
PR, and let CI (lint + typecheck + test + build + seed) go green before merging.
