# OSHA_52 Phase 1: Final Summary

Prepared 2026-10-04. Phase 1 (content only) is complete: both tracks are fully drafted, cited, and source-backed. The final batch (batch 6) is **committed locally and not pushed**, pending your approval. Phase 2 (app rebuild) has not started.

---

## 1. Totals

| Track | Weeks | Questions | Total duration | Durations (30 / 45 / 60 min) | Resources |
|---|---|---|---|---|---|
| **29 CFR 1926** (construction) | 52 | 525 | 2,580 min (43 h) | 3 / 30 / 19 weeks | 159 |
| **29 CFR 1910** (general industry) | 26 | 301 | 1,380 min (23 h) | 2 / 8 / 16 weeks | 93 |

- **Files:** `OSHA_52/data/osha1926.json` and `OSHA_52/data/osha1910.json`.
- **Format:** each week has `standard`, `week`, `title`, `duration`, `topics`, `resources` (title, url, type, description), and `test`. Each question has `question`, 4 `options`, a 0-based `correctAnswer`, an `explanation`, and a `citation`.
- **Answer balance:** 1926 A/B/C/D = 119/139/145/122; 1910 = 71/83/85/62.
- **Sources:** `OSHA_52/sources/ecfr/` holds the eCFR text for every cited section, retrieved 2026-10-04, Title 29 current as of 2026-09-30. `OSHA_52/sources/osha-guidance/` holds the two OSHA interpretation sources used in Week 48.
- **Change logs:** `OSHA_52/reports/changelog-1926-weeks-*.md` show original vs. new for all 52 weeks, with the reason for each change.

---

## 2. Batch 6 (final) changes

| Item | Result |
|---|---|
| **1926 Week 39** | Added Q11: alarm rule citing `1926.35(c)(1) and 1910.165(b)(2) (via 1926 Appendix A)`. It is excluded from answer rebalancing so the option order of already-approved weeks 40-50 didn't shift. |
| **1926 Week 42** | The five 1926.105 tank/tower questions are replaced with 1926.502(c)(2), (c)(4)(i), (c)(5), (c)(6), and (c)(7). None repeats Week 11, which tests only (c)(1). The 1926.105 resource is replaced with the eCFR 1926.502(c) anchor. |
| **1926 Week 48** | The jobsite-as-establishment premise (Q2, Q5) now cites **OSHA's Recordkeeping Policies and Procedures Manual, CPL 02-00-135**. Its construction section says: "Construction work sites... scheduled to continue for a year or more: A separate OSHA 300 Log must be maintained for each establishment." The **February 28, 2014 interpretation letter** on 1904.30 is also cited. Both are saved under `sources/osha-guidance/` and labeled as interpretation. CPL 02-00-135 replaced the generic recordkeeping page as a Week 48 resource. |
| **1910 Week 18** | Third resource added: OSHA Directorate of Training and Education, "Flammable Liquids 29 CFR 1910.106" (live PDF). The eCFR 1910.106 page was already one of the two. |
| **1926 Weeks 51-52** | Arc Welding and Cutting (1926.351, using only paragraphs Weeks 25-26 did not test), and **Lift-Slab and Precast Construction** (1926.705, plus 1926.704(a)). |
| **1910 Weeks 21-26** | Overhead Cranes and Slings, Medical/First Aid/Sanitation, Hand and Portable Powered Tools, Air Contaminants and Silica, HAZWOPER, and Access to Exposure and Medical Records: 69 questions. |

**Second check, batch 6:**

| Scope | Result |
|---|---|
| 1926 changes (W39 Q11, W42 Q6-10, W48 Q2 and Q5, W51, W52) | 27 of 28 supported; 1 fixed (W51 Q5 scenario) |
| 1910 W21-23 | 30 of 35 supported; 5 fixed |
| 1910 W24-26 | 30 of 34 supported; 4 fixed |

- **No wrong answer keys were found.**
- **The most significant fix:** 1910 W23 Q9 presented powder-actuated tool edge distances without the low-velocity-tool exception in 1910.243(d)(4)(ix)(a).
- **A correction to my own brief:** the drafting worker found I had the general-industry silica medical-surveillance trigger wrong. It is "at or above the action level for 30 or more days per year" (1910.1053(i)(1)(i)), and the question follows the text.

---

## 3. Remaining open flags

1. **No second check yet on 1926 weeks 1-30 (except W17 Q4) or 1910 weeks 1-4: about 343 questions.**
   - These were drafted before the independent check existed. When you extended the check to my own drafts (batch 4), I applied it to new batches only and did not go back.
   - Every later batch had a similar rate of citation and scope problems, so these weeks likely have some too. No later check found a wrong answer key, but these 343 questions haven't had that check.
   - **Recommendation:** run the same check on them before Phase 2 uses the data.
2. **Lead records cross-reference (1926.62(n)(1)(iii)):** the current eCFR text says records are kept "in accordance with 29 CFR 1910.33", which looks like an outdated reference. Per your direction it's left as is; W37 Q10 tests the lead exposure limit instead.
3. **1926.159 is not printed in Part 1926.** Appendix A to Part 1926 designates it as 1910.165 (employee alarm systems). Week 39 Q11 relies on that designation.
4. **W17 Q4 (Type C benching)** describes what Appendix B's Figure B-1 *shows* for Type C (simple slopes only). The reviewer confirmed it doesn't read an absence as a rule, but the regulation has no explicit ban on benching in Type C soil.
5. **Images in the eCFR that no answer uses:** Table F-1 (extinguisher classes), Figure C.1 (HazCom pictogram symbols), the drawings in Appendix B to Subpart P, and Table H-2 (wire rope clips).
   - Table B-1 is also an image in the eCFR, but OSHA's text version is saved (`1926-SubpartP-AppendixB-osha-text.txt`).
6. **Phase-in date:** 1910 Week 8 Q4 tests the November 18, 2036 fixed-ladder deadline (1910.28(b)(9)(i)(D)). It will need revision after that date.
7. **Topic overlap between tracks, accepted by design:**
   - 1926 W27 ↔ 1910 W1 (HazCom)
   - 1926 W29 ↔ 1910 W3 (respiratory protection)
   - 1926 W48 ↔ 1910 W16 (Part 1904)
   - 1926 W50 ↔ 1910 W25 (HAZWOPER)
8. **Week 52's title changed** from the approved "Precast, Lift-Slab, and Masonry" to **"Lift-Slab and Precast Construction"**. Both masonry paragraphs (1926.706(a) and (b)) are already tested in Week 24.
9. **Durations** are my judgment (30, 45, or 60 minutes, by scope and complexity). Please review them before Phase 2 uses them for scheduling.
10. **The app is not wired to the new data.** `src/` and `compiled/` still read the old `weeklyData.js` and `WeeklyTests.jsx`, which contain the original unverified questions and dead links. That's Phase 2 work.
11. **Batch 6 is not pushed** (local commit only).

---

## 4. Questions that rely on interpretation or incorporation

**Questions that rely on OSHA interpretation (not regulation text):**

| Question | Citation | Interpretation relied on |
|---|---|---|
| 1926 W48 Q2 | `1904.30(a) (with CPL 02-00-135)` | A construction work site scheduled to continue a year or more is an establishment that needs its own 300 Log. Source: CPL 02-00-135; 2014-02-28 interpretation letter. |
| 1926 W48 Q5 | `1904.30(b)(4) (with CPL 02-00-135)` | Same premise: the 2-year project is a separate establishment. |

Both questions state the premise in the question itself, and both explanations say it is interpretation, not rule text.

**Questions that rely on incorporation by reference.** This is regulation text, but the rule sits in a different standard than the one named in the question:

| Questions | Mechanism |
|---|---|
| 1926 W27 Q1-Q10 | 1926.59 makes construction HazCom identical to 1910.1200. Cited as `1910.1200(...) (via 1926.59)`. |
| 1926 W29 Q1-Q10 | 1926.103 makes construction respiratory protection identical to 1910.134. Cited as `1910.134(...) (via 1926.103)`. |
| 1926 W39 Q11 | 1926.35(c)(1) → 1926.159 → 1910.165, via Appendix A to Part 1926. |

**Appendix citations:**
- 1926 W17 Q3, Q4, Q8 and W18 Q1-Q3: Appendices A and B to Subpart P.
- 1926 W27 Q10: Appendix C to 1910.1200.

---

## 5. Resource link verification

**All 224 unique resource URLs across both tracks returned 200 on a final pass on 2026-10-04.** Each eCFR page was confirmed by its actual eCFR page title.

During that pass, eCFR rate-limited and briefly bot-blocked the checker. Its block page also returns 200, so I re-verified the 27 affected eCFR URLs one by one, requiring a genuine eCFR page title.

**Verified only as far as an HTTP check allows:**
- **25 eCFR paragraph anchors** (e.g. `...section-1926.451#p-1926.451(f)(3)`): the page loads, but an HTTP check can't confirm the browser lands on that paragraph.
- **5 PDFs:** status and type confirmed, contents not opened.
  - OSHA3151 (PPE)
  - OSHA3124 (Stairways and Ladders)
  - OSHA2226 (Trenching)
  - OSHA3636 (HazCom/GHS)
  - the 1910.106 training guide
- **Not used because they returned 404:**
  - `osha.gov/aerial-lifts`
  - `osha.gov/flammable-liquids`
  - `osha.gov/overhead-cranes` (1910 W21 uses `osha.gov/cranes-derricks` instead)
  - `osha.gov/confined-spaces/construction` (replaced by `osha.gov/confined-spaces-construction`)

Nothing in the new data files is unverified.
