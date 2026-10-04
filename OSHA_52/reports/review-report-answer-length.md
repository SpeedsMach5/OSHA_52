# Review Report: Answer-Length Rebalance

**Goal (from the brief):**
- Rewrite wrong options so the correct answer is no longer reliably the longest. Target: the correct option is longest in no more than about 30% of questions per week.
- Wrong options must stay plausible and stay wrong per the cited text.
- Don't change any correct answer's meaning or citation.
- Second-check every changed question.
- Add a build check that fails any week over 40%.

## Result

| | Before | After |
|---|---|---|
| 1926: correct option is the longest (ties count) | 478/525 (91.0%) | 157/525 (29.9%) |
| 1910: correct option is the longest (ties count) | 261/301 (86.7%) | 78/301 (25.9%) |
| Weeks over 40% | 77 of 78 | 0 |
| Worst week | 100% | 1926: 40% (week 26); 1910: 30% |
| Weeks passable by always picking the longest option | 1926: 43/52; 1910: 18/26 | 0 |

Where the correct option ranks by length, after the change (1 = longest):

| | 1 | 2 | 3 | 4 (shortest) |
|---|---|---|---|---|
| 1926 | 29.9% | 30.1% | 33.1% | 6.9% |
| 1910 | 25.9% | 31.6% | 34.9% | 7.6% |

- **506 questions changed:** 323 in 1926 and 183 in 1910. Only wrong-option text changed. A script compared the data with the approved version and confirmed that every question, correct option, explanation, citation, topic and resource is identical.
- **Change log:** `reports/changelog-answer-length.md` lists every changed question with the old and new option text.

## Build check

- `scripts/check-answer-length.js` reports, for each week, how often the correct option is the longest. It exits 1 if any week is over 40%.
- It also prints the full length-rank spread, for information only.
- `npm run build` (which runs `npm run check:content`) runs it. Railway's Railpack runs `npm run build` during each deploy, so a content edit that breaks the rule now fails the deploy.

## Process

1. **Selection.** Each week kept at most 3 questions in which the correct option is longest: 30% of a 10-question week, 25–27% of an 11- or 12-question week. These were chosen at random with a fixed seed. The rest were queued: 505 questions.
2. **Round 1 drafts.** 11 drafting agents, one per block of weeks, worked from the cited eCFR text in `sources/`. Each changed option carries a reason that quotes the words that make it wrong. A validator enforced the rules: the correct option untouched, the longest wrong option at least 8 characters longer than the correct one, no duplicates, and no option that refers to other options.
3. **Round 2 rebalance.** After round 1, the correct option was **second-longest** in 52–62% of questions, up to 75% in one week. That traded one giveaway for another. The same agents lengthened further wrong options so the correct one moved to third-longest or shortest. In each week, at most 3–4 questions now have the correct option second-longest.
   - 13 questions had a correct option over the 200-character cap. Those were given a cap of the correct option's length plus 40.
4. **Second check.** 11 fresh agents that never saw the drafts re-read the cited paragraph and its neighbours for every changed question.
   - First pass: 489 of 508 passed and 19 failed. The failures were options that were arguably correct, two near-identical options, odd-one-out patterns, and two implausible options.
   - I fixed those 19, plus 2 borderline passes, and they were re-checked. 5 failed again; I fixed them and they were re-checked. The last one then passed.
   - Final: **every changed question passed the second check.**

## Judgment calls

- **"Longest" counts ties.** If the correct option ties for longest, it counts as longest. This is the stricter measure.
- **Week 26 (1926) is at 40%,** at the hard limit but above the ~30% target. Its chlorinated-solvents question has options in the form "25 feet / 50 feet / 100 feet / 200 feet", so the correct option ties on length. Adding a longer number would make an odd-looking option. Raising "minimum" on the wrong options only was tried, and the check failed it as an odd-one-out tell. The original options were kept.
- **1926 W30 Q8 (Table D-2)** is also back to its original options, for the same odd-one-out reason.
- **Rank-2 cap.** Your rule covers only "longest". I also limited "second-longest" per week (see Process step 3), because the first round created that pattern.
- **Second-longest in 1910 week 7** is 42%, and **third-longest in 1910 week 5** is 45%. No week can be passed by always picking one length rank.

## Fixes to original options (not part of the length rule)

- **1910 W9 Q12:** the original wrong option "With a knot tied inside the plug" was failed as arguably correct, since an underwriter's knot is a recognized strain-relief method. It was replaced with a soldered-joint option, which then passed the check.

## Flagged, not changed (original content)

- **13 correct options are over 200 characters,** for example 1926 W13 Q4 (291 characters) and 1910 W20 Q6 (299). Trimming them would change correct-answer text, so they were left as written.
- **Short throwaway options remain in some questions,** such as "Nothing", "No one" and "They must be locked". The check flagged them in 1910 W22 Q7. They were not part of this batch's rule.
- **1926 W2 Q2:** the unchanged option "Is a licensed professional engineer" could be argued to fit the competent-person definition.
- **1910 W8 Q5:** the unchanged option "39 inches minimum" is near the bottom of the 42 ± 3 inch range.
- **1926 W18 Q10:** the explanation's job-site scenario has the crew climb out before the box is dragged forward (a horizontal move). 1926.652(g)(1)(iv) only names vertical moves, so the scenario reads as if the rule requires something it doesn't.
- **1926 W20 Q9:** three "Yes, if …" options against one "No, unless …". The original already had this pattern.

### 1926 track, by week

| Week | Before | After |
|---|---|---|
| 1 | 7/10 (70%) | 3/10 (30%) |
| 2 | 9/10 (90%) | 3/10 (30%) |
| 3 | 10/10 (100%) | 3/10 (30%) |
| 4 | 8/10 (80%) | 3/10 (30%) |
| 5 | 7/10 (70%) | 3/10 (30%) |
| 6 | 10/10 (100%) | 3/10 (30%) |
| 7 | 7/10 (70%) | 3/10 (30%) |
| 8 | 9/10 (90%) | 3/10 (30%) |
| 9 | 10/10 (100%) | 3/10 (30%) |
| 10 | 10/10 (100%) | 3/10 (30%) |
| 11 | 4/10 (40%) | 3/10 (30%) |
| 12 | 8/10 (80%) | 3/10 (30%) |
| 13 | 9/10 (90%) | 3/10 (30%) |
| 14 | 8/10 (80%) | 3/10 (30%) |
| 15 | 10/10 (100%) | 3/10 (30%) |
| 16 | 9/10 (90%) | 3/10 (30%) |
| 17 | 9/10 (90%) | 3/10 (30%) |
| 18 | 9/10 (90%) | 3/10 (30%) |
| 19 | 10/11 (91%) | 3/11 (27%) |
| 20 | 10/10 (100%) | 3/10 (30%) |
| 21 | 10/10 (100%) | 3/10 (30%) |
| 22 | 10/11 (91%) | 3/11 (27%) |
| 23 | 10/10 (100%) | 3/10 (30%) |
| 24 | 10/10 (100%) | 3/10 (30%) |
| 25 | 10/10 (100%) | 3/10 (30%) |
| 26 | 10/10 (100%) | 4/10 (40%) |
| 27 | 9/10 (90%) | 3/10 (30%) |
| 28 | 9/10 (90%) | 3/10 (30%) |
| 29 | 10/10 (100%) | 3/10 (30%) |
| 30 | 6/10 (60%) | 3/10 (30%) |
| 31 | 8/10 (80%) | 3/10 (30%) |
| 32 | 8/10 (80%) | 3/10 (30%) |
| 33 | 10/10 (100%) | 3/10 (30%) |
| 34 | 9/10 (90%) | 3/10 (30%) |
| 35 | 9/10 (90%) | 3/10 (30%) |
| 36 | 10/10 (100%) | 3/10 (30%) |
| 37 | 10/10 (100%) | 3/10 (30%) |
| 38 | 10/10 (100%) | 3/10 (30%) |
| 39 | 11/11 (100%) | 3/11 (27%) |
| 40 | 7/10 (70%) | 3/10 (30%) |
| 41 | 10/10 (100%) | 3/10 (30%) |
| 42 | 9/10 (90%) | 3/10 (30%) |
| 43 | 10/10 (100%) | 3/10 (30%) |
| 44 | 10/10 (100%) | 3/10 (30%) |
| 45 | 9/10 (90%) | 3/10 (30%) |
| 46 | 10/10 (100%) | 3/10 (30%) |
| 47 | 10/10 (100%) | 3/10 (30%) |
| 48 | 12/12 (100%) | 3/12 (25%) |
| 49 | 10/10 (100%) | 3/10 (30%) |
| 50 | 9/10 (90%) | 3/10 (30%) |
| 51 | 10/10 (100%) | 3/10 (30%) |
| 52 | 10/10 (100%) | 3/10 (30%) |

### 1910 track, by week

| Week | Before | After |
|---|---|---|
| 1 | 9/10 (90%) | 3/10 (30%) |
| 2 | 9/11 (82%) | 3/11 (27%) |
| 3 | 11/11 (100%) | 3/11 (27%) |
| 4 | 10/11 (91%) | 3/11 (27%) |
| 5 | 10/11 (91%) | 3/11 (27%) |
| 6 | 7/12 (58%) | 3/12 (25%) |
| 7 | 11/12 (92%) | 3/12 (25%) |
| 8 | 11/12 (92%) | 3/12 (25%) |
| 9 | 8/12 (67%) | 3/12 (25%) |
| 10 | 9/12 (75%) | 3/12 (25%) |
| 11 | 10/12 (83%) | 3/12 (25%) |
| 12 | 11/12 (92%) | 3/12 (25%) |
| 13 | 6/12 (50%) | 3/12 (25%) |
| 14 | 11/12 (92%) | 3/12 (25%) |
| 15 | 11/11 (100%) | 3/11 (27%) |
| 16 | 10/12 (83%) | 3/12 (25%) |
| 17 | 12/12 (100%) | 3/12 (25%) |
| 18 | 10/12 (83%) | 3/12 (25%) |
| 19 | 10/12 (83%) | 3/12 (25%) |
| 20 | 10/11 (91%) | 3/11 (27%) |
| 21 | 11/12 (92%) | 3/12 (25%) |
| 22 | 11/11 (100%) | 3/11 (27%) |
| 23 | 11/12 (92%) | 3/12 (25%) |
| 24 | 10/12 (83%) | 3/12 (25%) |
| 25 | 12/12 (100%) | 3/12 (25%) |
| 26 | 10/10 (100%) | 3/10 (30%) |
