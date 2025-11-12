export interface Student {
  id: string
  name: string
  email: string
  teamId: string
}

export interface Grade {
  studentId: string
  sprint: number
  assignment: 'A' | 'R' | 'I' | 'C'
  score: number
}

export interface Team {
  id: string
  name: string
  color: string
}

export interface PeerReview {
  id: string
  sprint: number
  reviewingTeamId: string
  reviewedTeamId: string
  reviewLink: string | null
  status: 'submitted' | 'pending'
  submittedAt: Date | null
}

export type AssignmentLetter = 'A' | 'R' | 'I' | 'C'

export type Assignments = Array<AssignmentLetter> 

export const assignments: Assignments = ['A', 'R', 'I', 'C'];

export const assignmentNames = {
    A: 'Assignment',
    R: 'Peer review',
    I: 'Implementation',
    C: 'Coordination'
  };
