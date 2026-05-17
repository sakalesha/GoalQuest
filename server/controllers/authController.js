// server/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Cycle from '../models/Cycle.js';
import GoalSheet from '../models/GoalSheet.js';
import Goal from '../models/Goal.js';
import CheckIn from '../models/CheckIn.js';
import AuditLog from '../models/AuditLog.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-key', { expiresIn: '30d' });
};

export const register = async (req, res) => {
  const { name, email, password, role, managerId, department } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'employee',
    managerId,
    department
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    console.log(`Password match for ${email}: ${isMatch}`);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const seedDatabase = async (req, res) => {
  try {
    // Clear existing
    await User.deleteMany({});
    await Cycle.deleteMany({});
    await GoalSheet.deleteMany({});
    await Goal.deleteMany({});
    await CheckIn.deleteMany({});
    await AuditLog.deleteMany({});

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
        await CheckIn.create({
          goalId: g2._id,
          quarter: 'Q1',
          actualAchievement: 0,
          status: 'COMPLETED',
          progressScore: 1,
          managerComment: 'Well done'
        });
      }
    }

    res.json({ message: 'Seeding complete! You can now log in with the demo credentials.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to seed database', error: err.message });
  }
};
