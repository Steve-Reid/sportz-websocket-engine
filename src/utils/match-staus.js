import { MATCH_STATUS } from "../validation/matches.js";

/**
 * Determines the current status of a match based on start/end times.
 *
 * @param {string|Date} startTime - The match start time (ISO string or Date object)
 * @param {string|Date|null} endTime - The match end time (ISO string, Date object, or null for ongoing matches)
 * @param {Date} now - Reference time for status calculation (defaults to current time)
 * @returns {string|null} Match status (scheduled/live/finished) or null if start time is invalid
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {
  // Convert start time to Date object for comparison
  const start = new Date(startTime);

  // Validate start time - if invalid, we can't determine status
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  // If current time is before start time, match hasn't begun yet
  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  // Handle end time logic:
  // - If endTime is null/undefined, match is considered live once started
  // - If endTime is provided, validate it and check if match has finished
  if (endTime != null) {
    const end = new Date(endTime);

    // Only consider finished if end time is valid and current time is past it
    if (!Number.isNaN(end.getTime()) && now >= end) {
      return MATCH_STATUS.FINISHED;
    }
  }

  // If we're past start time and not finished, match is currently live
  return MATCH_STATUS.LIVE;
}

/**
 * Synchronizes a match's status with the current time and updates it if changed.
 *
 * This function is useful for periodic status updates in real-time applications
 * where matches need to transition from scheduled → live → finished automatically.
 *
 * @param {Object} match - The match object containing startTime, endTime, and current status
 * @param {Function} updateStatus - Async function that updates the match status in the database
 * @returns {Promise<string>} The current match status (unchanged or updated)
 */
export async function syncMatchStatus(match, updateStatus) {
  // Calculate what the status should be based on current time
  const nextStatus = getMatchStatus(match.startTime, match.endTime);

  // If we can't determine status (invalid start time), keep current status
  if (!nextStatus) {
    return match.status;
  }

  // Only update database if status has actually changed
  if (match.status !== nextStatus) {
    // Persist the new status to database
    await updateStatus(nextStatus);
    // Update local match object for immediate use
    match.status = nextStatus;
  }

  return match.status;
}
