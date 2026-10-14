# piXeval UI

Interactive design preview of the new piXeval interface — Vite + React + TypeScript.
All data is sample data, stored in the browser (`localStorage`); there is no backend yet.

## Run

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # type-checks, then builds static files to dist/ (GitHub Pages ready)
    npm run preview    # serve the production build
    npm run kill       # stop a running dev server

## Structure

    src/
      main.tsx, App.tsx       entry + routes (HashRouter, so GitHub Pages needs no config)
      pages/                  one file per screen
      dialogs/                dialogs, grouped by area; register each in components/DialogHost.tsx
      components/             Shell (sidebar + topbar), Dialog, DialogHost, Toasts, ui.tsx primitives,
                              ContextBar (subject/group/exam selects), PathField, SheetView
      store/useApp.ts         the single store: data, UI state, every create/edit/delete action, persistence
      data/                   types.ts (domain model), seed.ts (sample data)
      lib/                    domain.ts (grading, difficulty), hooks.ts, nav.ts, iconPaths.ts
      styles/                 app.css (design tokens + components, Markdown styles), pages.css (login)
      research/               the research documents (Markdown), shown in the app under Research
      pages/Research.tsx      renders them; lib/research.ts loads them at build time

## Research

The Markdown files in `src/research/` are bundled and rendered in the app (sidebar → **Research**). Add a document by dropping a `.md` file there and linking it from `src/research/README.md`; links between documents (`other-file.md`) work inside the app.

## Adding a screen

1. Create `src/pages/MyScreen.tsx`, add a `<Route>` in `App.tsx` and an entry in `lib/nav.ts`.
2. Put new data/actions in `store/useApp.ts`; reuse the primitives in `components/ui.tsx`.
3. Dialogs: add `src/dialogs/MyDialog.tsx`, add its name to `DialogName` in the store and a line in `DialogHost.tsx`.

## Data & persistence

Everything you create, edit or delete is saved in the browser, so it survives a reload (per browser and device).

- The **Saving to DB** switch (top bar) controls it. Off = changes last until reload.
- Avatar menu: **Reset demo data** restores the sample data; **Fast-forward demo** jumps to a corrected, assigned state.
- ⌘K / Ctrl+K opens the command palette.

## Connecting a backend later

Persistence lives in one place: the `useApp.subscribe` block at the bottom of `store/useApp.ts`, plus the actions above it.
Replace those with API calls; the screens don't change.

## Publish to GitHub Pages

`npm run build`, then publish `dist/` (for example with a Pages workflow or the `gh-pages` branch). Asset paths are relative.
