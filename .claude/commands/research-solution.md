---
name: research-solution
description: Enhanced ProposeSolution framework with parallel consensus-based research to reduce bias
usage: "/research-solution [problem description or 'continue' to resume current stage]"
category: planning
---

# Research Solution with Parallel Consensus Analysis

Enhanced ProposeSolution framework that deploys multiple independent research agents to reduce bias and increase confidence through convergent analysis.

## Usage
/research-solution $ARGUMENTS

---

<ResearchSolution>

# 🎯 PRIMARY OBJECTIVE
Deploy multiple independent research agents to analyze the same problem using your established ProposeSolution framework, then synthesize findings through consensus analysis to reduce bias and increase solution confidence.

## STEP-BY-STEP EXECUTION PROCESS

### STEP 1: COMPLEXITY ASSESSMENT
Action: Analyze the problem statement to determine complexity level
Method: Look for these indicators:
- LOW COMPLEXITY (2-3 agents): Single component changes, clear requirements, minimal integration
- MEDIUM COMPLEXITY (3-4 agents): Multiple touchpoints, integration needs, performance considerations  
- HIGH COMPLEXITY (4-6 agents): Architectural changes, security implications, cross-platform needs

### STEP 2: AGENT DEPLOYMENT
Action: Deploy the determined number of research agents
Requirements: Each agent receives IDENTICAL:
- Problem statement
- Context files and system architecture
- Success criteria and constraints
- Reference to `/_ai/tools/planning/propose_solution.md`

### STEP 3: INDEPENDENT RESEARCH EXECUTION
Action: Launch all agents simultaneously with this exact prompt:
```
You are Research Agent #[N] conducting independent analysis.

MANDATORY SETUP:
1. Read /_ai/tools/planning/propose_solution.md and follow it exactly
2. Apply ALL methodology details from the ProposeSolution framework
3. Use the complete rubric and stage requirements as defined in the original file

PROBLEM STATEMENT: [IDENTICAL FOR ALL AGENTS]
CONTEXT FILES: [IDENTICAL FOR ALL AGENTS]
SUCCESS CRITERIA: [IDENTICAL FOR ALL AGENTS]

Your analysis must be completely independent. Do not reference other agents' work.
Reference /_ai/tools/planning/propose_solution.md for all methodology details.
```

### STEP 4: COLLECT INDIVIDUAL RESULTS
Action: Gather complete analyses from each agent
Requirements: Each agent must provide:
- Complete Discover → Define → Develop → Deliver progression
- Full 6-metric scoring per original framework
- All deliverables specified in ProposeSolution framework

### STEP 5: CONSENSUS SYNTHESIS
Action: Analyze convergence and divergence across all agent results
Process:
1. Solution Clustering: Group similar solutions across agents
2. Confidence Scoring: Calculate agent consensus percentages
3. Divergence Analysis: Identify where agents disagreed and why
4. Bias Detection: Note potential blind spots in unanimous recommendations

### STEP 6: PRESENT FINDINGS
Action: Deliver structured consensus report
Format:
- HIGH CONFIDENCE (80-100% agreement): Convergent solutions with strong consensus
- MEDIUM CONFIDENCE (60-79% agreement): Majority consensus with variations noted
- LOW CONFIDENCE (<60% agreement): Significant divergence requiring further analysis

## DETAILED EXECUTION REFERENCE

### Consensus Analysis Process
When Step 5 is reached, use this detailed process:

1. Solution Clustering: Group similar recommendations across agents
2. Confidence Scoring: Calculate agreement percentages for each solution
3. Divergence Analysis: Document where agents disagreed and why
4. Bias Detection: Identify potential blind spots in unanimous recommendations

### Output Template for Step 6
```
## CONVERGENT SOLUTIONS (HIGH CONFIDENCE)
- Solutions recommended by majority of agents
- Consistent reasoning patterns across agents
- Similar risk assessments and mitigation strategies

## DIVERGENT ANALYSIS (MEDIUM/LOW CONFIDENCE)
- Where agents disagreed and alternative approaches
- Conflicting assumptions or interpretations
- Different risk tolerance or implementation preferences

## BIAS INDICATORS
- Unanimous blind spots (what all agents might have missed)
- Assumption patterns across all agents
- Potential alternative perspectives not considered
```

## QUALITY ASSURANCE CHECKLIST

Before presenting final results, verify:

### Framework Compliance
- [ ] All agents read `/_ai/tools/planning/propose_solution.md`
- [ ] Identical methodology application per original framework
- [ ] Consistent rubric scoring per original criteria
- [ ] Complete stage deliverables per original framework requirements

### Consensus Validation
- [ ] Solution clustering completed
- [ ] Confidence levels calculated
- [ ] Divergence analysis documented
- [ ] Bias indicators identified

### Output Quality
- [ ] Clear convergent vs divergent solution presentation
- [ ] Confidence indicators throughout analysis
- [ ] Actionable recommendations with consensus backing
- [ ] Transparent methodology and agent count rationale

## CLOSING PROTOCOL
Always end with:
- Consensus Summary: Key convergent findings
- Confidence Assessment: Overall recommendation reliability  
- Next Steps: Based on consensus strength and user validation needs
- "Ready to proceed with [HIGH/MEDIUM/LOW] confidence consensus?"

## EXECUTION SUMMARY
1. Assess Complexity → Determine agent count (2-6)
2. Deploy Agents → Launch with identical context + ProposeSolution reference
3. Execute Research → Each agent follows complete framework independently
4. Collect Results → Gather all individual analyses
5. Synthesize Consensus → Analyze convergence, divergence, and bias
6. Present Findings → Deliver structured consensus report with confidence levels

</ResearchSolution>

Use $ARGUMENTS to handle the problem description or stage continuation command.