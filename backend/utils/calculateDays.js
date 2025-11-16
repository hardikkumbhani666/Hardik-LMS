/**
 * Calculate total days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Boolean} businessDaysOnly - If true, exclude weekends
 * @returns {Number} Total days
 */
export function calculateTotalDays(startDate, endDate, businessDaysOnly = false) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set time to midnight for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (businessDaysOnly) {
    return calculateBusinessDays(start, end);
  } else {
    // Calculate calendar days (inclusive)
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end date
  }
}

/**
 * Calculate business days (excluding weekends)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Number} Business days count
 */
function calculateBusinessDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Check if two date ranges overlap
 * @param {Date} start1 - First range start
 * @param {Date} end1 - First range end
 * @param {Date} start2 - Second range start
 * @param {Date} end2 - Second range end
 * @returns {Boolean} True if ranges overlap
 */
export function dateRangesOverlap(start1, end1, start2, end2) {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);

  return s1 <= e2 && s2 <= e1;
}

