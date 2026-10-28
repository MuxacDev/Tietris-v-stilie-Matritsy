# MATRIX / TETRIS

Одностраничный браузерный Тетрис на TypeScript с оформлением в стиле фильма «Матрица».

## Product requirements

- Пользователь попросил простую игру: начать и закончить партию, двигать и поворачивать фигуры, выбирать сложность.
- Оформление — кодерский стиль и падающие символы на фоне.
- По просьбе пользователя игра реализована полностью на фронтенде, без серверных зависимостей.
- Интерфейс на русском языке.

## Run

- Managed workflow: `artifacts/matrix-tetris: web`
- `pnpm --filter @workspace/matrix-tetris run typecheck`

## Architecture decisions

- Gameplay and records stay in the browser. No database or external integrations are required.
- Records are local to the browser, not shared between devices.
- Difficulty is selected before a game to keep each run consistent.
