import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { userServiceExtended, authService } from "../../../services";
import { validateForm, userValidationSchema, type ValidationErrors } from "../../../utils/validation";
import FileUpload from "../../../components/shared/FileUpload";

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
  const [quyens, setQuyens] = useState<Quyen[]>([
    { maQuyen: 1, tenQuyen: 'Quản trị viên' },
    { maQuyen: 2, tenQuyen: 'Nha sĩ' },
    { maQuyen: 3, tenQuyen: 'Lễ tân' },
    { maQuyen: 4, tenQuyen: 'Bệnh nhân' },
    { maQuyen: 5, tenQuyen: 'Chủ phòng khám' }
  ]);
  const [modalUser, setModalUser] = useState<Partial<User & { matKhau?: string; file?: File }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userServiceExtended.getFullList();
      setUsers(res.data);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const handleDelete = async (maNguoiDung: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) return;
    try {
      await userServiceExtended.deleteUser(maNguoiDung);
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
    setErrors({});
  };

  const handleCreate = () => {
    setModalUser({
      maQuyen: 4 // Default to patient
    });
    setIsEditing(false);
    setIsModalOpen(true);
    setErrors({});
    setShowPassword(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setShowPassword(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setModalUser({ ...modalUser, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSave = async () => {
    // Validate form
    let validationSchema = { ...userValidationSchema };
    if (isEditing) {
      // Remove password validation for editing
      delete validationSchema.tenTaiKhoan;
      delete validationSchema.matKhau;
    }

    const validationErrors = validateForm(modalUser, validationSchema);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
        await userServiceExtended.updateUser(modalUser.maNguoiDung!, form);
        toast.success("Cập nhật thông tin người dùng thành công");
      } else {
        await authService.register(form);
        toast.success("Thêm tài khoản thành công");
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "Lưu thông tin thất bại";
      toast.error(message);
    }
  };

  const getRoleBadgeColor = (maQuyen: number) => {
    const colors: { [key: number]: string } = {
      1: 'danger',    // Admin
      2: 'primary',   // Nha sĩ
      3: 'info',      // Lễ tân
      4: 'success',   // Bệnh nhân
      5: 'warning'    // Chủ phòng khám
    };
    return colors[maQuyen] || 'secondary';
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.eMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tenTaiKhoan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !filterRole || u.maQuyen.toString() === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="container-fluid">
      <ToastContainer />
      <h4 className="mb-4">Quản lý tài khoản</h4>

      {/* Search and Filter */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo họ tên, email, tài khoản..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            {quyens.map(q => (
              <option key={q.maQuyen} value={q.maQuyen}>{q.tenQuyen}</option>
            ))}
          </select>
        </div>
        <div className="col-md-5 text-end">
          <button className="btn btn-primary" onClick={handleCreate}>
            <i className="icofont-plus me-2"></i>Thêm tài khoản
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Họ tên</th>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày sinh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr key={user.maNguoiDung}>
                <td>{idx + 1}</td>
                <td>
                  {user.anh ? (
                    <img
                      src={user.anh}
                      alt={user.hoTen}
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                      style={{ width: '40px', height: '40px' }}
                    >
                      {user.hoTen.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="fw-medium">{user.hoTen}</td>
                <td>{user.tenTaiKhoan}</td>
                <td>
                  <span className={`badge bg-${getRoleBadgeColor(user.maQuyen)}`}>
                    {user.tenQuyen}
                  </span>
                </td>
                <td>{user.eMail}</td>
                <td>{user.soDienThoai}</td>
                <td>{new Date(user.ngaySinh).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(user)}
                      title="Sửa"
                    >
                      <i className="icofont-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.maNguoiDung)}
                      title="Xóa"
                    >
                      <i className="icofont-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-5 text-muted">
            <i className="icofont-users fs-1"></i>
            <p className="mt-2">Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Cập nhật người dùng" : "Thêm người dùng mới"}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} />
              </div>
              <div className="modal-body">
                {!isEditing && (
                  <>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tên tài khoản <span className="text-danger">*</span></label>
                        <input
                          className={`form-control ${errors.tenTaiKhoan ? 'is-invalid' : ''}`}
                          value={modalUser.tenTaiKhoan || ""}
                          onChange={e => handleInputChange('tenTaiKhoan', e.target.value)}
                          placeholder="Nhập tên tài khoản"
                        />
                        {errors.tenTaiKhoan && (
                          <div className="invalid-feedback">{errors.tenTaiKhoan}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Mật khẩu <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`form-control ${errors.matKhau ? 'is-invalid' : ''}`}
                            value={modalUser.matKhau || ""}
                            onChange={e => handleInputChange('matKhau', e.target.value)}
                            placeholder="Nhập mật khẩu"
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`icofont-${showPassword ? 'eye-blocked' : 'eye'}`}></i>
                          </button>
                          {errors.matKhau && (
                            <div className="invalid-feedback">{errors.matKhau}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Vai trò <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={modalUser.maQuyen || ""}
                        onChange={e => handleInputChange('maQuyen', +e.target.value)}
                      >
                        {quyens.map(q => (
                          <option key={q.maQuyen} value={q.maQuyen}>{q.tenQuyen}</option>
                        ))}
                      </select>
                    </div>
                    <hr className="my-4" />
                  </>
                )}

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Họ tên <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${errors.hoTen ? 'is-invalid' : ''}`}
                      value={modalUser.hoTen || ""}
                      onChange={e => handleInputChange('hoTen', e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.hoTen && (
                      <div className="invalid-feedback">{errors.hoTen}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className={`form-control ${errors.eMail ? 'is-invalid' : ''}`}
                      value={modalUser.eMail || ""}
                      onChange={e => handleInputChange('eMail', e.target.value)}
                      placeholder="example@email.com"
                    />
                    {errors.eMail && (
                      <div className="invalid-feedback">{errors.eMail}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                    <input
                      className={`form-control ${errors.soDienThoai ? 'is-invalid' : ''}`}
                      value={modalUser.soDienThoai || ""}
                      onChange={e => handleInputChange('soDienThoai', e.target.value)}
                      placeholder="0xxxxxxxxx"
                    />
                    {errors.soDienThoai && (
                      <div className="invalid-feedback">{errors.soDienThoai}</div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Ngày sinh <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className={`form-control ${errors.ngaySinh ? 'is-invalid' : ''}`}
                      value={modalUser.ngaySinh?.split('T')[0] || ""}
                      onChange={e => handleInputChange('ngaySinh', e.target.value)}
                    />
                    {errors.ngaySinh && (
                      <div className="invalid-feedback">{errors.ngaySinh}</div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Giới tính</label>
                    <select
                      className="form-select"
                      value={modalUser.gioiTinh || ""}
                      onChange={e => handleInputChange('gioiTinh', e.target.value)}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    className="form-control"
                    value={modalUser.diaChi || ""}
                    onChange={e => handleInputChange('diaChi', e.target.value)}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="mb-3">
                  <FileUpload
                    label="Ảnh đại diện"
                    onChange={(file) => handleInputChange('file', file)}
                    preview={modalUser.anh}
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="icofont-save me-2"></i>
                  {isEditing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountManager;
