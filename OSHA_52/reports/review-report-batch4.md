# OSHA_52 Content Rebuild: Review Report (Batch 4)

Prepared 2026-10-04. This batch covers **1926 weeks 31-40** (100 questions) and **1910 weeks 13-16** (47 questions), plus your batch 3 follow-ups. **It is committed locally only and has not been pushed;** I'll push once you approve.

| File | Change |
|---|---|
| `data/osha1926.json` | Weeks 31-40 added. W17 Q4 reworded. W27 and W29 citation fields now name both standards. |
| `data/osha1910.json` | Weeks 13-16 added. The five fixes to weeks 5-8 are applied. |
| `reports/changelog-1926-weeks-31-40.md` | New |
| `reports/changelog-1926-weeks-11-20.md`, `...-21-30.md` | Regenerated for W17 Q4 and the W27/W29 citations |
| `sources/ecfr/` | Source text for new citations: Subpart V, 1926.97, .603, .604, .800, .803, .55, .57, .1153, .62, .1101, .53, .54, plus 1910.157, .146, .1030 and Part 1904 sections |

---

## 1. Second check: every batch, including my own drafts

Every question was checked by a separate reviewer with no part in drafting. All flagged items are fixed in this commit.

| Scope | Result | Fixed |
|---|---|---|
| 1926 weeks 31-35 + W17 Q4 (my drafts) | 49 of 51 supported; 2 wording issues | W17 Q4 answer reworded. W32 Q10 adds the 1-inch rear-mesh opening. W33 Q3 notes the 1926.800(c) exception for completed facilities. |
| 1926 weeks 36-40 (my drafts) | 42 of 50 supported; 8 problems | See below |
| 1910 weeks 13-16 (worker draft) | 46 of 47 supported; 1 overstatement | W14 Q8: "annual program review" changed to "within 1 year after each entry" (1910.146(d)(14)) |

**The two real problems were in my lead questions:**
- **W37 Q2:** the wording "(including blood lead monitoring)" made the distractor "above the action level for a single day" also correct, because initial blood monitoring applies on any day (1926.62(j)(1)(i)). Fix: the question now asks specifically about the full (j)(2)/(j)(3) program, and the distractor is replaced.
- **W37 Q3:** the distractor "whenever the worker prefers" was close to the real rule that respirators must be provided when an employee requests one (1926.62(f)(1)(iii)). Fix: the distractor is replaced, and the employee-request trigger is added to the correct answer and the explanation.

**Smaller fixes:**
- **Citations that named only part of the rule** were widened to the full paragraph range:
  - W37 Q7: 1926.62(h)(2)-(5)
  - W37 Q8: 1926.62(l)(1)(iii)-(iv)
  - W39 Q10: 1926.150(a)(2)-(3)
  - W40 Q3: 1926.54(a)-(b)
  - W40 Q5: 1926.54(d)-(e)
- **W39 Q1** duplicated Q8 (both tested 1926.35(b)(3)). It now tests (b)(5), the preferred means of reporting emergencies.

### W17 Q4 (Type C benching)

The reviewer's verdict is that the question **does not depend on reading an absence as a rule.** It asks what Figure B-1/B-1.3 *shows*, and the answer describes exactly that:
- a simple slope at 1 1/2:1;
- a shielded or supported vertically sided lower portion at 1 1/2:1;
- no benched configuration shown.

The explanation also notes that other Type C configurations go through 1926.652(b), per B-1.3 item 3. I applied the reviewer's wording tweak, which removes "only" so it can't be read as a ban. No swap to the max-slope question is needed, which matters because Week 17 Q3 already asks the Type C 1 1/2:1 maximum slope; swapping would have duplicated it.

### 1910 weeks 5-8 fixes (approved)

All five are applied:
- W6 Q11: dropped the uncited Part 1904 claim.
- W7 Q8: citation widened to 1910.23(b)(11)-(12).
- W8 Q12: citation widened to 1910.30(a)(1)-(2).
- W8 Q2: designated-area wording corrected per (b)(13)(ii) and (iii)(A).
- W8 Q6: "downward" added to the 39-inch rule.

---

## 2. Your direction, applied

| Item | Result |
|---|---|
| Push policy | This batch is committed locally only. I'll push after your approval. Saved as a standing rule. |
| W27 and W29 cite both standards | The `citation` field reads, e.g., `1910.1200(f)(1) (via 1926.59)` and `1910.134(f)(2) (via 1926.103)`. Each explanation already states the 1926 rule that adopts the 1910 standard. |
| Noise week (W30) | No 1910.95 rules came back in. 1926.52 plus 1926.101 already support all 10 questions (Q3 cites 1926.101(a)). |
| Week 32 | Rebuilt as **Pile Driving and Site Clearing** (1926.603, 1926.604), per your choice. |

---

## 3. 1926 weeks 31-40

| Category | Count |
|---|---|
| Week topic replaced per approval (W32, W35, W40) | 30 |
| Answer was correct (now cited) | 22 |
| Overstated or oversimplified | 27 |
| Off-topic for the cited standard (W34: air-tool questions under 1926.803) | 10 |
| Unsupported | 6 |
| Off-topic | 1 |
| Not in 1926 or not in Subpart V | 2 |
| Wrong trigger (W36 Q4 medical surveillance) | 1 |
| Replaced pending a cross-reference question (W37 Q10) | 1 |

**Flags for your review:**

1. **Week 34 was about the wrong standard.** Its cited resource, 1926.803, regulates *work in compressed-air environments* (caissons and tunnels: physicians, medical locks, decompression). All ten original questions were about compressed-air *tools*, which are 1926.302(b) and already covered in Week 8. I rebuilt Week 34 to match 1926.803 and retitled it **"Work in Compressed Air"**. If your crews never work in caissons or pressurized tunnels, this week may not be useful. Tell me if you'd rather replace it with another 1926 topic.
2. **Week 36 Q4 (silica medical surveillance):** the original trigger was wrong. It said "exposed above the PEL 30+ days/year"; the construction trigger is *respirator use* for 30 or more days per year (1926.1153(h)(1)(i)). Also corrected:
   - **"Regulated areas" (Q6):** this comes from the general-industry standard (1910.1053). 1926.1153 uses access restriction in the written exposure control plan instead.
   - **"Annual" training (Q8):** not in 1926.1153.
3. **Two dangling cross-references in the current eCFR text:**
   - **1926.62(n)(1)(iii)** says lead exposure records are kept "in accordance with 29 CFR 1910.33". That looks like an outdated reference (1910.1020 is the records standard). I avoided a records question for lead and used the PEL instead (W37 Q10).
   - **1926.35(c)(1)** requires an alarm system complying with **1926.159**, but 1926.159 does not exist in the current eCFR; the API and structure listing both confirm it. No question relies on it.
4. **Week 40's Q1 scenario** mentions agreement-state licenses as context. 1926.53 itself only references NRC 10 CFR part 20.

### Resource URL changes (weeks 31-40), all live-checked (200) on 2026-10-04

| Week | Old (status) | New |
|---|---|---|
| 31 | `line-clearance.pdf` (404) | osha.gov 1926.960 |
| 32 | osha.gov 1926.600 (200; week topic changed) | osha.gov 1926.603 |
| 32 | `equipment-inspection.pdf` (404) | osha.gov 1926.604 |
| 32 | `equipment-operation.pdf` (404) | eCFR 1926.603(a) anchor |
| 33 | `air-monitoring.pdf` (404) | eCFR 1926.800(j) anchor |
| 33 | `underground-emergency.pdf` (404) | eCFR 1926.800(g) anchor |
| 34 | `compressed-air-safety.pdf` (404) | eCFR 1926.803(b) anchor |
| 34 | `air-equipment-inspection.pdf` (404) | eCFR 1926.803(f) anchor |
| 35 | osha.gov 1926.51 (200; topic changed) | osha.gov 1926.55 |
| 35 | heat-exposure page (200; topic changed) | osha.gov 1926.57 |
| 35 | winter-weather page (200; topic changed) | eCFR 1926.55 |
| 36 | `silica/SilicaControlOptions.pdf` (dead; redirects to a topic page) | eCFR 1926.1153 (per your direction) |
| 36 | `silica/medicalsurveillance.pdf` (dead; redirects to a topic page) | OSHA silica construction page (per your direction) |
| 37 | `lead-monitoring.pdf` (404) | eCFR 1926.62(d) anchor |
| 37 | `lead-medical.pdf` (404) | eCFR 1926.62(j) anchor |
| 38 | `asbestos-id.pdf` (404) | eCFR 1926.1101(k) anchor |
| 38 | `asbestos-control.pdf` (404) | eCFR 1926.1101(g) anchor |
| 39 | `eap-template.pdf` (404) | osha.gov 1926.50 |
| 39 | `/evacuation-plans-procedures` (404) | OSHA Evacuation Plans and Procedures eTool |
| 40 | incident-investigation page (200; topic changed) | osha.gov 1926.53 |
| 40 | `root-cause.pdf` (404) | osha.gov 1926.54 |
| 40 | `incident-forms.pdf` (404) | eCFR 1926.54 |

---

## 4. 1910 weeks 13-16

| Week | Title | Questions | Duration |
|---|---|---|---|
| 13 | Portable Fire Extinguishers (1910.157) | 12 | 45 |
| 14 | Permit-Required Confined Spaces (1910.146) | 12 | 60 |
| 15 | Bloodborne Pathogens (1910.1030) | 11 | 60 |
| 16 | Injury and Illness Recordkeeping and Reporting (Part 1904) | 12 | 60 |

- **Week 16 avoids repeating 1926 Week 1.** It covers recordability, work-relatedness, the 7-day entry rule, 5-year retention, certification, 24-hour reports, electronic submission, and privacy cases. **Note for 1926 Week 48**, which you set to Part 1904: it will need different angles again, or you could accept some overlap with 1910 Week 16.
- The reviewer confirmed every number against the source text, including extinguisher travel distances, the Table L-1 intervals, the 10-working-day hepatitis B offer, the 180-day cap, the March 2 submission date, and the 5-year retention.

**Overall answer balance:** 1926 A/B/C/D = 90/108/111/93; 1910 = 42/52/54/37.
