// import { mockGrades, mockStudent, mockStudents, mockTeams, reviewAssignments } from "./data/mock";
import AllReviews from "./instructor/reviews/AllReviews";
// import Dashboard from "./instructor/grading/Dashboard";
// import StudentDashboard from "./student/StudentDashboard";

function App() {
  return (
    <div className="App">
    {/* <StudentDashboard student={mockStudent}
            teams={mockTeams}
            students={mockStudents}
            grades={mockGrades}
            reviewAssignments={reviewAssignments} />   */}
        {/* <InstructorTeamGrading
      teams={teams}
      students={students}
      initialGrades={initialGrades}
    /> */}
        {/* <LoginPage/> */}
        {/* <Dashboard/> */}
        {<AllReviews />}
      </div>
  );
}

export default App;