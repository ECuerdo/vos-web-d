# Budgeting Reports Module Workflow

This document records the architectural structure, logic flows, and API specifications for the `Reports` module within the `budgeting` domain.

## 1. Database Schema Context
The Reports module utilizes the core budget tables. Data is aggregated based on:
- `budget`: Primary transaction table.
- `chart_of_accounts`: For labels and GL codes.
- `department` & `division`: For organizational categorization.

## 2. API Specification: Data Generation

### `GET /api/fm/treasury/budgeting/reports/generate`
**Purpose**: A polymorphic endpoint that aggregates budget data into different reporting matrices based on the `report_type` parameter.

**Parameters**:
- `year` (number): The fiscal year.
- `period` (string): Specific month or "ALL".
- `division_id` (number/string): Filter by division.
- `status` (string): Filter by budget status (Approved, Submitted, etc.).
- `report_type` (string): Dictates the aggregation key and visible columns.

**Implementation Patterns**:
- **Aggregation Strategy**: Uses a `Map<string, any>` to combine `proposed_amount` values based on a composite key derived from the `report_type`.
- **Dynamic Grouping Keys**:
  - `budget_allocation`: `Division :: Department :: AccountTitle`
  - `department_budget_summary`: `Division :: Department`
  - `account_wise_budget`: `GLCode :: AccountTitle`
  - `budget_utilization_variance`: `AccountTitle`
- **Synthetic Fields**:
  - `budgeted`: Sum of `proposed_amount`.
  - `utilized`: Currently set to 0 (placeholder for future actual expenditure integration).
  - `remaining`: `budgeted - utilized`.
  - `percentage`: `(remaining / budgeted) * 100` (calculated for Variance reports).

---

## 3. UI Implementation: `ReportModal`

The modal serves as a live preview and structure generator for all report types.

### A. Dynamic Table Heads
Columns are conditionally rendered using the `reportId`:
- **Department**: Visible in "Allocation" and "Department Summary".
- **Account Code**: Visible in "Account-wise".
- **Account Title**: Visible in all except "Department Summary".
- **Utilization Details**: Visible in all except "Allocation".

### B. High-Level Metadata
- **Men2 Corporation Header**: Fixed branding.
- **Year & Period Context**: Aligned to the **right** below the title to provide immediate filter context in exports.

---

## 4. Export Utilities

### A. PDF Generation (`exportPdf.ts`)
- **Library**: `jspdf` + `jspdf-autotable`.
- **Grand Total Alignment (Correction)**: Instead of hardcoded pixel offsets, the footer uses **Sector-Based Positioning**. For 3 values (Budgeted, Utilized, Remaining), the box is divided into 3 equal columns to prevent text overlapping for large currency values.
- **Paper Sizes**: Supports A4, Letter, and Legal via a live preview modal.

### B. Excel Generation (`exportExcel.ts`)
- **Library**: `exceljs` + `file-saver`.
- **Structural Integrity**:
  - Merged Title Row (Centered).
  - Right-aligned Subtitle Row (Year & Period).
  - Division-based grouping with separate table headers for each sector where applicable.
  - Formatted currency columns and percentage rounding.

---

## 5. "Under Development" Handling
To maintain UI consistency while developing new reports:
- The API returns an empty `data` array with a `message`.
- The `ReportModal` detects an unimplemented state and renders a friendly "Under Development" illustration and message, preventing crashes or empty generic tables.
