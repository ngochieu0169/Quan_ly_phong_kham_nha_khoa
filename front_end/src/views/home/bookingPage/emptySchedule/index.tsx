import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";

const formatDateKey = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDisplay = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const weekdayNames = ["CN","Th 2","Th 3","Th 4","Th 5","Th 6","Th 7"];
  const wd = weekdayNames[d.getDay()];
  return { dayMonth: `${day}-${month}`, weekday: wd };
};

// type Slot = {
//   id: number;
//   start: string; // e.g. "08:00"
//   end: string;   // e.g. "10:00"
//   doctorName?: string;
// };

export default function EmptySchedule({ onSlotSelect }: any) {

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState([]) as any;
  const [selectedSlot, setSelectedSlot] = useState(null) as any

  // Mỗi khi ngày thay đổi → fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      const dateKey = formatDateKey(selectedDate);
      try {
        const res = await axios.get(`http://localhost:3000/api/cakham/lich-trong?date=${dateKey}`);
        // Đảm bảo response là mảng
        if (Array.isArray(res.data)) {
          setSlots(res.data);
        } else {
          console.warn("API không trả về mảng:", res.data);
          setSlots([]); // fallback an empty array
        }
        setSelectedSlot(null);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setSlots([]); // fallback an empty array
      }
    };
    fetchSlots();
  }, [selectedDate]);
  

  const { dayMonth, weekday } = formatDisplay(selectedDate);

  return (
    <div>
      {/* Chọn ngày bằng DatePicker */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <label className="form-label fw-bold">Chọn ngày:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(d) => d && setSelectedDate(d)}
          dateFormat="yyyy-MM-dd"
          className="form-control"
          minDate={new Date()}
        />
        <div style={{ marginLeft: 16 }}>
          <strong>{weekday}</strong>, {dayMonth}
        </div>
      </div>

      {/* Hiển thị khung giờ */}
      {slots.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {slots?.map((slot: any) => {
            const label = `${slot.start} - ${slot.end}`;
            return (
              <div
                key={slot.id}
                onClick={() => {
                    setSelectedSlot(slot)
                    onSlotSelect({
                      ...slot,
                      date: selectedDate
                    });
                }}
                style={{
                    padding: '10px 14px',
                    border: '1px solid #007bff',
                    borderRadius: '6px',
                    backgroundColor: selectedSlot === slot ? '#007bff' : '#e7f1ff',
                    color: selectedSlot === slot ? 'white' : '#007bff',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                  }}
                
              >
                <div>{label}</div>
                {slot.doctorName && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    BS: {slot.doctorName}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#dc3545" }}>
          Không còn khung giờ nào trống cho ngày này.
        </p>
      )}
    </div>
  );
}
