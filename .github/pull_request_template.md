## What changed

<!-- One or two sentences. What does this PR do, and why? -->

## How to verify

<!-- The exact steps a reviewer should run. For example:
1. `npm run db:reset`
2. `npm run dev`
3. `GET /api/jobs?locations=Bengaluru` returns only Bengaluru roles
-->

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] Schema changed? `prisma/schema.prisma` and `prisma/seed.ts` updated together
- [ ] New endpoint? Documented with `@ApiOperation` and visible at `/api/docs`
- [ ] Breaking API change? The web repo has a matching PR linked below

## Related

<!-- Link the paired wellfound-clone-web PR, if there is one. -->
