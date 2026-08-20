# Task 11 — Phase 2 Improvements (split login, dark mode, notifications, settings view, profile photo upload)

Agent: full-stack-developer
Task ID: 11

## Work Log

1. Read `worklog.md` to gather context (Prisma schema already had `profileImage`, `phone`, `bio`; 37 users / 30 students / 6 teachers / 10 courses / 156 grades seeded; lint passes 0 errors; design tokens navy/teal/orange).

2. Audited existing source files: `lib/types.ts` (SafeUser), `lib/auth.ts` (getCurrentUser), `app/api/auth/login/route.ts` + `me/route.ts`, `components/providers.tsx`, `app/globals.css`, `store/ui-store.ts` (ViewKey), `store/auth-store.ts`, `components/layout/sidebar.tsx` (already had a settings nav item but ViewKey type was missing `settings`), `components/layout/top-header.tsx`, `components/layout/dashboard-shell.tsx`, `components/auth/login-form.tsx`, `app/page.tsx`, `hooks/use-api.ts`, dashboard view sub-components (kpi-card, stat-card, grades-donut-chart, top-students-chart, average-evolution-chart) and views (dashboard, students, teachers, courses, grade-entry, student-grades, student-transcript, promotions, reports).

3. **Backend foundation** (Step 1)
   - Extended `SafeUser` interface with `profileImage`, `phone`, `bio`, `createdAt` and added a new `AppNotification` type.
   - Updated `getCurrentUser()` to include the new fields (ISO-stringified `createdAt`).
   - Updated `POST /api/auth/login` to return the new fields in the `SafeUser` payload.
   - Created `PATCH /api/auth/profile` (zod-validated, role-guarded) accepting `name/phone/bio/profileImage` (base64 up to ~500 KB).
   - Created `POST /api/auth/password` (zod-validated, current-password-verified) to change the password.
   - Created `GET /api/notifications` returning role-specific mock notifications (admin: 7, teacher: 6, student: 6) with title/message/time/read/type.

4. **ThemeProvider + dark palette** (Step 2)
   - Wrapped `Providers` in `next-themes` `<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>`.
   - Replaced the grayscale `.dark` block in `globals.css` with the project palette (background `#1a1f2e`, card `#252b3a`, popover `#252b3a`, primary teal `#1ABC9C`, secondary `#2C3E50`, muted `#2a3142`, muted-foreground `#95a5a6`, border `#34495E`, input `#34495E`, ring `#1ABC9C`, sidebar stays navy).
   - Added smooth color-transition CSS so dark-mode toggle doesn't flash.

5. **UI store + shell wiring** (Step 3)
   - Added `"settings"` to the `ViewKey` union.
   - Imported `SettingsView` and mapped it in `dashboard-shell.tsx`; rewrote the student-guard to allow `settings` view (so students can open settings without being redirected to "my-grades").

6. **SettingsView** (Step 4) — full page with 4 sections:
   - **Profile photo** — large circular avatar (image if `user.profileImage`, otherwise initials on teal gradient), "Changer la photo" button opening a hidden `<input type=file>` (JPG/PNG ≤ 2 MB → base64 → PATCH `/api/auth/profile`), "Supprimer" button (only visible if a photo exists), spinner + sonner toasts, re-fetches `/api/auth/me` to refresh the auth store.
   - **Personal info** — name (editable), email (disabled with lock icon), phone, bio (textarea with 500-char counter), role badge, `createdAt` formatted in French; zod-validated form → PATCH `/api/auth/profile`.
   - **Account security** — current/new/confirm password fields with zod refinement that both new passwords match; POST `/api/auth/password`.
   - **Preferences** — dark-mode Switch synced with `useTheme()`, language (FR active, EN with "Bientôt" badge), email-notifications Switch (local state + toast).

7. **Sidebar** (Step 5) — kept the existing nav items array but moved the **Settings button** to the bottom section just above **Déconnexion** (separated visually with a top border). Sidebar profile circle now displays `user.profileImage` if present, otherwise initials.

8. **TopHeader** (Step 6) — added the new `NotificationBell` and `DarkModeToggle` components between the search pill and the window-control dots; added `dark:` variants on the header, search input, mobile-menu button, divider, and welcome text.

9. **NotificationBell component** (Step 7) — uses shadcn `Popover` + `useQuery` (`/api/notifications`); red unread-count badge on the bell (with `9+` cap), header row with title + "Tout lire" mark-all-as-read button, list of notifications with type-colored left border (info=blue, success=teal, warning=orange), unread dot, role-filtered content.

10. **DarkModeToggle component** (Step 7) — uses `useTheme()`; shows `Sun` icon (amber) in dark mode → click → light, shows `Moon` icon in light mode → click → dark; mounted-state guard to avoid hydration mismatch; proper `aria-label` and `title`.

11. **Split login redesign** (Step 8) — `app/page.tsx` is now a 2-column grid (`lg:grid-cols-2`) with a hidden-on-mobile left hero panel (`/campus.jpg` background-image with a navy→teal overlay, white logo circle + GraduationCap, big title "Gestion des Notes Étudiantes", subtitle, teal divider, 4 feature bullets with Lucide icons, bottom badge "Année académique 2024-2025 / v2.0 Soutenance"). The right panel is the white form side (or dark `#1a1f2e` in dark mode) with the redesigned `LoginForm` (subtitle "Connexion / Connectez-vous à votre espace", email + password + submit, 3 demo-account quick-fill buttons retained). Mobile gets a compact navy header above the form.

12. **Dark-mode variants on existing views** (Step 9) — added `dark:` variants to every hardcoded hex surface:
    - Common `ui-bits.tsx` (`PageHeader`, `EmptyState`, `Badge`).
    - Dashboard sub-components (`KpiCard`, `StatCard`, `GradesDonutChart`, `TopStudentsChart`, `AverageEvolutionChart`) and `DashboardView`.
    - Views: `students-view`, `teachers-view`, `courses-view`, `grade-entry-view`, `student-grades-view`, `student-transcript-view`, `promotions-view`, `reports-view`.
    - App window frame (`app-window.tsx` outer gradient + main bg).
    - Mapping: `bg-white` → `bg-white dark:bg-[#252b3a]`; `bg-[#F5F7FA]` → `bg-[#F5F7FA] dark:bg-[#1f2330]`; `bg-[#FAFAFA]` → `… dark:bg-[#1f2330]`; `bg-[#ECF0F1]` → `… dark:bg-[#2a3142]`; `text-[#2C3E50]` → `… dark:text-[#ECF0F1]`; `text-[#7F8C8D]` → `… dark:text-[#95a5a6]`; `border-[#E0E0E0]` → `… dark:border-[#34495E]`; `border-[#ECF0F1]` → `… dark:border-[#34495E]`; `hover:bg-[#F5F7FA]/60` → `… dark:hover:bg-white/5`; `hover:bg-[#ECF0F1]` → `… dark:hover:bg-white/10`.

13. **Verification** (Step 10)
    - `bun run lint` → 0 errors, 0 warnings.
    - Had to run `bun run db:push` to regenerate the Prisma client (the new `profileImage/phone/bio` columns were already in SQLite but the running Prisma client was stale). After restart the PATCH profile API works.
    - Curl smoke-tests: PATCH `/api/auth/profile` → 200 + updated SafeUser JSON; POST `/api/auth/password` → `{ ok: true }`; GET `/api/notifications` returns 7/6/6 mock notifications per role (admin/teacher/student).
    - Agent-Browser (desktop 1440×900 + mobile 375×812):
      * Login page split layout: left hero with campus.jpg + overlay + features, right form with demo-account buttons.
      * Admin login → Dashboard with real data, all 7 admin nav items (Dashboard/Étudiants/Enseignants/Matières/Notes/Promotions/Rapports) + Paramètres.
      * Notifications bell popover opens with admin-specific items (4 unread), "Tout lire" button visible.
      * Dark-mode toggle (both the header Sun/Moon button and the settings Switch) flips `document.documentElement.className` to `dark`/`light` and persists to `localStorage`.
      * Settings view loads for admin + student, all 4 sections render, profile fields pre-fill from API.
      * Teacher login → sidebar shows Dashboard/Étudiants/Matières/Notes/Paramètres, notifications show 3 unread (teacher-specific).
      * Student login → routed to "Mes Notes" (dashboard guard works), sidebar shows Dashboard/Mes Notes/Paramètres, notifications show 3 unread (student-specific).
      * No console errors, no API 500s during the full flow.
    - Dev log after testing: only 200 OK responses; Prisma SELECT now includes `profileImage/phone/bio` columns.

## Stage Summary

### Files created
- `src/app/api/auth/profile/route.ts` — PATCH profile (name/phone/bio/profileImage).
- `src/app/api/auth/password/route.ts` — POST change password.
- `src/app/api/notifications/route.ts` — GET role-based mock notifications.
- `src/components/views/settings-view.tsx` — 4-section settings page (profile photo / personal info / security / preferences).
- `src/components/common/notification-bell.tsx` — Popover bell with unread badge.
- `src/components/common/dark-mode-toggle.tsx` — Sun/Moon toggle bound to next-themes.

### Files modified
- `src/lib/types.ts` — `SafeUser.profileImage/phone/bio/createdAt`, `AppNotification` type.
- `src/lib/auth.ts` — `getCurrentUser` returns new fields.
- `src/app/api/auth/login/route.ts` — returns new fields.
- `src/app/api/auth/me/route.ts` — (no source change required, `getCurrentUser` already supplies them).
- `src/components/providers.tsx` — wraps in `ThemeProvider`.
- `src/app/globals.css` — project-palette `.dark` block + smooth color transitions.
- `src/store/ui-store.ts` — adds `"settings"` to `ViewKey`.
- `src/components/layout/dashboard-shell.tsx` — wires `SettingsView`, exempt settings from student guard.
- `src/components/layout/sidebar.tsx` — Settings button at bottom above Déconnexion, displays `profileImage`.
- `src/components/layout/top-header.tsx` — adds `NotificationBell` + `DarkModeToggle`, dark variants.
- `src/components/layout/app-window.tsx` — dark variants on outer gradient + main bg.
- `src/components/auth/login-form.tsx` — redesigned for the right panel (subtitle, demo buttons kept).
- `src/app/page.tsx` — split-screen layout (left hero `campus.jpg`, right form), dark variants, dark loading screen.
- `src/components/common/ui-bits.tsx` — dark variants on `PageHeader`, `EmptyState`, `Badge`.
- `src/components/dashboard/kpi-card.tsx`, `stat-card.tsx`, `grades-donut-chart.tsx`, `top-students-chart.tsx`, `average-evolution-chart.tsx` — dark variants.
- `src/components/views/dashboard-view.tsx`, `students-view.tsx`, `teachers-view.tsx`, `courses-view.tsx`, `grade-entry-view.tsx`, `student-grades-view.tsx`, `student-transcript-view.tsx`, `promotions-view.tsx`, `reports-view.tsx` — dark variants.

### Features implemented
- Split login layout (left hero / right form, stacked on mobile) using `public/campus.jpg`.
- Dark mode (next-themes `class` strategy, project palette, smooth transitions) wired into header Sun/Moon button and settings Switch.
- Notification bell with role-based mock data, unread badge, "Tout lire" mark-all-as-read.
- Settings view: profile photo upload (file → base64 → PATCH), personal info (name/phone/bio) form, password change (current/new/confirm with zod refinement), preferences (dark-mode Switch, language, email-notifications).
- Settings nav item visible to all 3 roles at the sidebar bottom (above Déconnexion).
- Sidebar avatar now shows uploaded profile image when present.
- Every existing view audited — all nav links work for admin / teacher / student; no 500s, no console errors.

### Verification results
- `bun run lint` → 0 errors, 0 warnings.
- All API routes return 200 (auth/login, auth/me, auth/profile PATCH, auth/password POST, notifications, stats, students, teachers, courses, grades, promotions, grades/student/[id]).
- Agent-Browser: split login + admin/teacher/student logins, dark-mode toggle, notification popover, settings view all confirmed working in both light and dark mode, on desktop 1440×900 and mobile 375×812.

### Issues encountered
- Stale Prisma client in the running dev server (didn't know about `profileImage/phone/bio` columns); fixed by re-running `bun run db:push` to regenerate, then restarting the dev server (`bun run dev` re-run in background).
- Two initial `// eslint-disable-next-line @next/next/no-img-element` directives triggered "Unused eslint-disable directive" warnings (rule not enabled); removed the directives — `<img>` is fine here.
