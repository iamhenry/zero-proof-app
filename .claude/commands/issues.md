---
name: list issues
description: List open GitHub issues for the current repository
usage: "/list-issues"
category: github
---

# List Issues

Displays open GitHub issues for the current repository in a clean, readable format.

## Usage
/list-issues

## Examples
- `/list-issues` - Show all open issues in simple format

You are tasked with listing open GitHub issues for the current repository. Use the GitHub CLI (`gh`) to fetch and display issues in a clean, simple format.

**Steps:**
1. Check if we're in a git repository
2. Use `gh issue list --json number,title,createdAt --limit 30` to fetch open issues
3. Format the output to show:
   - Issue number
   - Creation date (YYYY-MM-DD format)
   - Issue title

**Error Handling:**
- Check if `gh` CLI is available
- Verify we're in a git repository
- Handle cases where no issues are found
- Provide helpful error messages for authentication issues

Use concise, scannable output with format: `#Number | Date | Title`