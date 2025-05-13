import React, { useState } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";

type Shift = {
  date: Date;
  hour: number;
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7).filter(
  (h) => h < 11 || h > 13 // Loại bỏ từ 11h - 13h
);

// Tạo dữ liệu mẫu các ca đã đăng ký
const registeredShifts: Shift[] = [
  { date: startOfDay(addDays(new Date(), 1)), hour: 8 },
  { date: startOfDay(addDays(new Date(), 2)), hour: 14 },
  { date: startOfDay(addDays(new Date(), 3)), hour: 17 },
];

function RegisterShiftPage() {
  const [selectedShifts, setSelectedShifts] = useState<Shift[]>([]);

  const isShiftRegistered = (date: Date, hour: number) =>
    registeredShifts.some(
      (shift) => isSameDay(shift.date, date) && shift.hour === hour
    );

  const isShiftSelected = (date: Date, hour: number) =>
    selectedShifts.some(
      (shift) => isSameDay(shift.date, date) && shift.hour === hour
    );

  const handleToggle = (date: Date, hour: number) => {
    const alreadyRegistered = isShiftRegistered(date, hour);
    if (alreadyRegistered) return;

    const newShift: Shift = { date, hour };
    const alreadySelected = isShiftSelected(date, hour);

    if (alreadySelected) {
      setSelectedShifts((prev) =>
        prev.filter((s) => !(isSameDay(s.date, date) && s.hour === hour))
      );
    } else {
      setSelectedShifts((prev) => [...prev, newShift]);
    }
  };

  const handleSubmit = () => {
    if (selectedShifts.length === 0) {
      alert("Vui lòng chọn ít nhất một ca khám để đăng ký!");
      return;
    }
    console.log("Ca khám đã đăng ký:", selectedShifts);
    alert("Đăng ký thành công!");
    // TODO: Gửi dữ liệu lên server
  };

  return (
    <div className=" mt-4">
      <h4 className="mb-4">Đăng ký ca khám (Tối đa 7 ngày tới)</h4>
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Giờ / Ngày</th>
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(new Date(), i + 1);
                return <th key={i}>{format(date, "dd/MM")}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td>{`${hour}:00 - ${hour + 1}:00`}</td>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = startOfDay(addDays(new Date(), i + 1));
                  const registered = isShiftRegistered(date, hour);
                  const selected = isShiftSelected(date, hour);

                  return (
                    <td key={i}>
                      <button
                        className={`btn w-100 ${
                          registered
                            ? "btn-success"
                            : selected
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => handleToggle(date, hour)}
                        disabled={registered}
                      >
                        {registered
                          ? "Đã đăng ký"
                          : selected
                          ? "Đã chọn"
                          : "Trống"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="d-flex justify-content-between ">
      <div className="mt-4">
            <h6>Các ca vừa chọn:</h6>
            <ul>
              {selectedShifts.map((shift, idx) => (
                <li key={idx}>
                  {format(shift.date, "dd/MM/yyyy")} - {shift.hour}:00 ~{" "}
                  {shift.hour + 1}:00
                </li>
              ))}
            </ul>
          </div>

        <div className="text-end">
          <button className="btn btn-primary mt-3" onClick={handleSubmit}>
            Xác nhận đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterShiftPage;
