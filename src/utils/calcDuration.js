// Calculate difference between two times
const calcDuration = (start, end) => {
  if (!start || !end) return 0;
  return Math.floor((end - start) / 1000); // seconds
};

// Convert HH:MM:SS string to Date object (today's date + given time)
const parseAPITime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, seconds || 0, 0);
  return now;
};

export {calcDuration, parseAPITime}