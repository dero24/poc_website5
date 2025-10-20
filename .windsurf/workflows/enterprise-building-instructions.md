---
description: Agentic Flow to building enterprise apps
auto_execution_mode: 3
---

## Workflow Contracts
1. **Architecture Phase**
   - Load `windsurf_workflow/agents/architecture/architecture-agent.md`.
   - Produce design documents and system diagrams using the formats in `windsurf_workflow/docs/output_formats/architecture-output.md`.
2. **Planning Phase**
   - Load `windsurf_workflow/agents/planning/planning-agent.md`.
   - Structure the roadmap and milestones referencing `windsurf_workflow/docs/output_formats/planning-output.md`.
3. **Task Breakdown Phase**
   - Load `windsurf_workflow/agents/task_breakdown/task-breakdown-agent.md`.
   - Output JSON-structured tasks per `windsurf_workflow/docs/output_formats/task-breakdown-output.md`.
   - If blocked, escalate to `windsurf_workflow/agents/fallback/task-breakdown-fallback.md`.
4. **Context Management Phase**
   - Load `windsurf_workflow/agents/context_manager/context-manager-agent.md`.
   - Ensure required files/specs are staged before coding.
5. **Code Generation Phase**
   - Load `windsurf_workflow/agents/code_generation/code-generation-agent.md`.
   - Follow coding standards and reference artifacts produced in earlier phases.
6. **Validation Phase**
   - Load `windsurf_workflow/agents/validation/task-validation-agent.md`.
   - Verify acceptance criteria, run relevant tests, and record issues.
   - Optionally run `windsurf_workflow/templates/task-verification-workflow.md` or `iteration-verification-workflow.md`.
7. **Runtime Preparation Phase**
   - Load `windsurf_workflow/agents/runtime_preparation/runtime-preparation-agent.md`.
   - Generate automation scripts, deployment steps, and operational docs.