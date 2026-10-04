# OSHA_52 Content Rebuild: Review Report (Batch 1)

Prepared 2026-10-04. Regulation text comes from the eCFR API (title 29, current as of 2026-09-30) and is saved under `sources/ecfr/<part>/<section>.txt`.

**This batch contains:**
- 1926 weeks 1-10, fully rewritten: 100 questions, every answer tied to a pulled paragraph.
- The 1910 26-week outline (Section 1, **needs your sign-off**).
- 1910 weeks 1-4 in full: 43 questions.

The work stops here for your review, as you asked.

Files:

| File | Contents |
|---|---|
| `data/osha1926.json` | 1926 weeks 1-10 (weeks 11-52 not yet migrated; they still live only in `src/components/WeeklyTests.jsx` and `src/data/weeklyData.js`) |
| `data/osha1910.json` | 1910 weeks 1-4 |
| `reports/changelog-1926-weeks-01-10.md` | Every 1926 question: original, new, cited paragraph, reason; plus resource URL changes |
| `sources/ecfr/` | Pulled regulation text (1926, 1910, 1903, 1904, 1977) |

---

## 1. Proposed 1910 track outline (for sign-off)

Ordered by your priority list first, then other frequently cited general-industry standards. Weeks 1-4 are written; weeks 5-26 are outline only.

| Wk | Title | Primary 29 CFR sections | Status |
|---|---|---|---|
| 1 | Hazard Communication | 1910.1200 | Written |
| 2 | Control of Hazardous Energy (Lockout/Tagout) | 1910.147 | Written |
| 3 | Respiratory Protection | 1910.134 | Written |
| 4 | Powered Industrial Trucks (Forklifts) | 1910.178 | Written |
| 5 | Machine Guarding: General Requirements | 1910.212 | Outline |
| 6 | Machine Guarding: Power Transmission, Abrasive Wheels, Presses | 1910.215, 1910.217, 1910.219 | Outline |
| 7 | Walking-Working Surfaces and Ladders | 1910.22, 1910.23, 1910.25 | Outline |
| 8 | Fall Protection Systems in General Industry | 1910.28, 1910.29, 1910.30, 1910.140 | Outline |
| 9 | Electrical: Design and Installation | 1910.303, 1910.304, 1910.305 | Outline |
| 10 | Electrical: Safety-Related Work Practices | 1910.331-1910.335 | Outline |
| 11 | PPE: Hazard Assessment, Eye/Face, Head, Foot, Hand | 1910.132, 1910.133, 1910.135, 1910.136, 1910.138 | Outline |
| 12 | Exit Routes, Emergency Action and Fire Prevention Plans | 1910.36, 1910.37, 1910.38, 1910.39 | Outline |
| 13 | Portable Fire Extinguishers | 1910.157 | Outline |
| 14 | Permit-Required Confined Spaces | 1910.146 | Outline |
| 15 | Bloodborne Pathogens | 1910.1030 | Outline |
| 16 | Injury and Illness Recordkeeping and Reporting | 29 CFR 1904 (see note A) | Outline |
| 17 | Occupational Noise and Hearing Conservation | 1910.95 | Outline |
| 18 | Flammable Liquids | 1910.106 | Outline |
| 19 | Welding, Cutting, and Brazing | 1910.252, 1910.253, 1910.254 | Outline |
| 20 | Process Safety Management (moved from 1926 Week 44) | 1910.119 | Outline |
| 21 | Overhead Cranes and Slings | 1910.179, 1910.184 | Outline |
| 22 | Medical Services, First Aid, and Sanitation | 1910.151, 1910.141 | Outline |
| 23 | Hand and Portable Powered Tools | 1910.242, 1910.243, 1910.244 | Outline |
| 24 | Air Contaminants and Respirable Crystalline Silica | 1910.1000, 1910.1053 | Outline |
| 25 | HAZWOPER and Emergency Response | 1910.120 | Outline |
| 26 | Access to Employee Exposure and Medical Records | 1910.1020 | Outline |

**Decisions needed:**
- **A. Week 16 (Recordkeeping) cites Part 1904, not 1910.** You listed recordkeeping as a priority, but no 1910 section covers it. Keep it citing 1904, or swap in a 1910 topic?
- **B. Ordering.** I used your priority order for weeks 1-4, so the track opens with HazCom rather than an intro/worker-rights week. 1926 Week 1 covers worker rights and could be shared with this track if you want an intro week.
- **C. Durations.** 1910 durations follow the same scale as 1926 (Section 7).

---

## 2. Known suspects (flagged for your review)

| Suspect | Where in the original | What the regulation says | Action this batch |
|---|---|---|---|
| **Fire watch duration** | W2 Q2 ("firewatch for 30 minutes after"), W6 Q4 ("hot work and 30 minutes after"), W25 Q1 ("minimum fire watch duration: 30 minutes"), W25 Q7 | 1926.352(e) requires fire watch personnel "for a sufficient period of time after completion of the work to ensure that no possibility of fire exists" and sets no fixed time. The half-hour minimum is general industry: 1910.252(a)(2)(iii)(B). | **W2 and W6 changed (deviation, see Section 5).** Your newer instruction was to rewrite all questions with answers tied to 1926 text, and the 30-minute answer fails that. W6 Q4 now uses the 1926.352(e) wording, and its explanation notes the 1910 half-hour rule. W2 Q2 was off-week and was replaced. Both originals are kept verbatim in the change log. **W25 Q1 and Q7 are unchanged** (later batch). |
| **Ladder angle ratio** | W12 Q1: marks "3:1 ratio" correct, but its own explanation (20-ft ladder 5 ft from the base) describes 4:1 | 1926.1053(b)(5)(i): horizontal distance from top support to foot is "approximately one-quarter of the working length", i.e. about 4:1. The original answer is wrong and contradicts its own explanation. | **Not changed** (Week 12 is in a later batch). |
| **Welding distance from combustibles** | **Not found as described.** No question in weeks 1-52 asks for a distance between welding and combustibles. The closest are W25 Q1/Q7 (fire watch) and W6 Q7 (heater clearance). | 1926.352 sets no distance. The 35-foot figures are general industry: 1910.252(a)(2)(vii) (relocate combustibles 35 ft) and 1910.252(a)(2)(iii)(A)(1) (fire watch trigger). | Nothing to change. Flagged so a 35-foot answer is not added to the 1926 track later. |
| **1910 inside the 1926 track** | No question text names "1910". But several 1926 answers were really 1910 requirements, and three weeks link 1910 standards as resources. | 1910-sourced answers found: W2 Q2 and W6 Q4 (30-min fire watch, 1910.252(a)(2)(iii)(B)); W6 Q2 (monthly extinguisher inspection, 1910.157(e)(2)); W6 Q5 and W25 Q2 (written hot work permit; 1910.252(a)(2)(iv) says only "preferably in the form of a written permit", and 1926 does not require one); W7 Q10 (pre-shift forklift inspection, 1910.178(q)(7)). 1910 resource links: W16 Lockout (1910.147), W29 Respiratory (1910.134), W44 Process Safety (1910.119). | Weeks 1-10 items were rewritten to 1926 text, and each explanation notes the 1910 origin. W25 Q2 is unchanged (later batch). W16, W29, and W44 are handled per your instructions in Section 4. |

### Other suspect answers spotted in weeks 11-52 (not changed; later batches)

These came up while checking the suspects above. They are not a full audit of weeks 11-52; that happens batch by batch.

| Week/Q | Original correct answer | Issue | Paragraph |
|---|---|---|---|
| W14 Q1 | Connector fall protection "Above 30 feet" | Oversimplified. Connectors must be protected above two stories or 30 feet, *whichever is less*, and must be provided and tied-off-ready equipment from over 15 to 30 feet. | 1926.760(b)(1), (b)(3) |
| W25 Q1 | Fire watch "30 minutes" | 1910 requirement. 1926 says "sufficient period". | 1926.352(e) vs 1910.252(a)(2)(iii)(B) |
| W25 Q2 | Hot work permit for "All hot work" | Not required by 1926. | 1926.352 (no permit provision) |
| W12 Q1 | "3:1 ratio" | Wrong; about 4:1. | 1926.1053(b)(5)(i) |
| All weeks 11-52 | 416 explanations start with "Example:" | Placeholder text, none cited. Every one will be rewritten in later batches. | — |

---

## 3. Weeks with no (or only a thin) 1926 basis: proposed replacements

**Not swapped. Awaiting your approval.** A week is listed if its resources and questions do not rest on a 1926 standard.

| Wk | Current title | 1926 basis today | Proposed replacement | Source |
|---|---|---|---|---|
| 35 | Environmental Controls | None (links are heat and winter-weather topic pages; no 1926 standard) | Gases, Vapors, Fumes, Dusts, Mists, and Ventilation | 1926.55, 1926.57 |
| 40 | Incident Investigation | None in 1926 (reporting is Part 1904) | Ionizing and Nonionizing Radiation (including lasers) | 1926.53, 1926.54 |
| 41 | Safety Program Management | Thin (1926.20(b) is already covered in Week 2) | Stairways | 1926.1050, 1926.1051, 1926.1052 |
| 42 | Workplace Violence Prevention | None | Material Hoists, Personnel Hoists, Elevators, and Conveyors | 1926.552, 1926.554, 1926.555 |
| 43 | Risk Assessment and Job Hazard Analysis | None | Rollover Protective Structures and Overhead Protection | 1926.1000, 1926.1001 |
| 45 | Workplace Security | None | Steel Erection: Connectors and Controlled Decking Zones | 1926.760 |
| 46 | Safety Leadership | None | Fall Protection Training Requirements | 1926.503 |
| 47 | Continuous Improvement | None | Cranes: Power Line Safety | 1926.1408 |
| 48 | Documentation and Record Keeping | Part 1904, not 1926 | Hexavalent Chromium and Cadmium in Construction | 1926.1126, 1926.1127 |
| 49 | Safety Training Methods | Thin (1926.21 is already covered in Week 2) | Hoisting Personnel with Cranes | 1926.1431 |
| 50 | Safety Innovation and Technology | None | Hazardous Waste Operations and Emergency Response (construction) | 1926.65 |
| 51 | Annual Review and Program Evaluation | None | Arc Welding and Cutting | 1926.351 |
| 52 | Future Planning and Goal Setting | None | Precast, Lift-Slab, and Masonry Construction | 1926.705, 1926.706 |

Notes:
- **Week 39 (Emergency Response Planning)** has a real 1926 basis (1926.35, 1926.150(e)) and stays.
- **Week 32 (Mobile Equipment Operations)** has a 1926 basis (1926.600) but largely duplicates Week 9, which now covers 1926.600-.602. Consider merging, or refocusing Week 32 on a different subpart.
- **Week 49 alternative:** if you'd rather keep a training-focused week, 1926.21 plus the training paragraphs scattered across standards (1926.454, 1926.503, 1926.1060) would give it a real basis.
- All proposed sections were pulled from the eCFR and saved under `sources/ecfr/1926/` so they can be checked.

---

## 4. Restructuring you directed (weeks outside this batch)

| Week | Direction | Plan / finding |
|---|---|---|
| **44 Process Safety Management** | Move 1910.119 to the 1910 track; replace with a 1926 topic | Moved to 1910 Week 20 in the outline. **Replacement options** (none is covered by any current 1926 week): **(1) Explosives and Blasting, Subpart U, 1926.900-1926.914 (recommended):** a real construction hazard with a dedicated subpart; Week 4 only touches the signal code. **(2) Stairways, Subpart X, 1926.1050-1926.1052:** Week 12 covers ladders only. If chosen here, Week 41's proposal above shifts. **(3) Material and Personnel Hoists, 1926.552:** if chosen here, Week 42's proposal above shifts. |
| **16 Lockout/Tagout** | Rebuild around 1926.417; note that the full LOTO program is covered in 1910 | **Finding:** 1926.417 has only three short paragraphs (tag controls, render circuits inoperative, tags identify equipment). That is not enough for 10 well-supported questions. I propose building Week 16 on **1926.417 plus 1926.416** (electrical safe work practices: deenergizing, testing, protection from energized parts), with the resource note "The full energy control program (procedures, devices, periodic inspection, training) is covered in 1910 Week 2." Please confirm that adding 1926.416 is acceptable. |
| **29 Respiratory Protection** | Keep; cite both 1926.103 and 1910.134 | **Finding:** 1926.103 is a one-line note saying construction requirements "are identical to those set forth at 29 CFR 1910.134." Citing both is consistent. Questions will cite the 1910.134 paragraph and note applicability via 1926.103. This overlaps 1910 Week 3 by design. |

---

## 5. Deviations and judgment calls

1. **Week 1 cites Parts 1903, 1904, and 1977, not 1926.** Worker rights, injury reporting, posters, and retaliation complaints are not in Part 1926. Only Q1 cites 1926 (1926.20(a)(1)). The alternative was dropping the topic, which you did not ask for.
2. **Fire watch answers changed in W2 and W6** despite the "don't change those answers" instruction. Your later instruction to tie every answer to 1926 text was incompatible with keeping the 30-minute answer. Originals are preserved in the change log.
3. **Added a `citation` field** to every question, in addition to the citation inside the explanation. It is the machine-readable paragraph reference, so any answer can be checked against `sources/`. Remove it if you want the schema strictly as specified.
4. **Answer positions were rebalanced.** Originally 39% of correct answers were "B". Options were reordered so correct answers spread across A-D (1926: 22/26/29/23; 1910: 10/11/13/9). Ordered lists (numbers, shades, SDS sections, distances) keep their natural order. The change log shows final letters.
5. **Off-week originals:** where an original question's topic was valid but belonged to another week (concrete forms, confined spaces, fall protection heights, aerial-lift power lines, load charts), it was replaced with an on-week question. Power-line clearance moved to Week 9 Q8.
6. **Dead resource links were replaced with regulation pages** (osha.gov standard page, or an eCFR paragraph anchor), per your preference for specific sections. Titles and descriptions were updated to match the new target, and the type stays `standard`/`guide` as appropriate. Old URLs are listed in the change log.
7. **Weeks 2-5 now have 10 questions.** The 20 added questions are marked "New question added" in the change log.
8. **The schema keeps the original answer convention:** `correctAnswer` is a 0-based index into `options`.
9. **No answers in weeks 11-52 were touched.** `data/osha1926.json` holds weeks 1-10 only, so it is not yet a drop-in replacement for the 52-week app data.
10. **1926.202 (Barricades)** returned 404 from the eCFR API and was not cited.

---

## 6. Resource URL verification

All 149 unique resource URLs in `src/data/weeklyData.js` were requested live on 2026-10-04 (browser user agent, following redirects):

| Result | Count |
|---|---|
| 200 OK | 63 |
| 200 OK after redirect (URL updated where replaced) | 7 |
| 404 Not Found | 78 |
| 404 after redirect | 1 |
| Network error / timeout | 0 |

- **Weeks 1-10:** all 11 dead or redirected links were replaced, and every replacement was re-checked live (200). Details are in the change log.
- **Weeks 11-52:** dead links are listed in the table below and will be replaced in their batches. Nearly all 404s are invented `osha.gov/sites/default/files/<name>.pdf` paths that never existed.

**Could not fully verify:**
- **eCFR paragraph anchors** (e.g. `https://www.ecfr.gov/current/title-29/section-1926.451#p-1926.451(f)(3)`). The page loads (200), but an HTTP check cannot confirm the browser lands on that paragraph, because anchors are client-side.
- **`https://www.osha.gov/silica/SilicaControlOptions.pdf` and `.../silica/medicalsurveillance.pdf`** return 200 only because they redirect to the general silica topic page. The documents themselves are gone. Treat them as dead.
- **PDF content** was not inspected, only status and type. `OSHA3151.pdf` (Week 3) returns `application/pdf`.

Full per-URL results for weeks 11-52 are listed below.

---

## 7. Durations and topics

- **Durations** use 30, 45, or 60 minutes, judged from each week's material: 30 for a narrow single-section topic; 45 for one standard or subpart with about 10 recall questions; 60 for multiple standards or a program-heavy topic with conditional rules. No week in this batch landed at 30. Values: 1926 W1 60, W2 45, W3 45, W4 45, W5 60, W6 60, W7 45, W8 45, W9 60, W10 45. 1910 W1 60, W2 60, W3 60, W4 45.
- **Topics** are written from each week's questions and resources: one entry per distinct requirement area tested.

---

## 8. Source text notes

- Files are plain-text conversions of the eCFR XML. Paragraph labels are kept. Tables are flattened to one cell per line (e.g. Table D-1, D-2, D-3, E-1, U-1). Figures (e.g. Table F-1 extinguisher classes, abrasive-wheel figures) are images in the eCFR and are **not** in the text, so no answer relies on them.
- Each file header has the API URL, the human-readable eCFR URL, and the retrieval date.


### Appendix: URL results for weeks 11-52 (not yet replaced)

| Week | Resource | URL | Status |
|---|---|---|---|
| 11 | Fall Protection Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.501 | 200 |
| 11 | Personal Fall Arrest Systems | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.502 | 200 |
| 11 | Fall Protection Training | https://www.osha.gov/sites/default/files/fall-protection-training.pdf | 404 |
| 12 | Ladder Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1053 | 200 |
| 12 | Stairways and Ladders Guide | https://www.osha.gov/Publications/osha3124.pdf | 200 → https://www.osha.gov/sites/default/files/publications/OSHA3124.pdf |
| 12 | Portable Ladder Safety | https://www.osha.gov/sites/default/files/portable-ladder-safety.pdf | 404 |
| 13 | Scaffold Requirements | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.451 | 200 |
| 13 | Scaffold Training | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.454 | 200 |
| 13 | Scaffold eTool | https://www.osha.gov/etools/scaffolding | 200 |
| 14 | Steel Erection Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.750 | 200 |
| 14 | Steel Erection Guide | https://www.osha.gov/sites/default/files/steel-erection-guide.pdf | 404 |
| 14 | Multiple Lift Rigging | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.753 | 200 |
| 15 | Electrical Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.404 | 200 |
| 15 | Ground Fault Protection | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.404 | 200 |
| 15 | Electrical Safety Guide | https://www.osha.gov/sites/default/files/electrical-safety-guide.pdf | 404 |
| 16 | LOTO Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147 | 200 |
| 16 | LOTO Program Guide | https://www.osha.gov/sites/default/files/loto-guide.pdf | 404 |
| 16 | LOTO eTool | https://www.osha.gov/etools/lockout-tagout | 200 |
| 17 | Excavation Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.651 | 200 |
| 17 | Soil Classification | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.652 | 200 |
| 17 | Trenching Guide | https://www.osha.gov/Publications/osha2226.pdf | 200 → https://www.osha.gov/sites/default/files/publications/OSHA2226.pdf |
| 18 | Protective Systems | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.652 | 200 |
| 18 | Sloping/Benching Guide | https://www.osha.gov/sites/default/files/sloping-guide.pdf | 404 |
| 18 | Daily Inspection Checklist | https://www.osha.gov/sites/default/files/excavation-inspection.pdf | 404 |
| 19 | Confined Space Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1203 | 200 |
| 19 | Permit Program Guide | https://www.osha.gov/Publications/OSHA3138.pdf | 200 → https://www.osha.gov/sites/default/files/publications/OSHA3138.pdf |
| 19 | Entry Permit Form | https://www.osha.gov/sites/default/files/confined-space-permit.pdf | 404 |
| 20 | Demolition Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.850 | 200 |
| 20 | Demolition Guide | https://www.osha.gov/sites/default/files/demolition-safety.pdf | 404 |
| 20 | Engineering Survey | https://www.osha.gov/sites/default/files/engineering-survey.pdf | 404 |
| 21 | Crane Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1400 | 200 |
| 21 | Assembly/Disassembly | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1403 | 200 |
| 21 | Ground Conditions | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1402 | 200 |
| 22 | Lift Planning Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1417 | 200 |
| 22 | Critical Lift Planning | https://www.osha.gov/sites/default/files/critical-lift-planning.pdf | 404 |
| 22 | Signal Person Requirements | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1428 | 200 |
| 23 | Concrete Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.701 | 200 |
| 23 | Formwork Requirements | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.703 | 200 |
| 23 | Equipment and Tools | https://www.osha.gov/concrete-construction/equipment | 404 |
| 24 | Reinforcing Steel | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.703 | 200 |
| 24 | Cast-in-Place Concrete | https://www.osha.gov/sites/default/files/concrete-safety.pdf | 404 |
| 24 | Pre-Cast Concrete | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.704 | 200 |
| 25 | Welding Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.350 | 200 |
| 25 | Fire Prevention | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.352 | 200 |
| 25 | Ventilation Guide | https://www.osha.gov/sites/default/files/welding-ventilation.pdf | 404 |
| 26 | Special Processes | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.353 | 200 |
| 26 | Gas Systems | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.350 | 200 |
| 26 | Hot Work Guide | https://www.osha.gov/sites/default/files/hot-work-guide.pdf | 404 |
| 27 | HAZCOM Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.59 | 200 |
| 27 | GHS Guide | https://www.osha.gov/Publications/OSHA3636.pdf | 200 → https://www.osha.gov/sites/default/files/publications/OSHA3636.pdf |
| 27 | Chemical Inventory | https://www.osha.gov/sites/default/files/chemical-inventory.pdf | 404 |
| 28 | Storage Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.152 | 200 |
| 28 | Spill Response | https://www.osha.gov/sites/default/files/spill-response.pdf | 404 |
| 28 | Chemical Storage | https://www.osha.gov/sites/default/files/chemical-storage.pdf | 404 |
| 29 | Respiratory Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.134 | 200 |
| 29 | Fit Testing | https://www.osha.gov/sites/default/files/fit-testing.pdf | 404 |
| 29 | Medical Evaluation | https://www.osha.gov/sites/default/files/medical-evaluation.pdf | 404 |
| 30 | Noise Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.52 | 200 |
| 30 | Hearing Conservation | https://www.osha.gov/sites/default/files/hearing-conservation.pdf | 404 |
| 30 | Noise Monitoring | https://www.osha.gov/sites/default/files/noise-monitoring.pdf | 404 |
| 31 | Power Line Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.950 | 200 |
| 31 | Clearance Guide | https://www.osha.gov/sites/default/files/line-clearance.pdf | 404 |
| 31 | Equipment Grounding | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.954 | 200 |
| 32 | Equipment Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.600 | 200 |
| 32 | Inspection Requirements | https://www.osha.gov/sites/default/files/equipment-inspection.pdf | 404 |
| 32 | Operating Procedures | https://www.osha.gov/sites/default/files/equipment-operation.pdf | 404 |
| 33 | Underground Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.800 | 200 |
| 33 | Air Monitoring | https://www.osha.gov/sites/default/files/air-monitoring.pdf | 404 |
| 33 | Emergency Procedures | https://www.osha.gov/sites/default/files/underground-emergency.pdf | 404 |
| 34 | Compressed Air Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.803 | 200 |
| 34 | Safe Use Guide | https://www.osha.gov/sites/default/files/compressed-air-safety.pdf | 404 |
| 34 | Equipment Inspection | https://www.osha.gov/sites/default/files/air-equipment-inspection.pdf | 404 |
| 35 | Environmental Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.51 | 200 |
| 35 | Heat Stress Prevention | https://www.osha.gov/heat-exposure | 200 |
| 35 | Cold Stress Guide | https://www.osha.gov/winter-weather | 200 |
| 36 | Silica Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1153 | 200 |
| 36 | Control Methods | https://www.osha.gov/silica/SilicaControlOptions.pdf | 200 → https://www.osha.gov/silica-crystalline |
| 36 | Medical Surveillance | https://www.osha.gov/silica/medicalsurveillance.pdf | 200 → https://www.osha.gov/silica-crystalline |
| 37 | Lead Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.62 | 200 |
| 37 | Exposure Monitoring | https://www.osha.gov/sites/default/files/lead-monitoring.pdf | 404 |
| 37 | Medical Program | https://www.osha.gov/sites/default/files/lead-medical.pdf | 404 |
| 38 | Asbestos Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1101 | 200 |
| 38 | Identification Guide | https://www.osha.gov/sites/default/files/asbestos-id.pdf | 404 |
| 38 | Exposure Control | https://www.osha.gov/sites/default/files/asbestos-control.pdf | 404 |
| 39 | Emergency Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.35 | 200 |
| 39 | Emergency Action Plan | https://www.osha.gov/sites/default/files/eap-template.pdf | 404 |
| 39 | Evacuation Procedures | https://www.osha.gov/evacuation-plans-procedures | 404 |
| 40 | Investigation Guide | https://www.osha.gov/incident-investigation | 200 |
| 40 | Root Cause Analysis | https://www.osha.gov/sites/default/files/root-cause.pdf | 404 |
| 40 | Investigation Forms | https://www.osha.gov/sites/default/files/incident-forms.pdf | 404 |
| 41 | Management Guidelines | https://www.osha.gov/safety-management | 200 |
| 41 | Program Evaluation | https://www.osha.gov/sites/default/files/program-evaluation.pdf | 404 |
| 41 | Performance Metrics | https://www.osha.gov/sites/default/files/metrics-guide.pdf | 404 |
| 42 | Prevention Guidelines | https://www.osha.gov/workplace-violence | 200 |
| 42 | Risk Assessment | https://www.osha.gov/sites/default/files/violence-assessment.pdf | 404 |
| 42 | Response Procedures | https://www.osha.gov/sites/default/files/violence-response.pdf | 404 |
| 43 | JHA Guidelines | https://www.osha.gov/job-hazard-analysis | 404 |
| 43 | Hazard Assessment | https://www.osha.gov/sites/default/files/hazard-assessment.pdf | 404 |
| 43 | Control Selection | https://www.osha.gov/sites/default/files/control-selection.pdf | 404 |
| 44 | PSM Standards | https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119 | 200 |
| 44 | Process Hazard Analysis | https://www.osha.gov/sites/default/files/pha-guide.pdf | 404 |
| 44 | Operating Procedures | https://www.osha.gov/sites/default/files/operating-procedures.pdf | 404 |
| 45 | Security Guidelines | https://www.osha.gov/workplace-security | 404 |
| 45 | Access Control | https://www.osha.gov/sites/default/files/access-control.pdf | 404 |
| 45 | Security Assessment | https://www.osha.gov/sites/default/files/security-assessment.pdf | 404 |
| 46 | Leadership Guidelines | https://www.osha.gov/safety-leadership | 404 |
| 46 | Culture Assessment | https://www.osha.gov/sites/default/files/culture-assessment.pdf | 404 |
| 46 | Communication Guide | https://www.osha.gov/sites/default/files/safety-communication.pdf | 404 |
| 47 | Program Evaluation | https://www.osha.gov/program-evaluation | 404 |
| 47 | Performance Metrics | https://www.osha.gov/sites/default/files/performance-metrics.pdf | 404 |
| 47 | Improvement Planning | https://www.osha.gov/sites/default/files/improvement-plan.pdf | 404 |
| 48 | Recordkeeping Standards | https://www.osha.gov/recordkeeping | 200 |
| 48 | Electronic Records | https://www.osha.gov/sites/default/files/electronic-records.pdf | 404 |
| 48 | Records Retention | https://www.osha.gov/sites/default/files/retention-guide.pdf | 404 |
| 49 | Training Requirements | https://www.osha.gov/training-requirements | 404 |
| 49 | Training Evaluation | https://www.osha.gov/sites/default/files/training-evaluation.pdf | 404 |
| 49 | Training Documentation | https://www.osha.gov/sites/default/files/training-records.pdf | 404 |
| 50 | Technology Guide | https://www.osha.gov/safety-technology | 404 |
| 50 | Cost Analysis | https://www.osha.gov/sites/default/files/cost-benefit.pdf | 404 |
| 50 | Integration Guide | https://www.osha.gov/sites/default/files/tech-integration.pdf | 404 |
| 51 | Program Review Guidelines | https://www.osha.gov/program-review | 404 |
| 51 | Performance Analysis | https://www.osha.gov/sites/default/files/performance-analysis.pdf | 404 |
| 51 | Goal Setting | https://www.osha.gov/sites/default/files/goal-setting.pdf | 404 |
| 52 | Strategic Planning | https://www.osha.gov/strategic-planning | 404 |
| 52 | Resource Planning | https://www.osha.gov/sites/default/files/resource-planning.pdf | 404 |
| 52 | Implementation Guide | https://www.osha.gov/sites/default/files/implementation.pdf | 404 |
