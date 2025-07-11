---
name: gemini
description: Send a prompt to Gemini 2.5 Pro CLI model
usage: "/gemini [your prompt]"
category: ai-tools
---

# Gemini CLI

Send a prompt directly to the Gemini 2.5 Pro model via the CLI.

## Usage
/gemini $ARGUMENTS

Use the Gemini CLI to send prompts to the Gemini 2.5 Pro model for analysis, code review, or any other AI assistance. The command will execute `gemini -m gemini-2.5-pro -p "$ARGUMENTS"` and return the response.

The command accepts any text as arguments and passes it directly to Gemini 2.5 Pro for processing.

Examples:
- `/gemini Explain how React hooks work`
- `/gemini Review this code for potential issues`
- `/gemini What are the best practices for TypeScript?`