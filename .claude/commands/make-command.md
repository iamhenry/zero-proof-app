---
name: make-command
description: Generate new prompt-based slash commands
usage: "/make-command \"command-name\" \"description\" \"prompt content\""
category: development
---

# Make Slash Command Generator

Create new prompt-based slash commands quickly.

## Usage

```
/make-command "command-name" "Short description" "Your prompt content here"
```

**Arguments:**
- `command-name`: Max 3 words, lowercase, hyphens (e.g., "fix-bug", "review-code")
- `description`: Brief description for the command
- `prompt content`: The Claude instruction/prompt

## Generate Command

I'll create a new slash command file at `.claude/commands/{command-name}.md`:

**Parsing arguments:**
```
ARGS=($ARGUMENTS)
CMD_NAME="${ARGS[0]//\"/}"
DESCRIPTION="${ARGS[1]//\"/}"
PROMPT="${ARGS[2]//\"/}"
```

**Validation:**
- Command name: lowercase, max 3 words, hyphens only
- No special characters except hyphens
- Must not conflict with existing commands

**Template:**
```markdown
---
name: {command-name}
description: {description}
usage: "/{command-name} [arguments]"
category: custom
---

# {Title Case Command Name}

{description}

## Usage
/{command-name} $ARGUMENTS

{prompt content}

Use $ARGUMENTS in your prompt to handle command arguments.
```

The new command will be immediately available as `/{command-name}`.