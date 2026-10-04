# Review Report: Content Fixes Batch

The user's instructions for this batch:
1. 1926 W2 Q2: replace the "licensed professional engineer" option.
2. 1926 W18 Q10: correct the explanation.
3. Trim correct options over 200 characters without changing their meaning, and stay inside the length rule.
4. Replace throwaway wrong options with plausible ones where the length rule allows.

Full before/after text for every change is in `reports/changelog-content-fixes.md`.

## What changed

| | 1926 | 1910 |
|---|---|---|
| Wrong options rewritten | 184 | 49 |
| Correct options trimmed | 19 | 5 |
| Explanations rewritten | 1 (W18 Q10) | 0 |
| Questions, citations, answer keys | unchanged | unchanged |

- **Throwaways:** 222 candidates were reviewed. These are wrong options that dismiss the question, such as "Nothing", "None", "Never", "No one", "X is optional" and "Any method". 214 were replaced and 8 were kept, with reasons listed below. The remaining wrong-option rewrites were adjustments to keep the length rule after a trim, plus fixes from the second check.
- **1926 W2 Q2:** the "licensed professional engineer" option is now a person with authority to stop work who relies on an outside consultant to identify hazards. It is clearly wrong under 1926.32(f), which requires the person to be capable of identifying the hazards.
- **1926 W18 Q10:** the job-site example now has the crew climb out before the box is lifted to reset it. Climbing out before a horizontal drag is described as good practice, not as a 1926.652(g)(1)(iv) requirement.

## Length rule (build check)

| | Correct option is longest | Worst week | Weeks over 40% |
|---|---|---|---|
| 1926 | 152/525 (29.0%) | 40% (W26, approved) | 0 |
| 1910 | 78/301 (25.9%) | 30% | 0 |

Every week except 1926 W26 is at or under 30%.

## Trimmed correct options (24)

The list covers every correct option that was over 200 characters at the start of the batch: 24, not 13. The 13 flagged earlier were only the ones the rebalance drafters had to skip.

| Question | Before → after (characters) |
|---|---|
| 1926 W1 Q5 | 324 → 237 |
| 1926 W7 Q5 | 222 → 198 |
| 1926 W13 Q4 | 291 → 213 |
| 1926 W15 Q9 | 210 → 183 |
| 1926 W17 Q4 | 204 → 186 |
| 1926 W18 Q6 | 213 → 190 |
| 1926 W22 Q2 | 237 → 181 |
| 1926 W25 Q9 | 248 → 189 |
| 1926 W34 Q1 | 232 → 191 |
| 1926 W37 Q7 | 204 → 185 |
| 1926 W37 Q9 | 207 → 181 |
| 1926 W39 Q11 | 207 → 183 |
| 1926 W43 Q1 | 275 → 196 |
| 1926 W43 Q10 | 234 → 190 |
| 1926 W45 Q10 | 209 → 198 |
| 1926 W46 Q10 | 268 → 267 |
| 1926 W48 Q6 | 207 → 183 |
| 1926 W50 Q6 | 225 → 190 |
| 1926 W52 Q9 | 227 → 191 |
| 1910 W1 Q5 | 287 → 235 |
| 1910 W14 Q9 | 211 → 188 |
| 1910 W20 Q6 | 299 → 267 |
| 1910 W22 Q7 | 244 → 185 |
| 1910 W25 Q2 | 212 → 196 |

**Five are still over 200,** because meaning took priority over length:
- 1926 W1 Q5: the four 1977.12(b)(2) conditions.
- 1926 W13 Q4: the falling-object options in 1926.451(h)(2).
- 1926 W46 Q10: the scaffold retraining triggers in 1926.454(c). This is effectively untrimmed (268 → 267). Every shorter version dropped "has reason to believe" or a trigger.
- 1910 W1 Q5: the HazCom workplace label in 1910.1200(f)(6).
- 1910 W20 Q6: the pre-startup safety review in 1910.119(i).

Earlier, tighter versions of these were written as clipped lists. The second check failed them, either for lost conditions or because the clipped style gave away the answer.

**Trims where the correct option is now the longest:** 1926 W1 Q5, W7 Q5 and W46 Q10, and 1910 W1 Q5. Each is in a week that still has room under 30%. In every other trimmed question, a wrong option is still at least 8 characters longer.

**One trim leaves a phrase implied:** 1926 W43 Q1 drops "used in construction". The question stem already places it in Subpart W of Part 1926.

## Throwaways kept (8)

| Question | Option | Why kept |
|---|---|---|
| 1926 W2 Q4 | "Any employee over 18" | Age as qualification is a real misconception. The rule turns on training or experience. |
| 1926 W5 Q6 | "None, if workers can drive somewhere" | Misapplies the mobile-crew exception in 1926.51(c)(4). |
| 1926 W22 Q1 | "Any supervisor" | Tempting wrong party. No shorter clear replacement fit the length rank. |
| 1926 W24 Q8 | "No one, including erectors" | Common belief. 1926.704(e) allows the erectors. |
| 1926 W31 Q1 | "Any employee wearing rubber gloves" | Common misconception. The rule limits the work to qualified employees. |
| 1926 W31 Q7 | "None" | Misreads the 1926.50(c) exemption. The correct option is too short for a longer replacement. |
| 1910 W21 Q2 | "Any employee with a forklift card" | A forklift card taken as crane authorization is a real misconception. |
| 1910 W23 Q1 | "No one" | The correct option is 12 characters, and no plausible party fits under it. |

## Second check

Every changed question was checked against the cited eCFR text by an agent that didn't draft it.
- **First pass:** 202 of 222 passed. The 20 failures were:
  - trims that lost a condition or read as clipped lists (8);
  - near-duplicate options (6);
  - options partly true under another paragraph (4);
  - odd-one-out tells (2).
- **Re-checks:** I fixed the failures and they were re-checked. 5 failed again and were fixed again. The one that failed a third time was replaced with the checker's own suggestion, which it had already judged.
- **Final:** every changed question passed.
- **Before the check:** I sent five trims back to their drafters because they changed meaning: 1910 W20 Q6, 1926 W1 Q5, W43 Q1, W43 Q10 and W46 Q10.
