/* ============================================================
   RED FLAG CHECKLIST — the 10 sections run against a new client's
   intake form responses during Day 1-2 of onboarding, per the Hub's
   System Flows doc ("Run Red Flag Checklist against all 10 sections").
   Each item is a judgment call, not a hard pass/fail - checking a box
   means "this is a concern worth discussing with leadership before we
   proceed," not an automatic disqualifier.
   ============================================================ */

const RED_FLAG_ITEMS = [
  {
    key: "budget-reality",
    label: "Budget Reality",
    hint: "Does their stated budget realistically match the scope they're asking for?"
  },
  {
    key: "decision-making",
    label: "Decision-Making Clarity",
    hint: "Is there one clear decision-maker, or does this look like a committee with no final say?"
  },
  {
    key: "timeline-expectations",
    label: "Timeline Expectations",
    hint: "Are their deadline expectations realistic given the scope and our current capacity?"
  },
  {
    key: "asset-readiness",
    label: "Content & Asset Readiness",
    hint: "Do they have (or can they realistically get) the raw materials we need - logos, footage, brand assets, product info?"
  },
  {
    key: "communication",
    label: "Communication Responsiveness",
    hint: "Were they prompt and clear during the sales process, or did we have to chase them repeatedly?"
  },
  {
    key: "scope-creep-history",
    label: "Scope Creep Signals",
    hint: "Any \"and also could you...\" pattern already showing up in the intake responses or sales conversation?"
  },
  {
    key: "financial-stability",
    label: "Payment / Financial Stability",
    hint: "Anything about the industry, company age, or size that raises concern about ability to pay reliably?"
  },
  {
    key: "reputation",
    label: "Reputation / Public Record",
    hint: "Any concerning news, reviews, or legal history worth a quick search before proceeding?"
  },
  {
    key: "team-fit",
    label: "Team Bandwidth & Expertise Fit",
    hint: "Do we have the right people available with the right expertise for what this client specifically needs?"
  },
  {
    key: "contract-terms",
    label: "Contract / Legal Concerns",
    hint: "Any unusual requests, conflicting exclusivity asks, or non-standard terms in what they're asking for?"
  }
];
