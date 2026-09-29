# DRISHTI Database Specification

## Overview
DRISHTI uses a persistent JSON document database store (`/data/drishti.json`) with in-memory caching and synchronous atomic persistence to disk. State survives browser refreshes and server restarts without loss of records.

## Entity Schema & Relationships

### 1. `users`
* `id` (PK, string, e.g. `usr-op-01`)
* `name`, `email`, `phone`
* `role` (`OPERATOR` | `VERIFIER` | `SUPERVISOR` | `OFFICIAL` | `ADMIN`)
* `state`, `district`, `tehsil` (Administrative scope)
* `status` (`ACTIVE` | `INACTIVE`)
* `avatar`, `createdAt`, `lastLoginAt`

### 2. `documents`
* `id` (PK, string, e.g. `DOC-MH-2026-001`)
* `batchId` (FK $\to$ `batches.id`)
* `fileName`, `fileUrl`, `fileType`, `fileSize`, `fileHash` (SHA-256)
* `pageCount`, `state`, `district`, `tehsil`, `village`
* `documentType` (`Record of Rights` | `Mutation Register` | `Sale Deed` | `Cadastral Map` | `Land Register`)
* `language` (`Marathi` | `Hindi` | `English` | `Gujarati`)
* `uploadStatus`, `processingStatus` (`UPLOADED` | `QUEUED` | `PROCESSING` | `EXTRACTED` | `VALIDATED` | `REVIEW_REQUIRED` | `APPROVED` | `REJECTED` | `SYNCED` | `FAILED`)
* `qualityScore` (0-100), `overallConfidence` (0-100)
* `workflowStatus` (`PENDING` | `IN_REVIEW` | `APPROVED` | `REJECTED` | `ESCALATED` | `AUTO_ACCEPTED`)
* `priority` (`LOW` | `NORMAL` | `HIGH` | `CRITICAL`)
* `uploadedBy`, `assignedTo`, `approvedBy`, `reviewedBy` (FKs $\to$ `users.id`)
* `slaDueDate`, `slaBreached`
* `lrmsSyncStatus` (`NOT_SYNCED` | `PENDING` | `SYNCING` | `SYNCED` | `FAILED`), `lrmsRecordId`
* `duplicateStatus` (`NO_MATCH` | `POSSIBLE_DUPLICATE` | `HIGH_CONFIDENCE_DUPLICATE`)
* `createdAt`, `updatedAt`

### 3. `batches`
* `id` (PK), `batchNumber`, `name`
* `state`, `district`, `tehsil`, `village`
* `documentCount`, `processedCount`, `approvedCount`, `reviewCount`, `failedCount`
* `status` (`PENDING` | `PROCESSING` | `COMPLETED` | `PARTIALLY_COMPLETED`)
* `createdBy`, `createdAt`, `updatedAt`

### 4. `extracted_records`
* `id` (PK), `documentId` (FK)
* `location`: `state`, `district`, `tehsil`, `village`, `lgdStateCode`, `lgdDistrictCode`, `lgdVillageCode`
* `parcel`: `surveyNumber`, `khasraNumber`, `khataNumber`, `subDivision`, `plotArea`, `areaUnit`, `normalizedAreaAcres`
* `ownership`: `owners[]` (`id`, `name`, `fatherOrHusbandName`, `sharePercentage`, `ownershipType`), `totalSharePercentage`
* `land`: `landClassification`, `landUse`, `irrigationSource`, `cropType`
* `mutation`: `mutationNumber`, `mutationDate`, `mutationType`, `previousOwner`, `newOwner`
* `registration`: `registrationNumber`, `registrationDate`, `subRegistrarOffice`, `deedType`
* *Every extracted field stores: `value`, `confidence`, `boundingBox: [ymin, xmin, ymax, xmax]`, `sourcePage`, `isEdited`, `originalValue`, `editedBy`, `editedAt`.*

### 5. `validation_results`
* `id`, `documentId`, `ruleId`, `ruleName`, `severity` (`ERROR` | `WARNING` | `INFO`), `field`, `message`, `expected`, `actual`, `status` (`FAIL` | `PASS`)

### 6. `audit_logs`
* `id`, `timestamp`, `user`, `userName`, `role`, `action`, `entityType`, `entityId`, `before`, `after`, `ip`, `details`

### 7. `feedback_records` (ML Learning Loop)
* `id`, `documentId`, `field`, `originalValue`, `correctedValue`, `language`, `documentType`, `reviewer`, `confidenceBefore`, `notes`, `createdAt`

### 8. `gis_parcels`
* `id`, `surveyNumber`, `khasraNumber`, `village`, `district`, `state`, `ownerName`, `plotAreaAcres`, `status`, `confidence`, `coordinates[][]`, `centroid`
