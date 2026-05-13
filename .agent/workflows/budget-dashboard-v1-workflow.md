---
description: Budget Dashboard V1 DDL, Architecture, and API Endpoints
---

# Budget Dashboard V1 Workflow

This document outlines the database schema, frontend logic, and API endpoints utilized by the **Budgeting Dashboard V1** in the `vos-web-v2` project.

## 1. Database Schema DDL

The Dashboard V1 relies on the exact same underlying `budget` tables and foreign constraints as the main Budget Approvals module. 

```sql
CREATE TABLE `budget` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`period` ENUM('JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`year` INT NOT NULL,
	`department_id` INT NOT NULL,
	`division_id` INT NOT NULL,
	`coa_id` INT NOT NULL,
	`proposed_amount` DECIMAL(20,4) NOT NULL DEFAULT '0.0000',
	`justification` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`remark` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`attachment` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`budget_type_id` INT NOT NULL,
	`status` ENUM('draft','submitted','revised','pending','approved','rejected') NOT NULL DEFAULT 'draft' COLLATE 'utf8mb4_unicode_ci',
	`created_by` INT NULL DEFAULT NULL,
	`created_at` DATETIME(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_by` INT NULL DEFAULT NULL,
	`updated_at` DATETIME(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uq_budget_scope` (`year`, `period`, `division_id`, `department_id`, `coa_id`, `budget_type_id`) USING BTREE,
	INDEX `idx_budget_period_year` (`year`, `period`) USING BTREE,
	INDEX `idx_budget_coa_id` (`coa_id`) USING BTREE,
	INDEX `idx_budget_budget_type_id` (`budget_type_id`) USING BTREE,
	INDEX `idx_budget_status` (`status`) USING BTREE,
	INDEX `idx_budget_created_by` (`created_by`) USING BTREE,
	INDEX `idx_budget_updated_by` (`updated_by`) USING BTREE,
	INDEX `idx_budget_department_id` (`department_id`) USING BTREE,
	INDEX `idx_budget_division_id` (`division_id`) USING BTREE,
	CONSTRAINT `fk_budget_coa` FOREIGN KEY (`coa_id`) REFERENCES `chart_of_accounts` (`coa_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_budget_created_by` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT `fk_budget_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_budget_division` FOREIGN KEY (`division_id`) REFERENCES `division` (`division_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_budget_type` FOREIGN KEY (`budget_type_id`) REFERENCES `budget_type` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_budget_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=45
;
```

*(Note: Requires the related `department`, `division`, and `chart_of_accounts` tables as defined in earlier workflows).*

---

## 2. Platform Architecture & Logic Flows

Dashboard V1 is structured to be independently encapsulated within the `src/modules/financial-management/treasury/budgeting/dashboard-v1` directory to prevent contaminating other modules.

### A. Frontend Data Flow
1. **Cascading Filters**: The UI groups five master filters (Year, Period, Status, Division, Department). Selecting a `Division` automatically fires a network request to load `Departments` linked strictly to that division. The `Status` filter directly drives both table records and dynamic KPI aggregation.
2. **Global Theme Integration**: The progress bars ("Utilized" / "Remaining" Stacked Pills) are tightly bound to the `bg-primary` Shadcn UI Token tailwind class, causing them to automatically react to User Appearance settings (Cyan, Emerald, Amber, etc.).
3. **Client-Side Grouping**: The frontend fetches a flat list of DTOs from the API, but `RecordsTable.tsx` transforms this list into a nested Data Structure grouping rows by `Division` -> `Department` -> `Records`. It dynamically generates custom headers and aggregate Subtotals based on these groupings on the fly.
4. **Data Visualization**: `BudgetBarChart.tsx` utilizes Shadcn UI Chart components (built on Recharts) to visualize the monetary distribution of budgets across different statuses. It uses the `statusAmounts` provided by the summary API to render a thematic bar graph.
### B. Network API Endpoints

The API interacts strictly with the `Directus API` backend wrapper to extract information securely.

#### 1. `GET /api/fm/treasury/budgeting/dashboard-v1/summary`
- **Purpose**: Computes KPI card totals (Total Budget Amount, Total Utilized, Remaining), the pipeline `StatusBreakdown` counts, and the monetary `statusAmounts` for visualization.
- **Optimization Strategy**: Instead of dispatching 7 parallel queries, it utilizes Directus Database aggregations (`groupBy: "status"`) with multiple aggregate functions (`count: "*"` and `sum: "proposed_amount"`) to bulk retrieve all status metadata in exactly 2 network requests. The aggregations dynamically adapt to the currently selected `status` filter.

#### 2. `GET /api/fm/treasury/budgeting/dashboard-v1/records`
- **Purpose**: Retrieves tabular information for the grid.
- **Data Mapping**: Fetches raw items and explicitly resolves Foreign Keys (`coa_id`, `department_id`) mapping them to user-friendly column strings: 
  - `Account Details` (`Account Title - GL Code`)
  - `Amount` (mapped from `proposed_amount`)
  - `Utilized`
  - `Remaining`
  - `Status` (Capitalized)
  - `Period` (Appears dynamically as a badge when "All Periods" is active)
- **Pagination Logic**: Bypasses conventional pagination (fetches all rows mapped to limit `-1`) whenever the "All Periods" filter context is active to compute absolute totals.
