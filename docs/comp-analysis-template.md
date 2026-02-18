# Project Blind Spot Analysis

Prompt for Claude Cowork (mount the full repo). Have Claude Code fill in the bracketed sections before sending.

---

```
I'm working on a project and I want you to act as a rigorous strategic advisor. Your job is to tell me what I HAVEN'T considered — not to validate what I've already done. Be thorough. Take your time. I'd rather you spend 5 minutes thinking than give me a fast, shallow answer.

You have the full codebase mounted. Explore the repo structure, README, and any docs/ directory for product context, domain model, architecture, and implementation status before responding.

## The Project

**Name:** [Project name]
**What it does:** [2-3 sentence description]
**Target users:** [Who is this for?]
**Current stage:** [Idea / Prototype / MVP / Launched]
**Team:** [Who's building it? How many people? Full-time or side project?]
**Revenue model (if any):** [How does it or will it make money?]
**Tech stack:** [Languages, frameworks, databases, hosting]

## What's Already Done

[Bullet list of what exists — features built, research completed, partnerships explored, etc.]

## What's NOT Done Yet

[Bullet list of known gaps, planned features, and blockers]

## What I Want From You

Analyze this project across ALL of these dimensions and tell me what's missing, what's risky, and what I haven't thought about:

1. **Legal / regulatory** — IP, copyright, licensing, compliance, liability, entity structure
2. **Market / competitive** — Who else does this? What stops them from copying us? What's our actual moat?
3. **Technical** — Architecture risks, scaling bottlenecks, vendor lock-in, technical debt
4. **Financial** — Hidden costs, unit economics, break-even assumptions, what happens if it works and we need to hire
5. **Go-to-market** — Are we selling to the right people? Is our positioning actually differentiated? What channels are we ignoring?
6. **User research** — Have we validated the core assumption? What would disprove our thesis?
7. **Operational** — What breaks at current team size? What's the first hire? What's the bus factor?
8. **Domain-specific risks** — Anything unique to our industry/audience/vertical that we might be blind to

For each issue you identify:
- Rate severity: Critical / High / Medium / Low
- Estimate effort to address: Low / Medium / High
- Suggest when to address it: Now / Before launch / Post-launch / Ongoing

Be direct. Don't soften bad news. If something could kill the project, say so.
```
