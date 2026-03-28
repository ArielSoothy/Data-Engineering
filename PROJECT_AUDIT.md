# Project Audit

Date: 2026-03-16

Scope: product audit, UX audit, and codebase review with extra weight on the "between sessions on phone" use case. The strongest path in this repo is `Quick Mode`, but the current implementation is split across too many overlapping surfaces and has a few data-model bugs that will make progress and recommendations unreliable.

## Executive Summary

The app has the right primitives for a strong Meta DE prep companion:

- a mobile-first quick loop
- a deeper coding loop
- timed practice
- local/offline-friendly content
- lightweight progress tracking

The current problem is not lack of features. It is fragmentation.

- There are multiple overlapping products for the same job: `Quick Mode`, legacy `Quick Drill`, hidden `Study Hub`, `Practice`, legacy `Adaptive Practice`, and `Daily Assessment`.
- The quick-session path is not aligned with the later-stage study plan. The plan asks for hard/weak-topic/mobile review, but the shipped quick surface filters out most advanced material.
- Progress is not trustworthy today. Some quick-mode actions can mark the wrong questions complete.

If this were my project, I would make `Quick` the main phone product, keep `Deep` as the coding workspace, keep `Practice` for mocks, and merge or delete the rest.

## Highest-Priority Findings

### P0: Quick Drill progress can corrupt main dashboard progress

Files:

- `src/utils/questionNormalizer.ts:49-55`
- `src/utils/questionNormalizer.ts:103-115`
- `src/components/quick-mode/QuickFlashcard.tsx:168-171`
- `src/components/quick-mode/QuickQuiz.tsx:104-108`
- `src/components/quick-mode/QuickPuzzle.tsx:122-137`

Problem:

- `quickDrill` questions are normalized with `progressKey: 'sqlBasics'` as a placeholder.
- Quick mode components still call `updateProgress(current.progressKey, current.progressId, true)`.
- That means answering a quick-drill card can mark an unrelated `sqlBasics` question complete.
- Python quick-drill cards can also write into `sqlBasics`, which is even worse.

Impact:

- Dashboard percentages become unreliable.
- Weak spots become unreliable.
- Daily assessment readiness becomes unreliable.
- Any later LLM analysis on exported/local progress will be misleading.

Recommendation:

- Stop writing quick-drill results into `AppContext` entirely.
- Give quick drill its own progress source of truth and derive dashboard stats from a unified progress adapter instead of fake category ids.

### P0: Quick-mode progress storage is internally inconsistent

Files:

- `src/components/quick-mode/QuickQuiz.tsx:11-35`
- `src/components/quick-mode/QuickQuiz.tsx:104-105`
- `src/components/quick-mode/QuickPuzzle.tsx:31-49`
- `src/components/quick-mode/QuickPuzzle.tsx:122-132`
- `src/hooks/useStudyProgress.ts:21-25`

Problem:

- `QuickQuiz` stores progress in `quick_drill_progress` using `q.uid` keys.
- `QuickPuzzle` also stores progress using `deck[index].uid`.
- `useStudyProgress()` reads `quick_drill_progress` using numeric `q.sourceId`.
- `QuickFlashcard` does not write to `quick_drill_progress` at all; it writes FSRS data separately.

Impact:

- Completion stats for quick-drill cards are inconsistent depending on which mode the user used.
- Study Hub completion for drill cards can show incomplete even after multiple correct answers.
- "Mastered" counts are not measuring a stable concept.

Recommendation:

- Define one canonical quick-card progress record keyed by one stable id format.
- Make flashcard, quiz, and puzzle all write through the same adapter.
- Make all dashboards and filters read from that same adapter.

### P0: The product surface is fragmented and contradictory

Files:

- `src/App.tsx:21-29`
- `src/App.tsx:70-86`
- `src/components/TabNavigation.tsx:28-47`
- `src/components/study-hub/StudyHub.tsx:20-22`
- `src/components/study-hub/StudyHubFilters.tsx:23-29`
- `src/components/practice/PracticeHub.tsx:15-52`
- `src/data/dailyPlan.ts:154-155`
- `src/data/dailyPlan.ts:164-165`
- `src/data/dailyPlan.ts:177-178`
- `src/data/dailyPlan.ts:203-204`
- `src/data/dailyPlan.ts:230-231`

Problem:

- `/study` exists and contains the most complete multi-mode experience, but it is not in navigation.
- `/adaptive` still exists as a separate legacy surface.
- `Study Hub` also has an adaptive mode.
- The daily plan labels several tasks as "Adaptive Practice" but routes them to `/practice/daily`, which is `DailyAssessment`, not adaptive practice.
- `Quick Drill` still exists as a legacy route while the new surface is called `Quick Mode`.

Impact:

- The product does not present a single clear mental model.
- Users cannot tell which surface is current.
- The daily plan sends users to screens that do not match the label.
- This makes the app harder for other LLMs to reason about too, because intent is split across multiple partial implementations.

Recommendation:

- Collapse to 3 top-level products:
  - `Quick`: phone, between-session, review, short quizzes
  - `Deep`: coding/editor mode
  - `Practice`: timed mocks and readiness checks
- Merge `Study Hub` capabilities into `Quick` and `Deep`, or expose it explicitly if it is the intended core.
- Delete or redirect legacy routes once the consolidation is done.

### P1: Progress totals and readiness math are wrong

Files:

- `src/config.ts:12-21`
- `src/context/AppContext.tsx:160-190`
- `src/components/tabs/DailyAssessment.tsx:58-124`

Verified local data counts:

- `sql-basics.json`: 40
- `sql-advanced.json`: 55
- `python-basics.json`: 20, but config says 15
- `python-advanced.json`: 43, but config says 38
- `meta-official.json`: 34, but config says 50

Problem:

- `CATEGORY_TOTALS` is stale for multiple categories.
- `getTotalProgress()` excludes `metaOfficial`, while `DailyAssessment` includes it in readiness scoring.
- `getEstimatedTimeRemaining()` only counts unfinished questions that already exist in `progress`; untouched questions are ignored, so remaining time is understated.

Impact:

- Progress bars are mathematically wrong.
- Pace/readiness reports are wrong.
- Any prioritization logic based on weak areas is lower quality than it looks.

Recommendation:

- Generate totals from the source data at build time or load time.
- Stop hardcoding category counts.
- Redefine "remaining time" using total questions minus completed questions, not just entries present in local progress.

### P1: Sync design has a privacy/collision risk and misses some daily-plan state

Files:

- `src/config.ts:10`
- `src/services/progressSync.ts:4-20`
- `src/hooks/useDailyPlan.ts:8-10`
- `src/hooks/useDailyPlan.ts:52-54`
- `src/hooks/useDailyPlan.ts:66-70`

Problem:

- New installs fall back to `DEFAULT_SYNC_CODE = 'my-code-123'`.
- If this app is ever used by more than one person, that default can cause shared/colliding cloud data.
- `progressSync` syncs `daily_plan_streak` but not `streak_days`.
- `useDailyPlan` stores the heatmap data in `streak_days`, so cross-device sync is incomplete.

Impact:

- Potential privacy leak if the app is shared publicly.
- Phone/laptop daily-plan state can disagree.

Recommendation:

- Generate a random device id on first launch instead of using a shared default.
- Sync `streak_days` or rename storage keys so the sync list matches actual usage.
- Longer term, use authenticated user scopes if this stops being a single-user project.

## Quick-Mode / Mobile UX Audit

### What is already good

- Mobile bottom nav is the right direction.
- Quick mode has the right primitive modes: flashcard, quiz, puzzle.
- URL-backed filters are useful.
- Local data plus caching is good for phone usage.
- The daily plan correctly recognizes phone-friendly work as a distinct need.

### What is not yet aligned with the phone use case

Files:

- `src/components/quick-mode/QuickMode.tsx:13-15`
- `src/components/quick-mode/QuickMode.tsx:66-68`
- `src/data/dailyPlan.ts:173-223`
- `src/components/tabs/Dashboard.tsx:52-55`

Problems:

- Quick mode only pulls from `quickDrill`, `sqlBasics`, `pythonBasics`, and `metaOfficial`.
- It excludes `sqlAdvanced` and `pythonAdvanced`, even though the later study plan repeatedly asks for hard review and weak-topic speed drills.
- The dashboard still says "Quick Drill" while the primary route is now "Quick Mode".
- The quick-session product has no explicit presets like "5 min", "10 cards", "resume commute deck", or "weak spot sprint".

Recommendation:

- Make `Quick` the official mid-depth layer between passive review and deep chat/coding.
- Add quick entry presets:
  - `Resume`
  - `5 min review`
  - `10-question quiz`
  - `Weak spots`
  - `Hard review`
  - `Today’s plan`
- Include advanced-but-flashcardable questions in quick mode instead of limiting it mostly to basics.

### Session continuity is not ready for real phone usage

Files:

- `src/components/quick-mode/QuickFlashcard.tsx:71-77`
- `src/components/quick-mode/QuickFlashcard.tsx:87-89`
- `src/components/quick-mode/QuickFlashcard.tsx:165`
- `src/components/quick-mode/QuickPuzzle.tsx:51-55`
- `src/components/quick-mode/QuickPuzzle.tsx:65-72`
- `src/components/quick-mode/QuickQuiz.tsx:66-89`

Problems:

- Flashcard session restore only saves index/stats, not deck identity or filter state. If filters or deck order change, the resume target can be wrong.
- `deckLen` is saved but never validated on restore.
- Puzzle mode writes session data but never loads it back.
- Quiz mode has no resume support.
- For a phone workflow, interruption handling is a core feature, not a nice-to-have.

Recommendation:

- Save a session envelope with:
  - mode
  - filter snapshot
  - deck ids
  - current card id
  - current stats
- Restore only if the deck snapshot still matches.
- Show a visible `Resume previous session` CTA on `/quick`.

## UI / UX Findings

### Deep Mode is not really usable on mobile

Files:

- `src/components/deep-mode/DeepMode.tsx:171-175`
- `src/components/deep-mode/DeepMode.tsx:181-183`

Problem:

- The question list sidebar is desktop-only.
- The sidebar toggle is also desktop-only.
- On mobile, the user can filter, but there is no obvious question picker to move through the set.

Recommendation:

- Add a mobile question drawer or bottom sheet.
- If not, explicitly scope Deep Mode to desktop and message that in the UI.

### Safe-area handling is incomplete

Files:

- `src/components/TabNavigation.tsx:153`
- `src/components/TabNavigation.tsx:186`
- `tailwind.config.cjs:1-110`

Problem:

- `pb-safe` is used in mobile navigation/drawer classes.
- There is no corresponding utility in Tailwind config or global CSS.

Impact:

- On some phones, the bottom nav can sit too close to the home indicator.

Recommendation:

- Add an actual safe-area utility or explicit `padding-bottom: env(safe-area-inset-bottom)`.

### PWA/mobile install path needs another pass

Files:

- `vite.config.ts:141-155`

Problem:

- The manifest hardcodes `start_url: '/'`.
- The repo is also configured for GitHub Pages with a base path in production.
- If GitHub Pages is used, installed-PWA routing can break or land outside the repo base.

Recommendation:

- Make `start_url` and icon paths base-aware.
- Verify install/open behavior specifically on iPhone and Android after a GH Pages build.

## Engineering Quality

### Validation status

- `npm run build`: passes
- `npm run lint`: fails with 72 errors and 14 warnings on this audit run

Main themes from lint:

- too many `any` types across API, runtime, and major UI files
- hook dependency warnings in core screens
- dead/legacy code smells
- a few no-op/empty-block issues

Why this matters:

- The app is still shippable for solo use, but it is becoming hard to safely refactor.
- The current state invites regression because the same product idea exists in multiple places.

### Test coverage

I did not find a meaningful automated test suite in the repo. For this project, the highest-value tests would be:

- unified progress adapter tests
- quick-mode session restore tests
- daily plan routing tests
- question-count/config consistency tests
- sync merge tests

## Recommended Product Direction

### North star

This app should become:

"The fastest way to do a meaningful Meta DE review session from your phone, then drop into deep coding only when needed."

### What to prioritize

1. Make `Quick` the default between-session product.
2. Consolidate duplicate surfaces and routes.
3. Fix progress correctness before adding more features.
4. Make resume/state continuity solid on mobile.
5. Keep `Deep` for coding and `Practice` for mocks only.

## Suggested Fix Order

### Phase 1: Correctness

- Fix quick-drill progress corruption.
- Unify quick progress storage keys.
- Fix stale `CATEGORY_TOTALS`.
- Fix sync key mismatch for `streak_days`.
- Replace shared default sync code with generated ids.

### Phase 2: Product consolidation

- Decide whether `Study Hub` becomes the engine behind `Quick`/`Deep` or gets surfaced directly.
- Remove or redirect legacy `/quick-drill` and old `/adaptive`.
- Fix daily-plan routes so labels match actual destinations.

### Phase 3: Phone-first UX

- Add resume session.
- Add quick presets.
- Add weak-spot and hard-review decks.
- Add mobile question picker for deep mode or explicitly scope it away from mobile.
- Fix safe-area and PWA base-path behavior.

## Bottom Line

The project is promising, but the next win is not more breadth. It is consolidation and correctness.

If the goal is a useful in-between-session phone tool, the repo already has enough raw capability. The main work now is:

- choose one quick-study surface
- unify progress
- align the daily plan to the actual routes
- make the mobile loop resumable and trustworthy
