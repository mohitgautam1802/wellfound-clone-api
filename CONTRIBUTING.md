# Contributing

## Branch and PR flow

`main` is the integration branch. Work happens on branches and lands via PR.

```bash
git checkout main
git pull
git checkout -b feat/job-alerts

# ... make changes ...

npm run lint && npm test && npm run build
git commit -am "feat: email alerts for saved searches"
git push -u origin feat/job-alerts
gh pr create --fill
```

### Branch naming

| Prefix | For |
| --- | --- |
| `feat/` | New capability |
| `fix/` | Bug fix |
| `refactor/` | Behaviour-preserving change |
| `chore/` | Tooling, deps, CI |
| `docs/` | Documentation only |

### Commit messages

Conventional Commits: `type(scope): summary`.

```
feat(jobs): add funding-stage filter
fix(applications): stop double-withdraw returning 500
```

---

## Changing the database

The schema and the seed are a pair — CI runs the seed on every PR, so a schema
change without a matching seed update fails the build.

```bash
# 1. edit prisma/schema.prisma
npx prisma db push        # apply to your local dev.db
npx prisma generate       # refresh the typed client

# 2. update prisma/seed.ts to populate any new columns
npm run db:reset          # wipe and re-seed
```

Two constraints worth remembering, both from SQLite:

- **No `enum`.** Add the values to `src/common/constants/domain.ts` and validate
  with `@IsIn(...)` in the DTO.
- **No scalar lists.** If you need to *filter* on it, add a relation table. If
  you only ever read it back whole, a JSON `String` column is fine — read it
  through `parseJsonArray` / `parseJsonObject`.

---

## Adding an endpoint

1. DTO in `src/<module>/dto/`, validated with class-validator.
2. Business logic in the service. Controllers stay thin.
3. Annotate with `@ApiOperation` so it shows up at `/api/docs`.
4. Guard it with `JwtAuthGuard` and scope every query by `userId` — a candidate
   must never be able to read another candidate's rows by guessing an id.
5. If it changes the response shape, open the paired `wellfound-clone-web` PR and
   link the two.

## Tests

Unit tests live next to the code as `*.spec.ts`. Pure logic — scoring,
completion, parsing — should have them; thin CRUD wrappers generally should not.
