import React, { useEffect, useState } from "react";
import axios from "axios";
import { addDays, format, parseISO, isSameDay } from "date-fns";

type CaKham = {
  maCaKham: number;
  ngayKham: string;
  gioBatDau: string;
  gioKetThuc: string;
  moTa: string | null;
  maNhaSi: number | null;
};

const FIXED_SHIFTS = [
  { start: "08:00:00", end: "10:00:00" },
  { start: "10:00:00", end: "12:00:00" },
  { start: "13:00:00", end: "15:00:00" },
  { start: "15:00:00", end: "17:00:00" },
];

function RegisterShiftPage() {
  const [caKhams, setCaKhams] = useState<CaKham[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await axios.get(
          `http://localhost:3000/api/cakham?maNhaSi=${user.tenTaiKhoan}`
        );
        setCaKhams(res.data || []);
      } catch (err) {
        console.error("Lỗi khi fetch ca khám:", err);
      }
    };

    fetchData();
  }, []);

  const handleRegister = async (date: Date, start: string, end: string) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post(`http://localhost:3000/api/cakham`, {
        maNhaSi: user.tenTaiKhoan,
        ngayKham: format(date, "dd-MM-yyyy"),
        gioBatDau: start,
        gioKetThuc: end,
        moTa: '',
      });
      alert("Đăng ký thành công");
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
    }
  };

  const handleUpdate = async (maCaKham: number) => {
    try {
      await axios.put(`http://localhost:3000/api/cakham/${maCaKham}`, {
        trangThai: "xác nhận",
      });
      alert("Cập nhật thành công");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  const findCaKham = (date: Date, gioBatDau: string) => {
    return caKhams.find(
      (ca) =>
        isSameDay(parseISO(ca.ngayKham), date) &&
        ca.gioBatDau === gioBatDau
    );
  };

  return (
    <div>
      <h4 className="mb-4">Đăng ký ca khám</h4>
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Khung giờ / Ngày</th>
              {Array.from({ length: 7 }, (_, i) => {
                const date = addDays(new Date(), i + 1);
                return <th key={i}>{format(date, "dd/MM")}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {FIXED_SHIFTS.map(({ start, end }) => (
              <tr key={start}>
                <td>{`${start.slice(0, 5)} - ${end.slice(0, 5)}`}</td>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = addDays(new Date(), i + 1);
                  const ca = findCaKham(date, start);

                  if (ca) {
                    return (
                      <td key={i}>
                        <button
                          className="btn btn-success w-100"
                          onClick={() => handleUpdate(ca.maCaKham)}
                        >
                          {ca.moTa || "Đã đăng ký"}
                        </button>
                      </td>
                    );
                  }

                  return (
                    <td key={i}>
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => handleRegister(date, start, end)}
                      >
                        Đăng ký
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RegisterShiftPage;
