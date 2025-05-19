/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import ProfileCard from "../Profile";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedDates, setHighlightedDates] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<any>();
  const [selectedStaff, setSelectedStaff] = useState<any>();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEvents = selectedStaffId
    ? events.filter((event) => event.staffId === selectedStaffId)
    : events;
  const [initialDate, setInitialDate] = useState<Date>(
    dayjs(schedule?.scheduleStartDate).toDate()
  );

  const getPlugins = () => {
    const plugins = [dayGridPlugin];

    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const getSelectedStaff = (id: string) => {
    setSelectedStaffId(id);
    setSelectedStaff(schedule?.staffs?.find((staff) => id === staff.id));
    console.log(selectedStaff)
  };

  const validDates = () => {
    const dates = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  function getDatesBetween(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    let currentDate = parseDate(startDate);
    const lastDate = parseDate(endDate);

    while (currentDate <= lastDate) {
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();

      dates.push(`${day}.${month}.${year}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  const generateStaffBasedCalendar = () => {
    const works: EventInput[] = [];

    const staffAssignments = schedule?.assignments?.filter(
      (assignment) => assignment?.staffId === selectedStaffId
    );

    if (staffAssignments && staffAssignments.length > 0) {
      const earliestAssignment = staffAssignments.reduce((earliest, current) => {
        const currentDate = new Date(current.shiftStart);
        const earliestDate = new Date(earliest.shiftStart);
        return currentDate < earliestDate ? current : earliest;
      });

      setInitialDate(new Date(earliestAssignment.shiftStart));
    }

    for (let i = 0; i < staffAssignments?.length; i++) {
      const assignment = staffAssignments[i];

      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === assignment?.shiftId
      );

      const assignmentDate = dayjs
        .utc(assignment?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);

      const work = {
        id: assignment?.id,
        title: getShiftById(assignment?.shiftId)?.name,
        duration: "01:00",
        date: assignmentDate,
        staffId: assignment?.staffId,
        shiftId: assignment?.shiftId,
        className: `event ${classes[className]} ${getAssigmentById(assignment?.id)?.isUpdated ? "highlight" : ""
          } ${!isValidDate ? "invalid-date" : ""}`,
      };

      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;

    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );

    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    setHighlightedDates(highlightedDates);
    setEvents(works);

    const selectedStaff = getStaffById(selectedStaffId);

    const pairs = selectedStaff?.pairList || [];

    let tempHighlightedDates: { date: string; color: string }[] = [];

    pairs.forEach(pair => {
      const staff = getStaffById(pair.staffId);
      const color = (staff as any)?.color || '#000000'; // default renk siyah

      const dates = getDatesBetween(pair.startDate, pair.endDate);

      dates.forEach(date => {
        tempHighlightedDates.push({ date, color });
      });
    });

    const uniqueDatesMap = new Map<string, { date: string; color: string }>();

    tempHighlightedDates.forEach(item => {
      if (!uniqueDatesMap.has(item.date)) {
        uniqueDatesMap.set(item.date, item);
      }
    });

    const uniqueHighlightedDates = Array.from(uniqueDatesMap.values());

    setHighlightedDates(uniqueHighlightedDates);
  };

  const sortedStaffs = [...(schedule?.staffs || [])].sort((a, b) => {
    const aMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const bMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) + Math.round(255 * percent);
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent);
    let b = (num & 0x0000FF) + Math.round(255 * percent);

    r = r > 255 ? 255 : r;
    g = g > 255 ? 255 : g;
    b = b > 255 ? 255 : b;

    return `rgb(${r}, ${g}, ${b})`;
  }

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.refetchEvents();
    }
  }, [filteredEvents]);

  useEffect(() => {
    if (schedule?.staffs?.length) {
      const firstStaff = getStaffById(schedule.staffs[0].id);
      if (firstStaff) {
        setSelectedStaffId(firstStaff.id);
        setSelectedStaff(schedule?.staffs?.find((staff) => firstStaff.id === staff.id));
      }
    }
  }, [schedule]);

  useEffect(() => {
    generateStaffBasedCalendar();
  }, [selectedStaffId]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const RenderEventContent = ({ eventInfo }: any) => {

    const handleClick = () => {
      const event = eventInfo.event;
      const extendedProps = event.extendedProps;

      const staff = schedule.staffs.find(s => s.id === extendedProps.staffId);
      if (staff) {
        event.staffName = staff.name;
      }

      const shift = schedule.shifts.find(s => s.id === extendedProps.shiftId);
      if (shift) {
        event.shift = shift;
      }

      setSelectedEvent(event);

      console.log(event)
      setIsModalOpen(true);
    };

    return (
      <>
        <div className="event-content clickable" onClick={handleClick}>
          <p>{eventInfo.event.title}</p>
        </div>
      </>
    );
  };

  const EventModal = ({ event, onClose }: { event: any; onClose: () => void }) => {
    if (!event) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-title" style={{ background: lightenColor(selectedStaff.color, 0.3), color: '#fff' }}>
            <h2>{event.title}</h2>

            <div className="modal-calendar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier">
                  <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  </path>
                </g>
              </svg>
              <i>
                {event.start &&
                  new Date(event.start).toLocaleDateString("en-En", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
              </i>
            </div>
          </div>

          <br />

          <div className="modal-content">
            <div
              key={selectedStaff.id}
              onClick={() => getSelectedStaff(selectedStaff.id)}
              className="staff"
              style={{
                display: 'flex', alignItems: 'center'
              }}
            >
              <div className="circle" style={{
                height: '56px',
                width: '56px',
                color: selectedStaff.color,
                borderColor: selectedStaff.color,
                borderRadius: '50%',
                border: '2px solid',
                display: 'flex',
                placeContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                backgroundColor: lightenColor(selectedStaff.color, 0.6),
              }}>
                {selectedStaff.name.charAt(0).toUpperCase()}
              </div>

              <span>{selectedStaff.name}</span>
            </div>

            <div className="shift-info">
              <div style={{ padding: '8px', background: '#62748e3d', borderRadius: '50%', height: '40px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
                    <path d="M12 7V12H15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    </path>
                  </g>
                </svg>
              </div>

              <div style={{display: 'flex'}}>
                <strong>{event.shift.shiftStart} </strong>

                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier"> <path d="M6 12H18M18 12L13 7M18 12L13 17"
                    stroke="#62748e3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  </path>
                  </g>
                </svg>

                <strong>{event.shift.shiftEnd} </strong>
              </div>

              <span style={{ color: '#62748e', fontWeight: 600 }}>({event.shift.shiftDurationHourly} hours) </span>
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <div className="content-container">
          <ProfileCard profile={auth} />

          <hr />

          <div className="staff-list">
            <div className="search-wrapper">
              <svg className="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M15 10.5C15 12.9853 12.9853 15 10.5 15C8.01472 15 6 12.9853 6 10.5C6 8.01472 8.01472 6 10.5 6C12.9853 6 15 8.01472 15 10.5ZM14.1793 15.2399C13.1632 16.0297 11.8865 16.5 10.5 16.5C7.18629 16.5 4.5 13.8137 4.5 10.5C4.5 7.18629 7.18629 4.5 10.5 4.5C13.8137 4.5 16.5 7.18629 16.5 10.5C16.5 11.8865 16.0297 13.1632 15.2399 14.1792L20.0304 18.9697L18.9697 20.0303L14.1793 15.2399Z" fill="#888888"></path> </g></svg>
              <input
                type="text"
                placeholder="Search Staff"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="staff-search-input"
              />
            </div>

            <div className="staff-container">
              {sortedStaffs.map((staff: any) => (
                <div
                  key={staff.id}
                  onClick={() => getSelectedStaff(staff.id)}
                  className={`staff ${staff.id === selectedStaffId ? "active" : ""}`}
                  style={{
                    borderColor: staff.id === selectedStaffId ? staff.color : '#fff',
                    background: staff.id === selectedStaffId ? lightenColor(staff.color, 0.6) : 'transparent',
                  }}
                >
                  <div className="circle" style={{
                    height: '32px',
                    width: '32px',
                    color: staff.id === selectedStaffId ? "#fff" : staff.color,
                    borderColor: staff.color,
                    borderRadius: '50%',
                    border: '1px solid',
                    display: 'flex',
                    placeContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    backgroundColor: staff.id === selectedStaffId ? staff.color : lightenColor(staff.color, 0.7),
                  }}>
                    {staff.name.charAt(0).toUpperCase()}
                  </div>

                  <span>{staff.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            key={initialDate.toISOString()}
            locale={auth.language}
            plugins={getPlugins()}
            height="100%"
            handleWindowResize={true}
            selectable={true}
            editable={true}
            eventOverlap={true}
            eventDurationEditable={false}
            initialView="dayGridMonth"
            initialDate={initialDate}
            events={filteredEvents}
            firstDay={1}
            dayMaxEventRows={4}
            fixedWeekCount={true}
            showNonCurrentDates={true}
            eventContent={(eventInfo: any) => (
              <RenderEventContent eventInfo={eventInfo} />
            )}
            datesSet={(info: any) => {
              const prevButton = document.querySelector(
                ".fc-prev-button"
              ) as HTMLButtonElement;
              const nextButton = document.querySelector(
                ".fc-next-button"
              ) as HTMLButtonElement;

              if (
                calendarRef?.current?.getApi().getDate() &&
                !dayjs(schedule?.scheduleStartDate).isSame(
                  calendarRef?.current?.getApi().getDate()
                )
              )
                setInitialDate(calendarRef?.current?.getApi().getDate());

              const startDiff = dayjs(info.start)
                .utc()
                .diff(
                  dayjs(schedule.scheduleStartDate).subtract(1, "day").utc(),
                  "days"
                );
              const endDiff = dayjs(dayjs(schedule.scheduleEndDate)).diff(
                info.end,
                "days"
              );
              if (startDiff < 0 && startDiff > -35)
                prevButton.disabled = false;

              if (endDiff < 0 && endDiff > -32)
                nextButton.disabled = false;
            }}
            dayCellContent={({ date }) => {
              const currentDay = dayjs(date).format("DD");
              const currentMonth = dayjs(date).format("MM");
              const currentYear = dayjs(date).format("YYYY");

              const matchedDateObj = highlightedDates.find(d => {
                const [day, month, year] = d.date.split('.');
                return day === currentDay && month === currentMonth && year === currentYear;
              });

              const borderColor = matchedDateObj ? matchedDateObj.color : 'transparent';

              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderBottom: matchedDateObj ? `5px solid ${borderColor}` : 'none',
                  }}
                >
                  {dayjs(date).date()}
                </div>
              );
            }}
          />
        </div>

        {isModalOpen && (
          <EventModal event={selectedEvent} onClose={closeModal} />
        )}

      </div>
    </div >
  );
};

export default CalendarContainer;
