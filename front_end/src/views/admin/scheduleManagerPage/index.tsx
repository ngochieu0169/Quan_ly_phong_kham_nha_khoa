import React from "react";

interface Schedule {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  patientName: string;
  description: string;
  status: "Chưa xác nhận" | "Đã xác nhận";
}

const mockSchedules: Schedule[] = [
  {
    id: 1,
    date: "2025-05-12",
    startTime: "08:00",
    endTime: "08:30",
    patientName: "Nguyễn Văn A",
    description: "Khám tổng quát",
    status: "Chưa xác nhận",
  },
  {
    id: 2,
    date: "2025-05-12",
    startTime: "09:00",
    endTime: "09:30",
    patientName: "Trần Thị B",
    description: "Lấy cao răng",
    status: "Đã xác nhận",
  },
];

const ScheduleManager: React.FC = () => {
  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-primary">Quản lý lịch khám</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Ngày khám</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Tên bệnh nhân</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {mockSchedules.map((s, index) => (
              <tr key={s.id}>
                <td>{index + 1}</td>
                <td>{s.date}</td>
                <td>{s.startTime}</td>
                <td>{s.endTime}</td>
                <td>{s.patientName}</td>
                <td>{s.description}</td>
                <td>
                  <span
                    className={`badge ${
                      s.status === "Đã xác nhận"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleManager;
