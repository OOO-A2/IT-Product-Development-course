import { useEffect, useRef, useState } from 'react';
import { Save, Calendar, Award, Users, ExternalLink, RefreshCw } from 'lucide-react';
import { assignmentNames, assignments, type AssignmentLetter, type Grade, type Student, type Team } from '../../types/types';
import TeamFilter from './TeamFilter';
import { Link, useSearchParams } from 'react-router-dom';
import { getGradeColor100, getGradeColor500 } from '../../utils/utils';
import { apiService } from '../../api/instructorApi';


export default function InstructorGrading() {
  // State for data from backend
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  // State for pending changes
  const [pendingGradeUpdates, setPendingGradeUpdates] = useState<Grade[]>([]);
  
  // UI state
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search params for URL state
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize selectedTeam from URL
  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    const teamNameFromUrl = searchParams.get('team');
    return teamNameFromUrl || 'all';
  });

  // Update URL with team name
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (selectedTeam === 'all') {
      newParams.delete('team');
    } else {
      newParams.set('team', selectedTeam);
    }

    setSearchParams(newParams, { replace: true });
  }, [selectedTeam, setSearchParams, searchParams]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        let [teamsData, studentsData, gradesData] = await Promise.all([
          apiService.fetchTeams(),
          apiService.fetchStudents(),
          apiService.fetchGrades(),
        ]);

        teamsData = !teamsData ? [] : teamsData
        studentsData = !studentsData ? [] : studentsData
        gradesData = !gradesData ? [] : gradesData
        
        setTeams(teamsData);
        setStudents(studentsData);
        setGrades(gradesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sprints = [1, 2, 3, 4];

  // Calculate team averages for assignments
  const getTeamAssignmentGrade = (teamId: string, sprint: number, assignment: AssignmentLetter): number => {
    if (assignment === 'E') return 0;
    const teamStudents = students.filter(s => s.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    const teamGrades = teamStudents.map(student =>
      grades.find(g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment)?.score ?? 0
    );

    return Math.round(teamGrades.reduce((acc, score) => acc + score, 0) / teamGrades.length);
  };

  // Get individual student grade
  const getStudentGrade = (studentId: string, sprint: number, assignment: AssignmentLetter): number => {
    const grade = grades.find(
      g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
    );
    return grade?.score ?? 0;
  };

  // Update team assignment grade (applies to all team members)
  const updateTeamAssignmentGrade = async (teamId: string, sprint: number, assignment: AssignmentLetter, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    const teamStudents = students.filter(s => s.teamId === teamId);

    const updatedGrades: Grade[] = [];

    teamStudents.forEach(student => {
      const existingGrade = grades.find(
        g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment
      );

      const updatedGrade: Grade = {
        studentId: student.id,
        sprint,
        assignment,
        score: validScore,
        ...(existingGrade && { id: existingGrade.id }), // Include ID if exists for update
      };

      updatedGrades.push(updatedGrade);
    });

    // Update local state immediately for UI responsiveness
    setGrades(prev => {
      const newGrades = [...prev];
      
      updatedGrades.forEach(updatedGrade => {
        const existingIndex = newGrades.findIndex(
          g => g.studentId === updatedGrade.studentId && 
               g.sprint === updatedGrade.sprint && 
               g.assignment === updatedGrade.assignment
        );

        if (existingIndex >= 0) {
          newGrades[existingIndex] = updatedGrade;
        } else {
          newGrades.push(updatedGrade);
        }
      });

      return newGrades;
    });

    // Track pending updates
    setPendingGradeUpdates(prev => [...prev, ...updatedGrades]);
    setUnsavedChanges(true);
  };

  // Update individual student grade
  const updateStudentGrade = (studentId: string, sprint: number, assignment: AssignmentLetter, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));

    const updatedGrade: Grade = {
      studentId,
      sprint,
      assignment,
      score: validScore,
    };

    // Find existing grade for ID
    const existingGrade = grades.find(
      g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
    );
    
    if (existingGrade?.id) {
      updatedGrade.id = existingGrade.id;
    }

    // Update local state
    setGrades(prev => {
      const existingIndex = prev.findIndex(
        g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedGrade;
        return updated;
      } else {
        return [...prev, updatedGrade];
      }
    });

    // Track pending updates
    setPendingGradeUpdates(prev => [...prev, updatedGrade]);
    setUnsavedChanges(true);
  };

  // Calculate team sprint sum
  const calculateTeamSprintSum = (teamId: string, sprint: number): number => {
    const sum = assignments.reduce((acc, assignment) =>
      acc + getTeamAssignmentGrade(teamId, sprint, assignment), 0
    );
    return sum;
  };

  // Calculate student sprint sum
  const calculateStudentSprintSum = (studentId: string, sprint: number): number => {
    const scores = assignments.map(a => getStudentGrade(studentId, sprint, a));
    return scores.reduce((acc, score) => acc + score, 0);
  };

  // Calculate team overall average
  const calculateTeamOverallAverage = (teamId: string): number => {
    const sprintSums = sprints.map(sprint => calculateTeamSprintSum(teamId, sprint));
    const validSums = sprintSums.filter(sum => sum > 0);
    return validSums.length > 0
      ? Math.round(validSums.reduce((acc, sum) => acc + sum, 0))
      : 0;
  };

  // Calculate student overall average
  const calculateStudentSum = (studentId: string): number => {
    const sprintSums = sprints.map(sprint => calculateStudentSprintSum(studentId, sprint));
    const validSums = sprintSums.filter(sum => sum > 0);
    return validSums.length > 0
      ? Math.round(validSums.reduce((acc, sum) => acc + sum, 0))
      : 0;
  };

  // Calculate team total grade
  const calculateTeamTotalGrade = (teamId: string, sprint: number): number => {
    const teamStudents = students.filter(s => s.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    const assignmentTotals = assignments.map(assignment => {
      const assignmentScores = teamStudents.map(student =>
        assignment === 'E' ? 0 : getStudentGrade(student.id, sprint, assignment)
      );
      return assignmentScores.reduce((acc, score) => acc + score, 0) / assignmentScores.length;
    });

    return Math.round(assignmentTotals.reduce((acc, avg) => acc + avg, 0));
  };

  // Save changes to backend
  const handleSave = async () => {
    if (pendingGradeUpdates.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      // Send all pending updates to backend
      await apiService.saveGrades(pendingGradeUpdates);
      
      // Clear pending updates
      setPendingGradeUpdates([]);
      setUnsavedChanges(false);
      
      // Optional: Refresh data from server to ensure consistency
      const updatedGrades = await apiService.fetchGrades();
      setGrades(updatedGrades);
      
      // Show success message
      alert('Grades saved successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save grades';
      setError(errorMessage);
      alert(`Error saving grades: ${errorMessage}`);
      console.error('Error saving grades:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Refresh data from server
  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [teamsData, studentsData, gradesData] = await Promise.all([
        apiService.fetchTeams(),
        apiService.fetchStudents(),
        apiService.fetchGrades(),
      ]);
      
      setTeams(teamsData);
      setStudents(studentsData);
      setGrades(gradesData);
      setPendingGradeUpdates([]);
      setUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      console.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teams or get specific team students
  const displayData = selectedTeam === 'all'
    ? teams
    : students.filter(student => student.teamId == selectedTeam);

  const isTeamView = selectedTeam === 'all';

  // Scroll persistence
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Save scroll position
  const saveScrollPosition = () => {
    if (tableContainerRef.current) {
      const scrollPosition = {
        scrollLeft: tableContainerRef.current.scrollLeft,
        scrollTop: tableContainerRef.current.scrollTop,
      };
      localStorage.setItem('tableScroll', JSON.stringify(scrollPosition));
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    const saved = localStorage.getItem('tableScroll');
    if (saved && tableContainerRef.current) {
      const { scrollLeft } = JSON.parse(saved);

      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollLeft = scrollLeft;
        }
      }, 0);
    }
  };

  // Set up scroll listener
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;

    let scrollTimeout: number;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(saveScrollPosition, 100);
    };

    tableContainer.addEventListener('scroll', handleScroll);
    restoreScrollPosition();

    return () => {
      tableContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md">
          <div className="text-red-600 font-semibold mb-4">Error Loading Data</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Grading Dashboard</h1>
                <p className="text-sm text-gray-500">
                  {isTeamView ? 'Team Averages View' : 'Team Members View'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={!unsavedChanges || isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              
              {unsavedChanges && (
                <span className="text-orange-600 font-medium">
                  {pendingGradeUpdates.length} unsaved change{pendingGradeUpdates.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TeamFilter 
              teams={teams} 
              selectedTeam={selectedTeam} 
              setSelectedTeam={setSelectedTeam} 
            />
            <div className="text-sm text-gray-500">
              {isTeamView ? (
                <span>Showing {teams.length} team{teams.length !== 1 ? 's' : ''}</span>
              ) : (
                <span>Showing {displayData.length} student{displayData.length !== 1 ? 's' : ''} from selected team</span>
              )}
            </div>
          </div>
        </div>

        {/* Grading Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div ref={tableContainerRef} className="overflow-x-auto max-h-[70vh]">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  {/* Team/Student Column */}
                  <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r"
                    rowSpan={2}
                  >
                    {isTeamView ? 'Team' : 'Student'}
                  </th>

                  {/* Sprint Headers */}
                  {sprints.map(sprint => (
                    <th
                      key={sprint}
                      className="px-2 py-3 text-center border-l border-gray-200 group"
                      colSpan={isTeamView ? assignments.length : 3}
                    >
                      <Link
                        to={`/instructor/reviews?sprint=${sprint}`}
                        className="block bg-gray-50 hover:bg-blue-50 rounded-lg p-3 border-2 border-transparent hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-blue-800 uppercase tracking-wider">
                            Sprint {sprint}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                        </div>
                      </Link>
                    </th>
                  ))}

                  {/* Overall Column */}
                  <th
                    className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l border-gray-200"
                    rowSpan={2}
                  >
                    Overall
                  </th>
                </tr>

                {/* Assignment Type Headers */}
                <tr>
                  {sprints.flatMap(sprint => {
                    if (isTeamView) {
                      // Team View: A, R, I, C, Sum
                      return [
                        ...assignments
                          .filter(assignment => assignment !== 'E')
                          .map(assignment => (
                            <th
                              key={`${sprint}-${assignment}`}
                              className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 first:border-l-0"
                            >
                              <div className="flex flex-col items-center">
                                <span>{assignment}</span>
                                <span className="text-xs font-normal text-gray-400 normal-case">
                                  {assignment === 'TE' ? 'Extra' : assignmentNames[assignment]}
                                </span>
                              </div>
                            </th>
                          )),
                        <th
                          key={`${sprint}-sum`}
                          className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 bg-gray-100"
                        >
                          Sum
                        </th>
                      ];
                    } else {
                      // Individual Student View
                      return [
                        <th
                          key={`${sprint}-assignments-total`}
                          className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 first:border-l-0"
                        >
                          <div className="flex flex-col items-center">
                            <span>Total</span>
                            <span className="text-xs font-normal text-gray-400 normal-case">
                              Team grade
                            </span>
                          </div>
                        </th>,
                        <th
                          key={`${sprint}-extra`}
                          className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
                        >
                          <div className="flex flex-col items-center">
                            <span>Extra</span>
                            <span className="text-xs font-normal text-gray-400 normal-case">
                              Individual
                            </span>
                          </div>
                        </th>,
                        <th
                          key={`${sprint}-sum`}
                          className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 bg-gray-100"
                        >
                          Sum
                        </th>
                      ];
                    }
                  })}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((item) => {
                  if (isTeamView) {
                    // Team View
                    const team = item as Team;
                    const teamStudents = students.filter(s => s.teamId === team.id);
                    const overallAverage = calculateTeamOverallAverage(team.id);

                    return (
                      <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                        {/* Team Info */}
                        <td className="px-1 py-4 text-center whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                          <div className="flex flex-col items-center space-y-1">
                            <button
                              onClick={() => setSelectedTeam(team.id)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${team.color} transform hover:scale-105 hover:text-black transition-transform duration-200`}
                            >
                              {team.name}
                            </button>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              <span>{teamStudents.length} members</span>
                            </div>
                          </div>
                        </td>

                        {/* Team Assignment Grades */}
                        {sprints.flatMap(sprint => {
                          const sprintSum = calculateTeamSprintSum(team.id, sprint);

                          return [
                            ...assignments.map(assignment => {
                              if (assignment === 'E') return null;
                              const cellId = `team-${team.id}-${sprint}-${assignment}`;
                              const score = getTeamAssignmentGrade(team.id, sprint, assignment);
                              const isEditing = editingCell === cellId;

                              return (
                                <td
                                  key={`${sprint}-${assignment}`}
                                  className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100"
                                >
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={score}
                                      onChange={(e) => updateTeamAssignmentGrade(team.id, sprint, assignment, Number(e.target.value))}
                                      onBlur={() => setEditingCell(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                          setEditingCell(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-12 px-1 py-1 text-center border-2 border-blue-500 rounded focus:outline-none text-sm"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingCell(cellId)}
                                      className={`w-12 px-1 py-1 rounded font-medium transition-colors text-sm ${getGradeColor100(score)}`}
                                    >
                                      {score || '-'}
                                    </button>
                                  )}
                                </td>
                              );
                            }).filter(Boolean),
                            // Team Sprint Sum
                            <td
                              key={`${sprint}-sum`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50"
                            >
                              <button disabled className={`inline-flex items-center px-3 py-1 rounded text-sm font-semibold ${getGradeColor500(sprintSum)}`}>
                                {sprintSum || '-'}
                              </button>
                            </td>
                          ];
                        })}

                        {/* Team Overall Average */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor500(overallAverage)}`}>
                            {overallAverage || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  } else {
                    // Team Members View
                    const student = item as Student;
                    const team = teams.find(t => t.id === student.teamId);
                    const overallSum = calculateStudentSum(student.id);
                    const teamStudents = students.filter(s => s.teamId === student.teamId);
                    const studentIndex = teamStudents.findIndex(s => s.id === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        {/* Student Info */}
                        <td className="px-1 py-4 text-left whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{student.name}</span>
                            <span className="text-xs text-gray-500">{student.email}</span>
                            <span className={`inline-flex items-center  max-w-[150px] px-2 py-0.5 rounded-full text-xs font-medium text-white ${team?.color} mt-1`}>
                              {team?.name}
                            </span>
                          </div>
                        </td>

                        {/* Student Grades */}
                        {sprints.flatMap(sprint => {
                          const teamTotal = calculateTeamTotalGrade(team?.id || '', sprint);
                          const individualExtra = getStudentGrade(student.id, sprint, 'E');
                          const sprintSum = teamTotal + individualExtra;

                          return [
                            <td
                              key={`${sprint}-team-total`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100"
                            >
                              {studentIndex === 0 ? (
                                <button
                                  disabled
                                  className={`w-16 px-2 py-1 rounded font-medium transition-all duration-200 transform hover:scale-105 text-sm ${getGradeColor500(teamTotal)}`}
                                  title="Team Total (A+R+I+C+ET) - Same for all team members"
                                >
                                  {teamTotal || '-'}
                                </button>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>,

                            <td
                              key={`${sprint}-extra`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100"
                            >
                              {(() => {
                                const cellId = `extra-${student.id}-${sprint}`;
                                const isEditing = editingCell === cellId;

                                return isEditing ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={individualExtra}
                                    onChange={(e) => updateStudentGrade(student.id, sprint, 'E', Number(e.target.value))}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === 'Escape') {
                                        setEditingCell(null);
                                      }
                                    }}
                                    autoFocus
                                    className="w-12 px-1 py-1 text-center border-2 border-blue-500 rounded focus:outline-none text-sm"
                                  />
                                ) : (
                                  <button
                                    onClick={() => setEditingCell(cellId)}
                                    className={`w-12 px-1 py-1 rounded font-medium transition-all duration-200 transform hover:scale-110 text-sm ${getGradeColor100(individualExtra)}`}
                                  >
                                    {individualExtra || '-'}
                                  </button>
                                );
                              })()}
                            </td>,

                            <td
                              key={`${sprint}-sum`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50"
                            >
                              <button
                                disabled
                                className={`inline-flex items-center px-3 py-1 rounded text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${getGradeColor500(sprintSum)}`}
                              >
                                {sprintSum || '-'}
                              </button>
                            </td>
                          ];
                        })}

                        {/* Student Overall Average */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 ${getGradeColor500(overallSum)}`}>
                            {overallSum || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}