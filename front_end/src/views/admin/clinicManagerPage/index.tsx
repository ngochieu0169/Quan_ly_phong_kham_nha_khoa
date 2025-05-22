import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Clinic = {
  maPhongKham: number;
  tenPhongKham: string;
  diaChi: string;
  soDienThoai: string;
  gioLamViec: string;
  maChuPhongKham: string;
  trangthai: "duyệt" | "chưa duyệt" | "VIP";
};

type User = {
  tenTaiKhoan: string;
  hoTen: string;
};

const ClinicManagerPage: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [owners, setOwners] = useState<User[]>([]);

  // states for create modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClinic, setNewClinic] = useState({
    tenPhongKham: "",
    diaChi: "",
    soDienThoai: "",
    gioLamViec: "",
    maChuPhongKham: "",
  });

  // states for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  useEffect(() => {
    fetchClinics();
    fetchOwners();
  }, []);

  const fetchClinics = async () => {
    try {
      const res = await axios.get<Clinic[]>("http://localhost:3000/api/phongkham");
      setClinics(res.data);
    } catch {
      toast.error("Không tải được danh sách phòng khám");
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await axios.get<User[]>("http://localhost:3000/api/users/full");
      setOwners(res.data);
    } catch {
      toast.error("Không tải được danh sách chủ phòng khám");
    }
  };

  // Create handlers
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);
  const handleNewChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewClinic({ ...newClinic, [e.target.name]: e.target.value });
  };
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/phong-kham", newClinic);
      toast.success("Tạo mới phòng khám thành công!");
      closeAddModal();
      setNewClinic({ tenPhongKham: "", diaChi: "", soDienThoai: "", gioLamViec: "", maChuPhongKham: "" });
      fetchClinics();
    } catch {
      toast.error("Tạo mới thất bại");
    }
  };

  // Edit handlers (only status)
  const openEditModal = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedClinic(null);
  };
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (selectedClinic) {
      setSelectedClinic({ ...selectedClinic, trangthai: e.target.value as Clinic['trangthai'] });
    }
  };
  const handleUpdate = async () => {
    if (!selectedClinic) return;
    try {
      await axios.put(
        `http://localhost:3000/api/phong-kham/${selectedClinic.maPhongKham}`,
        { trangthai: selectedClinic.trangthai }
      );
      toast.success("Cập nhật trạng thái thành công!");
      closeEditModal();
      fetchClinics();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const deleteClinic = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/phong-kham/${id}`);
      toast.success("Xóa thành công!");
      fetchClinics();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="mb-4" style={{ color: "#223a66" }}>Quản lý Phòng Khám</h2>

      <div className="mb-3 text-end">
        <button className="btn btn-success" onClick={openAddModal}>
          + Thêm phòng khám
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead style={{ backgroundColor: "#223a66", color: "#fff" }}>
            <tr>
              <th>STT</th>
              <th>Tên PK</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
              <th>Giờ làm việc</th>
              <th>Chủ PK</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c, i) => (
              <tr key={c.maPhongKham}>
                <td>{i + 1}</td>
                <td>{c.tenPhongKham}</td>
                <td>{c.diaChi}</td>
                <td>{c.soDienThoai}</td>
                <td>{c.gioLamViec}</td>
                <td>{c.maChuPhongKham}</td>
                <td>
                  <span className={`badge ${
                    c.trangthai === "duyệt" ? "bg-success" :
                    c.trangthai === "chưa duyệt" ? "bg-warning text-dark" : "bg-info"
                  }`}>
                    {c.trangthai}
                  </span>
                </td>
                <td className="d-flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => openEditModal(c)}>
                    Sửa
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteClinic(c.maPhongKham)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {clinics.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  Không có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreate} className="row g-3 p-3">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo phòng khám mới</h5>
                  <button type="button" className="btn-close" onClick={closeAddModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Tên phòng khám</label>
                      <input
                        name="tenPhongKham"
                        value={newClinic.tenPhongKham}
                        onChange={handleNewChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Địa chỉ</label>
                      <input
                        name="diaChi"
                        value={newClinic.diaChi}
                        onChange={handleNewChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Số điện thoại</label>
                      <input
                        name="soDienThoai"
                        value={newClinic.soDienThoai}
                        onChange={handleNewChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Giờ làm việc</label>
                      <input
                        name="gioLamViec"
                        value={newClinic.gioLamViec}
                        onChange={handleNewChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Chủ phòng khám</label>
                      <select
                        name="maChuPhongKham"
                        value={newClinic.maChuPhongKham}
                        onChange={handleNewChange}
                        className="form-select"
                        required
                      >
                        <option value="">Chọn chủ phòng khám</option>
                        {owners.map(o => (
                          <option key={o.tenTaiKhoan} value={o.tenTaiKhoan}>
                            {o.hoTen} ({o.tenTaiKhoan})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Tạo mới</button>
                  <button type="button" className="btn btn-secondary" onClick={closeAddModal}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClinic && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật trạng thái</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Tên PK:</strong> {selectedClinic.tenPhongKham}</p>
                <p><strong>Địa chỉ:</strong> {selectedClinic.diaChi}</p>
                <div className="mb-3">
                  <label className="form-label">Trạng thái mới</label>
                  <select
                    className="form-select"
                    value={selectedClinic.trangthai}
                    onChange={handleStatusChange}
                  >
                    <option value="duyệt">duyệt</option>
                    <option value="chưa duyệt">chưa duyệt</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdate}>Cập nhật</button>
                <button className="btn btn-secondary" onClick={closeEditModal}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicManagerPage;
