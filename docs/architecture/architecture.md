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
- [Architectural Decisions](#architectural-decisions)
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
### Architectural Decisions

| Driver | Decision | Rationale | Discarded Alternatives |
|--------|----------|-----------|------------------------|
| PRIV-1: Data privacy & on-prem constraint | **Self-hosted deployment via Docker + docker-compose** | - Keeps grades/files on university hardware<br>- Simple ops model for TA/IT to run locally<br>- Reproducible environments | - Managed cloud PaaS: violates “no external server” requirement<br>- Kubernetes: overkill/ops burden for MVP |
| SIMP-1: Ship fast, small team | **Monolithic FastAPI app (Python 3.11) with SQLAlchemy/Alembic & PostgreSQL** | - Minimal moving parts; easier debugging and testing<br>- Strong ecosystem, known by team<br>- Alembic gives safe schema evolution | - Microservices: too much infra/coordination overhead<br>- NoSQL-first: weak relational modeling for grades/teams |
| AUTH-1: Low-friction, simple auth | **Email + password login with signed session cookies (bcrypt/argon2 hashing)** | Straightforward UX; easy to implement and audit; no external IdP; secure with proper hashing and session TTL/rotation. | Magic-link/passwordless (extra email flow and deliverability concerns); University SSO/OAuth (bureaucratic setup, not MVP-ready). |
| FILE-1: All artifacts in external storage | **Storage Adapter abstraction over Google Drive / Yandex / Local** | - One code path for import/upload/download<br>- Pluggable provider; avoids vendor lock-in<br>- Aligns with “all files live in storage” rule | - Binding to a single provider SDK: hard to switch later<br>- Storing files in DB: bloats DB, complicates backups |
| INT-1: LMS integration scope control | **Export Moodle-compatible CSV (manual upload), no Moodle API in MVP** | - Meets core need with minimal risk<br>- Works offline/self-hosted; fewer secrets/SSL hurdles<br>- Faster to implement & support | - Direct Moodle API sync: higher complexity & failure modes<br>- Spreadsheet copy/paste: error-prone, time-consuming |
