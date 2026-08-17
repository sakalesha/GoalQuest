// server/utils/exportHelper.js
import ExcelJS from 'exceljs';

export const generateAchievementReport = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Achievement Report');

  worksheet.columns = [
    { header: 'Employee Name', key: 'name', width: 20 },
    { header: 'Department', key: 'dept', width: 15 },
    { header: 'Goal Title', key: 'title', width: 30 },
    { header: 'UoM', key: 'uom', width: 10 },
    { header: 'Target', key: 'target', width: 10 },
    { header: 'Weightage', key: 'weight', width: 10 },
    { header: 'Q1 Actual', key: 'q1', width: 10 },
    { header: 'Q2 Actual', key: 'q2', width: 10 },
    { header: 'Q3 Actual', key: 'q3', width: 10 },
    { header: 'Q4 Actual', key: 'q4', width: 10 },
    { header: 'Final Score', key: 'score', width: 10 }
  ];

  data.forEach(item => {
    worksheet.addRow({
      name: item.employeeName,
      dept: item.department,
      title: item.goalTitle,
      uom: item.uomType,
      target: item.target,
      weight: `${item.weightage}%`,
      q1: item.checkIns?.Q1?.actualAchievement || '-',
      q2: item.checkIns?.Q2?.actualAchievement || '-',
      q3: item.checkIns?.Q3?.actualAchievement || '-',
      q4: item.checkIns?.Q4?.actualAchievement || '-',
      score: item.avgScore ? `${(item.avgScore * 100).toFixed(2)}%` : '0%'
    });
  });

  // Styling header
  worksheet.getRow(1).font = { bold: true };
  
  return workbook;
};
