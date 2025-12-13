---
layout: default
title: "Script"
nav_order: 2
parent: "Sprint 6"
---

# Meeting Script: Backend Integration Demo

## Meeting Purpose
Demonstrate: Live backend running in Docker with frontend integration  
Audience: Customer, system205

---

## 1. Opening & Context 
"Today we'll show you the backend system now running in Docker with actual frontend integration. Previously we showed prototypes - now most pages and actions send real requests to our backend API."

Quick agenda:
- Show backend running in Docker
- Demonstrate key API endpoints
- Show frontend-backend integration
- Discuss next steps

---

## 2. Docker Backend Demonstration
*[Share terminal/VS Code screen]*

Key points to highlight:
- ✅ Backend runs in isolated Docker container
- ✅ Database connected and responding
- ✅ API endpoints are live and accessible
- ✅ Environment configured for development/production

---

## 3. Frontend-Backend Integration
*[Switch to browser with frontend application]*

### Live interactions to demonstrate:
1. Dashboard loading: "This now fetches real team/student data from backend"
2. Grade submission: "When TA enters a grade, it sends POST to /api/grades"
3. Peer review submission: "PDF uploads and metadata go to backend storage"
4. Data persistence: "Refresh page to show data persists from backend"

---

## 4. Key API Endpoints Working
List endpoints now functional:
- GET /api/teams - Returns all teams with members
- POST /api/grades - Submits new grades
- GET /api/peer-reviews - Fetches review status
- POST /api/upload - Handles file uploads
- GET /api/health - System status check

Customer check: "Do these endpoints cover the main actions you expect TAs and students to perform?"

---

## 5. Next Steps & Questions
### Immediate next:
- Load testing with multiple concurrent users
- Add authentication layer
- Prepare for production deployment

### Questions for customer:
- "Are there specific workflows you'd like us to test with this integrated system?"
- "What data volumes should we prepare for (teams, students, submissions)?"

---

## Closing
Summary: "We now have a working backend-frontend system where most user actions trigger real API calls. This moves us from prototype to functional application."
