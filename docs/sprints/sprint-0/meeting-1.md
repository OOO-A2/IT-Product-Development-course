---
layout: default
nav_order: 1
parent: "Sprint 0"
title: "Meeting 1"
---

1. 29.10.2025 2 pm

2. https://drive.google.com/file/d/1bL7cg-IEt9P49oavH6agETbmkV6rjVLs/view?usp=sharing

3. Summary of the meeting. Core features of the planned platform:

- Displaying statistics for each student: personal grades throughout the course, not just at the end.

- Statistics on team performance.

- Automated, randomized matching of teams for peer reviews.

- Enabling students to easily submit their work and peer feedback in PDF format to maintain formatting.

- Centralized platform to view grades, feedback, and submissions with export capabilities to integrate with Moodle.

- Instructor interface to view all teams, grades, feedback, and relevant links such as repositories.

- Visual highlighting of grades with colors for quick assessment of underperforming or high-performing teams.

- Self-hosting capability due to privacy concerns.

- Integration with Google Drive or alternative file storage like Яндекс Диск﻿ for automated fetching of submitted reports and feedback links.

- Commenting capability on PDFs for instructors, with students uploading feedback as PDFs.

- This platform aims to significantly reduce manual work, improve transparency for students on their progress, and streamline the workflow for instructors and TAs managing peer review and grading processes.​​

4. Speakers:
Danila Danko, @system205, @rayderdo

5. 
## [00:00] Goals of the Current Solution (Google Sheets)
Danila Danko:

We use Google Sheets to track:

Students' personal grades

Team performance statistics

Organization of peer reviews between teams

Problems with the current system:

No automation for matching teams for peer reviews

Personal grades are only visible at the end of the course

Manual copying of grades from Sheets to Moodle

No integration with Google Drive for automatically fetching links to assignments

## [03:00] Current Workflow with Sheets and Moodle
Danila Danko:

Students submit their work to Moodle.

Work is manually copied to Google Drive.

The instructor manually assigns which team reviews which.

Links to submissions and reviews are aggregated in a Google Sheet.

Grades and feedback are manually transferred back to Moodle.

## [06:00] Key Problems to Automate
Danila Danko:

Matching teams for peer review: This takes several hours and needs to be randomized to prevent collusion.

Tracking current grades: Currently, students only see their final grade at the end of the course.

Fetching assignment links: Manual copying of links from Google Drive into the spreadsheet.

Hosting: The solution must be self-hosted to maintain data confidentiality for Innopolis University.

## [12:00] Requirements for the New Application
Danila Danko:

For Students:

A dashboard showing their current personal and team grades at any point in the course.

Access to assignments and deadlines.

A clear interface showing which team's work they need to review.

Ability to upload their feedback as a PDF file.

For Instructors:

An admin panel to manage all teams and view all data.

Automated and randomized matching of teams for peer review.

Visual grade indicators (like color-coding in Sheets) to quickly identify underperforming teams.

A structured place to leave feedback notes for teams.

Technical Requirements:

Integration with Google Drive API to automatically fetch submission links and potentially host feedback files.

Optional future integration with Moodle for final grade submission.

Self-hosted deployment is mandatory.

Support for PDF uploads for peer review feedback.

## [17:00] User Roles and Permissions
Danila Danko:

Students: Access to their own data and their team's data.

Instructors: Full administrative access to the entire course, including all grades and settings.

## [22:00] Integrations
Danila Danko:

Google Drive: Essential for accessing submissions and using its built-in PDF comment features. An API key will be provided for a test drive.

Moodle: Desirable for syncing final grades, but not a primary requirement for the MVP.

Alternatives like Yandex Disk are possible only if they offer similar in-browser PDF commenting tools.

## [24:00] Success Metrics
Danila Danko:

Drastic reduction in time spent on manual tasks (e.g., from hours to minutes for peer review matching).

A convenient and clear interface for students and instructors to manage peer reviews.

Automated and randomized team matching.

The ability for students to see their current grades at any time during the course.