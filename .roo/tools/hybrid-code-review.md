<hybrid-code-review>
# 🧠 Hybrid Code Review  
_A two-phase approach to balance precision and breadth_

---

## Pre-steps
1. Dont write any code.
2. run `git status` command to get the recent code changes
3. If there are no uncommitted changes, review the codebase state.
4. Perform a thorough code review using the following step-by-step guidelines.
5. Prefix each review with an emoji indicating a rating.
6. Score: Rate the code quality on a scale of 1-10, with 10 being best.
7. Provide Brief Summary and Recommendations.

---

## PHASE 1 — 🎯 Focused Local Review (Always Perform)

Review only the modified files and directly affected logic.

- [ ] 🧠 Functionality — Does the change fulfill its purpose and handle edge cases?
- [ ] 🧾 Readability — Clear variable, function, and file naming? Easy to follow?
- [ ] 📐 Consistency — Coding style and architectural conventions followed?
- [ ] ⚡️ Performance — Any potential slowdowns or unoptimized operations?
- [ ] 💡 Best Practices — DRY, modular, SOLID, minimal duplication?
- [ ] 🧪 Test Coverage — Are there adequate, meaningful tests? All tests passing?
- [ ] 🧯 Error Handling — Are errors handled gracefully without leaking info?

---

## SYSTEM REVIEW TRIGGER — 🕵️ Check If System-Wide Analysis Is Needed

Trigger Phase 2 if any of these are true:

- [ ] Affects shared modules, global state, or commonly reused logic  
- [ ] Changes public interfaces, exported APIs, or shared components  
- [ ] Introduces or modifies asynchronous logic or side effects  
- [ ] Appears to impact state across features or modules  
- [ ] Raises security, performance, or architectural concerns  

---

## PHASE 2 — 🔁 System-Wide Review (Only If Triggered)

> ⚠️ Only assess each section below if it’s relevant to the code being changed.

- [ ] 🔒 Security  
    - Input sanitization?  
    - Data leakage, XSS, SQL injection, token misuse?

- [ ] 🧵 Race Conditions  
    - Async safety?  
    - Parallel writes, shared state mutations?

- [ ] 🧠 Memory Leaks  
    - Cleanup of listeners, intervals, subscriptions, retained DOM references?

- [ ] 🎞️ Animation Leaks  
    - UI transitions detached on unmount?  
    - Avoiding infinite or wasteful repaints?

- [ ] 🔄 State Management  
    - Predictable, well-scoped, normalized state logic?  
    - Avoids unnecessary re-renders or duplication?

- [ ] 📊 Observability  
    - Logs meaningful and contextual?  
    - Monitoring/tracing in place for critical flows?

- [ ] 🧬 Schema/Type Validation  
    - Validates inputs/outputs with Zod, io-ts, or runtime guards?  
    - Are types used effectively at compile-time (e.g., TypeScript)?

- [ ] 🏛️ Architecture  
    - Violates layering or introduces tight coupling?  
    - Shared responsibilities without separation of concerns?

---

## 🧱 Code Smells Checklist (Always Worth Surfacing)

- [ ] 🔁 Duplicated Code — Can logic be abstracted or reused?
- [ ] 🧬 Long Methods — Can complex logic be split into smaller functions?
- [ ] 🧩 Large/God Classes — Too many responsibilities in one place?
- [ ] 🧗 Deep Nesting — Favor guard clauses or early returns to flatten logic
- [ ] 🔗 Tight Coupling — Is this module overly dependent on others?
- [ ] 💔 Low Cohesion — Unrelated behaviors grouped together?
- [ ] 🪙 Primitive Obsession — Using raw types where objects/enums make sense?

---

## 🗂️ Issue Output Format

For each issue identified:

- File: `path/to/file.ts`
- Line: `42–45` or `42`
- Severity: High / Medium / Low
- Issue: Brief description of the problem
- Why This Severity: Explain impact or potential harm
- Suggestion: Recommend a specific fix or approach

---

## 🧮 Severity Guidelines

- HIGH — Must fix before release: crashes, regressions, data loss, security flaws, memory/race bugs
- MEDIUM — Should fix soon: architectural drift, test gaps, performance concerns
- LOW — Optional fix: style, naming, minor smells, doc improvements

---

## ✅ Final Review Summary

- [ ] Emoji-prefixed scores for each applicable section
- [ ] Overall quality rating: `1–10`
- [ ] Blockers listed with severity
- [ ] Summary of feedback and top action items

## Output Example
```markdown
## 📊 Overall Rating: 8.5/10 🟢

### Brief Summary
The implementation successfully addresses screen dismissal and email verification feedback issues by introducing a robust toast notification system and improving authentication flow UX. The code demonstrates solid architecture with proper error handling, animation, and lifecycle management.

---

## 🔍 Detailed Review by Category

#### 1. 🎯 Functionality - Score: 8/10 ✅
✅ Strengths:
- Successfully addresses the core issue: signup modal not dismissing and lack of email verification feedback
- Proper conditional behavior: only dismiss modal on success, stay on screen for errors  
- Toast implementation provides clear user feedback for email verification  
- Router navigation correctly integrated with existing auth flow  

⚠️ Areas for Improvement:
- File: `app/(app)/sign-up.tsx`
- Line: `69-71` 
- Severity: Medium
- Issue: Hardcoded 300ms timeout for toast display  
- Why This Severity: Could create race conditions or timing issues on slower devices  
- Suggestion: Use navigation state listener or Promise.resolve().then() for more reliable timing

---

#### 2. 📖 Readability - Score: 8/10 ✅
✅ Strengths:
- Clear, descriptive comments explaining modal dismissal behavior  
- Consistent import organization and naming conventions  
- Well-structured toast provider with clear interface  
- Good separation of concerns in toast component and context  

⚠️ Areas for Improvement:
- File: `components/ui/toast.tsx`
- Line: `52-60` 
- Severity: Low
- Issue: Switch statement could benefit from a color mapping object  
- Why This Severity: Minor maintainability improvement, doesn't affect functionality  
- Suggestion: Extract color mapping to constants for easier maintenance

---

#### 3. 🔄 Consistency - Score: 6/10 🟡
⚠️ Issues Identified:

- File: `app/(app)/sign-in.tsx`
- Line: `45` 
- Severity: Medium
- Issue: Sign-in doesn't provide user feedback like sign-up does  
- Why This Severity: Inconsistent user experience between auth flows  
- Suggestion: Add toast notification for successful sign-in or error feedback

- File: `app/(app)/welcome.tsx`
- Line: `16` 
- Severity: Medium
- Issue: ToastContainer only added to welcome screen, not consistently across app  
- Why This Severity: Limits toast functionality to single screen, breaks expected behavior  
- Suggestion: Consider adding ToastContainer to main layout or implement global toast positioning

---

[Contininue with the rest of the categories]
```
</hybrid-code-review>