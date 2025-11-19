import type { Grade, PeerReview, Student } from "../types/types";

export const mockStudent: Student = {
    id: 's1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    teamId: 't1'
};

export const mockTeams = [
    { id: 't1', name: 'Team Alpha', color: 'bg-blue-500' },
    { id: 't2', name: 'Team Beta', color: 'bg-yellow-500' },
    { id: 't3', name: 'Team Gamma', color: 'bg-purple-500' },
];

export const mockStudents: Array<Student> = [
    { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', teamId: 't1' },
    { id: 's2', name: 'Bob Smith', email: 'bob@example.com', teamId: 't1' },
    { id: 's3', name: 'Carol Williams', email: 'carol@example.com', teamId: 't2' },
    { id: 's4', name: 'David Brown', email: 'david@example.com', teamId: 't2' },
    { id: 's5', name: 'Emma Davis', email: 'emma@example.com', teamId: 't2' },
    { id: 's6', name: 'Frank Miller', email: 'frank@example.com', teamId: 't2' },
    { id: 's7', name: 'Grace Wilson', email: 'grace@example.com', teamId: 't3' },
    { id: 's8', name: 'Henry Moore', email: 'henry@example.com', teamId: 't3' },
]

export const mockGrades: Array<Grade> = [
    // Sprint 1
    { studentId: 's1', sprint: 1, assignment: 'A', score: 85 },
    { studentId: 's1', sprint: 1, assignment: 'R', score: 90 },
    { studentId: 's1', sprint: 1, assignment: 'I', score: 88 },
    { studentId: 's1', sprint: 1, assignment: 'C', score: 92 },
    { studentId: 's1', sprint: 1, assignment: 'E', score: 1 },
    { studentId: 's2', sprint: 1, assignment: 'A', score: 85 },
    { studentId: 's2', sprint: 1, assignment: 'R', score: 90 },
    { studentId: 's2', sprint: 1, assignment: 'I', score: 88 },
    { studentId: 's2', sprint: 1, assignment: 'C', score: 92 },
    { studentId: 's2', sprint: 1, assignment: 'E', score: 5 },
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