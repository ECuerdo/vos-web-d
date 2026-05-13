---
description: Budget Dashboard Database Schema DDL and API Endpoints
---

# Budget Dashboard Workflow

This document outlines the database schema and API endpoints used by the Budget Dashboard.

## 1. Database Schema DDL

The Dashboard relies on the following primary tables:

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

CREATE TABLE `chart_of_accounts` (
	`coa_id` INT NOT NULL AUTO_INCREMENT,
	`gl_code` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`account_title` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`bsis_code` INT NULL DEFAULT NULL,
	`account_type` INT NULL DEFAULT NULL,
	`balance_type` INT NULL DEFAULT NULL,
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`memo_type` INT NULL DEFAULT NULL,
	`date_added` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	`added_by` INT NULL DEFAULT NULL,
	`isPayment` BIT(1) NOT NULL DEFAULT (b'0'),
	`is_payment` BIT(1) NULL DEFAULT NULL,
	PRIMARY KEY (`coa_id`) USING BTREE,
	UNIQUE INDEX `gl_code` (`gl_code`) USING BTREE,
	UNIQUE INDEX `account_title` (`account_title`) USING BTREE,
	INDEX `FK3bdcpkvm6owauj5ylrfqltktu` (`account_type`) USING BTREE,
	INDEX `FKp46q9vxjauhlky2khlsto765` (`balance_type`) USING BTREE,
	INDEX `FKx3looy98ffa5b6abr079c6cj` (`bsis_code`) USING BTREE,
	CONSTRAINT `FK3bdcpkvm6owauj5ylrfqltktu` FOREIGN KEY (`account_type`) REFERENCES `account_types` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `FKp46q9vxjauhlky2khlsto765` FOREIGN KEY (`balance_type`) REFERENCES `balance_type` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT `FKx3looy98ffa5b6abr079c6cj` FOREIGN KEY (`bsis_code`) REFERENCES `bsis_types` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=170
;

CREATE TABLE `department` (
	`department_id` INT NOT NULL AUTO_INCREMENT,
	`department_name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`parent_division` INT NOT NULL DEFAULT '0',
	`department_description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`department_head` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`department_head_id` INT NULL DEFAULT NULL,
	`tax_id` INT NULL DEFAULT NULL,
	`date_added` DATE NULL DEFAULT NULL,
	PRIMARY KEY (`department_id`) USING BTREE,
	UNIQUE INDEX `department_name` (`department_name`) USING BTREE,
	INDEX `idx_department_department_head_id` (`department_head_id`) USING BTREE,
	CONSTRAINT `fk_department_department_head_user` FOREIGN KEY (`department_head_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=28
;

CREATE TABLE `department_division_coa` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`dept_div_id` INT NOT NULL,
	`coa_id` INT NOT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uq_dept_div_coa` (`dept_div_id`, `coa_id`) USING BTREE,
	INDEX `idx_dept_div_id` (`dept_div_id`) USING BTREE,
	INDEX `idx_coa_id` (`coa_id`) USING BTREE,
	CONSTRAINT `fk_ddc_coa` FOREIGN KEY (`coa_id`) REFERENCES `chart_of_accounts` (`coa_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_ddc_dept_division` FOREIGN KEY (`dept_div_id`) REFERENCES `department_per_division` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=12
;

CREATE TABLE `department_per_division` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`division_id` INT NOT NULL,
	`department_id` INT NOT NULL,
	`bank_id` INT NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `uq_division_department` (`division_id`, `department_id`) USING BTREE,
	INDEX `idx_division_id` (`division_id`) USING BTREE,
	INDEX `idx_department_id` (`department_id`) USING BTREE,
	INDEX `idx_bank_id` (`bank_id`) USING BTREE,
	CONSTRAINT `fk_dpd_bank_account` FOREIGN KEY (`bank_id`) REFERENCES `bank_accounts` (`bank_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_dpd_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT `fk_dpd_division` FOREIGN KEY (`division_id`) REFERENCES `division` (`division_id`) ON UPDATE CASCADE ON DELETE RESTRICT
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=46
;

CREATE TABLE `division` (
	`division_id` INT NOT NULL AUTO_INCREMENT,
	`division_name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`division_description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`division_head` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`division_code` VARCHAR(10) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`date_added` DATE NULL DEFAULT NULL,
	`division_head_id` INT NULL DEFAULT NULL,
	PRIMARY KEY (`division_id`) USING BTREE,
	UNIQUE INDEX `division_code` (`division_code`) USING BTREE,
	INDEX `fk_division_head_user` (`division_head_id`) USING BTREE,
	CONSTRAINT `fk_division_head_user` FOREIGN KEY (`division_head_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE ON DELETE SET NULL
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=16
;
```

## 2. API Endpoints

The dashboard uses three primary local API routes:

### A. Options API
- **Endpoint**: `GET /api/fm/treasury/budgeting/dashboard/options`
- **Purpose**: Provides data for the UI filter dropdowns.
- **Returns**: `years` (range merged with DB), `periods`, `divisions`, and `departments` (with `parent_division`).

### B. Summary API
- **Endpoint**: `GET /api/fm/treasury/budgeting/dashboard/summary`
- **Purpose**: Computes KPI card values and status breakdown counts based on selected filters.
- **Returns**: Aggregated totals for `Approved` budgets, utilized, remaining balances, and counts per status.

### C. Records API
- **Endpoint**: `GET /api/fm/treasury/budgeting/dashboard/records`
- **Purpose**: Fetches the detailed list of budget records for the data table.
- **Returns**: Paginated list of `BudgetRecord` objects, including joined names for `division`, `department`, and `account_title`.
