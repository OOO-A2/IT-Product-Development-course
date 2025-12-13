## Meeting date: 12.12.2025

## Action points:

### For Team:
HIGH: Implement user import (CSV/JSON with emails/roles)

HIGH: Complete file upload/download for peer reviews

MEDIUM: Fix UI issues and implement sprint ordering

LOW: Enhance error handling

### For Customer:
- Provide sample user data structure for CSV import

- Confirm review workflow rules (one team → one review)

## Summary:

1. Backend Integration Status
✅ Backend running in Docker with separate docker-compose setup

✅ Frontend connected to backend API on localhost:8000

✅ Swagger API documentation available at /docs endpoint

✅ Basic data fetching for teams, students, and grades now functional

⚠️ Authentication not yet implemented - currently using mock login

### 2. Functional Areas Demonstrated
Dashboard & Grading:
- Teams and students data fetched from backend

- Grade submission partially works (supports extra grades for students, not full grading yet)

- Error handling implemented for backend downtime

- Real-time data refresh capabilities

Peer Review System:
- Review data fetched from backend

- Still in progress: File upload/download functionality

- Still in progress: Review link management

- Current mock data shows reviewing team assignments

Student View:
- Students can see their grades fetched from backend

- Grade naming inconsistency noted (ET vs TE, total vs sum)

- No feedback mechanism for extra grades currently

### 3. Issues Identified & Customer Feedback
Technical Issues:
- Filtering by teams not working on backend (needs frontend implementation)

- Some UI mismatches (whitespace display issues)

- Sprint order display - should show most recent first (priority 1,2,3)

-No pending reviews logic yet (should handle weekly review assignments)

Business Logic Clarifications:
- Each team reviews only one team (not multiple)

- Review links should appear on student pages when added by instructors

- Cannot have two pending reviews simultaneously (weekly cadence)

### 4. New Requirement Identified
- High Priority Feature: User management via CSV/JSON import

- Need ability to import users (students/instructors) with email, password, and role

- Instructors should be able to configure themselves as instructors

- Essential for making login functional (not hard-coded)


## Meeting record:
Audio https://drive.google.com/file/d/1VgIvtqqBzPtDv_YOmEIDWWSuQeOUcwfB/view?usp=sharing & https://drive.google.com/file/d/1qpmVV69fVLfLs-S2CgsnxpcBPsIio2IJ/view?usp=sharing 

Video https://drive.google.com/file/d/138u6-hyOv4LXqhDoHeWcw5_e9Ik0GajH/view?usp=sharing 
