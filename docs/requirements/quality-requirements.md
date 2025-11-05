# Quality Requirements

## Table of Contents
- [Usability](#usability)
- [Performance](#performance)
- [Reliability](#reliability)
- [Security](#security)
- [Interoperability](#interoperability)

## Usability
### QAS001
### Instructor Dashboard Navigation
- **Source**: Instructor
- **Stimulus**: Wants to view team grades and review assignments
- **Artifact**: Web UI
- **Environment**: Normal operation
- **Response**: System displays dashboard with clear sections for grades, teams, and pending reviews within 2 seconds
- **Response Measure**: 95% of users can navigate to the correct section without assistance

### QAST001-1
Conduct a usability test with 5 instructors, measuring time to complete key tasks (e.g., find a team's grades, assign a review).

## Performance
### QAS002
### Grade Export Response Time
- **Source**: Instructor
- **Stimulus**: Requests export of grades in Moodle-compatible format
- **Artifact**: Export service
- **Environment**: Peak load (end of semester)
- **Response**: System generates and downloads the file
- **Response Measure**: Export completes within 10 seconds for up to 200 students

### QAST002-1
Load test with 200 student records; measure export time.

## Reliability
### QAS003
### System Availability During Peer Review Submission
- **Source**: Student
- **Stimulus**: Submits peer review feedback as PDF
- **Artifact**: File upload service
- **Environment**: Submission deadline
- **Response**: System confirms successful upload and stores file persistently
- **Response Measure**: 99.9% success rate for uploads; no data loss

### QAST003-1
Simulate 50 concurrent uploads; verify all files are stored and accessible.

## Security
### QAS004
### Role-Based Access Control
- **Source**: Unauthorized user
- **Stimulus**: Attempts to access instructor dashboard
- **Artifact**: Authentication middleware
- **Environment**: Normal operation
- **Response**: System denies access and redirects to login
- **Response Measure**: 100% of unauthorized access attempts are blocked

### QAST004-1
Penetration testing for role escalation and unauthorized access.

## Interoperability
### QAS005
### Moodle Grade Format Compatibility
- **Source**: Instructor
- **Stimulus**: Exports grades for upload to Moodle
- **Artifact**: Export module
- **Environment**: Post-grading
- **Response**: System generates a CSV file that is accepted by Moodle without manual reformatting
- **Response Measure**: 100% of exported files are successfully imported into Moodle

### QAST005-1
Test export/import cycle with a sample Moodle instance.
