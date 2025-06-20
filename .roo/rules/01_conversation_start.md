---
description: Defines conversation workflow, context bank usage, and task analysis process
alwaysApply: true
---

# IMPORTANT: For every new conversation (not every query):
==========================
  1. Before responding, explicitly state "YESSIR" and infer the user query, then follow the instructions: 
  2. Immediately read and analyze files in {Context Bank}
  3. List out the files that are required to complete this task (GREPPING THE CODEBASE IS FREE DO IT OFTEN)
  4. Incorporate insights from {Context Bank} into {ooda_framework}
  5. {Context Bank} analysis must occur before any other tool use
  6. If {Context Bank} cannot be read, notify user immediately
  7. Use {Context Bank} context to inform all subsequent decisions
  8. Verify you have complete context
  9. Finally proceed with the {ooda_framework}

# Context Bank Directory
==========================
- Context Bank =  `_ai/context-bank/FILEMAP.md`

# Tool
==========================
<ooda_framework>

# OODA Reasoning Tool (Software)

Important Note: This reasoning tool is used strictly for planning and decision-making before code implementation.  
Do not write or suggest any code in any section. The output should focus only on conceptual planning, strategy, and reasoning.

## Step 1: Clarifications
<clarifications>
You must first examine the task and identify any ambiguities in its requirements, constraints, or context.

- If ambiguities exist, list 1–3 precise, targeted questions to resolve them.  
- If the task is clear, state: “No clarifications needed.”

Important:  
Do not proceed to the next step until these clarifications are answered by the user.  
Wait for the user response.  
</clarifications>

## Step 2: Step-by-Step Thinking  
<thinking>
Once clarifications have been resolved, present this entire section in a Markdown code block using the following structure:

```markdown
1. Observe  
Summarize the task clearly, incorporating clarifications. Note key objectives, context, constraints, and success criteria.

2. Orient  
Classify the task’s complexity (simple, moderate, complex). Propose 2–4 possible approaches. For each, outline:  
- Basic idea  
- Pros and cons  
- Trade-offs (e.g., time, accuracy, flexibility)

3. Decide  
Choose the optimal approach based on your analysis. Justify the choice and list high-level steps for implementation.

4. Act  
Translate the chosen solution into actionable steps.  
Then perform recursive reflection:  
- Identify weaknesses, edge cases, or alternatives.  
- Refine the solution.  
- Repeat this reflection cycle until no further improvements are apparent.  
- Explain why you stopped refining.
```
</thinking>

## Step 3: Final Output
<answer>
Present the final refined output (e.g., plan, or decision), reflecting all improvements made during the Act phase.  
</answer>

## Step 4: Task Input
<task>  
[Insert the user’s specific task or problem here. Ensure it is self-contained and includes enough context for clarification.]  
</task>
</ooda_framework>