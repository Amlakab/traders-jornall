# TradeX Journal — Frontend Client

Next.js 14 App Router + TypeScript + TailwindCSS frontend for the Trading Journal Web Application.

## Scripts

- `npm run dev`: Runs the development server on `http://localhost:3000`.
- `npm run build`: Compiles production build.
- `npm start`: Runs the production server on port 3000.
- `npm run lint`: Runs ESLint checks.

## Key Components

- `DynamicSelect`: Fetches `/api/options?field=` and provides inline `+ Other` creation without hardcoding.
- `HybridNumberField`: Displays calculated metric with manual override pencil, "Edited" badge, and reset-to-auto button.
- `AutoSummaryBox`: Displays narrative summary with edit pencil and regenerate button.
- `TradeForm`: Progressive form with Sections A–F, collapsible cards, draft auto-save, and Zod validation.
- `TradeTable`: Sortable, paginated, column toggles, bulk actions, and multi-format exports.
- `ScreenshotUploader`: 3 dedicated slots, preview thumbnails, lightbox zoom, and side-by-side Before vs After viewer.
- `TimeScopeSelector`: Today / specific day / week / month / year / custom range / all time.
# traders-jornall
