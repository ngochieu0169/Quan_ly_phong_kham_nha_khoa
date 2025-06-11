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
  const weekdayNames = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
  const wd = weekdayNames[d.getDay()];
  return { dayMonth: `${day}-${month}`, weekday: wd };
};

// Ca khám mặc định - sẽ hiển thị khi không chọn bác sĩ cụ thể
const DEFAULT_TIME_SLOTS = [
  { start: "08:00", end: "09:00" },
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
];

interface EmptyScheduleProps {
  onSlotSelect: (data: any) => void;
  selectedDoctor?: string;
  selectedPhongKham?: string;
}

export default function EmptySchedule({ onSlotSelect, selectedDoctor, selectedPhongKham }: EmptyScheduleProps) {

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState([]) as any;
  const [selectedSlot, setSelectedSlot] = useState(null) as any

  // Mỗi khi ngày thay đổi hoặc bác sĩ thay đổi → fetch slots
  useEffect(() => {
    const fetchSlots = async () => {
      const dateKey = formatDateKey(selectedDate);
      try {
        if (selectedDoctor && selectedPhongKham) {
          // TH1: Có chọn bác sĩ - lấy ca khám của bác sĩ đó
          const res = await axios.get(
            `http://localhost:3000/api/cakham/bac-si?date=${dateKey}&maNhaSi=${selectedDoctor}&maPhongKham=${selectedPhongKham}`
          );
          if (Array.isArray(res.data)) {
            setSlots(res.data.map((slot: any) => ({ ...slot, hasDoctor: true })));
          } else {
            setSlots([]);
          }
        } else if (selectedPhongKham) {
          // TH2: Không chọn bác sĩ - LUÔN hiển thị TẤT CẢ ca mặc định
          const availableSlots = DEFAULT_TIME_SLOTS.map((slot, index) => ({
            id: `default_${index}`,
            start: slot.start,
            end: slot.end,
            hasDoctor: false,
            isDefault: true
          }));

          setSlots(availableSlots);
        } else {
          setSlots([]);
        }
        setSelectedSlot(null);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setSlots([]);
      }
    };

    if (selectedPhongKham) {
      fetchSlots();
    } else {
      setSlots([]);
    }
  }, [selectedDate, selectedDoctor, selectedPhongKham]);


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

      {/* Thông báo loại ca khám */}
      {selectedPhongKham && (
        <div className="mb-3">
          <div className="alert alert-info py-2">
            <small>
              <i className="icofont-info-circle me-2"></i>
              {selectedDoctor ?
                "Hiển thị ca khám có sẵn của bác sĩ đã chọn" :
                "Hiển thị khung giờ mặc định. Lễ tân sẽ phân công bác sĩ phù hợp cho bạn sau khi đặt lịch."
              }
            </small>
          </div>
        </div>
      )}

      {/* Hiển thị khung giờ */}
      {selectedPhongKham ? (
        slots.length > 0 ? (
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
                    border: `1px solid ${slot.isDefault ? '#6c757d' : '#007bff'}`,
                    borderRadius: '6px',
                    backgroundColor: selectedSlot === slot ?
                      (slot.isDefault ? '#6c757d' : '#007bff') :
                      (slot.isDefault ? '#f8f9fa' : '#e7f1ff'),
                    color: selectedSlot === slot ? 'white' :
                      (slot.isDefault ? '#495057' : '#007bff'),
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
                  {slot.isDefault && (
                    <div style={{ fontSize: 11, marginTop: 2, fontStyle: 'italic' }}>
                      Khung giờ khám
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#dc3545" }}>
            {selectedDoctor ?
              "Bác sĩ này không có ca khám nào trong ngày đã chọn." :
              "Không có ca khám nào cho ngày này."
            }
          </p>
        )
      ) : (
        <p style={{ color: "#6c757d" }}>
          Vui lòng chọn phòng khám trước để xem lịch trống.
        </p>
      )}
    </div>
  );
}
