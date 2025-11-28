import { Student, SchoolClass } from './types';

// Get Grade Label based on percentage
export const getGradeLabel = (percentage: number): string => {
  if (percentage >= 90) return 'ممتاز';
  if (percentage >= 75) return 'جيد جداً';
  if (percentage >= 60) return 'جيد';
  if (percentage >= 50) return 'مقبول';
  return 'ضعيف';
};

// Calculate total score and percentage for a student
export const calculateStudentStats = (student: Student, schoolClass: SchoolClass) => {
  let totalScore = 0;
  let maxPossibleScore = 0;

  schoolClass.subjects.forEach((subj) => {
    const score = student.scores[subj.id] || 0;
    totalScore += score;
    maxPossibleScore += subj.maxScore;
  });

  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const fixedPercentage = parseFloat(percentage.toFixed(2));

  return {
    ...student,
    totalScore,
    percentage: fixedPercentage,
    gradeLabel: getGradeLabel(fixedPercentage),
  };
};

// Calculate rankings with "Joint" (Duplicate) handling
export const calculateRankings = (students: Student[]): Student[] => {
  // Sort by total score descending
  const sorted = [...students].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  let rank = 1;
  return sorted.map((student, index) => {
    let displayRank = rank.toString();
    let isJoint = false;

    // Check if previous student has same score
    if (index > 0 && student.totalScore === sorted[index - 1].totalScore) {
      // Use the same rank as the previous one
      displayRank = sorted[index - 1].rankLabel?.split(' ')[0] || rank.toString();
      isJoint = true;
    } else {
      // Update rank to current position (1-based index)
      rank = index + 1;
      displayRank = rank.toString();
    }

    return {
      ...student,
      rank: rank,
      rankLabel: isJoint ? `${displayRank} مكرر` : displayRank,
    };
  });
};

// Generate formatted Excel HTML content (RTL supported)
export const generateExcelHTML = (students: Student[], schoolClass: SchoolClass): string => {
  const headers = ['الترتيب', 'الاسم', ...schoolClass.subjects.map(s => `${s.name} (${s.maxScore})`), 'المجموع', 'النسبة %', 'التقدير'];
  
  let tableRows = '';
  students.forEach(student => {
    const subjectCells = schoolClass.subjects.map(s => `<td style="text-align:center;">${student.scores[s.id] || 0}</td>`).join('');
    // Color code grade
    let gradeColor = '#ffffff';
    if (student.percentage && student.percentage >= 90) gradeColor = '#d1fae5'; // Emerald-100
    else if (student.percentage && student.percentage >= 75) gradeColor = '#dbeafe'; // Blue-100
    else if (student.percentage && student.percentage < 50) gradeColor = '#fee2e2'; // Red-100

    tableRows += `
      <tr>
        <td style="text-align:center; font-weight:bold;">${student.rankLabel}</td>
        <td style="text-align:right;">${student.name}</td>
        ${subjectCells}
        <td style="text-align:center; font-weight:bold;">${student.totalScore}</td>
        <td style="text-align:center;">${student.percentage}%</td>
        <td style="text-align:center; background-color:${gradeColor};">${student.gradeLabel || ''}</td>
      </tr>
    `;
  });

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${schoolClass.name}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayRightToLeft/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Arial', sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000000; padding: 8px; font-size: 12pt; }
        th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
      </style>
    </head>
    <body>
      <h2 style="text-align: center; margin-bottom: 20px;">كشف درجات: ${schoolClass.name}</h2>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
};

// Generate Simple CSV content (kept for backward compatibility or simple imports)
export const generateCSV = (students: Student[], schoolClass: SchoolClass): string => {
  const headers = ['الترتيب', 'الاسم', ...schoolClass.subjects.map(s => `${s.name} (${s.maxScore})`), 'المجموع', 'النسبة %', 'التقدير'];
  
  const rows = students.map(student => {
    const subjectScores = schoolClass.subjects.map(s => student.scores[s.id] || 0);
    return [
      student.rankLabel,
      student.name,
      ...subjectScores,
      student.totalScore,
      `${student.percentage}%`,
      student.gradeLabel || ''
    ].join(',');
  });

  return ['\ufeff' + headers.join(','), ...rows].join('\n');
};

export const parseCSV = (csvText: string, schoolClass: SchoolClass): Partial<Student>[] => {
  const lines = csvText.split('\n').filter(l => l.trim() !== '');
  
  const students: Partial<Student>[] = [];

  for(let i=1; i<lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 2) continue;

    const name = cols[1]; 
    const scores: Record<string, number> = {};
    
    schoolClass.subjects.forEach((subj, idx) => {
      const scoreIndex = 2 + idx;
      if (cols[scoreIndex]) {
        scores[subj.id] = parseFloat(cols[scoreIndex]) || 0;
      }
    });

    students.push({
      name,
      scores,
      classId: schoolClass.id
    });
  }
  return students;
}
