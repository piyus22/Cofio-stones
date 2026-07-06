# CLAUDE.md

## Workflow Orchestration

1. **Plan Mode Default**: Enter plan mode for any non-trivial task (3+ steps or architectural decisions). Stop and re-plan if issues arise. Use for verification steps, not just building. Write detailed specs upfront.

2. **Subagent Strategy**: Deploy subagents liberally to maintain clean context. Offload research and parallel analysis. Address complex problems with increased computational resources. "One task per subagent" for focused execution.

3. **Self-Improvement Loop**: After user corrections, update `tasks/lessons.md` with patterns. Create rules preventing repeated mistakes. Iterate until error rates drop. Review lessons at session start.

4. **Verification Before Done**: Never complete tasks without proof of functionality. Diff behavior between versions when relevant. Ask if "a staff engineer" would approve. Run tests and demonstrate correctness.

5. **Demand Elegance (Balanced)**: For non-trivial changes, pause and consider "a more elegant way." Address hacky fixes by implementing optimal solutions with current knowledge. Skip this for simple fixes. Challenge your work first.

6. **Autonomous Bug Fixing**: Fix bug reports independently without hand-holding. Point to logs and errors, then resolve. Require zero context-switching from users. Fix failing CI tests proactively.

## Task Management

- Plan first with checkable items in `tasks/todo.md`
- Verify plans before implementation
- Track progress continuously
- Explain changes at each step
- Document results in `tasks/todo.md`
- Update `tasks/lessons.md` after corrections

## Core Principles

- "Simplicity First": Minimize code changes and impact
- "No Laziness": Find root causes, no temporary fixes, maintain senior developer standards
- "Minimal Impact": Touch only necessary code
