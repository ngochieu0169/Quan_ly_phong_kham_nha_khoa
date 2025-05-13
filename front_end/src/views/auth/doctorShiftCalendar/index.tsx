import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { format, addDays } from "date-fns";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
 
const localizer = momentLocalizer(moment);

const DoctorShiftCalendar = () => {
  const [date, setDate] = useState(new Date());
  // const [showModal, setShowModal] = useState(false);
  // const [selectedEvent, setSelectedEvent] = useState(null);

  const events = [
    {
      title: "Khám bệnh: Nguyễn Văn A",
      start: new Date(2025, 4, 12, 8, 0),
      end: new Date(2025, 4, 12, 8, 30),
    },
    {
      title: "Khám bệnh: Trần Thị B",
      start: new Date(2025, 4, 13, 10, 0),
      end: new Date(2025, 4, 13, 10, 45),
    },
    {
      title: "Khám bệnh: Lê Văn C",
      start: new Date(2025, 4, 14, 13, 0),
      end: new Date(2025, 4, 14, 13, 30),
    },
    {
      title: "Khám bệnh: Mai Thị D",
      start: new Date(2025, 4, 15, 9, 0),
      end: new Date(2025, 4, 15, 9, 30),
    },
    {
      title: "Khám bệnh: Phạm Văn E",
      start: new Date(2025, 4, 16, 15, 0),
      end: new Date(2025, 4, 16, 15, 45),
    },
    {
      title: "Khám bệnh: Đinh Thị F",
      start: new Date(2025, 4, 17, 16, 0),
      end: new Date(2025, 4, 17, 16, 30),
    },
    {
      title: "Khám bệnh: Nguyễn Văn G",
      start: new Date(2025, 4, 12, 14, 0),
      end: new Date(2025, 4, 12, 14, 30),
    },
    {
      title: "Khám bệnh: Trần Thị H",
      start: new Date(2025, 4, 13, 11, 0),
      end: new Date(2025, 4, 13, 11, 45),
    },
  ];

  const handleEventClick = (event: any) => {
    // setSelectedEvent(event);
    // setShowModal(true);
  };

  return (
    <div className=" mt-4 schedule">
      <h4 className="mb-3">
        Ca khám của tôi: Tuần {format(date, "dd/MM")} -{" "}
        {format(addDays(date, 6), "dd/MM")}
      </h4>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["week"]}
        step={15}
        timeslots={2}
        date={date}
        onNavigate={setDate}
        style={{ height: 600 }}
        messages={{
          week: "Tuần",
          day: "Ngày",
          today: "Hôm nay",
          previous: "Trước",
          next: "Sau",
        }}
        components={{
          event: ({ event }) => (
            <div
              onClick={() => handleEventClick(event)}
              style={{ padding: "2px", fontSize: "0.85em", cursor: "pointer" }}
            >
              <strong>{event.title}</strong>
              <br />
            </div>
          ),
          toolbar: (props) => (
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <button
                className="btn btn-outline-primary"
                onClick={() => props.onNavigate("PREV")}
              >
                ← Tuần trước
              </button>
              <h5 className="m-0">
                {format(props.date, "dd/MM/yyyy")} -{" "}
                {format(addDays(props.date, 6), "dd/MM/yyyy")}
              </h5>
              <button
                className="btn btn-outline-primary"
                onClick={() => props.onNavigate("NEXT")}
              >
                Tuần sau →
              </button>
            </div>
          ),
        }}
        min={new Date(2025, 4, 12, 6, 0)} // Giới hạn thời gian bắt đầu từ 6h sáng
        max={new Date(2025, 4, 12, 20, 0)} // Giới hạn thời gian kết thúc ở 20h tối
      />

  
    </div>
  );
};

export default DoctorShiftCalendar;
