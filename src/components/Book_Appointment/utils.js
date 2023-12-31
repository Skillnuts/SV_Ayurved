import axios from "axios";
import { listOfDays, listOfMonths } from "./data";
import { BOOKED_APPOINTMENT_API_URL } from "../../data/constant";

export const addMonthsToDate = (date, numOfMonth) => {
  return new Date(date.setMonth(date.getMonth() + numOfMonth));
};

export const normaliseDateToReadableString = (d) => {
  const month = d.getMonth();
  const date = d.getDate();
  const day = d.getDay();
  const year = d.getFullYear();

  const result = `${listOfDays[day]} ${date} ${listOfMonths[month]} ${year}`;

  return result;
};

/* ***** convert 24hrs into 12hrs ***** */
export const getAMPMFrm24Hrs = (time) => {
  const [sHours, minutes] = time.match(/([0-9]{1,2}):([0-9]{2})/).slice(1);
  const period = +sHours < 12 ? "AM" : "PM";
  const hours = +sHours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
};

/* ***** convert 12hrs into 24hrs ***** */
export const get24HrsFrmAMPM = (time) => {
  const [sHours, minutes, period] = time
    .match(/([0-9]{1,2}):([0-9]{2}) (AM|PM)/)
    .slice(1);
  const PM = period === "PM";
  const hours = (+sHours % 12) + (PM ? 12 : 0);

  return `${("0" + hours).slice(-2)}:${minutes}`;
};

/**
 * Date doesn't matter
 * @param  {string} time
 * @returns {number} return milliseconds of the date created with time parameter
 */
export const timeToMilliseconds = (time) => {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000
  const [hours, minutes] = time.split(":");
  const updateHours = new Date().setHours(hours, 0, 0, 0);
  const updateMinsAndHours = new Date(updateHours).setMinutes(minutes, 0, 0, 0);
  return (updateMinsAndHours);
};

/**
 * @param  {number | string} hours
 * @param  {number | string} mins
 * @returns {string} returns formatted time i.e. 09:00, 18:30
 */
export const getAndFormatTime = (hours, mins) => {
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Utility function to extract hour and minute from a time string
export const extractHourAndMinute = (timeString) => {
  const [hours, minutes] = timeString
    .split(":")
    .map((part) => parseInt(part, 10));
  return { hours, minutes };
};

/* ***** create time intervals ***** */
export const createTimeIntervals = (startTime, endTime, interval) => {
  const timeSlots = [];
  if (startTime >= endTime)
    throw new Error("Start time cannot be greater than closing time");

  for (
    let i = startTime;
    i < endTime;
    i = new Date(i + interval * 60000).getTime()
  ) {
    timeSlots.push(
      getAMPMFrm24Hrs(
        getAndFormatTime(new Date(i).getHours(), new Date(i).getMinutes())
      )
    );
  }
  return timeSlots;
};

// Get all times available base on schedule
export const getTotalTimeSlots = (schedule, date, interval) => {
  let daySchedule = null;
  for (let k = 0; k < schedule.length; k += 1) {
    if (schedule[k].day === listOfDays[date.getDay()]) {
      daySchedule = schedule[k];
    }
  }

  if (daySchedule) {
    let startHour = timeToMilliseconds(get24HrsFrmAMPM(daySchedule.startTime));
    let endHour = timeToMilliseconds(get24HrsFrmAMPM(daySchedule.endTime));

    const totalTimeSlots = createTimeIntervals(startHour, endHour, interval);

    return totalTimeSlots;
  }
};


export const fetchBookedAppointments = async () => {
  try {
    const response = await axios.get(BOOKED_APPOINTMENT_API_URL)
    if (!response.statusText) {
      throw new Error('Network response was not ok');
    }
    return response.data
  }
  catch (error) {
    console.log('Error: ', error);
    throw new Error(error)
  }
}


export const getNextAvailableDate = (date) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1); // Move to the next date

  // Check if the next date is Sunday, and if so, set it to Monday
  if (nextDate.getDay() === 0) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}