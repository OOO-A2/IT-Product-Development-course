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
- ✅ **Supports user login and role-based access** (instructor/student) with authentication system
- ✅ **Provides instructor dashboard** to view and manage team grades, submissions, and review assignments
- ✅ **Offers student dashboard** to view personal/team grades and review assignments
- ✅ **Automates peer review matching** using cyclic or randomized assignment strategies
- ✅ **Allows PDF uploads** for peer review feedback submission
- ✅ **Exports grades in Moodle-compatible CSV format** for easy grade transfer
- ✅ **Supports self-hosted deployment** via Docker containerization
- ✅ **Provides the same core functionality** as the current spreadsheet solution with improved usability

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
