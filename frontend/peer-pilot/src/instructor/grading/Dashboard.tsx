import { useEffect, useRef, useState } from 'react';
import { Download, Save, Calendar, Award, Users, ExternalLink } from 'lucide-react';
import { assignmentNames, assignments, type AssignmentLetter, type Grade, type Student, type Team } from '../../types/types';
import TeamFilter from './TeamFilter';
import { mockGrades, mockStudents, mockTeams } from '../../data/mock';
import { Link, useSearchParams } from 'react-router-dom';
import { getGradeColor100, getGradeColor500 } from '../../utils/utils';

export default function InstructorGrading() {
  // Mock data
  const [teams] = useState<Team[]>(mockTeams);
  const [students] = useState<Student[]>(mockStudents);
  const [grades, setGrades] = useState<Grade[]>(mockGrades);

  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  // Initialize selectedTeam from URL
  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    const teamNameFromUrl = searchParams.get('team');
    if (teamNameFromUrl) {
      // Find team by name (case insensitive)
      const team = teams.find(t =>
        t.name.toLowerCase() === teamNameFromUrl.toLowerCase()
      );
      return team ? team.id : 'all';
    }
    return 'all';
  });

  // Update URL with team name
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (selectedTeam === 'all') {
      newParams.delete('team');
    } else {
      const team = teams.find(t => t.id === selectedTeam);
      if (team) {
        newParams.set('team', team.name.toLowerCase().replace(/\s+/g, '-'));
      }
    }

    setSearchParams(newParams, { replace: true });
  }, [selectedTeam, teams, setSearchParams, searchParams]);

  const sprints = [1, 2, 3, 4];

  // Calculate team averages for assignments
  const getTeamAssignmentGrade = (teamId: string, sprint: number, assignment: AssignmentLetter): number => {
    if (assignment === 'E') return 0
    const teamStudents = students.filter(s => s.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    const teamGrades = teamStudents.map(student =>
      grades.find(g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment)?.score ?? 0
    );

    return Math.round(teamGrades.reduce((acc, score) => acc + score, 0) / teamGrades.length);
  };

  // Get individual student grade (for extra grades in team view)
  const getStudentGrade = (studentId: string, sprint: number, assignment: AssignmentLetter): number => {
    const grade = grades.find(
      g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
    );
    return grade?.score ?? 0;
  };

  // Update team assignment grade (applies to all team members)
  const updateTeamAssignmentGrade = (teamId: string, sprint: number, assignment: AssignmentLetter, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));
    const teamStudents = students.filter(s => s.teamId === teamId);

    setGrades(prev => {
      const updated = [...prev];

      teamStudents.forEach(student => {
        const existingIndex = updated.findIndex(
          g => g.studentId === student.id && g.sprint === sprint && g.assignment === assignment
        );

        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], score: validScore };
        } else {
          updated.push({ studentId: student.id, sprint, assignment, score: validScore });
        }
      });

      return updated;
    });

    setUnsavedChanges(true);
  };

  // Update individual student grade (for extra grades)
  const updateStudentGrade = (studentId: string, sprint: number, assignment: AssignmentLetter, score: number) => {
    const validScore = Math.max(0, Math.min(100, score));

    setGrades(prev => {
      const existingIndex = prev.findIndex(
        g => g.studentId === studentId && g.sprint === sprint && g.assignment === assignment
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], score: validScore };
        return updated;
      } else {
        return [...prev, { studentId, sprint, assignment, score: validScore }];
      }
    });

    setUnsavedChanges(true);
  };

  // Calculate team sprint sum
  const calculateTeamSprintSum = (teamId: string, sprint: number): number => {
    const sum = assignments.reduce((acc, assignment) =>
      acc + getTeamAssignmentGrade(teamId, sprint, assignment), 0
    );
    return sum;
  };

  // Calculate student sprint sum (for extra grades)
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

  // Calculate team total grade (A + R + I + C + ET)
  const calculateTeamTotalGrade = (teamId: string, sprint: number): number => {
    const teamStudents = students.filter(s => s.teamId === teamId);
    if (teamStudents.length === 0) return 0;

    // Get average team grade among students for each assignment
    const assignmentTotals = assignments.map(assignment => {
      const assignmentScores = teamStudents.map(student =>
        assignment === 'E' ? 0 : getStudentGrade(student.id, sprint, assignment)
      );
      return assignmentScores.reduce((acc, score) => acc + score, 0) / assignmentScores.length;
    });

    // Sum all assignment averages
    return Math.round(assignmentTotals.reduce((acc, avg) => acc + avg, 0));
  };


  const handleSave = () => {
    // Send grades to backend
    setUnsavedChanges(false);
    alert('Grades saved successfully!');
  };


  const handleExport = () => {
    console.log('Exporting grades...');
    alert('Export functionality would download CSV/Excel file');
  };

  // Filter teams or get specific team students
  const displayData = selectedTeam === 'all'
    ? teams
    : students.filter(student => student.teamId === selectedTeam);

  const isTeamView = selectedTeam === 'all';

  // Scroll persistance
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

      // Use setTimeout to ensure DOM is ready
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
      // Throttle scroll events
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(saveScrollPosition, 100);
    };

    tableContainer.addEventListener('scroll', handleScroll);
    restoreScrollPosition(); // Restore on mount

    return () => {
      tableContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-left">
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

            <div className="flex items-center space-x-3 mx-5">
              <button onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button onClick={handleSave} disabled={!unsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              {unsavedChanges && (<span className="text text-orange-600 font-medium">Unsaved changes</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TeamFilter teams={teams} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
          </div>
        </div>

        {/* Grading Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div ref={tableContainerRef} className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b border-gray-200">
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
                          .filter(assignment => assignment !== 'E') // Exclude individual extra in team view
                          .map(assignment => (
                            <th
                              key={`${sprint}-${assignment}`}
                              className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 first:border-l-0"
                            >
                              <div className="flex flex-col items-center">
                                <span>{assignment}</span>
                                <span className="text-xs font-normal text-gray-400 normal-case">
                                  {assignment === 'ET' ? 'Extra' : assignmentNames[assignment]}
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
                      // Individual Student View: Assignments (Total), Extra, Sum
                      return [
                        // Assignments Total Column (A + R + I + C + Team Extra)
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
                        // Individual Extra Column
                        <th
                          key={`${sprint}-extra`}
                          className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 bg-blue-50"
                        >
                          <div className="flex flex-col items-center">
                            <span>Extra</span>
                            <span className="text-xs font-normal text-gray-400 normal-case">
                              Individual
                            </span>
                          </div>
                        </th>,
                        // Sum Column (Total + Individual Extra)
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
                    // Team View - show team averages
                    const team = item as Team;
                    const teamStudents = students.filter(s => s.teamId === team.id);
                    const overallAverage = calculateTeamOverallAverage(team.id);

                    return (
                      <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                        {/* Team Info */}
                        <td className="px-1 py-4 text-center whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                          <div className="flex flex-col items-center space-y-1">
                            <button className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${team.color} transform hover:scale-105 hover:text-black transition-transform duration-200`}
                              onClick={() => setSelectedTeam(team.id)}>
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
                              if (assignment === 'E') return
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
                            }),
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${overallAverage >= 1080 ? 'bg-green-100 text-green-800' :
                            overallAverage >= 960 ? 'bg-blue-100 text-blue-800' :
                              overallAverage >= 840 ? 'bg-yellow-100 text-yellow-800' :
                                overallAverage >= 720 ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800 border border-gray-300'
                            }`}>
                            {overallAverage || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  } else {
                    // Team Members View - show individual students with team assignments total + individual extra grades
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
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${team?.color} mt-1`}>
                              {team?.name}
                            </span>
                          </div>
                        </td>

                        {/* Student Grades (Team total + individual extra grades) */}
                        {sprints.flatMap(sprint => {
                          const teamTotal = calculateTeamTotalGrade(team?.id || '', sprint);
                          const individualExtra = getStudentGrade(student.id, sprint, 'E');
                          const sprintSum = teamTotal + individualExtra;

                          return [
                            // Team Total Column (A + R + I + C + ET) - same for all team members
                            <td
                              key={`${sprint}-team-total`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100"
                            >
                              {studentIndex === 0 ? (
                                // Only show team total in first student's row, span other rows
                                <button
                                  disabled
                                  className={`w-16 px-2 py-1 rounded font-medium transition-all duration-200 transform hover:scale-105 text-sm ${getGradeColor500(teamTotal)}`}
                                  title="Team Total (A+R+I+C+ET) - Same for all team members"
                                >
                                  {teamTotal || '-'}
                                </button>
                              ) : (
                                // Empty cell for other students - team total is shown in first row
                                <span className="text-gray-300">-</span>
                              )}
                            </td>,

                            // Individual Extra Column - editable per student
                            <td
                              key={`${sprint}-extra`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-100 bg-blue-50"
                            >
                              {(() => {
                                const cellId = `extra-${student.id}-${sprint}`;
                                const isEditing = editingCell === cellId;

                                return isEditing ? (
                                  <input type="number" min="0" max="100" value={individualExtra}
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

                            // Sum Column (Team Total + Individual Extra)
                            <td
                              key={`${sprint}-sum`}
                              className="px-3 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50"
                            >
                              <button
                                disabled
                                className={`inline-flex items-center px-3 py-1 rounded text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${sprintSum >= 450 ? 'bg-green-100 text-green-800' :
                                  sprintSum >= 400 ? 'bg-blue-100 text-blue-800' :
                                    sprintSum >= 350 ? 'bg-yellow-100 text-yellow-800' :
                                      sprintSum >= 300 ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                  }`}
                              >
                                {sprintSum || '-'}
                              </button>
                            </td>
                          ];
                        })}

                        {/* Student Overall Average */}
                        <td className="px-6 py-4 whitespace-nowrap text-center border-l border-gray-200 bg-gray-50">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 ${overallSum >= 1350 ? 'bg-green-100 text-green-800' :
                            overallSum >= 1200 ? 'bg-blue-100 text-blue-800' :
                              overallSum >= 1050 ? 'bg-yellow-100 text-yellow-800' :
                                overallSum >= 900 ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800 border border-gray-300'
                            }`}>
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
