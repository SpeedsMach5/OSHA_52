# OSHA_52 Content Rebuild: Review Report (Batch 5)

Prepared 2026-10-04. This batch covers **1926 weeks 41-50** (102 questions), the **Week 34 replacement** (Aerial Lifts), and **1910 weeks 17-20** (47 questions). **It is committed locally only and has not been pushed;** I'll push once you approve. Batch 4 was pushed per your approval.

| File | Change |
|---|---|
| `data/osha1926.json` | Weeks 41-50 added. Week 34 replaced with Aerial Lifts (1926.453). All other earlier weeks unchanged. |
| `data/osha1910.json` | Weeks 17-20 added. Weeks 1-16 unchanged. |
| `reports/changelog-1926-weeks-41-50.md` | New |
| `reports/changelog-1926-weeks-31-40.md` | Regenerated for the new Week 34 |
| `sources/ecfr/` | New sources: 1926.453 context, 1926.1000-.1003, 1926.105/.106 context, 1904.1, .2, .30, .31, .46, 1926.33, 1910.165, 1910.95, .106, .252-.254, .119, plus **Appendix A to Part 1926** (`1926-AppendixA-Designations.txt`) |

---

## 1. 1926.159: what I found

You were right that 1926.159 is assigned to employee alarm systems, but its text is not printed anywhere in Part 1926.

| Check | Result |
|---|---|
| Current Subpart F in the eCFR structure | Lists only 1926.150-1926.155. There is no 1926.156-1926.159. |
| eCFR version history for 1926.159 | Zero versions on record. |
| eCFR full-text search for "1926.159" | Found only in references *to* it: 1926.35(c)(1) and 1926.65 (alarms "installed in accordance with 29 CFR 1926.159"), plus **Appendix A to Part 1926**. |
| **Appendix A to Part 1926**, "Designations for General Industry Standards Incorporated Into Body of Construction Standards" | Assigns **1926.156 = 1910.160, 1926.157 = 1910.162, 1926.158 = 1910.164, and 1926.159 = 1910.165 (Employee alarm systems)**. |
| osha.gov pages for 1926.156-.159 | Return 403 (not available). 1926.155 returns 200. |

**Conclusion:** 1926.159 is a designation that points to the general-industry alarm standard, 1910.165, through Appendix A. The construction alarm requirement in 1926.35(c)(1) is therefore 1910.165 in substance. I saved Appendix A and pulled 1910.165 as sources.

**Offer:** Week 39 Q7 currently avoids the alarm rule. I can add an alarm question there citing `1926.35(c)(1)` together with `1910.165` (via the Appendix A designation), the same way Weeks 27 and 29 cite both standards.

---

## 2. Your direction, applied

| Item | Result |
|---|---|
| **Week 34** | Aerial lifts is not a full week anywhere else in the 1926 track (Week 10 covers scaffolds only), so Week 34 is now **Aerial Lifts (1926.453)**: 10 questions. Subpart W remains Week 43, as approved. |
| **Lead records** | Left as is (W37 Q10 stays on the PEL). |
| **Week 48** | Built for construction on Part 1904 as you specified: separate logs (1904.30(a)), short-term projects (1904.30(b)(1)), linking floating employees (1904.30(b)(3)), central records (1904.30(b)(2)), whose log a subcontractor's injury goes on (1904.31(b)(3)), temporary and leased workers (1904.31(b)(2), (b)(4)), self-employed workers (1904.31(b)(1)), and work-zone vehicle crashes (1904.39(b)(3)). It does not reuse any 1910 Week 16 paragraph. 12 questions. |
| **Weeks 41-50 replacement topics** | Swapped in as approved: Stairways, Working Over Water + Safety Nets, ROPS, Hoists, Steel Erection CDZ, Fall Protection Training, Crane Power Line Safety, Recordkeeping, Hoisting Personnel, HAZWOPER. |

---

## 3. Second check results (every question in this batch)

| Scope | Result | Fixed |
|---|---|---|
| 1926 W34 + W41-45 | 54 of 60 supported, 6 problems | All |
| 1926 W46-50 | 44 of 52 supported, 8 problems | All |
| 1910 W17-20 | 43 of 47 supported, 4 problems | All |

**No marked answer was wrong.** The problems:
- **Citations that named only part of the rule (6):** W45 Q4 and Q7, W46 Q4, W49 Q5, 1910 W17 Q10, and 1910 W20 Q11. Each now names every paragraph the answer relies on.
- **Scope wording (5):**
  - W43 Q3: the ISO 3471 requirement applies to the equipment in 1926.1001(a), not to all tractors.
  - W46 Q10: retraining applies to changes that present a hazard the worker wasn't trained on.
  - W50 Q8: the medical exam schedule covers only specific employee groups.
  - W45 Q10: added "or its authorized representative".
  - W42 Q6: 1926.500(a)(2)(v) only says where tank and tower fall protection rules are found; I added 1926.500(a)(3)(iv).
- **Explanation and option wording (5):** W34 Q9, W47 Q2, W50 Q9, 1910 W20 Q1, and 1910 W20 Q6 (the PSSR answer now includes training).
- **Week 48 premise (Q1, Q2, Q5, Q6). Flag for you:**
  - **Rule text:** 1904.30(a) requires a separate 300 Log for each *establishment* expected to operate a year or more. For construction, 1904.46 defines the establishment as the office that supervises the work.
  - **Interpretation, not rule text:** treating a year-plus *jobsite* as its own establishment comes from OSHA's interpretation.
  - **What I changed:** the questions now state that premise in the question itself, and the explanation labels it as OSHA's interpretation, so no answer presents an interpretation as rule text.
  - W48 Q1 now says short jobs may go either on the supervising office's log or on a short-term log, matching Q3. W48 Q6 now presents central recordkeeping as conditional on the 7-day transmission.

---

## 4. Other flags

1. **Week 42 (Safety Nets):** 1926.105 is the fall protection rule for **erecting tanks and communication/broadcast towers** (1926.500(a)(2)(v)). It sets nets at no more than 25 ft below the work surface, versus 30 ft in 1926.502(c)(1) for other Subpart M work. The questions are framed that way, and Q8 says so explicitly. If your crews don't erect tanks or towers, the net half of Week 42 is low-value; Working Over or Near Water (1926.106) supplies 5 of its 10 questions.
2. **Week 43 manufacture dates:** the rules use "before", "on or after", and (for compactors and skid steers in 1926.1000(a)) "after" July 15, 2019. The reviewer confirmed each question matches its paragraph.
3. **Week 47 vs Week 21:** Week 21 already used Table A, so Week 47 covers the rest of 1926.1408: work zone, options, planning meeting, tag lines, warning line, additional measures, voltage information, operating below lines, presumed energized, and training.

### Resource URL changes, all live-checked (200) on 2026-10-04

Every original Week 41-50 resource was replaced, because the week topics changed. Most were 404 `.../sites/default/files/*.pdf` paths; the live originals were generic topic pages for the retired topics. The new resources are the osha.gov pages for each standard, eCFR paragraph anchors, and OSHA's cranes, fall protection, recordkeeping, and hazardous waste topic pages. The full old → new list is in `changelog-1926-weeks-41-50.md` and, for Week 34, `changelog-1926-weeks-31-40.md`. OSHA's aerial-lifts topic page (`/aerial-lifts`) returned 404 and was not used.

---

## 5. 1910 weeks 17-20

| Week | Title | Questions | Duration |
|---|---|---|---|
| 17 | Occupational Noise and Hearing Conservation (1910.95) | 12 | 60 |
| 18 | Flammable Liquids (1910.106) | 12 | 45 |
| 19 | Welding, Cutting, and Brazing (1910.252-.254) | 12 | 60 |
| 20 | Process Safety Management (1910.119) | 11 | 60 |

- **Week 17** uses the general-industry hearing conservation rules (85 dBA action level, audiograms, training, records). Those are correct for 1910 and were removed from the 1926 noise week.
- **Week 19 Q4** treats the hot work permit in 1910.252(a)(2)(iv) as "preferably" written, not mandatory. **Week 20 Q7** cites the mandatory PSM hot work permit in 1910.119(k).
- **Week 18:** OSHA's flammable-liquids topic page returned 404, so Week 18 has two resources: the osha.gov standard page and the eCFR link.

**Overall answer balance:** 1926 A/B/C/D = 114/134/138/118; 1910 = 53/64/67/48.
