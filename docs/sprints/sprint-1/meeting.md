---
layout: default
title: "meeting"
nav_order: 2
has_children: true
permalink: /sprints/sprint-1/
---

1. 06.11.2025

2. https://drive.google.com/file/d/1hPqRuNfEx_pL84KtUeuzXkwkg6PoFlRu/view?usp=sharing
https://drive.google.com/file/d/1Mu0pJumXJIgMNRQaWbZuRKczpX2s_gnB/view?usp=sharing

3. 
- Should the website design be adaptive to mobile devices for the MVP?
   Yes, it is suggested to make the design adaptive to mobile for the MVP.

- How is user login handled for students in the MVP?
   Students provide their email as login, validated to be in the Polis University domain. There is no password required; the site remembers the user after successful login using browser cache or cookies.

- What grades are displayed to students on their page?
   Students see their name, team, and grades for sprints. The grades shown are team grades (baseline) and possibly personal bonuses, but personal grades are not visible to other students.

- How are peer reviews managed in the platform?
   Students submit peer reviews as PDF files uploaded to Google Drive via the platform. Teams receive links to reviews submitted by other teams. Peer reviews are assigned automatically for each sprint, and instructors grade these reviews.

- Can instructors manually assign or change peer review assignments?
   For the MVP, instructors cannot manually change peer review assignments. Assignments are automatically set after team formation and remain fixed until the end of the course.

- How is file management handled for submissions and peer reviews?
   Students upload peer review PDFs through the platform, which stores them on Google Drive. Instructors download these files from Google Drive to grade and then upload feedback files back to Moodle. The platform may provide download buttons for convenience.

- What is the workflow for exporting grades to Moodle?
   Grades are exported in CSV format compatible with Moodle. Instructors manually upload grades and feedback files to Moodle. Peer review feedback files with instructor comments are also uploaded to Moodle for students to view.

- How is team formation handled in the platform?
   Students choose their teams from a list of projects and teams. Instructors confirm team formation, after which teams become locked. The first student in a team can edit the team name before confirmation.

- What quality attributes are considered for the platform?
   Quality attributes include usability (clear UI, quick response), performance (export grades within 10 seconds), reliability (persistent file storage), security (blocking unauthorized access), compatibility with Moodle, and maintainability.

- How is security ensured regarding access to instructor and student pages?
   Unauthorized users cannot access instructor dashboards or other students' pages. Access control is enforced via URLs and login status to prevent unauthorized access.

- What is the purpose of the peer-reviewed storage in the system?
   Peer-reviewed storage is where PDFs for peer reviews are submitted and stored, typically on Google Drive, allowing students to access their peer review materials through their dashboard.

- Are files stored directly on Moodle in this system?
   No, files are not stored on Moodle. Instructors upload files from Moodle to Google Drive, and the system imports them from there.

- What role does the student dashboard play?
   The student dashboard provides an interface for students to view peer review pairings, submit PDFs for peer review, and access links to their repositories such as GitHub or GitLab.

- Is the system designed to manage Single Sign-On (SSO) for users?
   No, the MVP does not manage SSO. The identity provider redirects users to the login page, and the system itself does not handle user authentication directly.

- What technologies are planned for the frontend and backend of the system?
   The frontend will use React, and the backend will use Plastic.

- What is the function of the Moodle exporter in the system?
   The Moodle exporter is used to export feedback and grades to Moodle, primarily interacted with by instructors through the dashboard.

- Will the system use zip files for exporting Moodle packages?
   No, the team decided not to use zip files for exporting Moodle packages due to inconvenience.

- What is the threshold of success for the MVP?
   The threshold of success includes completing the dashboard for managing grades and reviews, implementing login, and achieving a pure browser experience with zero FPS issues.

- Are all features discussed included in the MVP?
   No, some features are beyond the MVP scope and may be dropped or simplified to focus on essential functionality.

- What kind of architecture is being used for the backend services?
   The backend consists of multiple functions or classes, possibly modules, rather than microservices, including components like review service and grading engine.

4. Danila Danko, @system205, @rayderdo, @Vladimir

5. https://docs.google.com/document/d/1NJnPzX6ujV3icAgCSZ1CctVmSD8zC_OoR-zNgWReOKQ/edit?usp=sharing