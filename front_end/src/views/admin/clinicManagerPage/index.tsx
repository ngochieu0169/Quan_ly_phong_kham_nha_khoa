import React from "react";

type Clinic = {
  id: number;
  name: string;
  owner: string;
  status: "Hoạt động" | "Ngừng hoạt động";
};

const clinics: Clinic[] = [
  { id: 1, name: "Phòng khám Nha Khoa A", owner: "Nguyễn Văn A", status: "Hoạt động" },
  { id: 2, name: "Phòng khám Nha Khoa B", owner: "Trần Thị B", status: "Ngừng hoạt động" },
  { id: 3, name: "Phòng khám Nha Khoa C", owner: "Lê Văn C", status: "Hoạt động" },
];

function ClinicManagerPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-4" style={{ color: "#223a66" }}>Quản lý Phòng Khám</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr style={{ backgroundColor: "#223a66", color: "white" }}>
              <th scope="col">STT</th>
              <th scope="col">Tên phòng khám</th>
              <th scope="col">Chủ sở hữu</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic, index) => (
              <tr key={clinic.id}>
                <td>{index + 1}</td>
                <td>{clinic.name}</td>
                <td>{clinic.owner}</td>
                <td>
                  <span className={`badge ${clinic.status === "Hoạt động" ? "bg-success" : "bg-secondary"}`}>
                    {clinic.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClinicManagerPage;
