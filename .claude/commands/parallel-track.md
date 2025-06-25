---
name: parallel-track
description: Create temp .md file for task tracking and spawn parallel subagents
usage: "/parallel-track \"task description\""
category: workflow
---

# Parallel Task Tracking Command

Create a temporary markdown file for comprehensive task tracking and spawn multiple subagents to work safely in parallel.

## Initialize Task Tracking

First, let me create a descriptive tracking file and parse your task:

```bash
TASK_DESC="$ARGUMENTS"
TASK_SLUG=$(echo "$TASK_DESC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g' | cut -c1-50)
TIMESTAMP=$(date +"%m%d-%H%M")
TASK_FILE="task-${TASK_SLUG}-${TIMESTAMP}.md"
```

## Create Task Tracking File

@$TASK_FILE
```markdown
# Task Tracking: $TASK_DESC
**Started:** $(date)
**Status:** INITIALIZING

## Task Breakdown
*Task breakdown will be dynamically generated based on the specific requirements*

## Subagent Assignments
*Subagents will be spawned dynamically based on task complexity and requirements*

## Issues & Notes
*Issues encountered will be documented here*

## Progress Log
$(date): Task initialized with parallel tracking system
```

## Analyze Task and Spawn Parallel Subagents

Now I'll analyze your task and dynamically spawn the appropriate number of specialized subagents:

**Task Analysis for:** $TASK_DESC

I will:
1. Break down the task into logical components
2. Determine the optimal number and type of subagents needed
3. Spawn them concurrently to work in parallel using `Task` tool
4. Coordinate their work through the tracking file

Each subagent will be given a specific focus area based on the task requirements and will update the tracking file with their progress, findings, and any issues encountered.

## Coordination Protocol

Each subagent will:
1. Check the task tracking file before starting work
2. Update progress and mark completed tasks
3. Document any issues or blockers encountered
4. Coordinate with other agents through the tracking file
5. Report back with consolidated results

## Task Completion

The task tracking file serves as the central coordination point and will contain:
- Real-time progress updates
- Issue documentation
- Resolution notes
- Final completion status

All work will be tracked and documented in the temporary markdown file for full transparency and coordination.