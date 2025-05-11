import React, { useState } from "react";
import { Link } from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    if (valid) {
      console.log("Đăng nhập với:", formData);
      // TODO: Gửi dữ liệu tới backend
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
                  Tên bệnh nhân <span className="required">*</span>
                </label>
                <div className="form-group">
                  <input
                    name="name"
                    id="name"
                    type="text"
                    className="form-control"
                    placeholder="Họ và tên"
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

              <div className="col-12 mt-3">
              <div className="text-center mt-3">
                <span>Bạn chưa có tài khoản? </span>
                <Link to="/register" className="text-primary fw-bold">
                  Đăng ký tại đây
                </Link>
              </div>
              </div>

              
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
