# Maintaining Monkmode

- Read `architecture.md` for the app boundaries and commands.
- Keep `backend/`, `frontend/`, and `mobile/` independently installable. Each owns its package manifest, lockfile, dependencies, and assets.
- Do not create a root package manifest, root lockfile, workspace configuration, or shared `node_modules`.
- Prefer direct functions, explicit imports, and one clear responsibility per module. Explain non-obvious decisions with short comments.
- Preserve the current UI and API behavior when cleaning up code.
- Keep audit documents, Gemini handoff documents, agent guidance, architecture documentation, and license notices.
- Do not retain generated output, logs, temporary scripts, or test files in the repository. Run temporary verification outside the repository when needed.
- After changes, run web lint/build and mobile lint/typecheck. Check an Android export when mobile code changes. Verify backend changes against a disposable database.
