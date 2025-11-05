# PeerPilot  
[![GitHub Pages with Jekyll](https://github.com/OOO-A2/IT-Product-Development-course/actions/workflows/pages.yml/badge.svg)](https://ooo-a2.github.io/IT-Product-Development-course/)

<p align="center">
  <img src="docs/assets/peerpilot-logo.svg" alt="PeerPilot – Peer review · Grades · Transparency" width="320" />
</p>

A self-hosted platform to automate peer reviews, track grades, and streamline course coordination — built to replace spreadsheets with structured clarity.

## Project goal(s)

The major goal is to replace the static and tediously updated spreadsheet solution with a more interactive and functional platform/website to:
- Track scores of students and teams;
- Automate peer-feedback process;
- Possibly integrate with Google Drive and Moodle.

## Threshold of Success

A project is considered successful if it provides the same functionality as the current spreadsheet solution and offers a more convenient grade description (by clicking on a team or a student), as well as automates peer-feedback assignment matching (enabling a team to understand who they need to provide feedback to).

## Description

**PeerPilot** is a lightweight, privacy-respecting course management platform that simplifies peer review processes and grade tracking for project-based learning environments.

In many current university workflows, instructors and TAs use spreadsheets to manually:
- Assign peer review partners for teams
- Track submissions, feedback, and grading
- Copy grades from spreadsheets into Moodle
- Collect and structure artifacts from Google Drive

These workflows are time-consuming, error-prone, and difficult to maintain across semesters.

**PeerPilot solves this** by:
- Automatically assigning teams for peer review using customizable algorithms
- Providing a unified dashboard for students and instructors to view grades, feedback, and assignments
- Enabling structured feedback collection and justification of bonus points
- Exporting grades in formats compatible with Moodle
- Integrating with Google Drive for fetching student submissions

The platform is designed to be self-hosted, ensuring confidentiality and compliance with university data policies.

## Project Context Diagram

### Stakeholders

- Teaching assistants;
- Primary instructor;
- ITPD Students;
- Development team;
- University administration.

### External Systems

- Google Drive - a cloud file storage with PDFs, student submissions, and instructors' feedback;
- Moodle - format compliance for importing and exporting grades. Also, possible integration to download or upload files to assignments;
- Innopolis mail, SSO, etc. - possible for seamless integration with the university educational process.

## Feature Roadmap
### Features for MVP
- [ ] User login with role-based access (students, instructors)
- [ ] Instructor dashboard to view and manage team grades, submissions, and reviews
- [ ] Student dashboard to view personal and team grades, who to review, and link to the review submission
- [ ] Automate peer review matching using cyclic or randomized strategies
- [ ] Upload peer review feedback as PDF files
- [ ] Export final grades in a Moodle-compatible format
- [ ] Self-hosted deployment

### Future Features
- [ ] Fetch assignment PDFs automatically from Google Drive
- [ ] PDF viewer with inline commenting for instructors
- [ ] Integration with Moodle API (automated grade sync, file transfer)
- [ ] Sign on via Innopolis University accounts
- [ ] Notifications or reminders for late submissions or missing reviews

## Documentation

The repo is organized as follows:
- [Sprints folder](docs/sprints) - List of folders for each sprint. 
    - **Sprint-0 contains**
    - Details on [meetings](docs/sprints/sprint-0/meeting-1.md) with a customer
    - [Summary report](docs/sprints/sprint-0/report.md)
    - Customer interview [script](docs/sprints/sprint-0/script.md)
- [AI usage](docs/ai-usage.md) - Details on how AI helped to increase efficiency in each sprint.
