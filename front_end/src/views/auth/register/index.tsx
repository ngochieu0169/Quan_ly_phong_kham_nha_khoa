import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    tenTaiKhoan: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    gender: "",
    avatar: null as File | null,
  });

  const [errors, setErrors] = useState({
    name: "",
    tenTaiKhoan: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    gender: "",
    avatar: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "avatar" && files) {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      name: "",
      email: "",
      tenTaiKhoan: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      gender: "",
      avatar: "",
    };
    let valid = true;

    if (!formData.name) {
      newErrors.name = "Tên không được để trống."; valid = false;
    }
    if (!formData.tenTaiKhoan) {
      newErrors.tenTaiKhoan = "Tên TK không được để trống."; valid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email không được để trống."; valid = false;
    }
    if (!formData.phone) {
      newErrors.phone = "SĐT không được để trống."; valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống."; valid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp."; valid = false;
    }
    if (!formData.address) {
      newErrors.address = "Địa chỉ không được để trống."; valid = false;
    }
    if (!formData.gender) {
      newErrors.gender = "Chọn giới tính."; valid = false;
    }
    if (!formData.avatar) {
      newErrors.avatar = "Vui lòng chọn ảnh đại diện."; valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    // Chuẩn bị form dữ liệu multipart
    const payload = new FormData();
    payload.append("hoTen", formData.name);
    payload.append("ngaySinh", new Date().toISOString().split("T")[0]); // hoặc lấy ngày sinh nếu có field
    payload.append("gioiTinh", formData.gender);
    payload.append("eMail", formData.email);
    payload.append("soDienThoai", formData.phone);
    payload.append("diaChi", formData.address);
    payload.append("anh", formData.avatar!);

    // Thông tin tài khoản
    payload.append("tenTaiKhoan", formData.tenTaiKhoan);    // hoặc logic khác cho username
    payload.append("matKhau", formData.password);
    payload.append("maQuyen", import.meta.env.VITE_APP_RULE_USER); // ví dụ mặc định 4 = bệnh nhân

    try {
      await axios.post(
        "http://localhost:3000/api/users/register",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center pt-3 pb-5">
      <ToastContainer />
      <div className="card shadow" style={{ width: "100%", maxWidth: 600 }}>
        <div className="card-body">
          <h4 className="mb-4 text-center">Đăng ký</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Tên */}
              <div className="col-12 mb-3">
                <label className="form-label">Họ tên <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <small className="text-danger">{errors.name}</small>}
              </div>
              {/* Tên */}
              <div className="col-12 mb-3">
                <label className="form-label">Tên tài khoản <span className="required">*</span></label>
                <input
                  type="text"
                  name="tenTaiKhoan"
                  className="form-control"
                  placeholder="Tên tài khoản"
                  value={formData.tenTaiKhoan}
                  onChange={handleChange}
                />
                {errors.tenTaiKhoan && <small className="text-danger">{errors.tenTaiKhoan}</small>}
              </div>

              {/* Email */}
              <div className="col-12 mb-3">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>

              {/* SĐT */}
              <div className="col-12 mb-3">
                <label className="form-label">Số điện thoại <span className="required">*</span></label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <small className="text-danger">{errors.phone}</small>}
              </div>

              {/* Mật khẩu */}
              <div className="col-12 mb-3">
                <label className="form-label">Mật khẩu <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="col-12 mb-3">
                <label className="form-label">Xác nhận mật khẩu <span className="required">*</span></label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
              </div>

              {/* Địa chỉ */}
              <div className="col-12 mb-3">
                <label className="form-label">Địa chỉ <span className="required">*</span></label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <small className="text-danger">{errors.address}</small>}
              </div>

              {/* Giới tính */}
              <div className="col-12 mb-3">
                <label className="form-label">Giới tính <span className="required">*</span></label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
                {errors.gender && <small className="text-danger">{errors.gender}</small>}
              </div>

              {/* Upload ảnh */}
              <div className="col-12 mb-3">
                <label className="form-label">Ảnh đại diện <span className="required">*</span></label>
                <input
                  type="file"
                  name="avatar"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                />
                {errors.avatar && <small className="text-danger">{errors.avatar}</small>}
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary w-100">Đăng ký</button>
              </div>

              <div className="col-12 mt-3 text-center">
                <Link to="/login" className="text-primary fw-bold">
                  Về trang đăng nhập
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
