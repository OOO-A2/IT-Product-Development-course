import type { Grade, PeerReview, Project, Student, Team, User, UserRole } from "../types/types";

export const mockUsers: User[] = [
    {
        id: '1',
        name: 'Professor Denis',
        email: 'denis@innopolis.ru',
        role: 'instructor' as UserRole,
        studentId: '1',
        teamId: ''
    },
    {
        id: '2',
        name: 'Arsen',
        email: 'arsen@innopolis.university',
        role: 'student' as UserRole,
        studentId: '1',
        teamId: 't1'
    }
];

export const mockStudent: Student = {
    id: 's1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    teamId: 't1'
};

export const mockTeams: Array<Team> = [
    { id: 't1', name: 'Team Alpha', color: 'bg-blue-500', students: [], isLocked: true },
    { id: 't2', name: 'Team Beta', color: 'bg-yellow-500', students: [], isLocked: true },
    { id: 't3', name: 'Team Gamma', color: 'bg-purple-500', students: [], isLocked: true },
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
    { studentId: 's1', sprint: 1, assignment: 'TE', score: 50 },
    { studentId: 's1', sprint: 1, assignment: 'E', score: 1 },
    { studentId: 's2', sprint: 1, assignment: 'A', score: 85 },
    { studentId: 's2', sprint: 1, assignment: 'R', score: 90 },
    { studentId: 's2', sprint: 1, assignment: 'I', score: 88 },
    { studentId: 's2', sprint: 1, assignment: 'C', score: 92 },
    { studentId: 's2', sprint: 1, assignment: 'TE', score: 50 },
    { studentId: 's2', sprint: 1, assignment: 'E', score: 5 },
    // Sprint 2
    { studentId: 's1', sprint: 2, assignment: 'A', score: 88 },
    { studentId: 's1', sprint: 2, assignment: 'R', score: 0 }, // Not submitted yet
    { studentId: 's1', sprint: 2, assignment: 'I', score: 86 },
    { studentId: 's1', sprint: 2, assignment: 'C', score: 94 },
    // Add more grades...
]

export const reviewAssignments: Array<PeerReview> = [
    {
        id: 'pr1',
        sprint: 1,
        reviewingTeamId: 't1',
        reviewedTeamId: 't2',
        reviewedTeamReportLink: 'https://drive.google.com/file/d/abc123/view',
        summaryPDFLink: 'https://drive.google.com/file/d/abc123/view',
        commentsPDFLink: 'https://drive.google.com/file/d/abc123/view',
        status: 'graded',
        submittedAt: new Date('2024-01-15'),
        suggestedGrades: {
            assignment: 1,
            iteration: 3
        }
    },
    {
        id: 'pr2',
        sprint: 2,
        reviewingTeamId: 't1',
        reviewedTeamId: 't3',
        reviewedTeamReportLink: 'https://drive.google.com/file/d/abc123/view',
        summaryPDFLink: 'https://drive.google.com/file/d/abc123/view',
        status: 'submitted',
        submittedAt: new Date('2024-01-15'),
        suggestedGrades: {
            assignment: 13,
            iteration: 33
        }
    },
    {
        id: 'pr3',
        sprint: 3,
        reviewingTeamId: 't1',
        reviewedTeamId: 't5',
        status: 'pending',
        submittedAt: null,
        dueDate: new Date(),
    },
]

export const mockReviews: Array<PeerReview> = [
    {
        id: 'pr1',
        sprint: 1,
        reviewingTeamId: 't1',
        reviewedTeamId: 't2',
        summaryPDFLink: 'https://drive.google.com/file/d/abc123/view',
        status: 'submitted',
        submittedAt: new Date('2024-01-15'),
        suggestedGrades: {
            assignment: 13,
            iteration: 33
        }
    },
    {
        id: 'pr2',
        sprint: 1,
        reviewingTeamId: 't2',
        reviewedTeamId: 't3',
        summaryPDFLink: '',
        status: 'pending',
        submittedAt: null,
    },
    {
        id: 'pr3',
        sprint: 1,
        reviewingTeamId: 't3',
        reviewedTeamId: 't1',
        summaryPDFLink: 'https://drive.google.com/file/d/def456/view',
        status: 'submitted',
        submittedAt: new Date('2024-01-16'),
        suggestedGrades: {
            assignment: 13,
            iteration: 33
        }
    },
]

export const mockSprints = [1, 2, 3, 4]

export const mockProjects: Array<Project> = [
    {
        "id": "c7bb38bb-6221-4228-9bb6-ab92c5ef7b1c",
        "name": "Course management system",
        "maxTeams": 3,
        "maxStudentsPerTeam": 3,
        "teams": [
            {
                "id": "d56b4c61-dd4f-4539-888b-ee5c55c6ac4a",
                "name": "Team 1",
                "students": [],
                "isLocked": true
            },
            {
                "id": "3651d899-710d-4fbd-8344-3326d3802ffc",
                "name": "Team 2",
                "students": [],
                "isLocked": false
            },
            {
                "id": "04f48ee7-1b9b-4fa9-bda0-d59f306312ff",
                "name": "Team 3",
                "students": [],
                "isLocked": false
            }
        ]
    }
]


export async function populateServerWithMockData() {
  const BASE_URL = 'http://localhost:8000';
  
  try {
    console.log('Starting to populate server with mock data...');
    
    // 1. First create teams
    console.log('Creating teams...');
    const teamIds = new Map(); // Store created team IDs
    
    for (const team of mockTeams) {
      const teamData = {
        name: team.name,
        color: team.color
        // Note: isLocked might be a server-side property or needs separate update
      };
      
      const response = await fetch(`${BASE_URL}/teams/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(teamData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create team ${team.name}`);
      }
      
      const createdTeam = await response.json();
      teamIds.set(team.id, createdTeam.id);
      console.log(`Created team: ${team.name} with ID: ${createdTeam.id}`);
    }
    
    // 2. Create students and assign them to teams
    console.log('Creating students...');
    const studentIds = new Map();
    
    for (const student of mockStudents) {
      const studentData = {
        name: student.name,
        email: student.email,
        teamId: teamIds.get(student.teamId) || null
      };
      
      const response = await fetch(`${BASE_URL}/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(studentData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create student ${student.name}`);
      }
      
      const createdStudent = await response.json();
      studentIds.set(student.id, createdStudent.id);
      console.log(`Created student: ${student.name} with ID: ${createdStudent.id}`);
    }
    
    // 3. Create grades for students
    console.log('Creating grades...');
    
    for (const grade of mockGrades) {
      const gradeData = {
        studentId: studentIds.get(grade.studentId),
        sprint: grade.sprint,
        assignment: grade.assignment,
        score: grade.score
      };
      
      const response = await fetch(`${BASE_URL}/grades/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(gradeData)
      });
      
      if (!response.ok) {
        console.warn(`Failed to create grade for student ${grade.studentId}, sprint ${grade.sprint}, assignment ${grade.assignment}`);
        // Continue with other grades even if one fails
      }
    }
    
    // 4. Create peer reviews
    console.log('Creating peer reviews...');
    
    for (const review of [...reviewAssignments, ...mockReviews]) {
      // Filter out duplicates based on ID
      if (review.id === 'pr1' || review.id === 'pr2' || review.id === 'pr3') {
        const reviewData = {
          sprint: review.sprint,
          reviewingTeamId: teamIds.get(review.reviewingTeamId),
          reviewedTeamId: teamIds.get(review.reviewedTeamId),
          status: review.status,
          submittedAt: review.submittedAt ? review.submittedAt.toISOString() : null,
          summaryPDFLink: review.summaryPDFLink || null,
          commentsPDFLink: review.commentsPDFLink || null,
          reviewedTeamReportLink: review.reviewedTeamReportLink || null,
          suggestedGrades: review.suggestedGrades || null
        };
        
        const response = await fetch(`${BASE_URL}/peer-reviews/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(reviewData)
        });
        
        if (!response.ok) {
          console.warn(`Failed to create peer review ${review.id}`);
        } else {
          console.log(`Created peer review for sprint ${review.sprint}`);
        }
      }
    }
    
    // 5. Create projects (if endpoint exists)
    console.log('Creating projects...');
    
    for (const project of mockProjects) {
      const projectData = {
        name: project.name,
        maxTeams: project.maxTeams,
        max_students_per_team: project.maxStudentsPerTeam
        // Note: teams array might need to be created separately
      };
      
      // Since projects endpoint isn't shown in the API, we'll attempt it
      // but wrap in try-catch in case endpoint doesn't exist
      try {
        const response = await fetch(`${BASE_URL}/projects/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
          // const createdProject = await response.json();
          console.log(`Created project: ${project.name}`);
          
          // If project creation includes team assignment, you might need additional API calls
          // to assign existing teams to this project
        }
      } catch {
        console.log('Projects endpoint might not be implemented yet');
      }
    }
    
    console.log('Server population completed successfully!');
    console.log(`Created: ${teamIds.size} teams, ${studentIds.size} students, ${mockGrades.length} grades`);
    
    // Return mapping of original mock IDs to actual server IDs
    return {
      teamIdMapping: Object.fromEntries(teamIds),
      studentIdMapping: Object.fromEntries(studentIds)
    };
    
  } catch (error) {
    console.error('Error populating server:', error);
    throw error;
  }
}

// Usage:
// populateServerWithMockData()
//   .then(mapping => console.log('Server populated with IDs:', mapping))
//   .catch(error => console.error('Failed to populate server:', error));