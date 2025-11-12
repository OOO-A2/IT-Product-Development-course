import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import Login from './auth/LoginPage.tsx'
// import Dashboard from './instructor/grading/Dashboard.tsx'
// import AllReviews from './instructor/reviews/AllReviews.tsx'
import StudentDashboard from './student/StudentDashboard.tsx'
import type { Grade, PeerReview } from './types/types.tsx';

const student = {
  id: 's1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  teamId: 't1'
};

const teams = [
  { id: 't1', name: 'Team Alpha', color: 'bg-blue-500' },
  { id: 't2', name: 'Team Beta', color: 'bg-green-500' },
];

const students = [   { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', teamId: 't1' },
    { id: 's2', name: 'Bob Smith', email: 'bob@example.com', teamId: 't1' },
    { id: 's3', name: 'Carol Williams', email: 'carol@example.com', teamId: 't1' },
    { id: 's4', name: 'David Brown', email: 'david@example.com', teamId: 't2' },
    { id: 's5', name: 'Emma Davis', email: 'emma@example.com', teamId: 't2' },
    { id: 's6', name: 'Frank Miller', email: 'frank@example.com', teamId: 't2' },
    { id: 's7', name: 'Grace Wilson', email: 'grace@example.com', teamId: 't3' },
    { id: 's8', name: 'Henry Moore', email: 'henry@example.com', teamId: 't3' },]

const grades: Array<Grade> = [
    // Sprint 1
    { studentId: 's1', sprint: 1, assignment: 'A', score: 85 },
    { studentId: 's1', sprint: 1, assignment: 'R', score: 90 },
    { studentId: 's1', sprint: 1, assignment: 'I', score: 88 },
    { studentId: 's1', sprint: 1, assignment: 'C', score: 92 },
    // Sprint 2
    { studentId: 's1', sprint: 2, assignment: 'A', score: 88 },
    { studentId: 's1', sprint: 2, assignment: 'R', score: 0 }, // Not submitted yet
    { studentId: 's1', sprint: 2, assignment: 'I', score: 86 },
    { studentId: 's1', sprint: 2, assignment: 'C', score: 94 },
    // Add more grades...
  ]

const reviewAssignments: Array<PeerReview> = [
    {
      id: 'pr1',
      sprint: 1,
      reviewingTeamId: 't1',
      reviewedTeamId: 't2',
      reviewLink: 'https://drive.google.com/file/d/abc123/view',
      status: 'submitted',
      submittedAt: new Date('2024-01-15'),
      dueDate: null,
    },
    {
      id: 'pr2',
      sprint: 2,
      reviewingTeamId: 't1',
      reviewedTeamId: 't3',
      reviewLink: '',
      status: 'pending',
      submittedAt: null,
      dueDate: new Date(),
    },
  ]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudentDashboard student={student}
      teams={teams}
      students={students}
      grades={grades}
      reviewAssignments={reviewAssignments}/>
  </StrictMode>,
)
