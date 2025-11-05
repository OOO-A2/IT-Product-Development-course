# Strategic Plan

## Table of Contents
- [Project Goals](#project-goals)
- [Threshold of Success](#threshold-of-success)
- [Feature Roadmap](#feature-roadmap)
- [Progress Monitoring](#progress-monitoring)
- [Contingency Plans](#contingency-plans)

## Project Goals
- Replace manual spreadsheet-based workflows with an automated, self-hosted platform
- Automate peer review assignment and feedback collection to reduce instructor workload
- Integrate with existing university systems (Google Drive and Moodle) for seamless file and grade management
- Provide structured clarity and transparency in the grading and peer review process
- Create a lightweight, privacy-respecting platform that complies with university data policies

## Threshold of Success
By the end of the course, deliver a Minimum Viable Product (MVP) that:
### ✅ Authentication & Access Control
- **Specific**: Implement role-based authentication system supporting instructors and students
- **Measurable**: System successfully authenticates users and enforces role-based permissions for all dashboard features
- **Achievable**: Use secure session-based authentication without requiring complex SSO integration initially
- **Relevant**: Essential for protecting sensitive grade data and providing appropriate interfaces per user type
- **Time-bound**: Complete authentication system deployed by end of Sprint 3

### ✅ Instructor Dashboard
- **Specific**: Provide comprehensive dashboard for instructors to manage teams, grades, and review assignments
- **Measurable**: Instructors can perform all key operations: view team lists, manage grades, assign reviews within 3 clicks
- **Achievable**: Build on standard web framework components with focused feature set
- **Relevant**: Replaces spreadsheet manual management with automated, structured interface
- **Time-bound**: Core dashboard functionality operational by end of Sprint 4

### ✅ Student Dashboard  
- **Specific**: Deliver student-facing interface for viewing grades and review assignments
- **Measurable**: Students can access personal grades, team information, and review tasks within 10 seconds of login
- **Achievable**: Limited scope focusing on read-only operations and simple submissions
- **Relevant**: Provides transparency and clear guidance on peer review responsibilities
- **Time-bound**: Student portal deployed and tested by end of Sprint 5

### ✅ Peer Review Automation
- **Specific**: Automate peer review matching using configurable algorithms (cyclic/randomized)
- **Measurable**: System generates review assignments for 50+ students in under 30 seconds with zero manual intervention
- **Achievable**: Implement proven assignment algorithms rather than developing novel approaches
- **Relevant**: Eliminates most time-consuming manual process in current workflow
- **Time-bound**: Automated matching feature complete by end of Sprint 6

### ✅ PDF Feedback System
- **Specific**: Enable PDF uploads for peer review feedback with secure file storage
- **Measurable**: System accepts PDF files up to 10MB, stores them reliably, and makes them accessible to intended recipients
- **Achievable**: Use established file handling libraries with proper validation
- **Relevant**: Maintains familiar feedback format while adding structure and automation
- **Time-bound**: File upload and retrieval system operational by end of Sprint 5

### ✅ Moodle Grade Export
- **Specific**: Export grades in Moodle-compatible CSV format matching institutional requirements
- **Measurable**: Generated CSV files import successfully into Moodle without manual reformatting for 100% of test cases
- **Achievable**: Follow documented Moodle CSV specifications with rigorous format validation
- **Relevant**: Enables seamless integration with existing university grading workflow
- **Time-bound**: Export feature complete and validated by end of Sprint 7

### ✅ Self-Hosted Deployment
- **Specific**: Support Docker-based deployment for university IT infrastructure
- **Measurable**: System runs successfully in Docker containers with all core features functional in isolated environment
- **Achievable**: Containerize existing web application stack without requiring complex orchestration
- **Relevant**: Meets university data privacy and infrastructure requirements
- **Time-bound**: Docker configuration and deployment documentation ready by end of Sprint 8

### ✅ Core Spreadsheet Parity
- **Specific**: Provide equivalent functionality to current spreadsheet solution with enhanced usability
- **Measurable**: All data management operations currently performed in spreadsheets can be completed in PeerPilot with equal or better efficiency
- **Achievable**: Focus on replicating proven workflows rather than reinventing processes
- **Relevant**: Ensures smooth transition from existing system while delivering tangible improvements
- **Time-bound**: Feature parity demonstrated in user acceptance testing by final delivery

## Feature Roadmap

### ✅ Completed
- [x] Market research and competitive analysis
- [x] Customer interviews and requirements gathering
- [x] Project setup and repository organization
- [x] Initial architecture planning

### 🔄 In Progress
- [ ] UI/UX design in Figma
- [ ] Technical architecture specification
- [ ] Quality requirements documentation
- [ ] Tech stack selection

### ⏳ Planned (MVP Features)
- [ ] User login with role-based access (students, instructors)
- [ ] Instructor dashboard to view and manage team grades, submissions, and reviews
- [ ] Student dashboard to view personal and team grades, who to review, and link to review submission
- [ ] Automate peer review matching using cyclic or randomized strategies
- [ ] Upload peer review feedback as PDF files
- [ ] Export final grades in a Moodle-compatible format
- [ ] Self-hosted deployment via Docker

### 🔮 Future Features
- [ ] Fetch assignment PDFs automatically from Google Drive
- [ ] PDF viewer with inline commenting for instructors
- [ ] Integration with Moodle API (automated grade sync, file transfer)
- [ ] Sign on via Innopolis University accounts
- [ ] Notifications or reminders for late submissions or missing reviews

## Progress Monitoring
- **Weekly Sprint Reviews**: Conduct team sync-ups to review burn-down charts and velocity in GitHub Projects
- **Bi-weekly Customer Meetings**: Validate features with the customer, adjust priorities based on feedback
- **Continuous Integration**: Automated testing and deployment to staging environment for early validation
- **Definition of Done**: Each feature must pass code review, automated tests, and meet acceptance criteria
- **Milestone Tracking**: Track progress against the feature roadmap with clear completion criteria

## Contingency Plans
- **Complex Feature Reduction**: If Moodle API integration proves too complex, fall back to manual CSV export/import functionality
- **UI Simplification**: If UI development lags, implement a basic Bootstrap-based interface instead of custom designs
- **Team Capacity Issues**: If team capacity is reduced, focus exclusively on core MVP features and defer enhancements
- **Technical Challenges**: If self-hosting proves difficult, provide clear deployment documentation for IT support
- **Scope Creep Management**: Regularly reassess priorities with customer to ensure MVP remains achievable within timeline
