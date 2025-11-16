import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import LeaveRequest from '../models/LeaveRequest.js';
import LeavePolicy from '../models/LeavePolicy.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await LeaveRequest.deleteMany({});
    await LeavePolicy.deleteMany({});

    console.log('🌱 Seeding database...');

    // Create HR user
    const hrUser = await User.create({
      email: 'hr@lms.com',
      password: 'hr123456',
      name: 'HR Manager',
      role: 'hr',
      employeeId: 'HR001',
      department: 'Human Resources',
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        unpaid: 0,
      },
    });

    // Create Manager user
    const managerUser = await User.create({
      email: 'manager@lms.com',
      password: 'manager123',
      name: 'John Manager',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Engineering',
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        unpaid: 0,
      },
    });

    // Create Employee users
    const employee1 = await User.create({
      email: 'employee1@lms.com',
      password: 'emp123456',
      name: 'Alice Employee',
      role: 'employee',
      employeeId: 'EMP001',
      department: 'Engineering',
      managerId: managerUser._id,
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        unpaid: 0,
      },
    });

    const employee2 = await User.create({
      email: 'employee2@lms.com',
      password: 'emp123456',
      name: 'Bob Employee',
      role: 'employee',
      employeeId: 'EMP002',
      department: 'Engineering',
      managerId: managerUser._id,
      leaveBalances: {
        casual: 10,
        sick: 8,
        earned: 12,
        unpaid: 0,
      },
    });

    const employee3 = await User.create({
      email: 'employee3@lms.com',
      password: 'emp123456',
      name: 'Charlie Employee',
      role: 'employee',
      employeeId: 'EMP003',
      department: 'Sales',
      managerId: managerUser._id,
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        unpaid: 0,
      },
    });

    const employee4 = await User.create({
      email: 'employee4@lms.com',
      password: 'emp123456',
      name: 'David Employee',
      role: 'employee',
      employeeId: 'EMP004',
      department: 'Engineering',
      managerId: managerUser._id,
      leaveBalances: {
        casual: 8,
        sick: 6,
        earned: 10,
        unpaid: 0,
      },
    });

    const employee5 = await User.create({
      email: 'employee5@lms.com',
      password: 'emp123456',
      name: 'Eve Employee',
      role: 'employee',
      employeeId: 'EMP005',
      department: 'Engineering',
      managerId: managerUser._id,
      leaveBalances: {
        casual: 15,
        sick: 12,
        earned: 18,
        unpaid: 0,
      },
    });

    // Create Leave Policies
    await LeavePolicy.create([
      {
        leaveType: 'casual',
        maxDays: 12,
        carryForward: false,
        requiresDocument: false,
        businessDaysOnly: false,
        description: 'Casual leave for personal work',
      },
      {
        leaveType: 'sick',
        maxDays: 10,
        carryForward: false,
        requiresDocument: true,
        businessDaysOnly: false,
        description: 'Sick leave with medical certificate',
      },
      {
        leaveType: 'earned',
        maxDays: 15,
        carryForward: true,
        maxCarryForwardDays: 5,
        requiresDocument: false,
        businessDaysOnly: false,
        description: 'Earned leave with carry forward option',
      },
      {
        leaveType: 'unpaid',
        maxDays: 0,
        carryForward: false,
        requiresDocument: false,
        businessDaysOnly: false,
        description: 'Unpaid leave',
      },
    ]);

    // Create sample leave requests
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);

    await LeaveRequest.create([
      {
        userId: employee1._id,
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // 3 days
        type: 'casual',
        reason: 'Family function',
        totalDays: 3,
        status: 'pending',
        managerId: managerUser._id,
      },
      {
        userId: employee2._id,
        startDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        type: 'sick',
        reason: 'Fever and cold',
        totalDays: 3,
        status: 'approved',
        managerId: managerUser._id,
        managerComment: 'Approved. Get well soon!',
      },
      {
        userId: employee3._id,
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 4 * 24 * 60 * 60 * 1000), // 5 days
        type: 'earned',
        reason: 'Vacation',
        totalDays: 5,
        status: 'pending',
        managerId: managerUser._id,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Users Created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HR User:');
    console.log('  Email: hr@lms.com');
    console.log('  Password: hr123456');
    console.log('  Role: HR');
    console.log('\nManager User:');
    console.log('  Email: manager@lms.com');
    console.log('  Password: manager123');
    console.log('  Role: Manager');
    console.log('\nEmployee Users:');
    console.log('  Email: employee1@lms.com | Password: emp123456 | Role: Employee');
    console.log('  Email: employee2@lms.com | Password: emp123456 | Role: Employee');
    console.log('  Email: employee3@lms.com | Password: emp123456 | Role: Employee');
    console.log('  Email: employee4@lms.com | Password: emp123456 | Role: Employee');
    console.log('  Email: employee5@lms.com | Password: emp123456 | Role: Employee');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

