# GarageIQ Autonomous SEO Operating Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans for implementation. The user approved the original SEO plan and requested complete operational autonomy on 5 October 2026. Routine work within the authority below does not require another approval.

**Goal:** Execute the [approved 90-day SEO plan](2026-10-05-landing-seo.md) through 3 January 2027 without daily user instructions: research, improve, validate, publish, measure, recover, and report.

**Architecture:** One native macOS LaunchAgent wakes a small Python coordinator. The coordinator uses the existing authenticated Codex CLI for bounded worker/reviewer runs, persists state outside the public repository, and publishes validated changes through the existing GitHub/Vercel integration. No new agent framework, paid SEO API, or always-on service is needed.

**Tech Stack:** macOS launchd, Python standard library, existing Codex/GitHub/Node CLIs, installed agent-reach/GEO skills, selected marketingskills, existing static Vercel site.

**Spec:** This document defines the autonomy layer. The original plan remains the source for SEO tasks, content requirements, deadlines, and outcome targets. This document supersedes its manual-export and routine human-publication-review steps; it does not expand the landing-site scope.

**Current activation status: NOT ACTIVATED.** This change creates the operating plan, not a background process. Activation is proven only by registration plus a real unattended run. No scheduler, runner, deployment, or search account was changed while preparing this document.

## Authority and limits

The user has delegated routine planning and execution. The agent may research, install the selected project skills, write factual landing content, improve metadata/schema, fix landing JavaScript, add the smallest necessary check, open task PRs, automatically merge validated changes, verify Vercel deployments, and revert its own failed releases. It can use already-authorized accounts for sitemap submission and read-only measurement. These actions proceed without repeated confirmation.

Automatic content review uses source evidence and an independent reviewer; it does not wait for the owner to approve every page. Unsupported claims are removed, qualified, or omitted rather than invented or repeatedly sent back for approval.

The following remain outside scope: application/API/worker changes; database writes or schema changes; purchases or paid subscriptions; registering accounts or accepting legal agreements; expanding account permissions; fabricated statistics/reviews/prices; legal/entity commitments; outreach messages, reviews, social posts, or directory submissions to third parties. Outreach drafts may be prepared without holding up the rest of the campaign.

Authentication challenges, missing access, and platform-enforced approvals are genuine exceptions to zero-touch operation. Record the exact missing capability once and continue independent tasks. Never bypass a tool rejection or claim access that has not been verified.

## Verified starting point

Read-only checks on 5 October 2026 established:

- Landing checkout: `/Users/taaqibmasood/Developer/Garage v1/garageIQ-landing-page`; authoritative remote `taaqib-masood/garageIQ-landing-page`, branch `main`, SHA `27263912252d83333b42142830cd31f702346203`.
- GitHub authentication is available with push/admin permission. No Actions validation workflow or branch protection currently exists; a successful merge alone would therefore prove little.
- GitHub records successful Vercel Production and Preview deployments for that exact SHA. The existing Git integration can publish changes; Vercel CLI installation is unnecessary unless later evidence shows otherwise. [Repository](https://github.com/taaqib-masood/garageIQ-landing-page), [Vercel Git workflow](https://vercel.com/docs/git)
- Codex CLI is installed and reports ChatGPT authentication. Git, Node, npm and agent-reach are present. No model/provider changes or extra credits were purchased.
- Search Console/Bing access, DNS rights and actual first-party analytics receipt have **not** been verified.
- No general scheduled-task create/update/list tool is exposed in this session. The computer-use tool denied access to the ChatGPT desktop app. Sites' scheduler is for Sites projects and cannot schedule this repository's agent work.

Codex CLI supports non-interactive execution and reuses saved authentication. Desktop scheduled tasks exist but require the computer on and app running; the CLI/IDE do not provide their management interface. This plan uses launchd to invoke the CLI, rather than editing hidden app configuration or pretending a chat goal is a scheduler. [Official CLI documentation](https://learn.chatgpt.com/docs/non-interactive-mode), [official scheduled-task documentation](https://learn.chatgpt.com/docs/automations?surface=app)

## One scheduler, one coordinator

Use one LaunchAgent named `ae.garageiq.seo`. It ticks every 15 minutes, but the coordinator starts work only for a due slot scheduled at **19:30 Asia/Dubai**, once per slot's Dubai calendar date. Most ticks perform only a cheap local due-date/lock check and never call a model. At the next tick after sleep, select the latest eligible due slot, execute it once, and advance to the next future slot; do not replay every missed day. This catch-up can occur before 19:30 on the wake date. Keep the original campaign calendar anchored to 5 October 2026 and record missed milestones rather than claiming retroactive execution.

The coordinator calculates due dates with `zoneinfo.ZoneInfo("Asia/Dubai")`, independently of the Mac's current timezone. Persist each scheduled-slot ID and task's next due time; carry overdue Monday/Thursday/Sunday and milestone work into the latest eligible run instead of checking only today's weekday. Use an OS file lock for the whole execution, including publishing and deployment verification. A second invocation exits without changing state when the lock is held. Kernel locks release on process death; do not implement a permanent lock file whose mere existence blocks every future run. Track child process groups and start identity; terminate/reap the whole group on timeout. After a coordinator crash, reconcile any surviving confirmed worker before starting another writer. Unknown process ownership blocks mutation rather than justifying a broad kill command.

Use a separate machine-owned checkout/worktree for worker changes. Never clean, reset, stash, or overwrite the user's working tree or its untracked plans. Each task has one branch and worktree; resume or reconcile that task before starting another mutation.

Local autonomy requires the Mac powered on, a logged-in user session, internet, and working authentication. It cannot run while the machine is shut down. A future always-on host is a separate infrastructure choice; do not copy ChatGPT login tokens into a public CI workflow or silently switch to paid API billing.

## Cadence and workload

| Due work | Automatic action | Run ceiling |
| --- | --- | --- |
| Daily at/after 19:30 Dubai | Check campaign state, live HTTP/crawl endpoints, unfinished release and access failures. Repair a confirmed urgent regression before other work. | 10 minutes for routine checks |
| Monday | Advance the next technical/measurement task; research changes only when evidence affects a decision. | 60 minutes total |
| Thursday | Advance one sourced content brief/page or evidence-backed refresh. | 60 minutes total |
| Sunday | Capture weekly metrics, release annotations, blockers and next action; use complete comparable windows. | 20 minutes |
| Days 14, 30, 60, 90 | Perform the original plan's milestone review; day 14 records justified target recalibration. | Within that day's run |

Initial bootstrap work can run immediately once the runner is implemented and its prerequisites pass. Dependencies determine task order: usable checks and release recovery come before automatic publishing; measurement comes before claims about conversion gains; briefs come before articles. There is no requirement to generate fresh content every day.

At most one writer and one independent reviewer run for a selected release. Read-only research can use two parallel agents when it reduces work; do not spawn agents for unchanged routine checks. Keep model and reasoning defaults unless the owner later specifies otherwise. Use current plan allowances, honor quota exhaustion, and never buy credits. Time ceilings stop the current attempt at a recoverable checkpoint; wall time is not an exact billing cap.

## Durable state and evidence

Private runtime root: `~/.agent-reach/garageiq-seo/`. Keep raw GSC/Bing exports, waitlist metrics, logs and runtime state there, outside this public repository. Never print credentials or publish email/session-level records. Public progress summaries contain only approved non-sensitive project changes; business metrics remain private by default.

Persist `state.json` atomically with a same-directory temporary file and rename. Record campaign start/end/timezone, activation proof, last daily/weekly/milestone run, task IDs and dependencies, and each task's status: `pending`, `running`, `blocked`, `reviewed`, `publishing`, `verifying`, `done`, or `reverted`.

Each task record includes source evidence and date, base SHA, candidate SHA, local check result, independent reviewer verdict and exact reviewed SHA, PR number, merged SHA, deployment ID/environment/SHA, live verification, attempts, last error and next retry time. Maintain an append-only sanitized run journal. Never mark a phase done merely because a process exited zero or a model said “done.”

Use these transitions:

`pending → running → reviewed → publishing → verifying → done`

Failures move the affected task to `blocked` or `reverted` with evidence. Other independent tasks remain eligible. Restart recovery compares saved state against the actual remote branch, PR, merge and deployment before repeating a write. If a publish succeeded but the process died before saving state, recover the existing release instead of making another PR or push.

## Worker and publisher separation

The model worker edits only its isolated landing worktree. Run editing/review workers with `workspace-write`, no interactive approvals, network disabled, a structured output schema and an output file inside that worktree. The coordinator supplies public research and sanitized authorized metrics; online acquisition runs separately through agent-reach. Disable write-capable remote tools/MCP integrations in the worker profile and verify the actual available tools during bootstrap. Confirm the installed CLI accepts the selected options. Feed the task prompt on stdin; do not construct shell commands by interpolating scraped text.

`never` does not grant extra permissions. Workspace-write protects `.git`, `.agents` and `.codex`, so suppressing approvals alone cannot make autonomous commits or skill installation work. Nor does filesystem sandboxing alone prevent authenticated remote API writes. A small deterministic coordinator/publisher, outside the model's writable workspace, performs authorized writes after validation. Its installed source/hash must remain unchanged by workers. Bootstrap must prove the worker's network/tool boundary prevents a competing publishing path; otherwise this separation is only cooperative, automatic publishing stays disabled, and activation is incomplete. [Official permission model](https://learn.chatgpt.com/docs/agent-approvals-security)

The publisher accepts a task ID and validated candidate commit/worktree, never an arbitrary shell command from the model. Verify repository identity, base/candidate ancestry, path allowlist, staged content and reviewer SHA before any branch push. Normal content releases may change `public/**` and sanitized `docs/seo/**`; bootstrap has a separate exact-file allowlist for instructions, skills and checks. Protected product-context updates are drafted by workers into ignored task output, validated, and written by the coordinator through that exact-file path before a separately reviewed release. Workers cannot edit the controller or grant themselves broader authority.

Use standard library subprocess argument arrays, explicit executable paths/environment and timeouts. The current Codex path is inside the VS Code extension and can move on extension updates: bootstrap resolves and records the executable, and an unavailable executable becomes a recoverable runner error, not a silent successful run.

## Automatic release gate

1. Fetch current remote `main` and reconcile any unfinished task. Work from that base without disturbing the user's checkout.
2. Run JavaScript syntax checks and one dependency-free SEO check covering titles, descriptions, self-canonicals, valid JSON-LD, expected robots/sitemap URLs, local internal links/assets and permitted changed paths.
3. For funnel changes, also check new insert, duplicate 409, invalid email, API failure and denied storage with mocked responses. Verify no duplicate/new-signup confusion or PII in analytics. Do not create fake production leads.
4. After local checks, the coordinator stages only permitted files and creates a local candidate commit; the worker cannot perform this protected Git write. An independent reviewer inspects that exact commit's complete diff, sources, claim availability, accessibility and acceptance checks. Push nothing until the review confirms the candidate SHA; draft branches in this repository are public too. Any edit after review invalidates the verdict and requires a new commit and review.
5. Push the reviewed task branch and open a PR. Require the actual candidate SHA's successful Vercel Preview deployment and smoke-test that preview URL, including the relevant signup flow with intercepted/mock writes. A preview-comment check is not application validation.
6. If remote `main` advanced, update the candidate and repeat checks/review/preview. Otherwise merge the PR with a head-SHA match guard. Do not bypass new repository rules or required checks if someone adds them later.
7. Resolve the actual merged SHA and require its successful **Production** deployment. Poll at most every 30 seconds for up to 10 minutes; after timeout record `verifying` and let the next scheduled run reconcile it. Do not submit a second deployment because observation timed out.
8. Smoke-test `https://www.garageiq.ae/` and changed canonical URLs after deployment. Confirm the released HTML/assets belong to that release using deployed hashes or a revision marker; a random homepage 200 is not sufficient deployment proof. Only then mark the task done.

If a new production release breaks essential content, crawl endpoints or signup, revert the agent's release on the latest main and verify the revert's production deployment. Do not force-push, reset history, or revert unrelated user changes. If a clean revert conflicts, stop that release and report the exact conflict rather than guess.

## Research, content and measurement without daily input

Use installed agent-reach for acquisition and the six selected marketingskills plus existing GEO tools. Store a sanitized product context in `.agents/product-marketing.md`. Check tool version updates weekly, but adopt updates only after reviewing the changed instructions; do not reinstall the existing GEO environment blindly.

Research briefs identify intent, observed UAE results, evidence dates, competing page types, uncertainty and a specific user question. Content must add something beyond homepage paraphrasing. Follow the original methodology/Dubai-guide/comparison sequence. Keep prelaunch status truthful. No mass service × city expansion, keyword-density quotas or “best garage” lists without evidence.

Once authorized read-only measurement is connected, collect data programmatically; the campaign must not depend on the owner exporting CSVs every week. Search Console inputs are complete 28-day page/query/country/device windows. Bing inputs are its available equivalent. Funnel measurement distinguishes new driver leads from duplicates and owner leads. Keep raw identifiers private; unknown attribution and insufficient samples remain explicit.

If credentials are absent, generate a precise one-time access requirement for the relevant property and continue public technical/content work. Do not mark search/lead targets achieved, substitute a GEO heuristic for traffic, or infer successful analytics receipt from JavaScript alone.

Maintain the original working targets of 100 non-brand Google clicks and 10 new search-referred driver signups in the final complete 28-day window, subject to the documented day-14 baseline revision. Keep eight weekly reports, milestone evidence and release dates. GSC AI-feature clicks remain mixed into Web reporting; record manual AI citation probes separately.

## Recovery and reporting

- Retry a transient read at most twice with short bounded backoff. For a write timeout, inspect external state before any retry.
- Allow at most two fix/review attempts for the same defect per run. Then checkpoint the task and choose independent work; do not spend a night looping on one issue.
- Quota exhaustion or expired authentication causes no repeated model calls that day. Retry at the next eligible run after checking current status; never change billing/provider automatically.
- A missing analytics account blocks measurement tasks, not unrelated content checks. A missing publishing path blocks releases, not local drafting or research.
- Notify through the existing task/chat result or private local report: weekly summary plus concrete blockers/regressions. No unrequested emails, WhatsApp, Slack or social posts.
- A user request to pause stops new agent work; retain state and finish only safe reconciliation of a write already in flight. Resume from evidence, not from memory alone.

The final scheduled campaign slot is 19:30 Dubai on 3 January 2027. On the first available invocation at or after that cutoff, produce the final measured report once, reconcile unfinished releases, and disable new campaign work; if the Mac was offline, label the actual report date. No new content task starts after cutoff. Record separately whether execution checks passed and whether outcome targets were met. A deadline or exhausted quota never turns incomplete work into success. Do not roll into another quarter without a new instruction.

## Concrete implementation checklist

**Repository files planned:** `AGENTS.md` for durable delegated scope; `.agents/product-marketing.md`; `scripts/seo_check.py` and one small meaningful standalone check for non-trivial validation logic; the smallest mocked funnel check when that task is implemented. Reuse the existing static build and Git integration.

**Machine-local files planned:** `~/.agent-reach/garageiq-seo/controller/seo_run.py` as one standard-library coordinator/publisher; `worker-prompt.md`, `reviewer-prompt.md`, structured result schema, private state/journal; `~/Library/LaunchAgents/ae.garageiq.seo.plist`. Controller files are outside model-writable worktrees. Add no general-purpose agent service or dashboard.

- [ ] Bootstrap the reviewed plans and durable authority into the landing repository without including unrelated or private files. Install only missing selected skills through the coordinator.
- [ ] Implement the SEO check and a runnable self-check that fails on broken canonicals, invalid JSON-LD and missing linked pages, then passes after repair. Add actual funnel edge-case checks with the first funnel change.
- [ ] Implement one coordinator with Dubai due-date calculation, kernel locking, atomic state, bounded subprocesses, release reconciliation and exact-SHA gates. Test concurrent invocations, crash/restart after push, missing CLI, offline reads, worker timeout, duplicate success, a moved main and the campaign end date using mocked provider responses.
- [ ] Run a read-only CLI probe to verify saved authentication, intended sandbox/network and required tool availability. Prove editing/review workers cannot invoke remote write tools; missing isolation leaves automatic publishing disabled. Then run a local edit/review probe in a disposable worktree. Test the publisher only against this repository and an explicit harmless task branch; inspect the complete diff before its first push.
- [ ] Verify read-only Search Console/Bing/funnel access where available; record unresolved access requirements. Capture actual baselines instead of fabricating initial figures.
- [ ] Run one end-to-end in-scope release through candidate review, real preview, merge, exact-SHA production deployment and live checks. Verify recovery from an interrupted observation without republishing.
- [ ] Validate the LaunchAgent plist, register it in the logged-in user's launchd domain, trigger one invocation, and inspect launchd process/exit evidence plus the coordinator journal. Record `registered=true` and the readiness proof; registration alone does not mean the campaign is activated.
- [ ] On the next unattended due run, prove it resumes state without this chat and does not overlap or repeat the prior release. Set `activated=true` with timestamp/evidence and mark the daily cadence operational only after that proof and all activation acceptance checks pass.

**Activation acceptance:** real scheduler registration, actual CLI worker/reviewer execution, tested publication permission path, a verified release, and an unattended state-resuming invocation. If any of these are unavailable, report the narrower verified readiness; never label a saved plan or active conversation as a running 90-day automation.

## Durable worker instruction

> Execute the approved GarageIQ landing SEO plan under its autonomous operating plan. Read AGENTS.md, CLAUDE.md, both dated plans and product-marketing context. Work only on the coordinator's assigned task and isolated worktree; do not modify runtime/controller instructions or broaden permissions. Reconcile task state against GitHub before repeating writes. Use agent-reach for online acquisition, factual source dates and available SEO/GEO skills. Produce the smallest justified change and the specified acceptance evidence. Report unknown/private metrics as unavailable. Publishing authority is delegated to the coordinator after independent review and exact-SHA preview/production checks; do not wait for routine user approval or publish directly from an unchecked model result. Stop at the provided time ceiling, return structured status/evidence/blockers, and leave a recoverable checkpoint. Do not change the app/backend, send outreach, buy services, fabricate claims or claim the schedule is active without actual registration/run evidence.

This is the operating plan for autonomous execution. The implementation checklist remains open; campaign activation and SEO results are not yet claimed.
