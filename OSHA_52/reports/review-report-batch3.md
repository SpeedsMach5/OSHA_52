# OSHA_52 Content Rebuild: Review Report (Batch 3)

Prepared 2026-10-04. This batch covers **1926 weeks 21-30** (101 questions) and **1910 weeks 9-12** (48 questions). It also applies your batch 2 follow-ups and the new second-check step.

| File | Change |
|---|---|
| `data/osha1926.json` | Weeks 21-30 added. Week 17 Q4 and the Week 19 resources changed per your direction; all other earlier weeks are unchanged. |
| `data/osha1910.json` | Weeks 9-12 added. Weeks 1-8 unchanged (the batch-2 check findings are **not** applied yet; see Section 1). |
| `reports/changelog-1926-weeks-21-30.md` | New |
| `reports/changelog-1926-weeks-11-20.md` | Regenerated for the Week 17 Q4 and Week 19 resource changes |
| `sources/ecfr/1926/1926-SubpartP-AppendixB-osha-text.txt` | New: OSHA.gov text version of Appendix B, including Table B-1 |
| `sources/ecfr/` | Source text for every new citation |

---

## 1. Second check on parallel-worker drafts

A separate reviewer checked each answer against its cited paragraph: whether the paragraph is the right one, whether it supports the marked answer, whether any distractor is also correct, and whether the explanation states anything unsupported. That reviewer had no part in drafting.

### 1910 weeks 5-8 (already committed in batch 2): 42 of 47 fully supported, 5 minor problems

**Every answer key is correct, and no distractor is also correct.** The problems are an incomplete citation or loose explanation wording. **I have not fixed them; your rules say to wait for confirmation.** Approve and I'll apply them in the next batch.

| Week/Q | Citation | Problem | Proposed fix |
|---|---|---|---|
| W6 Q11 | 1910.217(g)(1) | The explanation says the 30-day press report is "in addition to Part 1904". That is true, but (g)(1) doesn't say it. | Remove that clause, or cite Part 1904 separately. Optionally say the report goes to OSHA's Directorate of Standards and Guidance or electronically. |
| W7 Q8 | 1910.23(b)(12) | The answer combines facing the ladder, which is (b)(11), with grasping it, which is (b)(12). The citation names only (b)(12). | Change the citation to 1910.23(b)(11)-(12). |
| W8 Q12 | 1910.30(a)(1) | "Trained by a qualified person" is in (a)(2), not (a)(1). | Change the citation to 1910.30(a)(1)-(2). |
| W8 Q2 | 1910.28(b)(13)(i) | The explanation applies "infrequent and temporary" to all designated areas. That condition applies only from 6 to under 15 ft, under (b)(13)(ii). At 15 ft or more, (b)(13)(iii)(A) allows designated areas without it. | Reword the explanation. |
| W8 Q6 | 1910.29(b)(3) | The explanation drops "downward" from the (b)(4) 39-inch deflection rule, and its example mixes up (b)(3) and (b)(4). | Add "downward" and fix the example. |

### 1910 weeks 9-12 (this batch): all 48 supported, no problems

The reviewer re-checked every number: Table S-1 and Table S-5 values, the shade table, ceiling heights, exit widths, sign lettering, and the 10-or-fewer-employee rule. Two optional notes need no change:
- W9 Q5: you could mention that Table S-1 allows 2.5 ft for installations built before April 16, 1981.
- W9 Q11: you could add "except as otherwise permitted" to the raceway wording.

---

## 2. Batch 2 follow-ups applied

| Item | Result |
|---|---|
| **Table B-1** | Saved as text from OSHA's Appendix B page (`1926-SubpartP-AppendixB-osha-text.txt`). It confirms Stable Rock vertical, Type A 3/4:1, Type B 1:1, Type C 1 1/2:1, plus the short-term and over-20-ft PE notes. |
| **Type C benching question (W17 Q4)** | Restored. **Flag: Table B-1 does not prohibit benching in Type C, and neither does the rest of Appendix B in words.** The support is by omission: Appendix B (c)(4) requires configurations to follow Figure B-1, and Figure B-1 lists benched configurations for Type A and Type B but not Type C. The question is worded to match that, asking what Appendix B allows rather than claiming an explicit ban, and the change log says so. |
| **Week 19 resources** | OSHA 3138 replaced with osha.gov 1926.1204 (permit space program) and OSHA's "Confined Spaces in Construction" page (`https://www.osha.gov/confined-spaces-construction`). Both are live (200). The URL I tried in batch 2 (`/confined-spaces/construction`) was wrong. |
| **Weeks 42, 44, 48** | Recorded for those batches: Week 42 Working Over or Near Water (1926.106), adding Safety Nets (1926.105) if needed; Week 44 Material and Personnel Hoists (1926.552); Week 48 Part 1904 recordkeeping. Note: 1926.106 is very short (about 700 characters), so 1926.105 will almost certainly be needed. Both are already pulled. |

---

## 3. 1926 weeks 21-30

| Category | Count |
|---|---|
| Answer was correct (now cited) | 35 |
| Oversimplified or overstated | 33 |
| Unsupported, or not supportable from the text | 17 |
| Not in 1926 or not in 1910.1200 (came from another standard) | 7 |
| Duplicate topic with an earlier week | 3 |
| Off-week or off-topic | 2 |
| Known suspect (fire watch) | 1 |
| New question added | 3 (Week 30 filled from 8 to 10; one fall-zone question in Week 22) |

**Patterns:**
- **The crane weeks (21-22) used terms Subpart CC doesn't have:** "critical lift", a 75% capacity trigger, "prelift meeting" for single-crane lifts, and "calibrated level device". These were rebuilt on 1926.1408 Table A, 1926.1402, .1404, .1412, .1417, .1424, .1425, .1431 and .1432.
- **The welding weeks (25-26) had 1910 requirements and invented ones:** written hot work permits, flashback arrestors, aluminum and stainless "special ventilation", and atmospheric monitoring. These were rebuilt on 1926.350-.354. Stainless now correctly cites the nitrogen dioxide rule, 1926.353(d)(1)(iv).
- **The noise week (30) was mostly 1910.95:** the 85 dBA action level, annual audiograms, training, and records. 1926.52 has none of these, so it now uses Table D-2, the Fe formula, the 140 dB impulse "should", continuous-noise treatment, and A-scale/slow response.
- **The HazCom week (27):** SDS retention "30 years + use" was wrong. HazCom sets no SDS retention period; 30 years comes from the exposure-records rule, 1910.1020.

**Known suspects in this range:**
- **W25 Q1 (fire watch, "30 minutes"):** rewritten to 1926.352(e). To avoid repeating Week 6 Q4, it now tests what fire watch personnel must be instructed on, and the explanation notes that the half-hour rule is 1910.252(a)(2)(iii)(B).
- **W25 Q2 (hot work permit for "all hot work"):** replaced with 1926.352(a). 1926 has no permit requirement.
- **Welding distance from combustibles:** still no such question in weeks 25-26, as reported in batch 1.

**Judgment calls to flag:**
1. **Week 27 (HazCom) cites 1910.1200 paragraphs,** using the same pattern you approved for Week 29: 1926.59 states construction requirements are identical to 1910.1200, and each explanation says so. Please confirm this is fine for Week 27 too.
2. **Pictogram question (W27 Q10):** which symbol means corrosive exists only in Figure C.1, which is an image in the eCFR. The question was rewritten to the pictogram format in Appendix C (C.2.3.1): a red-framed diamond with a black symbol on white.
3. **Week 29 overlaps 1910 Week 3** by design, since both rest on 1910.134. The Week 29 questions are worded for job sites but test the same paragraphs.
4. **Table A** is cited as `1926.1408 Table A`, and Appendix C as `1910.1200 Appendix C (C.2.3.1)`, because neither sits under a single lettered paragraph.
5. **No independent second check was run on my own 1926 drafts.** You asked for it on parallel-worker drafts. I can run the same check on 1926 weeks 21-30, or on all 1926 weeks, if you want it.

### Resource URL changes (weeks 21-30), all live-checked (200) on 2026-10-04

| Week | Old (status) | New |
|---|---|---|
| 22 | `critical-lift-planning.pdf` (404) | osha.gov 1926.1432 (multiple-crane lifts) |
| 23 | `/concrete-construction/equipment` (404) | osha.gov 1926.702 (equipment and tools) |
| 24 | `concrete-safety.pdf` (404) | osha.gov 1926.706 (masonry) |
| 25 | `welding-ventilation.pdf` (404) | osha.gov 1926.353 |
| 26 | `hot-work-guide.pdf` (404) | osha.gov 1926.351 |
| 27 | `Publications/OSHA3636.pdf` (redirect) | final URL `.../publications/OSHA3636.pdf` |
| 27 | `chemical-inventory.pdf` (404) | eCFR 1910.1200(e)(1) anchor |
| 28 | `spill-response.pdf` (404) | osha.gov 1926.151 |
| 28 | `chemical-storage.pdf` (404) | eCFR 1926.152(b) anchor |
| 29 | `fit-testing.pdf` (404) | osha.gov 1926.103 (cites both, per your direction) |
| 29 | `medical-evaluation.pdf` (404) | eCFR 1910.134(e) anchor |
| 30 | `hearing-conservation.pdf` (404) | osha.gov 1926.101 |
| 30 | `noise-monitoring.pdf` (404) | eCFR 1926.52(d) anchor |

---

## 4. 1910 weeks 9-12

| Week | Title | Questions | Duration |
|---|---|---|---|
| 9 | Electrical: Design and Installation (1910.303-.305) | 12 | 60 |
| 10 | Electrical: Safety-Related Work Practices (1910.331-.335) | 12 | 60 |
| 11 | PPE: Hazard Assessment, Eye/Face, Head, Foot, Hand (1910.132, .133, .135, .136, .138) | 12 | 45 |
| 12 | Exit Routes, Emergency Action and Fire Prevention Plans (1910.36-.39) | 12 | 45 |

- **Tables used:** Table S-1 working space, Table S-5 approach distances, and the 1910.133(a)(5) filter-shade table. All three appear as text in the source files.
- **Phase-in dates:** several dates appear in the source text (the 2008 PPE payment rule, 1981 and 2007 installation dates), but none is tested as a live deadline.
- **Resources:** Week 12 uses OSHA's Evacuation Plans and Procedures eTool. All 40 URLs were checked and returned 200.

**Overall answer balance:** 1926 A/B/C/D = 66/80/86/70; 1910 = 30/39/43/26.
