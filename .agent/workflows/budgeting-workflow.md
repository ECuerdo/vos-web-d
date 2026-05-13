---
description: Standard Budgeting Workflow (Revisions, Supplements, and Audit Trail)
---

# Budgeting Audit Trail Architecture

## Business Rules

1. **Master Record:** The `items/budget` table dictates the overall scope (amount utilized vs proposed, overall state: draft -> submitted -> approved -> rejected).
2. **Revisions:** If a budget is rejected, users can "Revise" the budget. This automatically triggers a new `budget_revision` record to act as the pending audit trail of what was previously requested vs what is currently requested.
3. **Supplements:** If an ALREADY approved budget needs more funds, users can "Supplement" the budget. This again generates a new `budget_revision` while placing the master budget into `submitted` state, preserving the previous approved tracking amount until explicitly approved by the approvers.

## Endpoints
- `budget`
- `budget_revision`

## Creating History
When interacting with `budget` directly through our custom API Wrappers (`/api/fm/treasury/budgeting/budget-records/[id]/route.ts`), the backend will safely and immutably record changes to `budget_revision` depending on if the budget state moved from:
`rejected` -> `submitted` = `revision`
`approved` -> `submitted` = `supplement`

The `/api/fm/treasury/budgeting/budget-approvals/route.ts` bulk-approval endpoint targets pending `budget_revision` records using the `budget_id` to intercept incoming status updates. If a `pending` `budget_revision` is approved and has type `supplement`, its newly requested amount automatically upgrades the global master `budget`.
