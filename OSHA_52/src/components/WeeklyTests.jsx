
// Weekly test questions and answers 1
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle } from "lucide-react";

const weeklyTests1 = ({ onComplete = () => {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "What is the primary purpose of OSHA 1926?",
      options: [
        "To provide safe working conditions in construction",
        "To increase productivity",
        "To reduce costs",
        "To manage schedules",
      ],
      correctAnswer: 0,
      explanation:
        "OSHA 1926 is specifically designed to ensure safe and healthful working conditions in construction.",
    },
    {
      question:
        "How quickly must employers report a workplace fatality to OSHA?",
      options: [
        "Within 8 hours",
        "Within 24 hours",
        "Within 48 hours",
        "Within 72 hours",
      ],
      correctAnswer: 0,
      explanation:
        "Employers must report work-related fatalities to OSHA within 8 hours.",
    },
    {
      question:
        "Which of the following is a protected worker right under OSHA?",
      options: [
        "Right to unlimited overtime",
        "Right to request workplace inspections",
        "Right to choose not to wear PPE",
        "Right to work from home",
      ],
      correctAnswer: 1,
      explanation:
        "Workers have the right to request an OSHA inspection if they believe hazardous conditions exist.",
    },
    {
      question: "What records must employers maintain under OSHA requirements?",
      options: [
        "Only injury reports",
        "Only training certificates",
        "OSHA 300 logs, 300A summaries, and 301 incident reports",
        "Only employee complaints",
      ],
      correctAnswer: 2,
      explanation:
        "Employers must maintain comprehensive records including OSHA 300 logs, 300A summaries, and 301 incident reports.",
    },
    {
      question: "When can an employee refuse to work under OSHA regulations?",
      options: [
        "Any time they feel uncomfortable",
        "When they believe there is imminent danger",
        "When the weather is bad",
        "When they prefer a different task",
      ],
      correctAnswer: 1,
      explanation:
        "Employees can refuse work when they believe there is a real and immediate danger of death or serious injury.",
    },
    {
      question: "What is the time limit for filing an OSHA complaint?",
      options: ["30 days", "60 days", "90 days", "180 days"],
      correctAnswer: 0,
      explanation:
        "Employees must file OSHA complaints within 30 days of the violation.",
    },
    {
      question: "What protection does OSHA provide for whistleblowers?",
      options: [
        "No specific protection",
        "Protection from retaliation",
        "Monetary rewards only",
        "Transfer to new department",
      ],
      correctAnswer: 1,
      explanation:
        "OSHA provides protection from employer retaliation for reporting violations.",
    },
    {
      question: "Which document summarizes worker rights under OSHA?",
      options: [
        "OSHA Form 300",
        "Job Safety Analysis",
        "OSHA Poster (Job Safety and Health)",
        "Incident Report",
      ],
      correctAnswer: 2,
      explanation:
        "The OSHA Poster (Job Safety and Health) must be displayed and summarizes worker rights.",
    },
    {
      question: "What is required for a valid OSHA complaint?",
      options: [
        "Video evidence",
        "Multiple witnesses",
        "Written documentation only",
        "Reasonable belief of violation",
      ],
      correctAnswer: 3,
      explanation:
        "A valid OSHA complaint requires reasonable belief that a violation exists.",
    },
    {
      question:
        "How must employers share OSHA recordkeeping data with employees?",
      options: [
        "Only upon written request",
        "Post Form 300A from Feb 1 to Apr 30",
        "Email monthly updates",
        "No sharing required",
      ],
      correctAnswer: 1,
      explanation:
        "Employers must post Form 300A summary data from February 1 to April 30 annually.",
    },
  ];

  const handleAnswer = (answerIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answerIndex,
    });
  };

  const calculateScore = () => {
    let correct = 0;
    Object.keys(answers).forEach((question) => {
      if (answers[question] === questions[question].correctAnswer) correct++;
    });
    return (correct / questions.length) * 100;
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setShowResults(true);
    onComplete(calculateScore());
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Quiz Results</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xl">Score: {calculateScore().toFixed(1)}%</div>
          <Progress value={calculateScore()} className="w-full" />
          {questions.map((q, index) => (
            <div key={index} className="border-b pb-4">
              <p className="font-medium">{q.question}</p>
              <div className="flex items-center gap-2 mt-2">
                {answers[index] === q.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <p>{q.explanation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-xl font-medium">
            {questions[currentQuestion].question}
          </h3>
          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant={
                  answers[currentQuestion] === index ? "default" : "outline"
                }
                className="w-full justify-start text-left p-4"
                onClick={() => handleAnswer(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit}>Submit Quiz</Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              disabled={!answers[currentQuestion]}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Weekly test questions and answers 2-5

const weeklyTests2to5 = {
  2: {
    title: "General Safety and Health Provisions",
    questions: [
      // Previous 5 questions remain the same, then add:
      {
        question:
          "During concrete form removal, what safety check is required?",
        options: [
          "Visual inspection only",
          "Concrete strength testing",
          "Supervisor approval only",
          "Weather conditions check",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Before removing forms supporting a 20-foot concrete wall, strength tests must confirm the concrete can support its weight.",
      },
      {
        question:
          "In a welding area, what fire prevention measure is required?",
        options: [
          "Water bucket nearby",
          "Fire extinguisher within 50 feet",
          "Firewatch for 30 minutes after",
          "Just clear the area",
        ],
        correctAnswer: 2,
        explanation:
          "Example: When welding near wooden formwork, a firewatch must monitor for 30 minutes after completion.",
      },
      {
        question:
          "What's required when operating aerial lifts near power lines?",
        options: [
          "Any distance is fine",
          "Minimum 10-foot clearance",
          "Power company presence",
          "No specific requirement",
        ],
        correctAnswer: 1,
        explanation:
          "Example: When using a boom lift to install siding near 7200V power lines, maintain 10-foot minimum clearance.",
      },
      {
        question: "How should tool inspections be documented?",
        options: [
          "No documentation needed",
          "Monthly summary",
          "Daily inspection log",
          "Annual report",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Document daily inspection of circular saws, noting blade condition and guard functionality.",
      },
      {
        question: "What's required for confined space entry permits?",
        options: [
          "Verbal approval",
          "Written permit with specific hazards",
          "General permit only",
          "No permit needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: When entering a 30-foot deep storm drain, permit must list atmospheric hazards and rescue procedures.",
      },
    ],
  },
  3: {
    title: "Personal Protective Equipment",
    questions: [
      // Previous 5 questions remain the same, then add:
      {
        question: "For fall protection, when are guardrails required?",
        options: [
          "6 feet or higher",
          "10 feet or higher",
          "4 feet or higher",
          "Any height",
        ],
        correctAnswer: 0,
        explanation:
          "Example: Installing roof trusses at 8 feet requires guardrails or personal fall arrest system.",
      },
      {
        question: "What eye protection is required for concrete cutting?",
        options: [
          "Regular safety glasses",
          "Face shield with safety glasses",
          "Mesh screen only",
          "Any eye protection",
        ],
        correctAnswer: 1,
        explanation:
          "Example: When cutting concrete blocks with a power saw, both face shield and safety glasses are required.",
      },
      {
        question: "Hard hat replacement is required when?",
        options: [
          "Annually",
          "After impact or damage",
          "Every two years",
          "When color fades",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Replace hard hat immediately if struck by falling 2x4 lumber, even if no visible damage.",
      },
      {
        question: "What determines proper glove selection?",
        options: [
          "Cost",
          "Specific hazard type",
          "Availability",
          "Worker preference",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Chemical-resistant gloves required when handling concrete accelerator additives.",
      },
      {
        question: "When is double hearing protection required?",
        options: ["Over 85 dBA", "Over 95 dBA", "Over 100 dBA", "Over 105 dBA"],
        correctAnswer: 3,
        explanation:
          "Example: When operating jackhammers (110 dBA), both earplugs and earmuffs are required.",
      },
    ],
  },
  4: {
    title: "Construction Site Communication",
    questions: [
      // Previous 5 questions remain the same, then add:
      {
        question: "How should crane signals be coordinated?",
        options: [
          "Multiple signal persons",
          "Single designated signal person",
          "Operator discretion",
          "Radio only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: When lifting steel beams with multiple workers present, only the designated signal person directs the crane operator.",
      },
      {
        question: "What's required for night work communication?",
        options: [
          "Verbal only",
          "Illuminated signals and reflective gear",
          "Radio only",
          "Standard signs",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Night paving operations require illuminated hand signals and reflective vests for flaggers.",
      },
      {
        question: "How should underground utility work be communicated?",
        options: [
          "Verbal warnings only",
          "Written documentation and marking",
          "Signs only",
          "Supervisor presence",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Before excavating, document utility locations and mark with paint/flags following color codes.",
      },
      {
        question: "What communication is required for blasting?",
        options: [
          "Radio announcement",
          "Multiple warning signals",
          "Single horn blast",
          "Verbal warning",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Rock blasting requires 3-2-1 horn signal sequence and all-clear signal before re-entry.",
      },
      {
        question: "How are evacuation routes communicated?",
        options: [
          "Verbal instructions",
          "Posted maps and illuminated signs",
          "Training only",
          "Supervisor direction",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Multiple-story building construction requires posted evacuation maps and lit exit signs at each level.",
      },
    ],
  },
  5: {
    title: "Site Planning and Setup",
    questions: [
      // Previous 5 questions remain the same, then add:
      {
        question: "What's required for material storage planning?",
        options: [
          "Any available space",
          "Designated areas with load limits",
          "Indoor only",
          "Near work areas",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Steel beam storage requires designated area with calculated floor load capacity and access planning.",
      },
      {
        question: "How should construction traffic routes be planned?",
        options: [
          "As needed",
          "Separate from worker paths",
          "Shortest route",
          "One-way only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Establish dedicated haul roads for dump trucks separate from worker walkways during earthwork operations.",
      },
      {
        question: "What's required for crane setup planning?",
        options: [
          "Level ground only",
          "Comprehensive site assessment",
          "Power line check only",
          "Operator preference",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Mobile crane setup requires ground condition assessment, underground utility check, and power line clearance verification.",
      },
      {
        question: "How should temporary power be planned?",
        options: [
          "As work progresses",
          "Complete system layout",
          "Generator placement only",
          "Minimum requirements",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Plan GFCI-protected temporary power distribution with dedicated panels and grounding before work begins.",
      },
      {
        question: "What's required for emergency response planning?",
        options: [
          "911 posting",
          "Comprehensive written plan",
          "First aid kit location",
          "Phone numbers only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Site plan must include emergency vehicle access, muster points, and specific procedures for different emergencies.",
      },
    ],
  },
};

// Weekly test questions and answers 6-7
const weeklyTests6to7 = {
  6: {
    title: "Fire Prevention and Protection",
    questions: [
      {
        question:
          "What type of fire extinguisher is required for electrical fires?",
        options: ["Type A", "Type B", "Type C", "Type D"],
        correctAnswer: 2,
        explanation:
          "Example: When working with live electrical panels, Type C extinguishers must be within 30 feet.",
      },
      {
        question: "How often must fire extinguishers be inspected?",
        options: ["Daily", "Weekly", "Monthly", "Annually"],
        correctAnswer: 2,
        explanation:
          "Example: Construction site fire extinguishers require documented monthly inspections, checking pressure gauge and physical condition.",
      },
      {
        question: "What's the maximum travel distance to a fire extinguisher?",
        options: ["50 feet", "75 feet", "100 feet", "150 feet"],
        correctAnswer: 1,
        explanation:
          "Example: On multi-story construction site, workers should never be more than 75 feet from an extinguisher.",
      },
      {
        question: "When is a fire watch required?",
        options: [
          "Only during welding",
          "During any hot work and 30 minutes after",
          "Only in confined spaces",
          "Only when requested",
        ],
        correctAnswer: 1,
        explanation:
          "Example: When welding near wood framing, fire watch must remain 30 minutes after work completion.",
      },
      {
        question: "What documentation is required for hot work?",
        options: [
          "None needed",
          "Verbal approval",
          "Written permit",
          "Safety meeting only",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Cutting metal deck with torch requires completed hot work permit identifying fire hazards and precautions.",
      },
      {
        question: "How should flammable materials be stored?",
        options: [
          "Any ventilated area",
          "Designated cabinet or area",
          "Away from work area",
          "Near exit for quick access",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Paint thinners must be stored in approved flammable storage cabinet with proper ventilation.",
      },
      {
        question: "What's required for temporary heaters?",
        options: [
          "Any clear area",
          "Clearance and stability",
          "Inside ventilation",
          "Near water source",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Propane heaters require 10-foot clearance from combustibles and stable, level surface.",
      },
      {
        question: "How should fire alarm systems be tested?",
        options: [
          "Monthly",
          "When installed only",
          "Per manufacturer schedule",
          "Annually only",
        ],
        correctAnswer: 2,
        explanation:
          "Example: New construction fire alarm system requires testing according to manufacturer's specifications before occupancy.",
      },
      {
        question: "What's required for emergency exits?",
        options: [
          "One per floor",
          "Two clear paths minimum",
          "Any available opening",
          "Window access only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Multi-story building under construction must maintain two clear exit paths at all times.",
      },
      {
        question: "How should combustible waste be handled?",
        options: [
          "Regular disposal",
          "Daily removal",
          "Weekly cleanup",
          "End of project",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Wood scraps and cardboard packaging must be removed daily to prevent fire hazards.",
      },
    ],
  },
  7: {
    title: "Material Handling and Storage",
    questions: [
      {
        question: "What's the maximum height for manually stacked materials?",
        options: ["6 feet", "8 feet", "10 feet", "12 feet"],
        correctAnswer: 1,
        explanation:
          "Example: When stacking lumber by hand, 8 feet is maximum height to prevent collapse.",
      },
      {
        question: "What's required for rigging inspection?",
        options: ["Annual only", "Before each use", "Weekly", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Wire rope slings must be inspected before lifting steel beams, checking for damage or wear.",
      },
      {
        question: "How should different materials be separated?",
        options: [
          "No separation needed",
          "By type and compatibility",
          "By size only",
          "By arrival date",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Separate storage areas required for reinforcing steel, lumber, and hazardous materials.",
      },
      {
        question: "What's required for material storage on scaffolds?",
        options: [
          "Anywhere convenient",
          "Minimal amounts needed",
          "End of day removal",
          "No restrictions",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Only store enough brick and mortar on scaffold platform for immediate work needs.",
      },
      {
        question: "How should compressed gas cylinders be stored?",
        options: [
          "Lying down",
          "Upright and secured",
          "Any position",
          "Near work area",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Oxygen and acetylene cylinders must be stored upright, secured with chain, separated by 20 feet.",
      },
      {
        question: "What's required for overhead storage?",
        options: [
          "Stable surface only",
          "Toe boards and proper rating",
          "Easy access",
          "Any platform",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Mezzanine storage requires toe boards, rated capacity posted, and proper guardrails.",
      },
      {
        question: "How should loads be lifted manually?",
        options: [
          "Quick lift",
          "Proper lifting technique",
          "Team lift always",
          "Any method",
        ],
        correctAnswer: 1,
        explanation:
          "Example: When lifting concrete blocks, keep load close, bend knees, avoid twisting.",
      },
      {
        question: "What documentation is needed for storage areas?",
        options: [
          "None required",
          "Load limits and inspection records",
          "Inventory only",
          "Access log",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Storage rack must display load capacity and maintain monthly inspection records.",
      },
      {
        question: "How should materials be accessed in storage?",
        options: [
          "Any method",
          "First in, first out",
          "As needed",
          "End of day",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Concrete forms should be rotated using first in, first out to prevent degradation.",
      },
      {
        question: "What's required for material handling equipment?",
        options: [
          "Annual inspection",
          "Pre-use inspection and rating",
          "End of shift check",
          "Visual check",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Forklift requires pre-shift inspection and visible load rating chart.",
      },
    ],
  },
};

// Weekly test questions and answers 8-9

const weeklyTests8to9 = {
  8: {
    title: "Hand and Power Tools",
    questions: [
      {
        question: "When must a power tool be inspected?",
        options: [
          "Weekly",
          "Monthly",
          "Before each use",
          "When malfunctioning",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Inspect circular saw blade, guard, and cord before cutting roof trusses.",
      },
      {
        question: "What's required for pneumatic tool connections?",
        options: [
          "Any fitting",
          "Whip check/safety clip",
          "Tape only",
          "Quick disconnect",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Air-powered nail gun must have safety clip on hose connection to prevent detachment.",
      },
      {
        question: "How should damaged tools be handled?",
        options: [
          "Minor repair",
          "Tag and remove",
          "Continue use",
          "User discretion",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Hammer with cracked handle must be tagged 'Do Not Use' and removed immediately.",
      },
      {
        question: "What's required when using powder-actuated tools?",
        options: [
          "Basic training",
          "Certification",
          "Experience only",
          "Safety meeting",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Must have manufacturer certification before using Hilti gun for concrete anchors.",
      },
      {
        question: "When are tool guards required?",
        options: [
          "Optional use",
          "All times during operation",
          "When convenient",
          "User choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Table saw blade guard must remain in place while cutting plywood sheets.",
      },
      {
        question: "What PPE is required for power tools?",
        options: [
          "Gloves only",
          "Task-specific PPE",
          "Basic PPE",
          "User choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Using concrete saw requires face shield, safety glasses, hearing protection, and dust mask.",
      },
      {
        question: "How should tools be stored?",
        options: [
          "Any location",
          "Secured and protected",
          "Job box only",
          "With materials",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Store power drills in locked job box, protected from weather and damage.",
      },
      {
        question: "What's required for electric tool grounding?",
        options: [
          "Optional",
          "Double insulated/grounded",
          "Any outlet",
          "Testing only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Corded drill must be either double insulated or have grounding pin intact.",
      },
      {
        question: "When can tools be modified?",
        options: ["Never", "With approval", "As needed", "For efficiency"],
        correctAnswer: 0,
        explanation:
          "Example: Never remove depth guard from circular saw even for deep cuts.",
      },
      {
        question: "What training is required for hand tools?",
        options: [
          "None needed",
          "Proper use demonstration",
          "Written only",
          "Annual review",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Workers must demonstrate proper use of utility knives before use on drywall.",
      },
    ],
  },
  9: {
    title: "Heavy Equipment Operation",
    questions: [
      {
        question: "What's required before operating equipment?",
        options: [
          "Keys only",
          "Complete inspection",
          "Supervisor OK",
          "Start up only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Excavator operator must complete documented pre-shift inspection checking fluids, controls, attachments.",
      },
      {
        question: "How should blind spots be managed?",
        options: [
          "Mirrors only",
          "Cameras/spotters",
          "Horn use",
          "Operator judgment",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use backup camera and spotter when reversing loader in congested area.",
      },
      {
        question: "What's required for equipment maintenance?",
        options: [
          "As needed",
          "Manufacturer schedule",
          "Annual only",
          "Operator choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Follow manufacturer's service intervals for oil changes and filter replacement on bulldozer.",
      },
      {
        question: "When is equipment certification required?",
        options: [
          "Never",
          "Specific equipment only",
          "All equipment",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Must have valid certification to operate crane over 2,000 pound capacity.",
      },
      {
        question: "What's required for fueling equipment?",
        options: [
          "Any time",
          "Shutdown and cool",
          "End of shift",
          "When needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Turn off skid steer and let cool before refueling to prevent fire.",
      },
      {
        question: "How should equipment be parked?",
        options: [
          "Any location",
          "Secured and stable",
          "Near work",
          "Level ground",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Park excavator on level ground, lower bucket, set brake, remove key.",
      },
      {
        question: "What's required for equipment modifications?",
        options: [
          "As needed",
          "Manufacturer approval",
          "Supervisor OK",
          "Operator choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Fork extensions for loader require manufacturer approval and load rating.",
      },
      {
        question: "How should load limits be determined?",
        options: [
          "Operator judgment",
          "Load charts",
          "Visual check",
          "Trial lift",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use crane load chart to verify capacity before lifting steel beam bundle.",
      },
      {
        question: "What's required for equipment access?",
        options: ["Any method", "3-point contact", "Ladder only", "Jump down"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain three points of contact when climbing into backhoe cab.",
      },
      {
        question: "When is a signal person required?",
        options: ["Never", "Limited visibility", "Always", "Operator choice"],
        correctAnswer: 1,
        explanation:
          "Example: Use signal person when moving concrete bucket where operator can't see landing area.",
      },
    ],
  },
};

// Weekly test questions and answers 10-11
const weeklyTests10to11 = {
  10: {
    title: "Mobile Scaffolding and Work Platforms",
    questions: [
      {
        question:
          "What is the minimum width requirement for a mobile scaffold platform?",
        options: ["12 inches", "18 inches", "24 inches", "36 inches"],
        correctAnswer: 1,
        explanation:
          "Example: Mobile scaffold platform used for brick laying must be at least 18 inches wide to provide safe working space.",
      },
      {
        question: "When are guardrails required on mobile scaffolds?",
        options: [
          "Only above 10 feet",
          "Only during movement",
          "Always required",
          "When requested",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Mobile scaffold used for window installation requires guardrails regardless of height.",
      },
      {
        question:
          "What's the maximum height-to-base width ratio for mobile scaffolds?",
        options: ["2:1", "3:1", "4:1", "5:1"],
        correctAnswer: 2,
        explanation:
          "Example: A 20-foot high mobile scaffold requires at least a 5-foot base width.",
      },
      {
        question: "How often must mobile scaffolds be inspected?",
        options: ["Weekly", "Monthly", "Before each shift", "When moved only"],
        correctAnswer: 2,
        explanation:
          "Example: Before starting drywall installation, scaffold must be inspected for stability and component integrity.",
      },
      {
        question: "What is required before moving a mobile scaffold?",
        options: [
          "Lock wheels only",
          "Remove all materials and workers",
          "Supervisor approval",
          "Nothing specific",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Before relocating scaffold for next section of painting, all workers and materials must be removed.",
      },
      {
        question: "What surface condition is required for mobile scaffolds?",
        options: [
          "Any solid surface",
          "Level and firm surface",
          "Concrete only",
          "Indoor only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Mobile scaffold used for exterior maintenance requires level, compacted ground with proper support plates.",
      },
      {
        question: "How should workers access mobile scaffold platforms?",
        options: [
          "Any convenient method",
          "Ladder or proper stairs",
          "Climbing frame",
          "Jump up",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Workers must use attached ladder to access 12-foot scaffold platform for HVAC installation.",
      },
      {
        question: "What wind speed requires scaffold work stoppage?",
        options: ["20 mph", "25 mph", "30 mph", "35 mph"],
        correctAnswer: 2,
        explanation:
          "Example: Work on mobile scaffold during facade repair must stop when winds reach 30 mph.",
      },
      {
        question: "When are outriggers required?",
        options: [
          "Always",
          "Height exceeds 3 times base",
          "When specified",
          "Indoor use only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: 15-foot scaffold with 4-foot base requires outriggers for stability during masonry work.",
      },
      {
        question: "What load rating is required for casters?",
        options: [
          "Any rating",
          "Equal to scaffold load",
          "Manufacturer specified",
          "Standard rating",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Scaffold used for mechanical equipment installation must have casters rated for total anticipated load.",
      },
    ],
  },
  11: {
    title: "Fall Protection Basics",
    questions: [
      {
        question: "At what height is fall protection required in construction?",
        options: ["4 feet", "6 feet", "8 feet", "10 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Workers installing roof trusses at 8 feet must use personal fall arrest system.",
      },
      {
        question: "What is the minimum breaking strength for lifelines?",
        options: ["2,500 lbs", "5,000 lbs", "7,500 lbs", "10,000 lbs"],
        correctAnswer: 1,
        explanation:
          "Example: Horizontal lifeline system for window washers must have minimum 5,000 lbs breaking strength.",
      },
      {
        question: "How often must fall protection equipment be inspected?",
        options: ["Weekly", "Monthly", "Before each use", "Annually"],
        correctAnswer: 2,
        explanation:
          "Example: Harness and lanyard must be inspected before use on steel erection project.",
      },
      {
        question: "What is the required minimum distance for warning lines?",
        options: ["6 feet", "10 feet", "15 feet", "20 feet"],
        correctAnswer: 2,
        explanation:
          "Example: Warning line system on flat roof must be 15 feet from edge during HVAC installation.",
      },
      {
        question: "When are safety nets required?",
        options: [
          "Always",
          "When other systems aren't feasible",
          "Only above 25 feet",
          "Never required",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Bridge construction requires safety nets when personal fall arrest systems aren't practical.",
      },
      {
        question: "What's the maximum free fall distance allowed?",
        options: ["4 feet", "6 feet", "8 feet", "10 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Worker on steel beam must use lanyard that limits free fall to 6 feet or less.",
      },
      {
        question: "How should anchor points be rated?",
        options: ["2,000 lbs", "3,000 lbs", "5,000 lbs", "10,000 lbs"],
        correctAnswer: 2,
        explanation:
          "Example: Roof anchor for window cleaning operation must support 5,000 lbs per attached worker.",
      },
      {
        question: "What is required for hole covers?",
        options: [
          "Any solid material",
          "Marked and secured",
          "Temporary only",
          "Supervisor approval",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Floor opening cover during concrete work must be marked 'HOLE' and secured against displacement.",
      },
      {
        question: "When are guardrails required?",
        options: [
          "Only temporary edges",
          "All open sides 6+ feet",
          "When specified",
          "Permanent only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Mezzanine installation requires guardrails on all open sides where fall distance exceeds 6 feet.",
      },
      {
        question: "What training is required for fall protection?",
        options: [
          "One-time training",
          "Annual certification",
          "Before exposure to hazards",
          "Monthly updates",
        ],
        correctAnswer: 2,
        explanation:
          "Example: New workers must complete fall protection training before working on elevated platforms.",
      },
    ],
  },
};

// Weekly tests 12-15

const weeklyTests12to15 = {
  12: {
    title: "Ladder Safety",
    questions: [
      {
        question: "What is the proper angle for a non-self-supporting ladder?",
        options: ["4:1 ratio", "3:1 ratio", "2:1 ratio", "1:1 ratio"],
        correctAnswer: 1,
        explanation:
          "Example: A 20-foot extension ladder should be placed 5 feet from building base for safe setup.",
      },
      {
        question: "How far must a ladder extend above the landing surface?",
        options: ["2 feet", "3 feet", "4 feet", "5 feet"],
        correctAnswer: 1,
        explanation:
          "Example: When accessing a roof, extension ladder must extend 3 feet above the roof edge.",
      },
      {
        question: "What is required for ladder inspections?",
        options: ["Monthly", "Weekly", "Before each use", "Annually"],
        correctAnswer: 2,
        explanation:
          "Example: Before using stepladder for light fixture installation, inspect all components including steps and spreaders.",
      },
      {
        question:
          "What's the maximum load capacity needed for construction ladders?",
        options: ["250 lbs", "300 lbs", "375 lbs", "500 lbs"],
        correctAnswer: 1,
        explanation:
          "Example: Type 1A ladder rated for 300 lbs required for worker carrying tools and materials.",
      },
      {
        question: "When must a ladder be removed from service?",
        options: [
          "Annual replacement",
          "Any visible damage",
          "After major project",
          "Supervisor decision",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Ladder with split rail discovered during inspection must be tagged and removed immediately.",
      },
      {
        question: "What is required at the base of a ladder?",
        options: [
          "Nothing specific",
          "Firm level surface and secure footing",
          "Concrete only",
          "Stake down",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Extension ladder used on soil needs base plates and level, compacted ground surface.",
      },
      {
        question: "How should tools be carried on a ladder?",
        options: [
          "One hand only",
          "Tool belt/pouch",
          "Any method",
          "In pockets",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Electrician must use tool belt to carry tools up ladder, maintaining three points of contact.",
      },
      {
        question: "What's required for ladder tie-off?",
        options: [
          "Optional",
          "When working",
          "Above 20 feet only",
          "Indoor only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Extension ladder must be tied off at top and bottom when accessing second story window.",
      },
      {
        question: "How should metal ladders be used near electrical work?",
        options: [
          "Carefully",
          "Never",
          "With rubber gloves",
          "When power is off",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Fiberglass ladder required when working near exposed electrical conductors.",
      },
      {
        question: "What's the maximum working height on a stepladder?",
        options: [
          "Top step",
          "Second step from top",
          "Two steps down from top",
          "Any comfortable height",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Painter must stay at least two steps down from top when using stepladder.",
      },
    ],
  },
  13: {
    title: "Scaffolding Safety",
    questions: [
      {
        question: "What's the minimum planking overlap required?",
        options: ["6 inches", "12 inches", "18 inches", "24 inches"],
        correctAnswer: 0,
        explanation:
          "Example: Scaffold planks spanning frames must overlap support by at least 6 inches on each end.",
      },
      {
        question: "Who must inspect scaffolding?",
        options: [
          "Any worker",
          "Supervisor",
          "Competent person",
          "Safety manager",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Designated competent person must inspect scaffold before each work shift.",
      },
      {
        question: "What is the minimum platform width requirement?",
        options: ["12 inches", "18 inches", "24 inches", "36 inches"],
        correctAnswer: 1,
        explanation:
          "Example: Platform for mason tenders must be at least 18 inches wide.",
      },
      {
        question: "When are toeboards required?",
        options: ["Always", "Above 10 feet", "When specified", "Optional"],
        correctAnswer: 0,
        explanation:
          "Example: Toeboards required on all open sides to prevent tools from falling onto workers below.",
      },
      {
        question: "What's the maximum gap allowed between platform and wall?",
        options: ["8 inches", "14 inches", "18 inches", "24 inches"],
        correctAnswer: 1,
        explanation:
          "Example: Gap between building face and scaffold platform must not exceed 14 inches for brick laying.",
      },
      {
        question: "How often must wire rope be inspected?",
        options: ["Daily", "Weekly", "Monthly", "Before each shift"],
        correctAnswer: 3,
        explanation:
          "Example: Suspended scaffold wire ropes must be inspected by competent person before each shift.",
      },
      {
        question: "What's required for scaffold access?",
        options: [
          "Any method",
          "Proper ladders/stairs",
          "Climbing frames",
          "Supervisor choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Built-in ladder frames or attached ladder required for scaffold over 2 feet high.",
      },
      {
        question: "When is cross bracing required?",
        options: [
          "Optional use",
          "All scaffold sections",
          "End sections only",
          "Above 20 feet",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Each scaffold section requires cross bracing for stability during masonry work.",
      },
      {
        question: "What load rating is required for suspension ropes?",
        options: [
          "4:1 safety factor",
          "6:1 safety factor",
          "8:1 safety factor",
          "10:1 safety factor",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Suspension ropes must support 8 times intended load for window washing operations.",
      },
      {
        question: "How should damaged scaffold parts be handled?",
        options: [
          "Repair immediately",
          "Remove from service",
          "Mark for later",
          "Continue use carefully",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Bent frame member must be tagged and removed from service immediately.",
      },
    ],
  },
  14: {
    title: "Steel Erection Safety",
    questions: [
      {
        question: "At what height is fall protection required for connectors?",
        options: [
          "Always required",
          "Above 15 feet",
          "Above 30 feet",
          "Two stories",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Connectors working at 35 feet must use personal fall arrest system.",
      },
      {
        question: "What's required before steel erection begins?",
        options: [
          "Verbal approval",
          "Written notification",
          "Site preparation verification",
          "Team meeting",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Concrete foundation must reach 75% strength before steel erection can begin.",
      },
      {
        question: "How many wraps minimum for wire rope clips?",
        options: ["2 wraps", "3 wraps", "4 wraps", "5 wraps"],
        correctAnswer: 1,
        explanation:
          "Example: Guy wire attachment requires minimum 3 wraps through clips for secure connection.",
      },
      {
        question: "What's required for multiple lift rigging?",
        options: [
          "Any rigging",
          "Specialized rigging",
          "Standard chains",
          "Rope only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Multiple beam lifts require specially designed rigging assemblies rated for the load.",
      },
      {
        question: "When is a site-specific erection plan required?",
        options: ["Always", "Over 5 stories", "Special conditions", "Never"],
        correctAnswer: 2,
        explanation:
          "Example: Complex building design with curved steel requires site-specific erection plan.",
      },
      {
        question: "What's the maximum number of pieces in multiple lift?",
        options: ["3 pieces", "5 pieces", "7 pieces", "10 pieces"],
        correctAnswer: 1,
        explanation:
          "Example: Multiple lift rigging limited to maximum 5 beams per lift.",
      },
      {
        question: "When must decking be secured?",
        options: ["End of shift", "End of day", "When installed", "Weekly"],
        correctAnswer: 2,
        explanation:
          "Example: Metal decking must be secured immediately when laid to prevent displacement.",
      },
      {
        question: "What's required for hoisting personnel?",
        options: [
          "Man basket only",
          "Platform with controls",
          "Any secure method",
          "Crane hook",
        ],
        correctAnswer: 0,
        explanation:
          "Example: Personnel must only be hoisted in properly designed and attached man basket.",
      },
      {
        question: "How should tools be carried during climbing?",
        options: ["Any method", "Tool belt", "Handed up", "In pockets"],
        correctAnswer: 1,
        explanation:
          "Example: Ironworker must use tool belt/pouches to keep hands free while climbing columns.",
      },
      {
        question: "What wind speed requires work stoppage?",
        options: ["15 mph", "20 mph", "25 mph", "30 mph"],
        correctAnswer: 2,
        explanation:
          "Example: Steel erection must stop when sustained winds reach 25 mph.",
      },
    ],
  },
  15: {
    title: "Electrical Safety Fundamentals",
    questions: [
      {
        question: "When is GFCI protection required?",
        options: [
          "Wet locations only",
          "All 120V circuits",
          "When specified",
          "Optional use",
        ],
        correctAnswer: 1,
        explanation:
          "Example: All 120-volt receptacles on construction site require GFCI protection.",
      },
      {
        question: "What's the minimum approach distance for 300V-750V?",
        options: ["1 foot", "2 feet", "3 feet", "4 feet"],
        correctAnswer: 0,
        explanation:
          "Example: Workers must stay at least 1 foot away from exposed 480V conductors.",
      },
      {
        question: "How often must assured grounding program test?",
        options: [
          "Monthly",
          "Quarterly",
          "Before first use and quarterly",
          "Annually",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Extension cords must be tested before first use, after repairs, and every 3 months.",
      },
      {
        question: "What color identifies ground wire?",
        options: ["White", "Black", "Green", "Red"],
        correctAnswer: 2,
        explanation:
          "Example: Green wire in power tool cord must be connected to grounding terminal.",
      },
      {
        question: "When are insulated tools required?",
        options: ["Always", "Live circuits only", "When specified", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Electrician must use insulated screwdriver when working on energized panel.",
      },
      {
        question: "What's required for temporary lighting?",
        options: [
          "Any bulb type",
          "Guard protection",
          "Minimum height",
          "Daily inspection",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Temporary light strings must have guards to prevent bulb breakage.",
      },
      {
        question: "How should extension cords be protected?",
        options: [
          "Any method",
          "Elevated or protected",
          "Covered only",
          "Marked only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Extension cords must be elevated or covered in high-traffic areas to prevent damage.",
      },
      {
        question: "What's required for working space around panels?",
        options: ["1 foot", "2 feet", "3 feet", "4 feet"],
        correctAnswer: 2,
        explanation:
          "Example: Minimum 3-foot clearance required in front of electrical panels.",
      },
      {
        question: "When is a hot work permit required?",
        options: ["Never", "Always", "Energized work", "Supervisor choice"],
        correctAnswer: 2,
        explanation:
          "Example: Hot work permit required before working on live 240V circuit.",
      },
      {
        question: "What PPE is required for voltage testing?",
        options: [
          "Gloves only",
          "Task-dependent",
          "Basic PPE",
          "Nothing specific",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Testing 480V requires voltage-rated gloves and face shield.",
      },
    ],
  },
};

// Weekly tests 16-20

const weeklyTests16to20 = {
  16: {
    title: "Lockout/Tagout Procedures",
    questions: [
      {
        question: "Who can remove a lockout device?",
        options: [
          "Supervisor",
          "Safety manager",
          "Person who applied it",
          "Authorized employee",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Only the electrician who placed the lock can remove it after motor repair is complete.",
      },
      {
        question: "What must be identified before LOTO?",
        options: [
          "Equipment type only",
          "All energy sources",
          "Main power only",
          "Supervisor approval",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Must identify electrical, hydraulic, and pneumatic sources before maintaining press brake.",
      },
      {
        question: "When is group lockout required?",
        options: [
          "Never",
          "Multiple shifts",
          "Multiple workers",
          "Optional use",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Three maintenance workers servicing conveyor system must use group lockout procedure.",
      },
      {
        question: "What's required for LOTO verification?",
        options: [
          "Visual check",
          "Try to operate",
          "Test equipment",
          "All of these",
        ],
        correctAnswer: 3,
        explanation:
          "Example: After locking out crane, attempt startup to verify zero energy state.",
      },
      {
        question: "When is complex LOTO required?",
        options: [
          "Multiple energy sources",
          "Single source only",
          "Basic maintenance",
          "Short duration",
        ],
        correctAnswer: 0,
        explanation:
          "Example: Production line with electrical, pneumatic, and hydraulic systems requires complex LOTO.",
      },
      {
        question: "What documentation is required?",
        options: [
          "None needed",
          "Written procedures",
          "Verbal instruction",
          "Optional records",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Specific written procedure required for locking out automated packaging system.",
      },
      {
        question: "How often must procedures be reviewed?",
        options: ["Never", "Annually", "Monthly", "When changed"],
        correctAnswer: 1,
        explanation:
          "Example: Annual review of LOTO procedures for all equipment required, updating as needed.",
      },
      {
        question: "What training is required?",
        options: [
          "One-time",
          "Annual refresher",
          "Initial and retraining",
          "Optional",
        ],
        correctAnswer: 2,
        explanation:
          "Example: New maintenance worker requires initial LOTO training before starting work.",
      },
      {
        question: "When can tags be used without locks?",
        options: [
          "Never",
          "When demonstrated",
          "Always acceptable",
          "Short duration",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Tags alone only permitted when company demonstrates equivalent protection to locks.",
      },
      {
        question: "What's required for shift changes?",
        options: [
          "Nothing special",
          "Orderly transfer",
          "Remove all locks",
          "Supervisor only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Outgoing maintenance crew must coordinate LOTO transfer with incoming crew.",
      },
    ],
  },
  17: {
    title: "Excavation Safety Basics",
    questions: [
      {
        question: "At what depth is a protective system required?",
        options: ["3 feet", "4 feet", "5 feet", "6 feet"],
        correctAnswer: 2,
        explanation:
          "Example: Trench for water line installation at 5.5 feet requires protective system.",
      },
      {
        question: "How often must excavations be inspected?",
        options: ["Daily", "Daily and after rain", "Weekly", "Before use"],
        correctAnswer: 1,
        explanation:
          "Example: Competent person must inspect trench after overnight rainstorm before work resumes.",
      },
      {
        question: "What's the maximum slope for Type C soil?",
        options: ["1/2:1", "3/4:1", "1:1", "1.5:1"],
        correctAnswer: 3,
        explanation:
          "Example: Sandy soil requires 1.5:1 slope ratio for 8-foot deep excavation.",
      },
      {
        question: "When is benching prohibited?",
        options: ["Never", "Type C soil", "Over 20 feet", "When specified"],
        correctAnswer: 1,
        explanation:
          "Example: Granular, sandy soil (Type C) cannot use benching as protection method.",
      },
      {
        question: "What's the minimum access/egress spacing?",
        options: ["25 feet", "50 feet", "75 feet", "100 feet"],
        correctAnswer: 0,
        explanation:
          "Example: 75-foot long trench requires minimum three ladders for proper access spacing.",
      },
      {
        question: "Where must spoil piles be placed?",
        options: [
          "Any location",
          "2 feet from edge",
          "5 feet from edge",
          "10 feet from edge",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Excavated soil must be placed at least 2 feet from trench edge during utility work.",
      },
      {
        question: "What testing is required for hazardous atmospheres?",
        options: ["None needed", "Before entry", "When visible", "Weekly only"],
        correctAnswer: 1,
        explanation:
          "Example: Test for hazardous atmosphere before entering deep excavation near underground storage tanks.",
      },
      {
        question: "How often must soil be reclassified?",
        options: ["Never", "Annually", "Changing conditions", "Project start"],
        correctAnswer: 2,
        explanation:
          "Example: Soil must be reclassified after heavy rain changes soil conditions.",
      },
      {
        question: "What's required for water removal?",
        options: [
          "Any method",
          "Proper dewatering",
          "Wait to dry",
          "Cover only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Must use proper pumps and monitor water removal system during utility installation.",
      },
      {
        question: "When are surface encumbrances addressed?",
        options: [
          "During work",
          "After digging",
          "Before excavation",
          "When noticed",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Support or remove sidewalk before beginning adjacent excavation.",
      },
    ],
  },
  18: {
    title: "Trenching Protection Systems",
    questions: [
      {
        question: "What's maximum allowable slope for Type B soil?",
        options: ["1/2:1", "3/4:1", "1:1", "1.5:1"],
        correctAnswer: 2,
        explanation:
          "Example: Clay soil classified as Type B requires 1:1 slope ratio for safe excavation.",
      },
      {
        question: "When must shields extend above ground?",
        options: ["Never", "18 inches", "24 inches", "36 inches"],
        correctAnswer: 1,
        explanation:
          "Example: Trench box must extend 18 inches above ground to prevent materials falling into trench.",
      },
      {
        question: "What's the maximum vertical side height?",
        options: ["3 feet", "4 feet", "5 feet", "6 feet"],
        correctAnswer: 2,
        explanation:
          "Example: Vertical sides in stable rock cannot exceed 5 feet without protection system.",
      },
      {
        question: "How often must support systems be inspected?",
        options: ["Daily", "Weekly", "Monthly", "Before use"],
        correctAnswer: 0,
        explanation:
          "Example: Hydraulic shoring must be inspected daily before workers enter trench.",
      },
      {
        question: "What's required for installing/removing supports?",
        options: [
          "Any method",
          "Safe procedure",
          "Quick removal",
          "Team approach",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Must follow manufacturer's procedure when removing hydraulic shores to prevent collapse.",
      },
      {
        question: "When are cross braces required?",
        options: ["Always", "Per design", "Optional", "Over 10 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Cross braces must be installed according to tabulated data for timber shoring.",
      },
      {
        question: "What's the maximum shield stack height?",
        options: [
          "No limit",
          "Two shields",
          "Manufacturer spec",
          "Three shields",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Trench boxes can only be stacked according to manufacturer's specifications.",
      },
      {
        question: "How to protect from cave-ins during entry/exit?",
        options: [
          "Quick movement",
          "Shield protection",
          "Team approach",
          "Any method",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Workers must remain under protection of shield when entering or exiting trench.",
      },
      {
        question: "What's required for mobile equipment near trenches?",
        options: [
          "Warning system",
          "No requirements",
          "Operator judgment",
          "Spotter only",
        ],
        correctAnswer: 0,
        explanation:
          "Example: Use stop logs or barricades to prevent equipment from approaching trench edge.",
      },
      {
        question: "When can workers be in trench during installation?",
        options: [
          "Never",
          "As needed",
          "Protected areas",
          "Supervisor approval",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Workers can only be in areas protected by partially installed shoring system.",
      },
    ],
  },
  19: {
    title: "Confined Space Entry",
    questions: [
      {
        question: "What's the minimum oxygen level for entry?",
        options: ["17.5%", "18.5%", "19.5%", "20.5%"],
        correctAnswer: 2,
        explanation:
          "Example: Storm drain must have minimum 19.5% oxygen before worker entry permitted.",
      },
      {
        question: "How often must atmosphere be tested?",
        options: ["Before entry", "Hourly", "Continuously", "Daily"],
        correctAnswer: 2,
        explanation:
          "Example: Continuous monitoring required while welding inside tank.",
      },
      {
        question: "What defines a permit-required space?",
        options: ["Size only", "Any hazard", "Specific hazards", "Depth only"],
        correctAnswer: 2,
        explanation:
          "Example: Vault with potential atmospheric hazards requires permit for entry.",
      },
      {
        question: "Who can serve as attendant?",
        options: [
          "Any worker",
          "Trained attendant",
          "Supervisor only",
          "Entry worker",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Designated attendant must be trained in duties before monitoring manhole entry.",
      },
      {
        question: "What rescue equipment is required?",
        options: [
          "Any equipment",
          "Space specific",
          "Standard kit",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Tripod and retrieval system required for vertical entry into sewer.",
      },
      {
        question: "When must entry permit be cancelled?",
        options: [
          "End of shift",
          "Work complete",
          "Hazard change",
          "Supervisor decision",
        ],
        correctAnswer: 2,
        explanation:
          "Example: permit must be cancelled if ventilation system fails during entry.",
      },
      {
        question: "What training is required for entrants?",
        options: [
          "Basic safety",
          "Specific hazards",
          "Annual only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Workers must be trained on specific hazards of chemical storage tank entry.",
      },
      {
        question: "How must spaces be labeled?",
        options: [
          "Not required",
          "Danger sign",
          "Permit required",
          "Any marking",
        ],
        correctAnswer: 2,
        explanation:
          "Example: 'Permit-Required Confined Space' sign must be posted at access point.",
      },
      {
        question: "What communication is required?",
        options: [
          "Any method",
          "Voice contact",
          "Two-way system",
          "Hand signals",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Radio communication required between entrant and attendant during tunnel work.",
      },
      {
        question: "When is ventilation required?",
        options: [
          "Optional",
          "Hazardous atmosphere",
          "Always",
          "Supervisor choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: mechanical ventilation required when testing shows low oxygen levels.",
      },
    ],
  },
  20: {
    title: "Demolition Safety",
    questions: [
      {
        question: "What's required before starting demolition?",
        options: [
          "Work plan",
          "Engineering survey",
          "Permit only",
          "Team meeting",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Written engineering survey required before demolishing load-bearing walls.",
      },
      {
        question: "When must utilities be shut off?",
        options: ["During work", "Before starting", "As needed", "End of day"],
        correctAnswer: 1,
        explanation:
          "Example: All utilities must be verified as disconnected before beginning building demolition.",
      },
      {
        question: "What's the maximum drop for materials?",
        options: ["20 feet", "30 feet", "40 feet", "50 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Debris chute required for dropping materials more than 30 feet to ground.",
      },
      {
        question: "When are floor openings protected?",
        options: ["End of shift", "When created", "During breaks", "As needed"],
        correctAnswer: 1,
        explanation:
          "Example: Cover or barricade floor opening immediately after removing floor section.",
      },
      {
        question: "What monitoring is required?",
        options: [
          "None needed",
          "Continuous progress",
          "Daily only",
          "Weekly review",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Competent person must continuously monitor structural stability during wall removal.",
      },
      {
        question: "How should hazardous materials be handled?",
        options: [
          "Regular disposal",
          "Special procedures",
          "Quick removal",
          "Team decision",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Asbestos must be removed following specific procedures before general demolition.",
      },
      {
        question: "What's required for wall demolition?",
        options: ["Any method", "Top down", "Bottom up", "Simultaneous"],
        correctAnswer: 1,
        explanation:
          "Example: Masonry walls must be removed in systematic top-down approach.",
      },
      {
        question: "When are catch platforms required?",
        options: ["Never", "Over entrances", "Optional use", "Interior only"],
        correctAnswer: 2,
        explanation:
          "Example: Catch platform required when dropping debris from upper floors.",
      },
    ],
  },
};

// Weekly tests 21-25

const weeklyTests21to25 = {
  21: {
    title: "Crane Operations - Setup and Planning",
    questions: [
      {
        question: "What's the minimum distance from power lines up to 350kV?",
        options: ["10 feet", "20 feet", "30 feet", "40 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Mobile crane must maintain 20-foot minimum clearance when operating near 13kV power lines.",
      },
      {
        question: "What ground condition documentation is required?",
        options: [
          "None needed",
          "Site assessment",
          "Written verification",
          "Verbal approval",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Written verification of ground support required before setting up 200-ton crane.",
      },
      {
        question: "When must outriggers be fully extended?",
        options: ["Never", "Always", "Per load chart", "Operator choice"],
        correctAnswer: 2,
        explanation:
          "Example: Load chart requires full outrigger extension for 75% rated capacity lift.",
      },
      {
        question: "Who must verify power line clearance?",
        options: ["Operator", "Assembly director", "Any worker", "Supervisor"],
        correctAnswer: 1,
        explanation:
          "Example: A/D director must verify and document power line clearance before crane assembly.",
      },
      {
        question: "What wind speed requires securing crane?",
        options: ["20 mph", "30 mph", "Per manual", "40 mph"],
        correctAnswer: 2,
        explanation:
          "Example: Tower crane must be secured at wind speeds specified in manufacturer's manual.",
      },
      {
        question: "How often must crane supports be inspected?",
        options: ["Daily", "Weekly", "Monthly", "Before setup"],
        correctAnswer: 0,
        explanation:
          "Example: Crane support mats must be inspected daily for shifting or settling.",
      },
      {
        question: "What's required for assembly/disassembly?",
        options: [
          "Team approach",
          "Written procedures",
          "Quick completion",
          "Minimal crew",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Written manufacturer procedures must be followed when assembling lattice boom.",
      },
      {
        question: "When is a prelift meeting required?",
        options: ["Never", "Critical lifts", "All lifts", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Prelift meeting required when planning 85% capacity steel beam lift.",
      },
      {
        question: "What determines counterweight installation?",
        options: [
          "Available weights",
          "Manufacturer specs",
          "Operator choice",
          "Site conditions",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Counterweight configuration must match manufacturer's specifications for load chart use.",
      },
      {
        question: "How must crane level be verified?",
        options: [
          "Visual check",
          "Calibrated device",
          "Operator judgment",
          "Team review",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use calibrated level indicator to verify 0.5-degree tolerance before operations.",
      },
    ],
  },
  22: {
    title: "Crane Operations - Lift Planning",
    questions: [
      {
        question: "When is a critical lift plan required?",
        options: [
          "All lifts",
          "75% capacity",
          "Multiple cranes",
          "Any of these",
        ],
        correctAnswer: 3,
        explanation:
          "Example: Critical lift plan required for tandem lift of HVAC unit using two cranes.",
      },
      {
        question: "What's the maximum number of workers riding loads?",
        options: ["None allowed", "One worker", "Two workers", "As needed"],
        correctAnswer: 0,
        explanation:
          "Example: Workers cannot ride on suspended loads during steel erection.",
      },
      {
        question: "When must tag lines be used?",
        options: ["Never", "Load control needed", "Always", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Tag lines required when positioning structural steel members in wind.",
      },
      {
        question: "What determines safe working radius?",
        options: [
          "Operator choice",
          "Load chart",
          "Site conditions",
          "Team decision",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Load chart specifies maximum radius for 10-ton lift with given configuration.",
      },
      {
        question: "How is load weight verified?",
        options: [
          "Visual estimate",
          "Documented weight",
          "Operator judgment",
          "Trial lift",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Shipping documents and engineering drawings verify exact weight of equipment package.",
      },
      {
        question: "What's required for blind lifts?",
        options: ["Extra care", "Signal person", "Radio only", "Team lift"],
        correctAnswer: 1,
        explanation:
          "Example: Dedicated signal person required when operator can't see load behind building.",
      },
      {
        question: "When is load testing required?",
        options: ["Never", "After repair", "Monthly", "Operator choice"],
        correctAnswer: 1,
        explanation:
          "Example: Load test required after replacing load bearing cable on overhead crane.",
      },
      {
        question: "What's the minimum hook height factor?",
        options: ["2 feet", "5 feet", "Load plus rigging", "10 feet"],
        correctAnswer: 2,
        explanation:
          "Example: Hook height must clear load height plus rigging length plus safety margin.",
      },
      {
        question: "Who can modify lift plans?",
        options: ["Operator", "Qualified person", "Any worker", "Supervisor"],
        correctAnswer: 1,
        explanation:
          "Example: Only qualified person can modify critical lift plan when site conditions change.",
      },
      {
        question: "What weather information is required?",
        options: [
          "Temperature only",
          "Wind only",
          "Complete forecast",
          "None needed",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Complete weather forecast needed for planning extended duration lift.",
      },
    ],
  },

  23: {
    title: "Concrete and Masonry - Forms and Shoring",
    questions: [
      {
        question: "When can forms be removed?",
        options: [
          "24 hours after pour",
          "When concrete reaches strength",
          "When convenient",
          "After inspection",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Column forms must remain until concrete test cylinders confirm required strength.",
      },
      {
        question: "Who can design formwork?",
        options: [
          "Foreman",
          "Qualified Engineer",
          "Experienced carpenter",
          "Project manager",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Engineer must design forms for 30-foot high concrete wall pour.",
      },
      {
        question: "How often must shores be inspected?",
        options: ["Daily", "Before/during/after pour", "Weekly", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Inspect shores before starting pour, during placement, and after concrete placement.",
      },
      {
        question: "What's required for vertical form stability?",
        options: ["Bracing", "Extra nails", "More ties", "Thicker plywood"],
        correctAnswer: 0,
        explanation:
          "Example: Wall forms require diagonal bracing every 8 feet to prevent tipping.",
      },
      {
        question: "When are guardrails required on formwork?",
        options: [
          "6 feet height",
          "4 feet height",
          "10 feet height",
          "Any height",
        ],
        correctAnswer: 0,
        explanation:
          "Example: Installing guardrails on gang forms when working platform exceeds 6 feet.",
      },
      {
        question: "What's the minimum shore spacing?",
        options: ["Any spacing", "Per design", "4 feet", "6 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Engineer's drawings specify maximum 3-foot shore spacing for elevated slab.",
      },
      {
        question: "How must reshoring be installed?",
        options: ["Randomly", "Bottom to top", "Top to bottom", "As needed"],
        correctAnswer: 2,
        explanation:
          "Example: Install reshores from top floor down when stripping multi-story building.",
      },
      {
        question: "What's required for form release agents?",
        options: ["Any type", "Approved type", "Optional use", "Water only"],
        correctAnswer: 1,
        explanation:
          "Example: Must use approved release agent that won't damage rebar bond.",
      },
      {
        question: "When are form drawings required?",
        options: ["Never", "Complex forms", "Always", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Detailed drawings required for flying forms on high-rise construction.",
      },
      {
        question: "What load must forms support?",
        options: [
          "Concrete only",
          "All imposed loads",
          "Dead load only",
          "Minimal load",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Forms must support concrete weight, workers, equipment, and impact loads.",
      },
    ],
  },
  24: {
    title: "Concrete and Masonry - Reinforcement",
    questions: [
      {
        question: "What protection is required for rebar ends?",
        options: ["None required", "Caps/covers", "Bend over", "Tape wrap"],
        correctAnswer: 1,
        explanation:
          "Example: Mushroom caps required on vertical rebar extending above footing.",
      },
      {
        question: "When is a limited access zone required?",
        options: [
          "Never",
          "During construction",
          "After completion",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Establish limited access zone while constructing 12-foot masonry wall.",
      },
      {
        question: "What's required for post-tension operations?",
        options: [
          "General warning",
          "Specific procedures",
          "verbal notice",
          "Nothing special",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Follow engineered procedures for tensioning parking deck tendons.",
      },
      {
        question: "How should vertical rebar be secured?",
        options: ["Any method", "Per specifications", "Wire only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Secure column rebar cage according to structural specifications.",
      },
      {
        question: "What's required for masonry wall bracing?",
        options: [
          "Optional use",
          "Engineered design",
          "Standard bracing",
          "Temporary only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Engineer must design bracing for 20-foot high block wall.",
      },
      {
        question: "When can rebar be used as ladder?",
        options: ["Never", "Emergency only", "When secured", "Short heights"],
        correctAnswer: 0,
        explanation:
          "Example: Workers must use proper ladder instead of climbing column rebar.",
      },
      {
        question: "What inspection is required for reinforcement?",
        options: [
          "Visual only",
          "Before concrete",
          "After pour",
          "Random checks",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Inspector must verify rebar placement before foundation pour.",
      },
      {
        question: "How should dowels be protected?",
        options: ["No protection", "Caps/covers", "Paint only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Cover exposed dowels extending from foundation with protective caps.",
      },
      {
        question: "What's required for reinforcement splices?",
        options: [
          "Any method",
          "Per specifications",
          "Wire tie",
          "Overlap only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Column rebar splices must meet engineered lap length requirements.",
      },
      {
        question: "When is grade testing required?",
        options: ["Never", "Each delivery", "Monthly", "Annually"],
        correctAnswer: 1,
        explanation:
          "Example: Verify grade markings on each rebar delivery against shop drawings.",
      },
    ],
  },
  25: {
    title: "Welding and Cutting - Basic Safety",
    questions: [
      {
        question: "What's the minimum fire watch duration?",
        options: ["15 minutes", "30 minutes", "45 minutes", "60 minutes"],
        correctAnswer: 1,
        explanation:
          "Example: Fire watch must remain 30 minutes after completing welding near wood framing.",
      },
      {
        question: "When is a hot work permit required?",
        options: ["Never", "All hot work", "Indoors only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Obtain hot work permit before welding structural steel connections.",
      },
      {
        question: "What ventilation is required?",
        options: [
          "Open doors",
          "Mechanical ventilation",
          "Natural air",
          "Any ventilation",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use local exhaust ventilation when welding galvanized steel.",
      },
      {
        question: "How should cylinders be stored?",
        options: ["Any method", "Secured upright", "Laying down", "Unsecured"],
        correctAnswer: 1,
        explanation:
          "Example: Oxygen and acetylene cylinders must be stored upright and secured with chain.",
      },
      {
        question: "What PPE is required for welding?",
        options: [
          "Basic PPE",
          "Complete protection",
          "Minimal gear",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Welder must wear helmet, FR clothing, gloves, and safety shoes.",
      },
      {
        question: "When are flash barriers required?",
        options: ["Never", "When exposed", "Indoor only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Install welding screens to protect other workers from arc flash.",
      },
      {
        question: "What fire protection is required?",
        options: ["Fire watch", "Extinguisher", "Both A and B", "Optional"],
        correctAnswer: 2,
        explanation:
          "Example: Maintain fire watch and extinguisher during overhead welding operations.",
      },
      {
        question: "How should leads be protected?",
        options: [
          "Any method",
          "Proper routing",
          "No protection",
          "When damaged",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Route welding leads to avoid damage and trip hazards.",
      },
      {
        question: "What's required for confined space welding?",
        options: [
          "Ventilation only",
          "Multiple requirements",
          "Basic safety",
          "Standard rules",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Confined space welding requires ventilation, monitoring, and rescue plan.",
      },
      {
        question: "When is grounding required?",
        options: ["Optional", "All electric welding", "Sometimes", "Never"],
        correctAnswer: 1,
        explanation:
          "Example: Ground arc welder to structural steel being welded.",
      },
    ],
  },
};

// Weekly tests 26-30

const weeklyTests26to30 = {
  26: {
    title: "Welding and Cutting - Special Processes",
    questions: [
      {
        question: "What ventilation is required for confined space welding?",
        options: [
          "Natural ventilation",
          "Mechanical ventilation",
          "Open door",
          "Any ventilation",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Local exhaust ventilation required when welding inside tank vessel.",
      },
      {
        question: "How must gas cylinders be transported?",
        options: [
          "Rolling cylinders",
          "Secured cart",
          "Carrying manually",
          "Any method",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Transport oxygen and acetylene cylinders on secured cart with valve caps installed.",
      },
      {
        question: "What's required for elevated welding?",
        options: [
          "Basic platform",
          "Fall protection system",
          "Good balance",
          "Helper watching",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use personal fall arrest system when welding from aerial lift.",
      },
      {
        question: "When is atmospheric monitoring required?",
        options: ["Never", "Enclosed spaces", "Outdoors only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Continuous monitoring required when welding in confined vessel.",
      },
      {
        question: "What's required for brazing operations?",
        options: [
          "Basic ventilation",
          "Specific controls",
          "No requirements",
          "Open area",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use local exhaust and specific PPE when brazing copper pipes.",
      },
      {
        question: "How should hoses be protected?",
        options: [
          "Any method",
          "Proper routing/protection",
          "No protection",
          "Cover when needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Route gas hoses to avoid damage and install flashback arrestors.",
      },
      {
        question: "What's required for aluminum welding?",
        options: [
          "Standard protection",
          "Special ventilation",
          "Basic PPE",
          "Regular setup",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Enhanced ventilation required when welding aluminum due to specific fumes.",
      },
      {
        question: "When are fire blankets required?",
        options: ["Never", "Overhead work", "Optional use", "Indoor only"],
        correctAnswer: 1,
        explanation:
          "Example: Use fire blankets to protect equipment below overhead welding operations.",
      },
      {
        question: "What's required for stainless steel welding?",
        options: [
          "Regular ventilation",
          "Special controls",
          "Basic setup",
          "Standard PPE",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Local exhaust ventilation required for hexavalent chromium exposure control.",
      },
      {
        question: "How should coated materials be handled?",
        options: [
          "Like regular materials",
          "Special precautions",
          "Basic ventilation",
          "No special needs",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Remove galvanized coating or use special ventilation when welding coated steel.",
      },
    ],
  },
  27: {
    title: "Hazardous Materials - Identification",
    questions: [
      {
        question: "What's required on chemical labels?",
        options: [
          "Name only",
          "GHS elements",
          "Basic warning",
          "Optional info",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Paint thinner container must have pictograms, signal word, and hazard statements.",
      },
      {
        question: "How long must SDS be retained?",
        options: ["1 year", "5 years", "30 years + use", "10 years"],
        correctAnswer: 2,
        explanation:
          "Example: Keep concrete additive SDS for duration of use plus 30 years.",
      },
      {
        question: "When is HAZCOM training required?",
        options: ["Annually", "Initial/new hazard", "Monthly", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Train workers before using new epoxy coating system.",
      },
      {
        question: "What information must be accessible?",
        options: ["Labels only", "SDS only", "Complete program", "Basic info"],
        correctAnswer: 2,
        explanation:
          "Example: Workers must have access to written program, SDSs, and container labels.",
      },
      {
        question: "How are hazards classified?",
        options: [
          "Any method",
          "GHS criteria",
          "Basic categories",
          "Company choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Classify new solvent using GHS physical and health hazard criteria.",
      },
      {
        question: "What determines PPE selection?",
        options: [
          "Worker choice",
          "Hazard assessment",
          "Availability",
          "Cost factors",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Select gloves based on chemical resistance rating for specific solvent.",
      },
      {
        question: "When must containers be labeled?",
        options: [
          "When convenient",
          "All containers",
          "Large only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Label secondary container when transferring cleaning solution from bulk storage.",
      },
      {
        question: "What's required for chemical inventory?",
        options: [
          "Basic list",
          "Detailed records",
          "Optional tracking",
          "No requirement",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain detailed inventory including quantities and locations of all chemicals.",
      },
      {
        question: "How often must program be reviewed?",
        options: ["Never", "Annually", "Every 5 years", "When changed"],
        correctAnswer: 1,
        explanation:
          "Example: Review and update HAZCOM program annually and when new hazards introduced.",
      },
      {
        question: "What pictogram indicates corrosives?",
        options: ["Skull", "Flame", "Corrosion", "Exclamation"],
        correctAnswer: 2,
        explanation:
          "Example: Hydrochloric acid container must have corrosion pictogram.",
      },
    ],
  },
  28: {
    title: "Hazardous Materials - Handling and Storage",
    questions: [
      {
        question: "How should incompatible materials be stored?",
        options: ["Together", "Separated", "Any method", "Mixed storage"],
        correctAnswer: 1,
        explanation:
          "Example: Store oxidizers separate from flammable materials.",
      },
      {
        question: "What's required for chemical storage areas?",
        options: [
          "Basic ventilation",
          "Specific controls",
          "Open area",
          "Any location",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Flammable storage room requires explosion-proof ventilation system.",
      },
      {
        question: "When are spill kits required?",
        options: [
          "Optional",
          "All storage areas",
          "Large spills",
          "When convenient",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain spill kits wherever chemicals are stored or transferred.",
      },
      {
        question: "What determines storage compatibility?",
        options: ["Container type", "Hazard class", "Size only", "Location"],
        correctAnswer: 1,
        explanation:
          "Example: Check hazard classes to determine proper chemical storage arrangement.",
      },
      {
        question: "How should containers be stored?",
        options: ["Any method", "Proper containment", "On floor", "Together"],
        correctAnswer: 1,
        explanation:
          "Example: Store drums on spill pallets with proper aisle spacing.",
      },
      {
        question: "What's required for transfer operations?",
        options: [
          "Any method",
          "Specific procedures",
          "Quick transfer",
          "Basic care",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use bonding and grounding when transferring flammable liquids.",
      },
      {
        question: "When is secondary containment required?",
        options: ["Never", "Specific materials", "Optional", "Outdoors only"],
        correctAnswer: 1,
        explanation:
          "Example: Provide secondary containment for bulk storage of corrosive liquids.",
      },
      {
        question: "What storage information is required?",
        options: [
          "Location only",
          "Complete inventory",
          "Basic list",
          "Optional records",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain detailed inventory of chemical quantities and storage locations.",
      },
      {
        question: "How often should storage be inspected?",
        options: ["Annually", "Regularly scheduled", "When needed", "Never"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct weekly inspections of chemical storage areas.",
      },
      {
        question: "What emergency equipment is needed?",
        options: [
          "Basic equipment",
          "Hazard specific",
          "Standard kit",
          "Optional items",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Install emergency shower/eyewash where corrosives are handled.",
      },
    ],
  },
  29: {
    title: "Respiratory Protection",
    questions: [
      {
        question: "When is fit testing required?",
        options: ["Optional", "Annually minimum", "One time", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct annual fit test for worker using half-face respirator.",
      },
      {
        question: "What medical evaluation is needed?",
        options: [
          "Basic exam",
          "OSHA questionnaire",
          "Optional check",
          "None needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Complete medical evaluation before initial respirator use.",
      },
      {
        question: "How often must cartridges be changed?",
        options: ["Monthly", "Per schedule", "When convenient", "Annually"],
        correctAnswer: 1,
        explanation:
          "Example: Change organic vapor cartridges according to calculated change schedule.",
      },
      {
        question: "What determines respirator selection?",
        options: [
          "Availability",
          "Hazard assessment",
          "Worker choice",
          "Cost only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Select respirator based on silica exposure monitoring results.",
      },
      {
        question: "When is user seal check required?",
        options: ["Daily", "Each use", "Weekly", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Perform positive and negative seal check before entering spray booth.",
      },
      {
        question: "What facial hair is allowed?",
        options: [
          "Trimmed beard",
          "Clean shaven",
          "Short stubble",
          "Neat beard",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Must be clean shaven where respirator seals with face.",
      },
      {
        question: "How should respirators be cleaned?",
        options: [
          "Any method",
          "Manufacturer procedure",
          "Basic cleaning",
          "When visible",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Clean and disinfect shared respirators after each use.",
      },
      {
        question: "What storage is required?",
        options: ["Any location", "Protected storage", "On desk", "With tools"],
        correctAnswer: 1,
        explanation:
          "Example: Store respirator in sealed bag away from dust and chemicals.",
      },
      {
        question: "When is program evaluation needed?",
        options: ["Never", "Regularly", "One time", "When failed"],
        correctAnswer: 1,
        explanation:
          "Example: Evaluate respiratory protection program effectiveness annually.",
      },
      {
        question: "What records must be kept?",
        options: [
          "Basic notes",
          "Complete records",
          "Optional logs",
          "None needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain fit test records, medical evaluations, and training documentation.",
      },
    ],
  },
  30: {
    title: "Noise Exposure and Hearing Conservation",
    questions: [
      {
        question: "What's the permissible exposure limit?",
        options: ["85 dBA", "90 dBA", "95 dBA", "100 dBA"],
        correctAnswer: 1,
        explanation:
          "Example: Worker exposure cannot exceed 90 dBA for 8-hour TWA.",
      },
      {
        question: "When is monitoring required?",
        options: ["Optional", "May exceed 85 dBA", "Annual only", "Never"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor noise levels when new equipment installed may exceed 85 dBA.",
      },
      {
        question: "What determines protection selection?",
        options: [
          "Comfort only",
          "Noise reduction",
          "Cost factors",
          "Availability",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Select hearing protection based on noise level and NRR rating.",
      },
      {
        question: "How often is audiometric testing needed?",
        options: ["Optional", "Annually", "One time", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct annual audiogram for workers in hearing conservation program.",
      },
      {
        question: "When is double protection required?",
        options: ["Never", "Over 105 dBA", "Optional use", "Always"],
        correctAnswer: 1,
        explanation:
          "Example: Use earplugs and muffs when operating jackhammer (115 dBA).",
      },
      {
        question: "What training is required?",
        options: [
          "Basic info",
          "Comprehensive program",
          "Optional review",
          "None needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Train on effects of noise, purpose of protection, and proper use.",
      },
      {
        question: "How should exposure be reduced?",
        options: [
          "PPE only",
          "Hierarchy of controls",
          "Administrative",
          "Nothing needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: First attempt engineering controls before relying on hearing protection.",
      },
      {
        question: "What records must be maintained?",
        options: [
          "Basic notes",
          "Complete records",
          "Optional logs",
          "None needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Keep noise exposure measurements, audiograms, and training records.",
      },
    ],
  },
};

// Weekly tests 31-33
const weeklyTests31to33 = {
  31: {
    title: "Power Transmission and Distribution",
    questions: [
      {
        question: "What's the minimum approach distance for 50kV lines?",
        options: ["5 feet", "10 feet", "15 feet", "20 feet"],
        correctAnswer: 1,
        explanation:
          "Example: Crane must maintain minimum 10-foot clearance from 50kV power lines.",
      },
      {
        question: "When are insulated tools required?",
        options: ["Optional use", "Energized work", "Any electrical", "Never"],
        correctAnswer: 1,
        explanation:
          "Example: Must use insulated hand tools when working near energized conductors.",
      },
      {
        question: "What grounding is required for vehicles?",
        options: ["None needed", "When near lines", "Optional", "Indoor only"],
        correctAnswer: 1,
        explanation:
          "Example: Ground aerial lift when working near overhead power lines.",
      },
      {
        question: "What PPE is required for line work?",
        options: ["Basic PPE", "Voltage rated", "Standard gear", "Any type"],
        correctAnswer: 1,
        explanation:
          "Example: Use voltage-rated gloves and sleeves for overhead line maintenance.",
      },
      {
        question: "How often must PPE be tested?",
        options: ["Monthly", "Per schedule", "Annually", "When damaged"],
        correctAnswer: 1,
        explanation:
          "Example: Test rubber insulating gloves every 6 months per voltage rating.",
      },
      {
        question: "What's required for underground work?",
        options: [
          "Basic precaution",
          "Complete procedures",
          "Visual check",
          "Nothing special",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Follow detailed procedures for entering underground electrical vault.",
      },
      {
        question: "When is a spotter required?",
        options: ["Never", "Near power lines", "Optional", "Indoor work"],
        correctAnswer: 1,
        explanation:
          "Example: Use dedicated spotter when operating crane near overhead lines.",
      },
      {
        question: "What emergency equipment is needed?",
        options: [
          "Basic kit",
          "Voltage specific",
          "First aid only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain hot stick and voltage-rated rescue equipment on site.",
      },
      {
        question: "How should tools be stored?",
        options: [
          "Any method",
          "Protected storage",
          "With other tools",
          "Outside",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Store insulated tools in protective cases to prevent damage.",
      },
      {
        question: "What weather restrictions apply?",
        options: ["None", "Specific conditions", "Rain only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Stop overhead line work during thunderstorm conditions.",
      },
    ],
  },
  32: {
    title: "Mobile Equipment Operations",
    questions: [
      {
        question: "How often must equipment be inspected?",
        options: ["Weekly", "Before use", "Monthly", "Annually"],
        correctAnswer: 1,
        explanation:
          "Example: Complete equipment inspection checklist before operating forklift each shift.",
      },
      {
        question: "What determines operator qualification?",
        options: [
          "Experience",
          "Training/Certification",
          "Supervisor ok",
          "Age only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Complete required training and evaluation before operating skid steer.",
      },
      {
        question: "When is spotter required?",
        options: ["Never", "Limited visibility", "Always", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use spotter when backing dump truck in congested area.",
      },
      {
        question: "What load information is required?",
        options: ["Weight only", "Complete data", "Estimate", "None needed"],
        correctAnswer: 1,
        explanation:
          "Example: Verify weight, dimensions, and center of gravity before lifting.",
      },
      {
        question: "How should equipment be parked?",
        options: [
          "Any location",
          "Secured position",
          "Near work",
          "Convenience",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Lower blade, set brake, remove key when parking bulldozer.",
      },
      {
        question: "What's required for maintenance?",
        options: [
          "Basic service",
          "Manufacturer specs",
          "As needed",
          "Annual only",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Follow manufacturer's maintenance schedule for loader servicing.",
      },
      {
        question: "When are seatbelts required?",
        options: [
          "Optional",
          "Always equipped",
          "Rough terrain",
          "High speeds",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use seatbelt when operating any equipped mobile equipment.",
      },
      {
        question: "What communication is required?",
        options: [
          "None needed",
          "Established system",
          "Verbal only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use standard hand signals when directing concrete truck placement.",
      },
      {
        question: "How should loads be carried?",
        options: [
          "Any method",
          "Per guidelines",
          "Low always",
          "Operator choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Carry load at proper height and tilted back when using forklift.",
      },
      {
        question: "What surface conditions are required?",
        options: ["Any surface", "Adequate support", "Hard only", "Level only"],
        correctAnswer: 1,
        explanation:
          "Example: Verify ground can support loaded scraper before crossing area.",
      },
    ],
  },
  33: {
    title: "Underground Construction",
    questions: [
      {
        question: "How often must air quality be tested?",
        options: ["Daily", "Weekly", "Continuously", "Monthly"],
        correctAnswer: 2,
        explanation:
          "Example: Monitor air quality continuously during tunnel boring operations.",
      },
      {
        question: "What ventilation is required?",
        options: ["Natural", "Mechanical system", "Open portal", "Any type"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain mechanical ventilation system during underground welding.",
      },
      {
        question: "When is check-in/out required?",
        options: ["Never", "All personnel", "New workers", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: All workers must check in/out when entering/leaving tunnel.",
      },
      {
        question: "What emergency equipment is needed?",
        options: ["Basic kit", "Complete system", "First aid only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain rescue equipment, communications, and breathing apparatus.",
      },
      {
        question: "How often must equipment be inspected?",
        options: ["Weekly", "Before use", "Monthly", "Annually"],
        correctAnswer: 1,
        explanation:
          "Example: Inspect boring equipment before each use underground.",
      },
      {
        question: "What illumination is required?",
        options: [
          "Any lighting",
          "Specific levels",
          "Natural light",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain minimum 5 foot-candles in underground work areas.",
      },
      {
        question: "When is atmospheric monitoring required?",
        options: ["Never", "Continuously", "Weekly", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor for hazardous gases during shaft excavation.",
      },
      {
        question: "What communication system is needed?",
        options: ["Any type", "Two-way system", "Phones only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain two-way communication between underground and surface.",
      },
      {
        question: "How should water be controlled?",
        options: [
          "Natural drainage",
          "Pumping system",
          "Any method",
          "No control",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Install and maintain dewatering system during tunnel construction.",
      },
      {
        question: "What ground support is required?",
        options: [
          "Optional",
          "Engineered system",
          "Basic support",
          "None needed",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Install designed support system for underground excavation.",
      },
    ],
  },
};
// Weekly tests 34-37
const weeklyTests34to37 = {
  34: {
    title: "Compressed Air Safety",
    questions: [
      {
        question: "What's the maximum pressure for cleaning?",
        options: ["15 psi", "30 psi", "45 psi", "60 psi"],
        correctAnswer: 1,
        explanation:
          "Example: Air used for cleaning must be reduced to 30 psi at nozzle.",
      },
      {
        question: "When are pressure tests required?",
        options: ["Monthly", "Annually", "Before use", "Never"],
        correctAnswer: 2,
        explanation:
          "Example: Test compressed air system before connecting new tool.",
      },
      {
        question: "What's required for hose connections?",
        options: [
          "Any fitting",
          "Whip check/safety clips",
          "Tape only",
          "Nothing",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Install safety clips on all compressed air hose connections.",
      },
      {
        question: "How should receivers be drained?",
        options: ["Never", "Daily", "Monthly", "Annually"],
        correctAnswer: 1,
        explanation:
          "Example: Drain moisture from air receiver tank at start of each shift.",
      },
      {
        question: "What PPE is required?",
        options: ["None", "Full protection", "Gloves only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Wear eye, face, and hearing protection when using compressed air tools.",
      },
      {
        question: "How often inspect air systems?",
        options: ["Monthly", "Daily visual", "Annually", "When broken"],
        correctAnswer: 1,
        explanation:
          "Example: Visually inspect air lines and connections before each use.",
      },
      {
        question: "When is lockout required?",
        options: ["Never", "During maintenance", "Optional", "End of day"],
        correctAnswer: 1,
        explanation:
          "Example: Lock out compressed air system before performing maintenance.",
      },
      {
        question: "What valve type is required?",
        options: ["Any type", "Quick-disconnect", "Ball valve", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Use quick-disconnect valves for tool changes.",
      },
      {
        question: "How store air tools?",
        options: ["Any method", "Protected storage", "On ground", "With hose"],
        correctAnswer: 1,
        explanation:
          "Example: Store air tools in protected area to prevent damage.",
      },
      {
        question: "What's required for manifolds?",
        options: ["Nothing", "Pressure rating", "Any pipe", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use properly rated manifolds for air distribution system.",
      },
    ],
  },
  35: {
    title: "Environmental Controls",
    questions: [
      {
        question: "At what temperature is heat monitoring required?",
        options: ["80°F", "85°F", "90°F", "95°F"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor workers when temperature exceeds 85°F with high humidity.",
      },
      {
        question: "What's required for cold stress prevention?",
        options: [
          "Extra breaks",
          "Complete program",
          "Warm clothing",
          "Nothing specific",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Implement warming breaks, protective clothing, and monitoring below 20°F.",
      },
      {
        question: "How often monitor indoor air quality?",
        options: ["Never", "As needed", "Regularly", "Annually"],
        correctAnswer: 2,
        explanation:
          "Example: Regular CO monitoring when using propane heaters indoors.",
      },
      {
        question: "What weather monitoring is required?",
        options: ["None", "Daily forecasts", "Temperature only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor weather forecasts for outdoor work planning.",
      },
      {
        question: "When provide cooling breaks?",
        options: ["Optional", "Per schedule", "Worker request", "End of day"],
        correctAnswer: 1,
        explanation:
          "Example: Schedule cooling breaks based on temperature and workload.",
      },
      {
        question: "What lighting is required?",
        options: ["Any level", "Task specific", "Daylight", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Provide minimum 10 foot-candles for general construction areas.",
      },
      {
        question: "How control dust exposure?",
        options: [
          "Natural ventilation",
          "Engineering controls",
          "Optional methods",
          "No control",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use water spray system during concrete cutting operations.",
      },
      {
        question: "What determines ventilation needs?",
        options: [
          "Space size",
          "Hazard assessment",
          "Worker count",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Assess painting operation to determine ventilation requirements.",
      },
      {
        question: "When stop outdoor work?",
        options: [
          "Never",
          "Hazardous conditions",
          "Worker choice",
          "End of day",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Stop roofing work when lightning detected within 10 miles.",
      },
      {
        question: "What emergency plans needed?",
        options: ["Basic plan", "Weather specific", "Optional", "None"],
        correctAnswer: 1,
        explanation:
          "Example: Develop specific procedures for severe weather events.",
      },
    ],
  },
  36: {
    title: "Silica Exposure Control",
    questions: [
      {
        question: "What's the PEL for silica?",
        options: ["25 μg/m³", "50 μg/m³", "100 μg/m³", "150 μg/m³"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor to ensure exposure stays below 50 μg/m³ during concrete grinding.",
      },
      {
        question: "When is exposure monitoring required?",
        options: ["Never", "Potential exposure", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor worker exposure during brick cutting operations.",
      },
      {
        question: "What controls are required first?",
        options: ["PPE", "Engineering controls", "Time limits", "Training"],
        correctAnswer: 1,
        explanation:
          "Example: Use wet methods or vacuum system before relying on respirators.",
      },
      {
        question: "How often is medical surveillance needed?",
        options: ["Never", "Per standard", "Monthly", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Provide medical exams for workers exposed above PEL for 30+ days/year.",
      },
      {
        question: "What housekeeping methods allowed?",
        options: ["Any method", "Approved methods", "Dry sweep", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use HEPA vacuum instead of dry sweeping silica dust.",
      },
      {
        question: "When establish regulated area?",
        options: ["Never", "Above PEL", "Optional", "Always"],
        correctAnswer: 1,
        explanation:
          "Example: Mark boundary where exposure may exceed PEL during sandblasting.",
      },
      {
        question: "What respiratory protection required?",
        options: ["Any type", "Task specific", "Optional", "Basic only"],
        correctAnswer: 1,
        explanation:
          "Example: Use minimum APF 10 respirator for concrete cutting with water.",
      },
      {
        question: "How often train workers?",
        options: ["Once", "Initially and annual", "Monthly", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Provide initial training and annual updates on silica hazards.",
      },
      {
        question: "What records must be kept?",
        options: ["None", "Complete records", "Basic notes", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain air monitoring, medical, and training records.",
      },
      {
        question: "When can dry cutting occur?",
        options: ["Anytime", "Never", "If controls used", "Optional"],
        correctAnswer: 2,
        explanation:
          "Example: Use dust collection system when wet methods aren't feasible.",
      },
    ],
  },
  37: {
    title: "Lead Safety",
    questions: [
      {
        question: "What's the action level for lead?",
        options: ["15 μg/m³", "30 μg/m³", "50 μg/m³", "75 μg/m³"],
        correctAnswer: 1,
        explanation:
          "Example: Begin monitoring when lead exposure may reach 30 μg/m³.",
      },
      {
        question: "When is blood testing required?",
        options: ["Never", "Exposure above AL", "Optional", "Annually"],
        correctAnswer: 1,
        explanation:
          "Example: Provide blood tests for workers exposed above action level for 30+ days.",
      },
      {
        question: "What determines PPE selection?",
        options: ["Cost", "Exposure level", "Comfort", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Select respiratory protection based on measured lead exposure levels.",
      },
      {
        question: "How often monitor exposure?",
        options: ["Never", "Per standard", "Annually", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Repeat monitoring quarterly if above action level.",
      },
      {
        question: "What hygiene facilities required?",
        options: [
          "Basic facilities",
          "Complete facilities",
          "Optional",
          "None",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Provide change rooms, showers, and eating areas.",
      },
      {
        question: "When is medical removal required?",
        options: ["Never", "Elevated BLL", "Optional", "Upon request"],
        correctAnswer: 1,
        explanation:
          "Example: Remove worker when blood lead level exceeds 50 μg/dL.",
      },
      {
        question: "What work practices required?",
        options: ["Any method", "Specific controls", "Basic care", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use HEPA vacuums and wet methods for cleanup of lead dust.",
      },
      {
        question: "How often train workers?",
        options: ["Once", "Initially and annual", "Monthly", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Provide training before initial assignment and annually after.",
      },
      {
        question: "What signs required?",
        options: ["None", "Warning signs", "Optional", "Basic notice"],
        correctAnswer: 1,
        explanation:
          "Example: Post warning signs at entrance to regulated areas.",
      },
      {
        question: "How long keep records?",
        options: ["1 year", "30 years", "5 years", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain exposure and medical records for duration plus 30 years.",
      },
    ],
  },
};

// Weekly tests 38-42

const weeklyTests38to42 = {
  38: {
    title: "Asbestos Awareness",
    questions: [
      {
        question: "What's required before disturbing suspected materials?",
        options: [
          "Visual inspection",
          "Laboratory testing",
          "Supervisor approval",
          "Nothing",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Test ceiling tile samples before removal in renovation project.",
      },
      {
        question: "When is monitoring required?",
        options: ["Never", "During disturbance", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor air during removal of asbestos pipe insulation.",
      },
      {
        question: "What determines work classification?",
        options: [
          "Amount only",
          "Material type/amount",
          "Location only",
          "Worker choice",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Class I work includes removal of thermal insulation and surfacing material.",
      },
      {
        question: "How must materials be wetted?",
        options: [
          "Spray bottle",
          "Amended water",
          "Regular water",
          "When convenient",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use amended water to wet floor tiles before removal.",
      },
      {
        question: "What respiratory protection needed?",
        options: ["Any type", "Based on work class", "Optional", "None"],
        correctAnswer: 1,
        explanation:
          "Example: Use minimum half-face respirator for Class II removal work.",
      },
      {
        question: "How should waste be handled?",
        options: [
          "Regular trash",
          "Sealed containers",
          "Any method",
          "Open bins",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Double-bag asbestos waste in labeled 6-mil poly bags.",
      },
      {
        question: "What decontamination required?",
        options: ["Basic cleanup", "3-stage setup", "Single room", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use clean room, shower, and equipment room for Class I work.",
      },
      {
        question: "Who can supervise work?",
        options: [
          "Any supervisor",
          "Competent person",
          "Any worker",
          "Project manager",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Designated competent person must oversee all asbestos work.",
      },
      {
        question: "What warning signs needed?",
        options: ["None", "Specific format", "Basic warning", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Post OSHA-specified warning signs at regulated areas.",
      },
      {
        question: "How long keep records?",
        options: ["1 year", "30 years", "5 years", "No requirement"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain exposure records and medical surveillance for 30 years.",
      },
    ],
  },
  39: {
    title: "Emergency Response Planning",
    questions: [
      {
        question: "What must emergency plan include?",
        options: [
          "Exit routes only",
          "All requirements",
          "Basic info",
          "Optional items",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Plan must include evacuation routes, procedures, and emergency contacts.",
      },
      {
        question: "How often must plan be reviewed?",
        options: ["Never", "When changes occur", "Annually", "Monthly"],
        correctAnswer: 1,
        explanation:
          "Example: Review and update plan when new chemical storage area added.",
      },
      {
        question: "What training is required?",
        options: ["None", "Initial and updates", "One-time", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Train all workers on emergency procedures before assignment.",
      },
      {
        question: "How often conduct drills?",
        options: ["Never", "Regular schedule", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct quarterly evacuation drills with all shifts.",
      },
      {
        question: "What emergency equipment needed?",
        options: ["Basic kit", "Hazard specific", "Standard items", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain specific equipment for chemical spill response.",
      },
      {
        question: "Who can modify plan?",
        options: ["Any worker", "Authorized person", "Supervisors", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Safety manager must approve changes to emergency procedures.",
      },
      {
        question: "What communication required?",
        options: ["None", "Multiple methods", "Phone only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use alarms, radios, and phones for emergency notification.",
      },
      {
        question: "Where post procedures?",
        options: ["Office only", "Key locations", "One place", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Post evacuation maps and procedures at all exit routes.",
      },
      {
        question: "What coordination needed?",
        options: ["None", "Emergency services", "Internal only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Coordinate response plans with local fire department.",
      },
      {
        question: "How document incidents?",
        options: [
          "Basic notes",
          "Complete records",
          "Verbal report",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Document all details of emergency response and outcomes.",
      },
    ],
  },
  40: {
    title: "Incident Investigation",
    questions: [
      {
        question: "When must investigation begin?",
        options: [
          "Within week",
          "Within 24 hours",
          "Immediately",
          "When convenient",
        ],
        correctAnswer: 2,
        explanation:
          "Example: Begin investigation immediately after fall from scaffold.",
      },
      {
        question: "Who must be interviewed?",
        options: [
          "Injured only",
          "All involved parties",
          "Supervisor only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Interview injured worker, witnesses, and supervisor after accident.",
      },
      {
        question: "What evidence must be gathered?",
        options: [
          "Basic info",
          "All relevant evidence",
          "Photos only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Collect photos, measurements, equipment, and documentation.",
      },
      {
        question: "How determine root cause?",
        options: [
          "Best guess",
          "Systematic analysis",
          "Quick review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use root cause analysis method to identify underlying factors.",
      },
      {
        question: "What documentation required?",
        options: [
          "Basic notes",
          "Complete report",
          "Brief summary",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Document all findings, analysis, and recommendations in report.",
      },
      {
        question: "When implement corrections?",
        options: ["Eventually", "Immediately", "Next month", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Implement guardrail improvements same day after fall incident.",
      },
      {
        question: "Who reviews findings?",
        options: [
          "Supervisor only",
          "Required parties",
          "Optional review",
          "No review",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Safety committee and management review investigation results.",
      },
      {
        question: "How track corrective actions?",
        options: ["Memory", "Tracking system", "Basic notes", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use action tracking system to verify completion of improvements.",
      },
      {
        question: "What follow-up required?",
        options: ["None", "Verify effectiveness", "Brief check", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Verify new guardrail system prevents similar incidents.",
      },
      {
        question: "When share lessons learned?",
        options: ["Never", "With all affected", "Supervisor only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Share investigation findings in safety meetings and training.",
      },
    ],
  },
  41: {
    title: "Safety Program Management",
    questions: [
      {
        question: "How often evaluate program?",
        options: ["Never", "Regularly", "When failed", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct annual comprehensive safety program review.",
      },
      {
        question: "What metrics required?",
        options: ["Optional", "Leading/Lagging", "Basic numbers", "None"],
        correctAnswer: 1,
        explanation:
          "Example: Track both incident rates and near-miss reports.",
      },
      {
        question: "How often meet safety committee?",
        options: ["Annually", "Monthly minimum", "When needed", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Safety committee meets monthly to review performance.",
      },
      {
        question: "What documentation needed?",
        options: [
          "Basic notes",
          "Complete records",
          "Brief summary",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain training, inspection, and incident records.",
      },
      {
        question: "Who can modify program?",
        options: ["Anyone", "Authorized person", "Workers", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Safety manager must approve program changes.",
      },
      {
        question: "What training documentation required?",
        options: [
          "Sign-in only",
          "Complete records",
          "Basic notes",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Document training content, attendance, and verification.",
      },
      {
        question: "How communicate program?",
        options: ["Post only", "Multiple methods", "Tell workers", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use meetings, training, and written materials to communicate.",
      },
      {
        question: "What determines PPE requirements?",
        options: [
          "Worker choice",
          "Hazard assessment",
          "Cost only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Conduct job hazard analysis to determine PPE needs.",
      },
      {
        question: "How verify compliance?",
        options: ["Assume okay", "Regular audits", "Wait for OSHA", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct monthly safety compliance audits of all areas.",
      },
      {
        question: "What review frequency needed?",
        options: ["Never", "Regular schedule", "When cited", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Review and update written programs annually minimum.",
      },
    ],
  },
  42: {
    title: "Workplace Violence Prevention",
    questions: [
      {
        question: "What must prevention program include?",
        options: [
          "Basic policy",
          "Complete program",
          "Rules only",
          "Optional items",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Program includes policy, procedures, training and response plans.",
      },
      {
        question: "When conduct training?",
        options: [
          "After incident",
          "Before exposure",
          "Annually only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Train workers on prevention before working with public.",
      },
      {
        question: "What controls required?",
        options: [
          "Guards only",
          "Multiple methods",
          "Cameras only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Implement physical security, procedures, and training controls.",
      },
      {
        question: "How assess threats?",
        options: [
          "Wait for incident",
          "Systematic process",
          "Basic review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use threat assessment team to evaluate potential risks.",
      },
      {
        question: "What reporting required?",
        options: ["Serious only", "All incidents", "Optional", "None"],
        correctAnswer: 1,
        explanation:
          "Example: Report and document all threats and violent incidents.",
      },
      {
        question: "When update procedures?",
        options: ["After incident", "Regularly/Changes", "Annually", "Never"],
        correctAnswer: 1,
        explanation:
          "Example: Review and update procedures after identified gaps.",
      },
      {
        question: "What response plan needed?",
        options: ["Call police", "Complete plan", "Basic steps", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Detailed response procedures for different threat scenarios.",
      },
      {
        question: "How often inspect security?",
        options: ["When failed", "Regular schedule", "After incident", "Never"],
        correctAnswer: 1,
        explanation:
          "Example: Monthly inspections of physical security measures.",
      },
      {
        question: "What recordkeeping needed?",
        options: ["Basic notes", "Complete records", "Optional", "None"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain training, incident, and assessment records.",
      },
      {
        question: "Who reviews program?",
        options: [
          "Safety only",
          "Multiple parties",
          "Manager only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Management, security, and safety review prevention program.",
      },
    ],
  },
};

// Weekly tests 43-47
const weeklyTests43to47 = {
  43: {
    title: "Risk Assessment and Job Hazard Analysis",
    questions: [
      {
        question: "What's the first step in JHA?",
        options: [
          "Assess risks",
          "Break job into steps",
          "Select controls",
          "Document findings",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Begin scaffold erection JHA by listing each step in sequence.",
      },
      {
        question: "When must JHA be updated?",
        options: ["Never", "Process changes", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Update concrete sawing JHA when new dust control system implemented.",
      },
      {
        question: "Who must be involved?",
        options: [
          "Supervisor only",
          "Multiple parties",
          "Safety only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Include workers, supervisors, and safety staff in crane lift JHA.",
      },
      {
        question: "How prioritize hazards?",
        options: ["Random order", "Risk based", "Alphabetical", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Prioritize fall hazards based on severity and likelihood.",
      },
      {
        question: "What controls considered first?",
        options: ["PPE", "Engineering", "Administrative", "Elimination"],
        correctAnswer: 3,
        explanation:
          "Example: First consider eliminating need for work at heights.",
      },
      {
        question: "How document assessment?",
        options: ["Mental notes", "Formal system", "Basic notes", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use standardized forms to document excavation hazard analysis.",
      },
      {
        question: "When observe actual work?",
        options: ["Never", "During assessment", "After complete", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Observe workers during welding operation to identify hazards.",
      },
      {
        question: "How often review JHAs?",
        options: ["Never", "Regularly/Changes", "Annually", "When failed"],
        correctAnswer: 1,
        explanation:
          "Example: Review confined space JHA before each entry operation.",
      },
      {
        question: "What training required?",
        options: ["None", "Process training", "Basic info", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Train assessment team on hazard recognition and analysis methods.",
      },
      {
        question: "How communicate results?",
        options: ["File only", "All affected", "Management", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Share JHA findings with all workers involved in the task.",
      },
    ],
  },
  44: {
    title: "Process Safety Management",
    questions: [
      {
        question: "How often review operating procedures?",
        options: ["Never", "Annually/Changes", "Monthly", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Review chemical transfer procedures annually and when equipment changes.",
      },
      {
        question: "What triggers MOC?",
        options: ["Major only", "Any change", "Optional", "Equipment only"],
        correctAnswer: 1,
        explanation:
          "Example: Implement MOC when changing chemical supply system components.",
      },
      {
        question: "When update PHA?",
        options: ["Never", "5 years/Changes", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Update Process Hazard Analysis when adding new chemical reactor.",
      },
      {
        question: "What mechanical integrity required?",
        options: [
          "Basic maintenance",
          "Written program",
          "Visual checks",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Document inspection procedures for pressure vessels.",
      },
      {
        question: "How verify contractor safety?",
        options: ["References", "Evaluation system", "Cost only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Review contractor safety programs and performance before selection.",
      },
      {
        question: "What employee participation needed?",
        options: ["Optional", "Active involvement", "Information only", "None"],
        correctAnswer: 1,
        explanation:
          "Example: Include operators in process hazard analysis teams.",
      },
      {
        question: "When conduct training?",
        options: ["Annually", "Before task/Change", "Monthly", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Train operators before assigning to new process area.",
      },
      {
        question: "What emergency planning required?",
        options: ["Basic plan", "Detailed procedures", "Call list", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Develop specific procedures for potential process releases.",
      },
      {
        question: "How investigate incidents?",
        options: [
          "Basic review",
          "Thorough analysis",
          "Quick check",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Conduct detailed investigation of process upset conditions.",
      },
      {
        question: "What documentation needed?",
        options: ["Basic records", "Complete system", "Notes only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain detailed records of process safety information.",
      },
    ],
  },
  45: {
    title: "Workplace Security",
    questions: [
      {
        question: "What must access control include?",
        options: [
          "Locks only",
          "Multiple measures",
          "Guards only",
          "Optional items",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Implement badges, locks, and visitor procedures for site access.",
      },
      {
        question: "How often assess security?",
        options: ["Never", "Regular schedule", "After incident", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct monthly security assessments of all access points.",
      },
      {
        question: "What lighting required?",
        options: ["Any level", "Adequate coverage", "Minimal", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain proper lighting levels in parking areas and entrances.",
      },
      {
        question: "When train employees?",
        options: ["After incident", "Before exposure", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Train workers on security procedures before assignment.",
      },
      {
        question: "What key control needed?",
        options: ["Basic system", "Complete program", "Log only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Implement key tracking system and controlled distribution.",
      },
      {
        question: "How monitor systems?",
        options: ["Visual check", "Regular testing", "When failed", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Test alarm systems monthly and maintain documentation.",
      },
      {
        question: "What visitor controls required?",
        options: ["Sign in only", "Complete process", "Basic ID", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Implement sign-in, badges, and escort procedures.",
      },
      {
        question: "When update procedures?",
        options: ["After breach", "Regularly/Changes", "Annually", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Review and update procedures when adding new access points.",
      },
      {
        question: "What emergency response needed?",
        options: [
          "Call police",
          "Written procedures",
          "Basic plan",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Develop specific procedures for security breaches.",
      },
      {
        question: "How document incidents?",
        options: ["Basic notes", "Complete records", "Report only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain detailed records of all security incidents.",
      },
    ],
  },
  46: {
    title: "Safety Leadership",
    questions: [
      {
        question: "What demonstrates commitment?",
        options: ["Talk only", "Visible actions", "Policy only", "Delegation"],
        correctAnswer: 1,
        explanation:
          "Example: Leaders conduct regular safety walks and address concerns.",
      },
      {
        question: "How often communicate safety?",
        options: ["Monthly", "Continuously", "Annually", "When needed"],
        correctAnswer: 1,
        explanation:
          "Example: Include safety messages in daily operations meetings.",
      },
      {
        question: "What accountability needed?",
        options: [
          "Discipline only",
          "Complete system",
          "Basic rules",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Implement performance measures for all leadership levels.",
      },
      {
        question: "How develop safety culture?",
        options: [
          "Rules only",
          "Multiple methods",
          "Training only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Build culture through example, involvement, and recognition.",
      },
      {
        question: "What resource allocation needed?",
        options: [
          "Minimum required",
          "Support objectives",
          "Fixed budget",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Provide resources needed to implement safety improvements.",
      },
      {
        question: "How engage employees?",
        options: [
          "Tell them",
          "Active involvement",
          "Posters only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Include workers in safety committees and decisions.",
      },
      {
        question: "What recognition effective?",
        options: ["Money only", "Multiple methods", "Annual only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Implement both formal and informal recognition programs.",
      },
      {
        question: "How measure leadership?",
        options: [
          "Incidents only",
          "Multiple metrics",
          "Basic review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Track leading and lagging indicators of leadership effectiveness.",
      },
      {
        question: "What coaching required?",
        options: ["Criticism", "Positive approach", "Commands", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Coach workers using constructive feedback methods.",
      },
      {
        question: "How handle resistance?",
        options: ["Ignore it", "Address directly", "Discipline", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Identify and address root causes of safety resistance.",
      },
    ],
  },
  47: {
    title: "Continuous Improvement",
    questions: [
      {
        question: "How identify improvements?",
        options: [
          "Wait for problems",
          "Multiple methods",
          "Annual review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use audits, observations, and feedback to identify opportunities.",
      },
      {
        question: "What data analysis needed?",
        options: [
          "Basic review",
          "Systematic analysis",
          "Numbers only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Analyze trends in leading and lagging indicators.",
      },
      {
        question: "How prioritize improvements?",
        options: ["Random order", "Risk based", "Cost only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Prioritize based on risk level and improvement potential.",
      },
      {
        question: "What tracking required?",
        options: ["Memory", "Formal system", "Basic notes", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Track improvement actions through completion.",
      },
      {
        question: "How verify effectiveness?",
        options: [
          "Assume working",
          "Measure results",
          "Basic check",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Measure impact of improvements on safety performance.",
      },
      {
        question: "What employee involvement needed?",
        options: [
          "Tell them",
          "Active participation",
          "Suggestions only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Include workers in improvement teams and decisions.",
      },
      {
        question: "How document improvements?",
        options: ["Memory", "Complete records", "Basic notes", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Maintain records of improvements and results.",
      },
      {
        question: "What review frequency needed?",
        options: ["Annually", "Regular schedule", "When failed", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Review improvement progress monthly with team.",
      },
      {
        question: "How communicate progress?",
        options: [
          "Don't share",
          "Multiple methods",
          "Tell supervisor",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Share improvement updates through meetings and reports.",
      },
      {
        question: "What benchmark against?",
        options: ["Nothing", "Multiple sources", "Past only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Compare performance against industry leaders and standards.",
      },
    ],
  },
};

// Weekly tests 48-52
const weeklyTests48to52 = {
  48: {
    title: "Documentation and Record Keeping",
    questions: [
      {
        question: "How long keep OSHA 300 logs?",
        options: ["1 year", "5 years", "3 years", "10 years"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain injury and illness logs for 5 years following the year they cover.",
      },
      {
        question: "What training records required?",
        options: [
          "Attendance only",
          "Complete records",
          "Basic notes",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Document training content, dates, attendees, and verification of understanding.",
      },
      {
        question: "How maintain inspection records?",
        options: ["File only", "Organized system", "Notes only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain systematic records of crane inspections with follow-up actions.",
      },
      {
        question: "What exposure records needed?",
        options: ["Basic data", "30-year retention", "5 years", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Keep noise exposure monitoring records for 30 years.",
      },
      {
        question: "How document incidents?",
        options: [
          "Basic report",
          "Complete documentation",
          "Notes only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Maintain detailed records of accident investigations and corrective actions.",
      },
      {
        question: "What medical records required?",
        options: ["Basic info", "Duration plus 30", "5 years", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Keep respirator medical evaluations for duration of employment plus 30 years.",
      },
      {
        question: "How organize documents?",
        options: ["Any method", "Systematic filing", "Basic files", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Implement organized system for quick retrieval of safety documents.",
      },
      {
        question: "What electronic backup needed?",
        options: ["None", "Regular backup", "Occasional", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Back up safety documentation daily to secure server.",
      },
      {
        question: "How ensure accessibility?",
        options: ["File away", "Available system", "Lock up", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain records where workers can access their exposure data.",
      },
      {
        question: "What review frequency needed?",
        options: ["Never", "Regular schedule", "When needed", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Review documentation systems quarterly for completeness.",
      },
    ],
  },
  49: {
    title: "Safety Training Methods",
    questions: [
      {
        question: "What makes training effective?",
        options: [
          "Lecture only",
          "Multiple methods",
          "Videos only",
          "Handouts",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Combine classroom, hands-on, and practical exercises in forklift training.",
      },
      {
        question: "How verify understanding?",
        options: [
          "Assume learned",
          "Multiple methods",
          "Written test",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use written tests, demonstrations, and observations to verify competency.",
      },
      {
        question: "What documentation needed?",
        options: ["Basic notes", "Complete records", "Attendance", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Document training content, methods, verification, and attendee information.",
      },
      {
        question: "When refresh training?",
        options: ["Never", "Per requirements", "Annually all", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Provide refresher training when observations indicate it's needed.",
      },
      {
        question: "How determine needs?",
        options: ["Guess", "Assessment", "Ask workers", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Analyze job hazards and performance data to identify training needs.",
      },
      {
        question: "What materials required?",
        options: [
          "Handouts only",
          "Topic appropriate",
          "Videos only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Develop specific materials for confined space entry training.",
      },
      {
        question: "How evaluate effectiveness?",
        options: ["No evaluation", "Multiple methods", "Test only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use testing, observation, and performance data to evaluate training.",
      },
      {
        question: "What instructor qualifications needed?",
        options: ["Anyone", "Qualified person", "Supervisor", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Use certified instructors for powered industrial truck training.",
      },
      {
        question: "How handle language barriers?",
        options: [
          "English only",
          "Accommodate needs",
          "Basic terms",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Provide training materials in languages workers understand.",
      },
      {
        question: "What follow-up required?",
        options: ["None", "Scheduled checks", "Ask later", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct follow-up observations to verify training application.",
      },
    ],
  },
  50: {
    title: "Safety Innovation and Technology",
    questions: [
      {
        question: "How evaluate new technology?",
        options: [
          "Cost only",
          "Systematic process",
          "Quick review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Evaluate new fall protection systems using defined criteria.",
      },
      {
        question: "What implementation steps needed?",
        options: [
          "Install only",
          "Complete process",
          "Basic steps",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Plan, test, train, and monitor implementation of new safety software.",
      },
      {
        question: "How measure effectiveness?",
        options: [
          "Assume working",
          "Multiple metrics",
          "Cost saving",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Track multiple indicators to verify effectiveness of new monitoring system.",
      },
      {
        question: "What training required?",
        options: ["None needed", "Comprehensive", "Basic intro", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Provide detailed training on new gas detection equipment.",
      },
      {
        question: "How manage change?",
        options: [
          "Just change",
          "Planned process",
          "Announce only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use change management process for new safety equipment implementation.",
      },
      {
        question: "What testing needed?",
        options: ["None", "Thorough testing", "Basic check", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Conduct extensive testing of new emergency notification system.",
      },
      {
        question: "How document system?",
        options: ["Basic notes", "Complete records", "Manual only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Maintain detailed documentation of safety technology systems.",
      },
      {
        question: "What maintenance required?",
        options: ["When failed", "Scheduled program", "Basic care", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Follow manufacturer's maintenance schedule for safety equipment.",
      },
      {
        question: "How integrate systems?",
        options: [
          "Separate use",
          "Planned integration",
          "Basic link",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Integrate new monitoring system with existing safety programs.",
      },
      {
        question: "What backup needed?",
        options: ["None", "Redundant systems", "Basic backup", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Implement backup power and data systems for critical safety equipment.",
      },
    ],
  },
  51: {
    title: "Annual Review and Program Evaluation",
    questions: [
      {
        question: "What elements review?",
        options: [
          "Basics only",
          "All components",
          "Selected parts",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Review all safety program elements including training, procedures, and results.",
      },
      {
        question: "How analyze data?",
        options: [
          "Basic look",
          "Thorough analysis",
          "Numbers only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Analyze trends in all safety metrics and leading indicators.",
      },
      {
        question: "What participation needed?",
        options: ["Safety only", "All levels", "Management", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Include workers, supervisors, and management in program review.",
      },
      {
        question: "How identify gaps?",
        options: [
          "Wait reports",
          "Active assessment",
          "Basic review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use audits, observations, and data analysis to identify program gaps.",
      },
      {
        question: "What documentation needed?",
        options: [
          "Basic notes",
          "Complete records",
          "Summary only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Document review findings, recommendations, and action plans.",
      },
      {
        question: "How set new goals?",
        options: [
          "Same as last",
          "Based on review",
          "Management only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Set new safety goals based on review findings and performance data.",
      },
      {
        question: "What follow-up required?",
        options: ["None needed", "Track progress", "Annual only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Monitor progress on action items from program review.",
      },
      {
        question: "How communicate results?",
        options: ["File only", "All stakeholders", "Management", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Share review results and plans with all employees.",
      },
      {
        question: "What benchmarking needed?",
        options: ["None", "Industry compare", "Internal only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Compare safety performance against industry leaders.",
      },
      {
        question: "How update program?",
        options: ["No changes", "Based on review", "Minor edits", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Revise program elements based on evaluation findings.",
      },
    ],
  },
  52: {
    title: "Future Planning and Goal Setting",
    questions: [
      {
        question: "How set objectives?",
        options: ["Copy others", "SMART process", "Basic goals", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Set specific, measurable safety goals with deadlines.",
      },
      {
        question: "What resources plan?",
        options: ["Basic needs", "Comprehensive", "Budget only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Plan personnel, equipment, and budget needs for safety initiatives.",
      },
      {
        question: "How involve stakeholders?",
        options: ["Tell them", "Active input", "Management only", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Include all levels in safety planning process.",
      },
      {
        question: "What timeline needed?",
        options: [
          "Rough estimate",
          "Detailed schedule",
          "Basic dates",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Develop detailed timeline for safety improvement projects.",
      },
      {
        question: "How measure success?",
        options: [
          "Completion only",
          "Multiple metrics",
          "Basic review",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Define specific metrics to measure goal achievement.",
      },
      {
        question: "What documentation required?",
        options: ["Basic notes", "Complete plan", "Goals only", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Document detailed plans, resources, and metrics.",
      },
      {
        question: "How communicate plans?",
        options: [
          "Post only",
          "Multiple methods",
          "Tell supervisors",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Use meetings, postings, and updates to communicate plans.",
      },
      {
        question: "What review frequency needed?",
        options: ["Annually", "Regular schedule", "End only", "Optional"],
        correctAnswer: 1,
        explanation: "Example: Review progress toward goals monthly with team.",
      },
      {
        question: "How adjust plans?",
        options: ["No changes", "As needed", "End of year", "Optional"],
        correctAnswer: 1,
        explanation:
          "Example: Modify plans based on progress and changing conditions.",
      },
      {
        question: "What recognition plan?",
        options: [
          "None needed",
          "Achievement based",
          "Year end only",
          "Optional",
        ],
        correctAnswer: 1,
        explanation:
          "Example: Recognize progress and achievement of safety goals.",
      },
    ],
  },
};

// Combine all week groups into one WeeklyTests object
export const weeklyTests = {
  ...weeklyTests1,
  ...weeklyTests2to5,
  ...weeklyTests6to7,
  ...weeklyTests8to9,
  ...weeklyTests10to11,
  ...weeklyTests12to15,
  ...weeklyTests16to20,
  ...weeklyTests21to25,
  ...weeklyTests26to30,
  ...weeklyTests31to33,
  ...weeklyTests34to37,
  ...weeklyTests38to42,
  ...weeklyTests43to47,
  ...weeklyTests48to52,
};

const WeeklyTests = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const calculateScore = (week) => {
    if (!userAnswers[week]) return 0;
    const correct = weeklyTests[week].questions.filter(
      (q, idx) => userAnswers[week][idx] === q.correctAnswer
    ).length;
    return (correct / weeklyTests[week].questions.length) * 100;
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [selectedWeek]: {
        ...prev[selectedWeek],
        [questionIndex]: answerIndex,
      },
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setUserAnswers((prev) => ({
      ...prev,
      [selectedWeek]: {},
    }));
    setShowResults(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Week Selection */}
      <div className="mb-6">
        <select
          value={selectedWeek}
          onChange={(e) => {
            setSelectedWeek(Number(e.target.value));
            setShowResults(false);
          }}
          className="block w-full p-2 border rounded"
        >
          {Object.entries(weeklyTests).map(([week, content]) => (
            <option key={week} value={week}>
              Week {week}: {content.title}
            </option>
          ))}
        </select>
      </div>

      {/* Test Content */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">
            Week {selectedWeek}: {weeklyTests[selectedWeek].title}
          </h2>
        </CardHeader>
        <CardContent>
          {weeklyTests[selectedWeek].questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-8">
              <h3 className="font-medium mb-4">{question.question}</h3>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <Button
                    key={oIndex}
                    variant={
                      userAnswers[selectedWeek]?.[qIndex] === oIndex
                        ? "default"
                        : "outline"
                    }
                    className="w-full justify-start text-left p-4"
                    onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    disabled={showResults}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {showResults && (
                <div className="mt-2 p-4 bg-gray-50 rounded">
                  <p
                    className={
                      userAnswers[selectedWeek]?.[qIndex] ===
                      question.correctAnswer
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Submit/Reset Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            {!showResults ? (
              <Button onClick={handleSubmit}>Submit Test</Button>
            ) : (
              <Button onClick={handleReset}>Reset Test</Button>
            )}
          </div>

          {/* Results Display */}
          {showResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Test Results</h3>
              <Progress value={calculateScore(selectedWeek)} className="mb-2" />
              <p>Score: {calculateScore(selectedWeek).toFixed(1)}%</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyTests;
