# Contributing to Seasons Out of Order

This guide is based on the team's common rules (sections 4, 5, 9).
The common rules document is the source of truth; if this file and that document disagree, follow the common rules document and fix this file.

## Setup and run

- Install Node.js 20 or later.
- `git clone https://github.com/kimgy5756581/go.git`
- `cd go`
- `node server.js`
- Open http://127.0.0.1:3000 in a browser.
- Run the tests with `node --test`.

## Reporting an issue

- Open the Issues tab and click New issue.
- Write a short title and describe what happened, what you expected, and how to reproduce it (steps, room, inputs).
- Add a label or assignee if you know who should handle it.

## Workflow

Issue -> assignee -> branch -> PR -> review -> fix -> merge.
Never push directly to `main`.

## Branches and commits

- Branch names show the role and the content, for example `feat/role3-spring-room`, `fix/shooter-collision`, `docs/setup`.
- Pull the latest `main` before you start, and bring your branch up to date with `main` at least once a day (rebase or merge — the team has not picked one method yet).
- Keep commits small, one working step each, and put the issue number in the message, for example `feat(rooms): spring room blocks (#12)`.
- Do not reformat a whole file in one commit. It explodes the diff and only creates conflicts.

## Pull requests

- Keep a PR small: one change only. Do not pack "3 rooms + items + music" into a single PR.
- In the PR description, write what changed and how you tested it (inputs, rooms, results). If the screen changed, attach a screenshot.
- If your PR touches someone else's files, that file's owner reviews it (CODEOWNERS assigns them automatically once it exists).
- `node --test` must pass before merge. A PR that breaks tests is not merged.
- If the PR conflicts, the person who opened it resolves it. Before deleting someone else's code, check with them first.
- Member 4 (integration) coordinates the merge order. When several PRs are open in the same week, the ones closest to shared files merge first.

## File ownership

- Do not change files owned by someone else without asking them first. If you must, tell the owner first and add them as a reviewer.
- Shared files (`src/logic.js`, `src/main.js`, `index.html`, `style.css`, `package.json`, `server.js`, `build-standalone.js`) need an issue and team agreement before you change them. One person handles them in one PR.

## Declaring work

- Put an assignee on the issue and leave a comment when you start ("Working on rooms.js").
- Tell the team (chat or issue) before you touch a shared file.
- Once a week the team runs the latest `main` together and files issues for what is broken.

## Generated files

- The single-file standalone build is a generated file. Normal PRs should not include it. It is built from `main` when a release is made.
