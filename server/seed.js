// server/seed.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Cycle from './models/Cycle.js';
import GoalSheet from './models/GoalSheet.js';
import Goal from './models/Goal.js';
import CheckIn from './models/CheckIn.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

export const runSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // DB is already seeded!

    console.log('Database empty. Seeding demo data...');

    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash('password123', salt);

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@goalquest.com',
      passwordHash: pwd,
      role: 'admin',
      department: 'HR'
    });

    // Create Managers
    const m1 = await User.create({
      name: 'Manager One',
      email: 'm1@goalquest.com',
      passwordHash: pwd,
      role: 'manager',
      department: 'Engineering'
    });

    const m2 = await User.create({
      name: 'Manager Two',
      email: 'm2@goalquest.com',
      passwordHash: pwd,
      role: 'manager',
      department: 'Sales'
    });

    // Create Employees
    const employees = [];
    for (let i = 1; i <= 4; i++) {
      const emp = await User.create({
        name: `Employee ${i}`,
        email: `emp${i}@goalquest.com`,
        passwordHash: pwd,
        role: 'employee',
        managerId: i <= 2 ? m1._id : m2._id,
        department: i <= 2 ? 'Engineering' : 'Sales'
      });
      employees.push(emp);
    }

    // Create Cycle
    const cycle = await Cycle.create({
      year: 2024,
      phase: 'GOAL_SETTING',
      openDate: new Date('2024-05-01'),
      closeDate: new Date('2025-04-30'),
      status: 'OPEN',
      createdBy: admin._id
    });

    // Create Goal Sheets & Goals for all employees
    for (const emp of employees) {
      const sheet = await GoalSheet.create({
        employeeId: emp._id,
        cycleId: cycle._id,
        status: emp.email === 'emp1@goalquest.com' ? 'DRAFT' : (emp.email === 'emp2@goalquest.com' ? 'SUBMITTED' : 'APPROVED')
      });

      await Goal.create({
        goalSheetId: sheet._id,
        employeeId: emp._id,
        cycleId: cycle._id,
        thrustArea: 'Business Growth',
        title: `Increase ${emp.department} Efficiency`,
        uomType: 'MAX',
        target: 100,
        weightage: 50
      });

      const g2 = await Goal.create({
        goalSheetId: sheet._id,
        employeeId: emp._id,
        cycleId: cycle._id,
        thrustArea: 'Safety',
        title: 'Maintain Zero Safety Incidents',
        uomType: 'ZERO',
        target: 0,
        weightage: 50
      });

      if (sheet.status === 'APPROVED') {
        // Create a check-in for approved sheets
        await CheckIn.create({
          goalId: g2._id,
          employeeId: emp._id,
          cycleId: cycle._id,
          quarter: 'Q1',
          actualAchievement: 0,
          status: 'COMPLETED',
          progressScore: 1,
          managerComment: 'Well done'
        });
      }
    }

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
};

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/atomquest')
    .then(() => runSeed())
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
}
