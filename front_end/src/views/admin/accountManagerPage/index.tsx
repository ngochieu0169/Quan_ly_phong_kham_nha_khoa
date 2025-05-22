import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface User {
  maNguoiDung: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  eMail: string;
  soDienThoai: string;
  diaChi: string;
  anh: string | null;
  tenTaiKhoan: string;
  maQuyen: number;
  tenQuyen: string;
}

interface Quyen {
  maQuyen: number;
  tenQuyen: string;
}

function AccountManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [quyens, setQuyens] = useState<Quyen[]>([]);
  const [modalUser, setModalUser] = useState<Partial<User & { matKhau?: string; file?: File }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchQuyens();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>("http://localhost:3000/api/users/full");
      setUsers(res.data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const fetchQuyens = async () => {
    try {
      const res = await axios.get<Quyen[]>("http://localhost:3000/api/quyen");
      setQuyens(res.data);
    } catch {
      toast.error("Không thể tải danh sách quyền");
    }
  };

  const handleDelete = async (maNguoiDung: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/delete/${maNguoiDung}`);
      toast.success("Xóa tài khoản thành công");
      fetchUsers();
    } catch {
      toast.error("Xóa tài khoản thất bại");
    }
  };

  const handleEdit = (user: User) => {
    setModalUser({ ...user });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setModalUser({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    const form = new FormData();
    form.append("hoTen", modalUser.hoTen || "");
    form.append("ngaySinh", modalUser.ngaySinh?.split('T')[0] || "");
    form.append("gioiTinh", modalUser.gioiTinh || "");
    form.append("eMail", modalUser.eMail || "");
    form.append("soDienThoai", modalUser.soDienThoai || "");
    form.append("diaChi", modalUser.diaChi || "");
    if (!isEditing) {
      form.append("tenTaiKhoan", modalUser.tenTaiKhoan || "");
      form.append("matKhau", modalUser.matKhau || "");
      form.append("maQuyen", String(modalUser.maQuyen || 1));
    }
    if (modalUser.file) {
      form.append("anh", modalUser.file);
    }

    try {
      if (isEditing) {
        await axios.put(
          `http://localhost:3000/api/users/edit/${modalUser.maNguoiDung}`,
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success("Cập nhật thông tin người dùng thành công");
      } else {
        await axios.post(
          "http://localhost:3000/api/users/register",
          form,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success("Thêm tài khoản thành công");
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch {
      toast.error("Lưu thông tin thất bại");
    }
  };

  // Lọc theo tên hoặc email
  const filtered = users.filter(u =>
    u.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.eMail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <ToastContainer />
      <h4 className="mb-4">Quản lý tài khoản</h4>
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Tìm theo họ tên hoặc email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreate}>Thêm tài khoản</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Họ tên</th>
              <th>Tài khoản</th>
              <th>Quyền</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày sinh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={user.maNguoiDung}>
                <td>{idx + 1}</td>
                <td>
                  {user.anh && <img src={user.anh} alt={user.hoTen} width="48" height="48" className="rounded-circle" />}
                </td>
                <td>{user.hoTen}</td>
                <td>{user.tenTaiKhoan}</td>
                <td>{user.tenQuyen}</td>
                <td>{user.eMail}</td>
                <td>{user.soDienThoai}</td>
                <td>{new Date(user.ngaySinh).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(user)}>Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.maNguoiDung)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Cập nhật người dùng" : "Thêm người dùng"}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} />
              </div>
              <div className="modal-body">
                {!isEditing && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Tên tài khoản</label>
                      <input className="form-control" value={modalUser.tenTaiKhoan || ""} onChange={e => setModalUser({ ...modalUser, tenTaiKhoan: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu</label>
                      <input type="password" className="form-control" value={modalUser.matKhau || ""} onChange={e => setModalUser({ ...modalUser, matKhau: e.target.value })} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quyền</label>
                      <select className="form-select" value={modalUser.maQuyen || ""} onChange={e => setModalUser({ ...modalUser, maQuyen: +e.target.value })}>
                        <option value="">Chọn quyền</option>
                        {quyens.map(q => (
                          <option key={q.maQuyen} value={q.maQuyen}>{q.tenQuyen}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="mb-3">
                  <label className="form-label">Họ tên</label>
                  <input className="form-control" value={modalUser.hoTen || ""} onChange={e => setModalUser({ ...modalUser, hoTen: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={modalUser.eMail || ""} onChange={e => setModalUser({ ...modalUser, eMail: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Số điện thoại</label>
                  <input className="form-control" value={modalUser.soDienThoai || ""} onChange={e => setModalUser({ ...modalUser, soDienThoai: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-control" value={modalUser.ngaySinh?.split('T')[0] || ""} onChange={e => setModalUser({ ...modalUser, ngaySinh: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Giới tính</label>
                  <select className="form-select" value={modalUser.gioiTinh || ""} onChange={e => setModalUser({ ...modalUser, gioiTinh: e.target.value })}>
                    <option value="">Chọn</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-control" value={modalUser.diaChi || ""} onChange={e => setModalUser({ ...modalUser, diaChi: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ảnh đại diện</label>
                  <input type="file" className="form-control" accept="image/*" onChange={e => setModalUser({ ...modalUser, file: e.target.files?.[0] })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
                <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountManager;
