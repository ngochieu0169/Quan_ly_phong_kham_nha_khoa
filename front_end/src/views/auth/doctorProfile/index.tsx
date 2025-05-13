import React, { useState } from "react";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({
    name: "Phó giáo sư, Tiến sĩ, Bác sĩ Lâm Việt Trung",
    title: "Bác sĩ",
    experience: "25 năm kinh nghiệm",
    specialty: "Nha khoa",
    position: "Phó Giám Đốc Bệnh Viện Chợ Rẫy",
    workplace: "Bệnh viện Chợ Rẫy",
    avatar: "https://img.freepik.com/free-vector/beautiful-young-female-doctor-presenting-something-cartoon-illustration_56104-484.jpg?semt=ais_hybrid&w=740", // ảnh minh hoạ
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...doctor });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setDoctor(form);
    setShowModal(false);
  };

  return (
    <div className="container my-4">
      <div className=" p-4 d-flex flex-row align-items-start">
        <img
          src={doctor.avatar}
          alt="Doctor Avatar"
          className="rounded-circle me-4 m-3"
          style={{ width: "100px", height: "100px", objectFit: "cover" }}
        />
        <div className="flex-grow-1 ml-3">
          <h5 className="fw-bold mb-1">{doctor.name}</h5>
          <div className="mb-2">
            <span className="text-primary fw-semibold me-2">
              ✔ {doctor.title}
            </span>
            <span className="text-muted ml-3">{doctor.experience}</span>
          </div>
          <div className="mb-1">
            <strong>Chuyên khoa: </strong>
            <span className="text-primary">{doctor.specialty}</span>
          </div>
          <div className="mb-1">
            <strong>Chức vụ: </strong>
            {doctor.position}
          </div>
          <div className="mb-1">
            <strong>Nơi công tác: </strong>
            {doctor.workplace}
          </div>
        </div>
        <div>
          <button className="btn btn-outline-secondary" onClick={() => setShowModal(true)}>
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chỉnh sửa thông tin</h5>
                <button
                  type="button"
                  className="btn-close button-custom"
                  onClick={() => setShowModal(false)}
                >X</button>
              </div>
              <div className="modal-body">
                {["name", "title", "experience", "specialty", "position", "workplace"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label text-capitalize">
                      {field === "title" ? "Chức danh" :
                       field === "experience" ? "Kinh nghiệm" :
                       field === "specialty" ? "Chuyên khoa" :
                       field === "position" ? "Chức vụ" :
                       field === "workplace" ? "Nơi công tác" : "Họ tên"}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name={field}
                      value={form[field as keyof typeof form]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay khi modal mở */}
      {showModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}
