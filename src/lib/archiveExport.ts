// Archive Export Utilities for CSV format
// Handles conversion and download of term archive data as CSV files

export async function exportArchiveAsCSV(archiveData: any, termName: string) {
  // Helper to convert array of objects to CSV
  const arrayToCSV = (data: any[], headers: string[]) => {
    if (data.length === 0) return '';
    
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // Create summary CSV
  const summary = [
    ['Term Archive Summary', ''],
    ['Term Name', archiveData.term.name],
    ['Start Date', archiveData.term.startDate],
    ['End Date', archiveData.term.endDate],
    ['Status', archiveData.term.status],
    ['', ''],
    ['Statistics', ''],
    ['Total Users', archiveData.statistics.totalUsers],
    ['Total Students', archiveData.statistics.totalStudents],
    ['Total Lecturers', archiveData.statistics.totalLecturers],
    ['Total Supervisors', archiveData.statistics.totalSupervisors],
    ['Total Reports', archiveData.statistics.totalReports],
    ['Total Profiles', archiveData.statistics.totalProfiles],
    ['Total Evaluations', archiveData.statistics.totalEvaluations],
    ['Total Check-ins', archiveData.statistics.totalCheckIns],
    ['Total Tasks', archiveData.statistics.totalTasks],
  ];

  const summaryCSV = summary.map(row => row.join(',')).join('\n');

  // Create individual CSV files for each data type
  const usersCSV = arrayToCSV(
    archiveData.data.users,
    ['id', 'email', 'fullName', 'role', 'status', 'departmentId', 'facultyId', 'studentId', 'createdAt']
  );

  const reportsCSV = arrayToCSV(
    archiveData.data.reports,
    ['id', 'studentId', 'lecturerId', 'reportDate', 'content', 'status', 'feedback', 'createdAt']
  );

  const profilesCSV = arrayToCSV(
    archiveData.data.profiles,
    ['id', 'studentId', 'companyName', 'companyAddress', 'supervisorName', 'supervisorEmail', 'position', 'startDate', 'endDate', 'status']
  );

  const evaluationsCSV = arrayToCSV(
    archiveData.data.evaluations,
    ['id', 'studentId', 'supervisorId', 'ratings', 'comments', 'evaluatedAt']
  );

  const checkInsCSV = arrayToCSV(
    archiveData.data.checkIns,
    ['id', 'studentId', 'date', 'checkInTime', 'checkOutTime', 'location', 'status']
  );

  const tasksCSV = arrayToCSV(
    archiveData.data.tasks,
    ['id', 'studentId', 'supervisorId', 'title', 'description', 'status', 'dueDate', 'createdAt']
  );

  const departmentsCSV = arrayToCSV(
    archiveData.data.departments,
    ['id', 'name', 'code', 'facultyId']
  );

  const facultiesCSV = arrayToCSV(
    archiveData.data.faculties,
    ['id', 'name', 'code']
  );

  // Since we can't create a ZIP in browser without additional libraries,
  // we'll download the main summary and provide links to individual files
  // For now, download a comprehensive CSV with all data sections

  let comprehensiveCSV = '=== TERM ARCHIVE SUMMARY ===\n';
  comprehensiveCSV += summaryCSV + '\n\n';
  
  if (usersCSV) {
    comprehensiveCSV += '\n\n=== USERS ===\n' + usersCSV + '\n';
  }
  
  if (reportsCSV) {
    comprehensiveCSV += '\n\n=== REPORTS ===\n' + reportsCSV + '\n';
  }
  
  if (profilesCSV) {
    comprehensiveCSV += '\n\n=== INTERNSHIP PROFILES ===\n' + profilesCSV + '\n';
  }
  
  if (evaluationsCSV) {
    comprehensiveCSV += '\n\n=== EVALUATIONS ===\n' + evaluationsCSV + '\n';
  }
  
  if (checkInsCSV) {
    comprehensiveCSV += '\n\n=== CHECK-INS ===\n' + checkInsCSV + '\n';
  }
  
  if (tasksCSV) {
    comprehensiveCSV += '\n\n=== TASKS ===\n' + tasksCSV + '\n';
  }
  
  if (departmentsCSV) {
    comprehensiveCSV += '\n\n=== DEPARTMENTS ===\n' + departmentsCSV + '\n';
  }
  
  if (facultiesCSV) {
    comprehensiveCSV += '\n\n=== FACULTIES ===\n' + facultiesCSV + '\n';
  }

  // Download the comprehensive CSV
  const blob = new Blob([comprehensiveCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${termName.replace(/\s+/g, '_')}_archive_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
