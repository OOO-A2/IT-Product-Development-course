---
layout: default
title: "Quality requirements"
nav_order: 2
permalink: /requirements/qa/
---

# Quality Requirements

## Table of Contents
- [Priority Matrix](#priority-matrix)
- [Usability](#usability)
- [Performance](#performance)
- [Reliability](#reliability)
- [Security](#security)
- [Interoperability](#interoperability)
- [Data Integrity](#data-integrity)
- [Scalability](#scalability)

## Priority Matrix

| Business Importance → <br/> Technical Risk ↓ | Low | Medium | High |
|-----------------------------------------------|-----|---------|------|
| **Low**                                       | QAS009 | QAS002 | **QAS001** |
| **Medium**                                    | QAS007 | QAS003 | QAS008 |
| **High**                                      | QAS004 | QAS005 | QAS006 |

**Priority Legend:**
- **High Priority**: Critical features with high business value and low technical risk
- **Medium Priority**: Important features with moderate risk/value balance  
- **Low Priority**: Lower impact features or high-risk implementations

## Usability
### QAS001
#### Automated Peer Review Matching
- **Source**: Instructor
- **Stimulus**: Wants to view team grades and review assignments
- **Artifact**: Web UI
- **Environment**: Normal operation
- **Response**: System displays dashboard with sections for grades, teams, and pending reviews within 2 seconds
- **Response Measure**: Complete all intended actions on the page without guidance

### QAST001-1
Conduct usability testing with 2 instructors performing 10 key tasks; measure success rate and time to completion.

### QAST001-2
A/B testing of dashboard layouts with 20 users; collect satisfaction scores (1-5 scale).

## Performance
### QAS002
#### Bulk Grade Operations
- **Source**: Instructor
- **Stimulus**: Requests export of grades in Moodle-compatible format
- **Artifact**: Export service
- **Environment**: Peak load (end of semester)
- **Response**: System generates and downloads the file
- **Response Measure**: Export completes within 10 seconds for up to 200 students

### QAST002-1
Load test with 200 student records; measure export time under concurrent user load.

### QAST002-2
Stress test with 500+ student records; verify graceful degradation beyond design capacity.

## Reliability
### QAS003
#### Real-time Notifications
- **Source**: Student
- **Stimulus**: Submits peer review feedback as PDF
- **Artifact**: File upload service
- **Environment**: Submission deadline
- **Response**: System confirms successful upload and stores file persistently
- **Response Measure**: 99.9% success rate for uploads; no data loss

### QAST003-1
Simulate 50 concurrent uploads during peak submission hours; verify all files are stored and accessible.

### QAST003-2
Conduct failure recovery testing by simulating server crashes during upload process.

## Security
### QAS004
#### SSO Integration
- **Source**: Unauthorized user
- **Stimulus**: Attempts to access instructor dashboard
- **Artifact**: Authentication middleware
- **Environment**: Normal operation
- **Response**: System denies access and redirects to login
- **Response Measure**: 100% of unauthorized access attempts are blocked

### QAST004-1
Penetration testing for role escalation and unauthorized access across all user roles.

### QAST004-2
Automated security scanning for common vulnerabilities (OWASP Top 10) in authentication flows.

### QAS005
#### Student Data Isolation and File Access Control
- **Source**: Student
- **Stimulus**: Attempts to access another student's grades, reviews, or personal data
- **Artifact**: Authorization middleware and file access controls
- **Environment**: Normal system operation
- **Response**: System denies access and logs the unauthorized attempt
- **Response Measure**: 100% prevention of cross-student data access; only authorized instructors/admins can access all student files

### QAST005-1
Simulate student attempts to access other students' data via URL manipulation or API calls; verify access denials.

### QAST005-2
Conduct file system security testing to ensure only administrators/instructors can access stored files on the server.

### QAS006
#### Data Protection and Privacy
- **Source**: System users or external attackers
- **Stimulus**: Attempts to intercept or access sensitive student data in transit or at rest
- **Artifact**: Encryption protocols and data storage systems
- **Environment**: All system environments (development, production)
- **Response**: Machine where data is stored is isolated from unauthorized access
- **Response Measure**: 100% of sensitive data encrypted in transit (TLS 1.2+) and at rest (AES-256)

### QAST006-1
Security audit of data encryption implementations for both database storage and file systems.

### QAST006-2
Network security testing to verify all data transmissions use secure encrypted channels.

## Interoperability
### QAS007
#### Moodle CSV Export
- **Source**: Instructor
- **Stimulus**: Exports grades for upload to Moodle
- **Artifact**: Export module
- **Environment**: Post-grading
- **Response**: System generates a CSV file that is accepted by Moodle without manual reformatting
- **Response Measure**: 100% of exported files are successfully imported into Moodle

### QAST007-1
Test export/import cycle with a sample Moodle instance using various grade scenarios.

### QAST007-2
Validate CSV format compliance against Moodle's official import specifications.

## Data Integrity
### QAS008
#### Grade Calculation Accuracy
- **Source**: Instructor or System Administrator
- **Stimulus**: Initiates final grade calculation process at semester end
- **Artifact**: Grade calculation engine and database
- **Environment**: High-stakes grading period with multiple review cycles and bonus points
- **Response**: System computes final grades using correct formulas, applies all weighting factors consistently, and preserves calculation integrity across all student records
- **Response Measure**: 100% accuracy in grade calculations verified against manual audit; zero discrepancies in 1000+ student records

### QAST008-1
Automated regression testing of grade calculation algorithms with comprehensive test datasets covering edge cases and complex weighting scenarios.

### QAST008-2
Cross-validation audit comparing system-calculated grades against independent manual calculations for a representative sample of student records.

### QAST008-3
Data consistency checks to ensure grade calculations remain stable and reproducible across multiple calculation runs.

## Scalability
### QAS009
#### Concurrent User Performance
- **Source**: Multiple concurrent users
- **Stimulus**: 100 students simultaneously accessing dashboards during peak hours
- **Artifact**: Application server and database
- **Environment**: High concurrent load
- **Response**: System maintains responsive performance under load
- **Response Measure**: Response times under 3 seconds for 95% of requests at 100 concurrent users

### QAST009-1
Load testing simulating 100+ concurrent users performing typical student/instructor workflows.

### QAST009-2
Database performance testing with datasets representing 100 students and 100 review records.
