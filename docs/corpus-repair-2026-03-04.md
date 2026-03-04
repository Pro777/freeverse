# Corpus Repair Log (2026-03-04)

Broad sanity pass for obviously corrupted short-poem files with anthology/notes spillover.

| File | Before (lines) | After (lines) |
|---|---:|---:|
| poems/alfred-tennyson/break-break-break.txt | 18454 | 19 |
| poems/christina-rossetti/amor-mundi.txt | 1223 | 13 |
| poems/christina-rossetti/song.txt | 791 | 9 |
| poems/christina-rossetti/when-i-am-dead-my-dearest.txt | 7163 | 16 |
| poems/edgar-allan-poe/alone.txt | 9824 | 25 |
| poems/george-gordon-byron/stanzas-for-music.txt | 4531 | 22 |
| poems/george-gordon-byron/the-destruction-of-sennacherib.txt | 388 | 41 |
| poems/george-gordon-byron/when-we-two-parted.txt | 483 | 43 |
| poems/john-keats/la-belle-dame-sans-merci.txt | 1608 | 59 |
| poems/john-keats/ode-on-a-grecian-urn.txt | 404 | 64 |
| poems/john-keats/on-first-looking-into-chapmans-homer.txt | 2300 | 14 |
| poems/percy-bysshe-shelley/music-when-soft-voices-die.txt | 19500 | 8 |
| poems/percy-bysshe-shelley/to-night.txt | 7965 | 42 |
| poems/william-blake/a-poison-tree.txt | 1410 | 19 |
| poems/william-wordsworth/it-is-a-beauteous-evening-calm-and-free.txt | 695 | 13 |

Method:
- Extracted intended poem bodies from existing files by deterministic start/end markers.
- Replaced `poems/christina-rossetti/amor-mundi.txt` from canonical Project Gutenberg source extraction (ebook 19188).
