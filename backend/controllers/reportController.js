import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import createCsvWriter from 'csv-writer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Get leave summary statistics
 * @route   GET /api/reports/summary
 * @access  Private (HR, Manager)
 */
export const getSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, department } = req.query;

  const matchQuery = {};

  // Date filter
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  // Role-based filtering
  if (req.user.role === 'manager') {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id);
    matchQuery.userId = { $in: teamMemberIds };
  }

  // Department filter (HR only)
  if (department && req.user.role === 'hr') {
    const usersInDept = await User.find({ department }).select('_id');
    const userIds = usersInDept.map((u) => u._id);
    matchQuery.userId = { $in: userIds };
  }

  // Aggregate statistics
  const stats = await LeaveRequest.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDays: { $sum: '$totalDays' },
      },
    },
  ]);

  const typeStats = await LeaveRequest.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDays: { $sum: '$totalDays' },
      },
    },
  ]);

  const summary = {
    byStatus: {},
    byType: {},
    total: {
      requests: 0,
      days: 0,
    },
  };

  stats.forEach((stat) => {
    summary.byStatus[stat._id] = {
      count: stat.count,
      totalDays: stat.totalDays,
    };
    summary.total.requests += stat.count;
    summary.total.days += stat.totalDays;
  });

  typeStats.forEach((stat) => {
    summary.byType[stat._id] = {
      count: stat.count,
      totalDays: stat.totalDays,
    };
  });

  res.json({
    success: true,
    data: { summary },
  });
});

/**
 * @desc    Export leave requests as CSV
 * @route   GET /api/reports/export/csv
 * @access  Private (HR, Manager)
 */
export const exportCSV = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, type, department } = req.query;

  const query = {};

  // Date filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (status) query.status = status;
  if (type) query.type = type;

  // Role-based filtering
  if (req.user.role === 'manager') {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id);
    query.userId = { $in: teamMemberIds };
  }

  // Department filter
  if (department && req.user.role === 'hr') {
    const usersInDept = await User.find({ department }).select('_id');
    const userIds = usersInDept.map((u) => u._id);
    if (query.userId) {
      query.userId = { $in: [...query.userId.$in, ...userIds] };
    } else {
      query.userId = { $in: userIds };
    }
  }

  const leaves = await LeaveRequest.find(query)
    .populate('userId', 'name email employeeId department')
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 });

  // Prepare CSV data
  const csvData = leaves.map((leave) => ({
    'Employee ID': leave.userId?.employeeId || '',
    'Employee Name': leave.userId?.name || '',
    'Email': leave.userId?.email || '',
    'Department': leave.userId?.department || '',
    'Start Date': leave.startDate.toISOString().split('T')[0],
    'End Date': leave.endDate.toISOString().split('T')[0],
    'Total Days': leave.totalDays,
    'Leave Type': leave.type,
    'Status': leave.status,
    'Reason': leave.reason,
    'Manager Comment': leave.managerComment || '',
    'HR Comment': leave.hrComment || '',
    'Created At': leave.createdAt.toISOString(),
  }));

  // Create CSV file
  const fileName = `leaves_export_${Date.now()}.csv`;
  const filePath = path.join(__dirname, '../temp', fileName);

  // Ensure temp directory exists
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: filePath,
    header: Object.keys(csvData[0] || {}).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(csvData);

  // Send file
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    } else {
      // Delete file after sending
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    }
  });
});

/**
 * @desc    Export leave requests as PDF
 * @route   GET /api/reports/export/pdf
 * @access  Private (HR, Manager)
 */
export const exportPDF = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, type, department } = req.query;

  const query = {};

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (status) query.status = status;
  if (type) query.type = type;

  if (req.user.role === 'manager') {
    const teamMembers = await User.find({ managerId: req.user._id }).select('_id');
    const teamMemberIds = teamMembers.map((m) => m._id);
    query.userId = { $in: teamMemberIds };
  }

  if (department && req.user.role === 'hr') {
    const usersInDept = await User.find({ department }).select('_id');
    const userIds = usersInDept.map((u) => u._id);
    if (query.userId) {
      query.userId = { $in: [...query.userId.$in, ...userIds] };
    } else {
      query.userId = { $in: userIds };
    }
  }

  const leaves = await LeaveRequest.find(query)
    .populate('userId', 'name email employeeId department')
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 });

  // Create PDF
  const doc = new PDFDocument();
  const fileName = `leaves_export_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../temp', fileName);

  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // PDF content
  doc.fontSize(20).text('Leave Management Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
  doc.moveDown(2);

  // Page dimensions
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
  const bottomMargin = 50;
  const maxY = pageHeight - bottomMargin;
  
  // Line height for calculations
  const lineHeight = 12;
  const sectionSpacing = 15;

  leaves.forEach((leave, index) => {
    // Calculate approximate height needed for this leave entry
    let entryHeight = 0;
    entryHeight += 20; // Title with underline
    entryHeight += lineHeight * 9; // 9 lines of data (employee, email, dept, dates, days, type, status, reason)
    if (leave.managerComment) entryHeight += lineHeight;
    if (leave.hrComment) entryHeight += lineHeight;
    entryHeight += sectionSpacing; // Spacing after entry

    // Check if we need a new page before adding this entry
    if (index > 0) {
      // Check if current position + entry height would exceed page
      if (doc.y + entryHeight > maxY) {
        doc.addPage();
      } else {
        // Add separator line between entries on same page
        doc.moveDown(0.5);
        const currentY = doc.y;
        doc.moveTo(margin, currentY)
          .lineTo(pageWidth - margin, currentY)
          .stroke();
        doc.moveDown(0.5);
      }
    }

    // Draw leave entry
    doc.fontSize(14).text(`Leave Request #${index + 1}`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Employee: ${leave.userId?.name || 'N/A'} (${leave.userId?.employeeId || 'N/A'})`);
    doc.text(`Email: ${leave.userId?.email || 'N/A'}`);
    doc.text(`Department: ${leave.userId?.department || 'N/A'}`);
    doc.text(`Start Date: ${leave.startDate.toISOString().split('T')[0]}`);
    doc.text(`End Date: ${leave.endDate.toISOString().split('T')[0]}`);
    doc.text(`Total Days: ${leave.totalDays}`);
    doc.text(`Leave Type: ${leave.type}`);
    doc.text(`Status: ${leave.status}`);
    doc.text(`Reason: ${leave.reason}`);
    if (leave.managerComment) {
      doc.text(`Manager Comment: ${leave.managerComment}`);
    }
    if (leave.hrComment) {
      doc.text(`HR Comment: ${leave.hrComment}`);
    }
    doc.moveDown(0.5);
  });

  doc.end();

  stream.on('finish', () => {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 1000);
      }
    });
  });
});

