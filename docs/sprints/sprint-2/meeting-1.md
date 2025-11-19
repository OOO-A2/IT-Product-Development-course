---
layout: default
nav_order: 1
parent: "Sprint 2"
title: "Meeting 1"
---

1. # Meeting Time: 13.10.2025 6 pm

2. # Recordings

## Audio recirding:
https://drive.google.com/file/d/1sMcfLFwssvVzKdsUf2Ff_Lz-7ZRRTaMK/view?usp=drive_link

## Video recording: 
https://drive.google.com/file/d/129HxIwH00XgQ3O8BlQLvEXQxYytHZ7A_/view?usp=sharing

3. # Action Points

## Immediate Changes (Frontend)
1. Dashboard Table Redesign
   - Change "Average" calculation to "Sum" for grades
   - Add "Extra" column for each week/sprint (labeled "E extra")
   - Make header columns fixed/non-movable (like Google Sheets)
   - Remove student column - show only teams by default
   - Implement collapse/expand functionality for teams:
     - Collapsed view: Show only team grades
     - Expanded view: Show individual student grades + individual grades column

2. Remove Redundant Pages
   - Eliminate the separate team grading page
   - Integrate all grading into the main dashboard table

## Backend & Integration
3. Grade Structure
   - Implement 5 grade types: A, R, I, C, Extra
   - Ensure group grades (A, R, I, C) are same for all team members
   - Individual grades only for "contribution to course"

4. Peer Review Management
   - Add 2 more columns to peer review table:
     - Assignment submission status
     - Review given by team
   - Add functionality for instructors to input document links
   - Add column for summary reviews

##  Medium Priority Features
5. Peer Feedback System
   - Implement peer feedback within teams (non-anonymous)
   - Add fields for teammates to grade and provide feedback to each other
   - Develop formula for grade calculation incorporating peer feedback

6. Student Submission Improvements
   - Add 2 more required fields for assignment and work grade submission
   - Make grade submission mandatory for review completion

## Discussion Needed
7. Clarification with Denis
   - Discuss individual grading approach for course contribution
   - Finalize extra points allocation per sprint
   - Confirm grade calculation formula

---

# Meeting Summary

## Meeting Overview
The meeting focused on reviewing the frontend design for a grading platform, primarily discussing the instructor dashboard, grade management system, and peer review functionality.

## Key Decisions & Discussions

### Grade Management System
- Structural Changes: Agreed to change from average calculation to sum-based grading
- Column Structure: Will include 5 grade types (A, R, I, C, Extra) with "E extra" column for each sprint/week
- Team vs Individual: Group grades (A, R, I, C) will be identical for all team members, with individual grades reserved only for course contribution
- Table Design: Will implement collapsible team rows where collapsed view shows team-level grades and expanded view reveals individual student grades

### User Interface Improvements
- Fixed Headers: Header columns will be frozen for better mobile and desktop experience
- Consolidated View: Eliminating separate team grading page in favor of integrated dashboard
- Mobile Optimization: Acknowledged horizontal scrolling needs for grade tables

### Peer Review Workflow
- Enhanced Columns: Adding columns for assignment submission and peer review status
- Document Management: Instructors need ability to input and manage Google Drive links for submissions
- Grade Submission: Students will be required to submit grades through the platform, not just in PDFs

### Future Features (Medium Priority)
- Peer Feedback System: Non-anonymous peer grading and feedback within teams
- Grade Calculation: Developing formulas that incorporate peer feedback into final grades
- Course Improvement Tracking: Potential column for course suggestions

### Technical Considerations
- Backend Integration: Current data is mock; need to wire with actual backend
- Export Functionality: CSV grade export considered lower priority since manual Moodle entry is preferred for group assignments
- Google Drive Integration: Platform may eventually handle automatic uploads, but manual link management acceptable for initial versions

## Next Steps
The team will proceed with implementing the collapsible table design, adding the required columns for peer reviews, and discussing open questions about individual grading with Denis. The peer feedback system is marked as medium priority for future iterations.

4. # Speakers:
Danila Danko, @system205, @rayderdo, @dar_verda

5. # Meeting transcription
https://docs.google.com/document/d/1UHC-vz4FsdHnOoYdh1L_B-EoC5kLrkvc5uuGyZvDBz4/edit?usp=sharing
