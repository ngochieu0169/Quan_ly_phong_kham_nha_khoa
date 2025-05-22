import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser } from "../../../store/user";

interface LoginResponse {
  message: string;
  user: {
    tenTaiKhoan: string;
    maQuyen: number;
    tenQuyen: string;
    maNguoiDung: number;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    eMail: string;
    soDienThoai: string;
    diaChi: string;
    anh: string;
  };
}

function LoginPage() {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [errors, setErrors] = useState({ name: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { name: "", password: "" };
    let valid = true;

    if (!formData.name) {
      newErrors.name = "Tên không được để trống.";
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống.";
      valid = false;
    }
    setErrors(newErrors);
    if (!valid) return;

    try {
      const res = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenTaiKhoan: formData.name,
          matKhau: formData.password,
        }),
      });
      const data: LoginResponse = await res.json();

      if (res.ok) {
        console.log('user: ', data.user)
        // Lưu thông tin user (toàn bộ object) vào localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        dispatch(updateUser(data.user));

        // Điều hướng theo quyền
        switch(data.user.maQuyen) {
          case 1:
            navigate("/admin");
            break;
          case 2:
            navigate("/doctor/profile");
            break;
          case 3:
            navigate("/le-tan");
            break;
          case 4:
            navigate("/");
            break;
          case 5:
            navigate("/phong-kham");
            break;
          default:
        }
        
      } else {
        alert(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối đến server");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "70vh" }}
    >
      <div className="card shadow" style={{ width: "100%", maxWidth: 500 }}>
        <div className="card-body">
          <h4 className="mb-4 text-center">Đăng nhập</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12 mb-3">
                <label className="form-label">
                  Tài khoản <span className="required">*</span>
                </label>
                <div className="form-group">
                  <input
                    name="name"
                    id="name"
                    type="text"
                    className="form-control"
                    placeholder="Tài khoản"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <small className="text-danger">{errors.name}</small>
                  )}
                </div>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">
                  Mật khẩu <span className="required">*</span>
                </label>
                <div className="form-group">
                  <input
                    name="password"
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <small className="text-danger">{errors.password}</small>
                  )}
                </div>
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="btn btn-primary w-100">
                  Đăng nhập
                </button>
              </div>

              <div className="col-12 mt-3 text-center">
                <span>Bạn chưa có tài khoản? </span>
                <Link to="/register" className="text-primary fw-bold">
                  Đăng ký tại đây
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
