---
layout: default
title: "Architecture"
nav_order: 2
has_children: true
permalink: /architecture/
---

## Table of Contents
- [Interactive Prototype](#interactive-prototype)
- [Context Diagram](#context-diagram)
- [Use Case Diagram](#use-case-diagram)
- [Component Diagram](#component-diagram)
- [Sequence Diagrams](#sequence-diagrams)
## Interactive Prototype
[Open the Figma prototype](https://www.figma.com/proto/hk0bqFHLPL5NcOpYbwDr6x/Untitled?node-id=0-1&t=UeW5SXTSeFen4Ni6-1)
## Context Diagram
![Context diagram](assets/context_diagram.png)
| Actor / System                              | Description                                                         | Key Interactions                                                                                 |
|---------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Student / Team                              | Students working in teams on course projects and peer reviews.      | Access PeerPilot UI; view team standing and (later) personal bonuses; download submissions; upload peer review PDFs. |
| Instructor / TA                             | Course staff managing teams, grades, and peer reviews.              | Use instructor dashboard; lock teams; generate pairings; import submissions; adjust bonuses; export grades.          |
| Moodle                                      | Official LMS used by the university.                               | Receives CSV exports produced by PeerPilot (manual upload by instructors; no direct API in MVP).                     |
| Storage Provider (Google Drive / Yandex / Local) | External storage used as file backend.                          | Provides submission files for import; stores and serves all submission and peer review PDFs via Storage Adapter.     |
## Use Case Diagram
![Use case diagram](assets/use_case_diagram.png)
| Actor           | Description                                                             | Main Goals                                                                                          |
|----------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Student / Team | Authenticated course participant acting as part of a project team.      | See team standing and personal standing; know who to review; download target PDFs; upload review PDFs; track review status. |
| Instructor / TA| Authenticated staff responsible for course administration and grading.  | Set up/lock teams; see all-students gradebook; auto-generate pairings; import submissions; set bonuses; monitor reviews; export grades CSV. |
| Storage Provider| External file storage configured for the deployment (Drive/Yandex/Local). | Reliably store and serve all submission and peer review PDFs requested by PeerPilot services.      |
### Component Diagram
![Component diagram](assets/component_diagram.png)
| Component                          | Responsibilities |
|-----------------------------------|------------------|
| Web App (Student & Instructor UI) | Single web frontend for both roles; renders student dashboard (standing, targets, links) and instructor gradebook/controls; calls API Backend. |
| API Backend                       | Central entrypoint; handles authentication/authorization checks, validates requests, and routes to domain services; exposes REST endpoints. |
| Auth & Session Service            | Implements passwordless email-link login; manages sessions; assigns roles (student/instructor) based on configured course data. |
| Team & User Management            | Stores users, teams, and memberships; supports team selection by students, approval and locking by instructors; provides mappings for grading and pairings. |
| Peer Review & Matching Service    | Generates cyclic/random peer review assignments after teams are locked; tracks who reviews whom per sprint; records review submission status. |
| Grading Service                   | Applies grading rules to team results and bonus/extra points; computes per-student standing for dashboards and for CSV export. |
| Storage Adapter                   | Provides unified API to the configured Storage Provider; imports submission files; uploads and reads all review PDFs; ensures correct paths and access. |
| Export Service (CSV for Moodle)   | Builds Moodle-compatible CSV (and related exports) from Grading/Team data; used by instructors to upload grades into Moodle manually. |
| Email Service (external)          | (External) Sends magic login links triggered by Auth & Session Service; no general notifications in MVP. |
| Storage Provider (external)       | (External) Durable storage for all submission and review PDFs; accessed only via Storage Adapter. |
### Sequence Diagrams
![Sequence diagram](assets/sequence_1_diagram.png)
![Sequence diagram](assets/sequence_2_diagram.png)
