# Psych Tickler dev tools (not part of the site)

This branch is separate from `main` so nothing here is published on GitHub Pages.

- `HANDOFF.md`: how to continue the work in a new chat.
- `tools/t1.py`: one phone. Brings a Batch Tickler card over, edits and saves My card, opens every main screen.
- `tools/t2.py`: four phones (owner, consultant, second year, same-batch first year) on a mock cloud; checks who sees restricted answers.
- `tools/t3.py` to `tools/t6.py`: bring from a backup file, built-in events, posters, didactics schedule (see `HANDOFF.md`, section 5).
- `tools/t7.py`: consultant quick facts (1.5.0), no cloud.
- `tools/mock.js`: the in-memory stand-in for `js/cloud.js` that `t2.py` injects. Keep it in step with the adapter.

Run from anywhere, with the site served from the `main` checkout on port 8765:

    python3 -m http.server 8765      # inside the main checkout
    python3 tools/t1.py
    python3 tools/t2.py

Needs Python Playwright with Chromium. Screenshots go to a temp folder, or to `$PT_SHOTS` if set.
