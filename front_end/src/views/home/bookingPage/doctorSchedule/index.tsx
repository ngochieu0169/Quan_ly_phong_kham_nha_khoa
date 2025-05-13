import React, { useState } from 'react';

const doctorSchedule = [
  {
    date: '2025-05-05',
    weekday: 'Th 2',
    slots: [],
  },
  {
    date: '2025-05-07',
    weekday: 'Th 4',
    slots: ['18:30 - 18:45', '18:45 - 19:00'],
  },
  {
    date: '2025-05-09',
    weekday: 'Th 6',
    slots: ['08:00 - 08:15', '08:15 - 08:30', '08:30 - 08:45', '09:00 - 09:15', '10:00 - 10:15', '11:00 - 11:15', '13:00 - 13:15'],
  },
  {
    date: '2025-05-12',
    weekday: 'Th 2',
    slots: ['08:00 - 08:15'],
  },
  {
    date: '2025-05-14',
    weekday: 'Th 4',
    slots: ['14:00 - 14:15', '14:15 - 14:30', '15:00 - 15:15'],
  },
  {
    date: '2025-05-16',
    weekday: 'Th 6',
    slots: ['10:00 - 10:15', '10:15 - 10:30'],
  },
  {
    date: '2025-05-18',
    weekday: 'CN',
    slots: ['08:00 - 08:15', '09:00 - 09:15'],
  },
  {
    date: '2025-05-20',
    weekday: 'Th 3',
    slots: ['13:00 - 13:15'],
  },
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}`;
};

const MAX_VISIBLE_DAYS = 5; // số lượng ngày hiển thị 1 lần

export default function DoctorSchedule() {
  const [selectedDate, setSelectedDate] = useState(doctorSchedule[0].date);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const startIdx = page * MAX_VISIBLE_DAYS;
  const endIdx = startIdx + MAX_VISIBLE_DAYS;
  const visibleDays = doctorSchedule.slice(startIdx, endIdx);

  const canGoBack = startIdx > 0;
  const canGoForward = endIdx < doctorSchedule.length;

  const selectedDay = doctorSchedule.find(day => day.date === selectedDate);

  return (
    <div>
      {/* Thanh chọn ngày */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button className='button-custom'
          onClick={() => setPage(page - 1)}
          disabled={!canGoBack}
          style={{ marginRight: '10px' }}
        >
          &#60;
        </button>

        <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', flexGrow: 1 }}>
          {visibleDays.map((day) => (
            <div
              key={day.date}
              onClick={() => {
                setSelectedDate(day.date);
                setSelectedSlot(null); // reset slot khi đổi ngày
              }}
              style={{
                padding: '10px 16px',
                border: selectedDate === day.date ? '2px solid blue' : '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '100px',
                textAlign: 'center',
                backgroundColor: day.slots.length === 0 ? '#f8d7da' : '#d4edda',
                color: day.slots.length === 0 ? '#721c24' : '#155724',
              }}
            >
              <div><strong>{day.weekday}</strong>, {formatDate(day.date)}</div>
              <div style={{ fontSize: '12px' }}>
                {day.slots.length === 0 ? 'Đã đầy lịch' : `${day.slots.length} khung giờ`}
              </div>
            </div>
          ))}
        </div>

        <button
        className='button-custom'
          onClick={() => setPage(page + 1)}
          disabled={!canGoForward}
          style={{ marginLeft: '10px' }}
        >
          &#62;	
        </button>
      </div>

      {/* Hiển thị khung giờ */}
      {selectedDay?.slots.length ? (
        <div>
          <h5>🕒 Buổi chiều</h5>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {selectedDay.slots.map((slot, index) => (
              <div
                key={index}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  padding: '10px 14px',
                  border: selectedSlot === slot ? '2px solid #007bff' : '1px solid #007bff',
                  borderRadius: '6px',
                  backgroundColor: selectedSlot === slot ? '#007bff' : '#e7f1ff',
                  color: selectedSlot === slot ? 'white' : '#007bff',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {slot}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: '#dc3545' }}>Không còn khung giờ nào trong ngày này.</p>
      )}
    </div>
  );
}
