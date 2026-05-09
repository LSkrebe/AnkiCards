# AnkiCards

Anki-style questionnaire to prepare for anything — a minimal black-and-white web app: read a question, type your answer, reveal the correct answer, and self-grade. Questions come from `questions.json`.

**Repository:** [github.com/LSkrebe/AnkiCards](https://github.com/LSkrebe/AnkiCards)

## How it works

- Cards are studied in **batches of 5** (random order within each batch).
- After the first pass, any card you marked wrong is repeated until **all five in the batch** are answered correctly.
- Then the next batch of five starts until the whole deck is done.

## Run locally

Browsers block loading JSON over `file://`, so serve the folder with any static server.

```bash
git clone https://github.com/LSkrebe/AnkiCards.git
cd AnkiCards
python3 -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/).

## Controls

| Action | Mouse | Keyboard |
|--------|-------|----------|
| Show answer | **Show answer** | `Ctrl+Enter` / `Cmd+Enter` |
| I was right | **I was right** | `→` |
| I was wrong | **I was wrong** | `←` |

Use **Restart** to shuffle and begin again.

## Editing questions

Edit `questions.json`: an array of objects with `question` and `answer` (strings).

## License

Use as you like for personal study.
