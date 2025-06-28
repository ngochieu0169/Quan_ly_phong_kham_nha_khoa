import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EmptySchedule from "./emptySchedule";
import { format } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notificationService } from "../../../services";

interface Slot {
  id: number;
  start: string;
  end: string;
  doctorName?: string;
}

const BookingPage = () => {
  const [isRegisterForOther, setIsRegisterForOther] = useState(false);
  const [phongKhams, setPhongKhams] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedPhongKham, setSelectedPhongKham] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState({}) as any;

  const [formData, setFormData] = useState({
    tenBenhNhan: "",
    sdt: "",
    tuoi: "",
    gioiTinh: "Nam",
    trieuChung: "",
    tenNguoiDatHo: "",
    moiQuanHe: "",
  });

  // Sử dụng useMemo để tránh parse user mỗi render
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isLoggedIn = Boolean(user && user.tenTaiKhoan);

  // Function để tính tuổi từ ngày sinh
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age.toString();
  };

  // Auto-fill thông tin user khi chọn "Đăng ký cho tôi"
  useEffect(() => {
    if (!isRegisterForOther && user && user.hoTen) {
      // Đăng ký cho chính mình - fill thông tin từ user
      setFormData(prev => ({
        ...prev,
        tenBenhNhan: user.hoTen || "",
        sdt: user.soDienThoai || "",
        tuoi: user.ngaySinh ? calculateAge(user.ngaySinh) : "",
        gioiTinh: user.gioiTinh || "Nam",
        tenNguoiDatHo: "",
        moiQuanHe: "",
      }));
    } else if (isRegisterForOther) {
      // Đăng ký hộ - clear thông tin để nhập thông tin người khác
      setFormData(prev => ({
        ...prev,
        tenBenhNhan: "",
        sdt: "",
        tuoi: "",
        gioiTinh: "Nam",
        tenNguoiDatHo: user.hoTen || "",
        moiQuanHe: "",
      }));
    }
  }, [isRegisterForOther, user.hoTen, user.soDienThoai, user.ngaySinh, user.gioiTinh]);

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (!isLoggedIn) {
    return (
      <div>
        <section className="page-title bg-1">
          <div className="overlay"></div>
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="block text-center">
                  <span className="text-white">Đăng ký</span>
                  <h1 className="text-capitalize mb-5 text-lg">
                    Đặt lịch nha khoa
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center">
                  <div className="mb-4">
                    <i className="icofont-lock text-primary" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h3 className="mb-3">Yêu cầu đăng nhập</h3>
                  <p className="mb-4 text-muted">
                    Để đặt lịch khám, bạn cần đăng nhập vào tài khoản của mình.
                    Nếu chưa có tài khoản, vui lòng đăng ký để sử dụng dịch vụ.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <Link to="/login" className="btn btn-main btn-round-full">
                      <i className="icofont-sign-in me-2"></i>Đăng nhập
                    </Link>
                    <Link to="/register" className="btn btn-main-2 btn-round-full">
                      <i className="icofont-ui-user me-2"></i>Đăng ký
                    </Link>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted">
                      <i className="icofont-phone me-2"></i>
                      Hoặc gọi hotline: <strong>+84 789 1256</strong> để được hỗ trợ đặt lịch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/phongkham")
      .then((res) => setPhongKhams(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPhongKham) {
      axios
        .get(`http://localhost:3000/api/nhasi?maPhongKham=${selectedPhongKham}`)
        .then((res) => setDoctors(res.data))
        .catch(console.error);
    } else {
      setDoctors([]);
    }
  }, [selectedPhongKham]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Nhận cả date và slot từ EmptySchedule
  const handleSelect = (payload: any) => {
    // payload.date là Date object từ EmptySchedule
    setSelectedDate(payload.date);
    setSelectedSlot(payload);
    console.log(payload);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (selectedSlot?.isDefault) {
      // TH2: Ca mặc định - tạo ca khám mới không có bác sĩ
      // Lấy tên phòng khám để thêm vào mô tả
      const selectedClinic = phongKhams.find(pk => pk.maPhongKham == selectedPhongKham);
      const payloadCa = {
        ngayKham: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
        gioBatDau: selectedSlot.start,
        gioKetThuc: selectedSlot.end,
        moTa: `[PK${selectedPhongKham}] ${formData.trieuChung}`,
        maNhaSi: null, // Không có bác sĩ, lễ tân sẽ phân công sau
      };

      axios
        .post("http://localhost:3000/api/cakham", payloadCa)
        .then((res1) => {
          const maCaKham = res1.data.data.insertId;
          const payloadLich = {
            ngayDatLich: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
            trieuChung: formData.trieuChung,
            trangThai: "Chờ",
            maBenhNhan: user.maNguoiDung,
            maNguoiDat: user.tenTaiKhoan,
            quanHeBenhNhanVaNguoiDat: isRegisterForOther
              ? formData.moiQuanHe
              : null,
            maCaKham,
          };
          return axios.post("http://localhost:3000/api/lichkham", payloadLich);
        })
        .then(async (lichKhamRes) => {
          const maLichKham = lichKhamRes.data.maLichKham;

          // Gửi thông báo cho bệnh nhân
          try {
            const selectedClinic = phongKhams.find(pk => pk.maPhongKham == selectedPhongKham);
            const notificationData = {
              maNguoiNhan: user.tenTaiKhoan,
              tieuDe: 'Đặt lịch khám thành công',
              noiDung: `Chúc mừng! Bạn đã đặt lịch khám thành công:\n\n` +
                `- Mã lịch: LK${maLichKham.toString().padStart(6, '0')}\n` +
                `- Phòng khám: ${selectedClinic?.tenPhongKham || 'Chưa xác định'}\n` +
                `- Ngày khám: ${selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}\n` +
                `- Giờ khám: ${selectedSlot.start} - ${selectedSlot.end}\n` +
                `- Bệnh nhân: ${formData.tenBenhNhan}\n` +
                `- Triệu chứng: ${formData.trieuChung}\n\n` +
                `Lưu ý: Lễ tân sẽ phân công bác sĩ và thông báo cho bạn sau.\n\n` +
                `Vui lòng đến đúng giờ hẹn. Xin cảm ơn!`
            };
            await notificationService.create(notificationData);
          } catch (notifError) {
            console.error('Error sending notification:', notifError);
            // Không hiển thị lỗi này cho user vì lịch khám đã được tạo thành công
          }

          console.log('🎉 Booking success - showing toast');
          console.log('Toast function exists:', typeof toast.success);

          // Toast chính
          setTimeout(() => {
            toast.success("Đặt lịch thành công! Lễ tân sẽ phân công bác sĩ cho bạn.");
          }, 100);

          resetForm();
        })
        .catch((err) => {
          console.error('❌ Booking error (no doctor):', err);
          toast.error("Đăng ký thất bại. Vui lòng thử lại.");
        });
    } else {
      // TH1: Ca khám có sẵn của bác sĩ - sử dụng ca khám đó
      const payloadLich = {
        ngayDatLich: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
        trieuChung: formData.trieuChung,
        trangThai: "Chờ",
        maBenhNhan: user.maNguoiDung,
        maNguoiDat: user.tenTaiKhoan,
        quanHeBenhNhanVaNguoiDat: isRegisterForOther
          ? formData.moiQuanHe
          : null,
        maCaKham: selectedSlot.id,
      };

      axios
        .post("http://localhost:3000/api/lichkham", payloadLich)
        .then(async (lichKhamRes) => {
          const maLichKham = lichKhamRes.data.maLichKham;

          // Gửi thông báo cho bệnh nhân
          try {
            const selectedClinic = phongKhams.find(pk => pk.maPhongKham == selectedPhongKham);
            const selectedDoctorInfo = doctors.find(doc => doc.maNhaSi == selectedDoctor);
            const notificationData = {
              maNguoiNhan: user.tenTaiKhoan,
              tieuDe: 'Đặt lịch khám thành công',
              noiDung: `Chúc mừng! Bạn đã đặt lịch khám thành công:\n\n` +
                `- Mã lịch: LK${maLichKham.toString().padStart(6, '0')}\n` +
                `- Phòng khám: ${selectedClinic?.tenPhongKham || 'Chưa xác định'}\n` +
                `- Bác sĩ: ${selectedDoctorInfo?.hoTen || 'Chưa xác định'}\n` +
                `- Ngày khám: ${format(new Date(selectedDate), "dd/MM/yyyy")}\n` +
                `- Giờ khám: ${selectedSlot.start} - ${selectedSlot.end}\n` +
                `- Bệnh nhân: ${formData.tenBenhNhan}\n` +
                `- Triệu chứng: ${formData.trieuChung}\n\n` +
                `Vui lòng đến đúng giờ hẹn. Xin cảm ơn!`
            };
            await notificationService.create(notificationData);
          } catch (notifError) {
            console.error('Error sending notification:', notifError);
            // Không hiển thị lỗi này cho user vì lịch khám đã được tạo thành công
          }

          console.log('🎉 Booking success (with doctor) - showing toast');
          console.log('Toast function exists:', typeof toast.success);

          // Toast chính
          setTimeout(() => {
            toast.success("Đặt lịch thành công!");
          }, 100);

          resetForm();
        })
        .catch((err) => {
          console.error('❌ Booking error (with doctor):', err);
          toast.error("Đăng ký thất bại. Vui lòng thử lại.");
        });
    }
  };

  const resetForm = () => {
    setFormData({
      tenBenhNhan: "",
      sdt: "",
      tuoi: "",
      gioiTinh: "Nam",
      trieuChung: "",
      tenNguoiDatHo: "",
      moiQuanHe: "",
    });
    setSelectedPhongKham("");
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedSlot(null);
  };

  return (
    <div>
      <section className="page-title bg-1">
        <div className="overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="block text-center">
                <span className="text-white">Đăng ký</span>
                <h1 className="text-capitalize mb-5 text-lg">
                  Đặt lịch nha khoa
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="appoinment section">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3">
              <div className="mt-3">
                <div className="feature-icon mb-3">
                  <i className="icofont-support text-lg"></i>
                </div>
                <span className="h3">Đặt lịch khám qua tổng đài</span>
                <h3 className="text-color mt-3">+84 789 1256 </h3>
              </div>
            </div>

            {/* Main Form */}
            <div className="col-lg-9">
              <div className="appoinment-wrap mt-5 mt-lg-0 pl-lg-5">
                <h2 className="mb-2 title-color">Đặt lịch online</h2>
                <p className="mb-4">
                  Vui lòng cung cấp thông tin để phòng khám hỗ trợ đặt lịch trực
                  tuyến
                </p>

                {/* Radio group */}
                <div className="mb-4">
                  <label className="form-label d-block">
                    Đối tượng đăng ký:
                  </label>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="registerType"
                      id="self"
                      value="self"
                      checked={!isRegisterForOther}
                      onChange={() => setIsRegisterForOther(false)}
                    />
                    <label className="form-check-label" htmlFor="self">
                      Đăng ký cho tôi
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="registerType"
                      id="other"
                      value="other"
                      checked={isRegisterForOther}
                      onChange={() => setIsRegisterForOther(true)}
                    />
                    <label className="form-check-label" htmlFor="other">
                      Đăng ký hộ
                    </label>
                  </div>
                </div>

                <form className="appoinment-form" onSubmit={handleSubmit}>
                  {/* Phòng khám */}
                  <div className="row">
                    <div className="col-lg-6">
                      <label className="form-label">Chọn phòng khám *</label>
                      <select
                        className="form-control"
                        value={selectedPhongKham}
                        onChange={(e) => setSelectedPhongKham(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn phòng khám --</option>
                        {phongKhams.map((pk: any) => (
                          <option key={pk.maPhongKham} value={pk.maPhongKham}>
                            {pk.tenPhongKham}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bác sĩ */}
                    <div className="col-lg-6">
                      <label className="form-label">Bác sĩ chỉ định</label>
                      <select
                        className="form-control"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                      >
                        <option value="">-- Không chọn bác sĩ --</option>
                        {doctors.map((doc: any) => (
                          <option
                            key={doc.maNhaSi}
                            value={doc.maNhaSi}
                          >
                            {doc.hoTen}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tên bệnh nhân */}
                    <div className="col-lg-6">
                      <label className="form-label">Tên bệnh nhân *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="tenBenhNhan"
                        value={formData.tenBenhNhan}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Đăng ký hộ */}
                    {isRegisterForOther && (
                      <>
                        <div className="col-lg-6">
                          <label className="form-label">
                            Tên người đặt hộ *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="tenNguoiDatHo"
                            value={formData.tenNguoiDatHo}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-lg-6">
                          <label className="form-label">Mối quan hệ *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="moiQuanHe"
                            value={formData.moiQuanHe}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Các trường còn lại: sdt, tuổi, giới tính */}
                    <div className="col-lg-6">
                      <label className="form-label">Số điện thoại *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="sdt"
                        value={formData.sdt}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Tuổi *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="tuoi"
                        value={formData.tuoi}
                        onChange={handleInputChange}
                        min="1"
                        max="150"
                        required
                      />
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">Giới tính *</label>
                      <select
                        className="form-control"
                        name="gioiTinh"
                        value={formData.gioiTinh}
                        onChange={handleInputChange}
                      >
                        <option>Nam</option>
                        <option>Nữ</option>
                        <option>Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Lịch trống theo ngày + slot UI */}
                  <div className="mt-4 mb-4">
                    <EmptySchedule
                      onSlotSelect={handleSelect}
                      selectedDoctor={selectedDoctor}
                      selectedPhongKham={selectedPhongKham}
                    />
                  </div>

                  {/* Triệu chứng */}
                  <div className="form-group-2 mb-4">
                    <label className="form-label">Mô tả triệu chứng *</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      name="trieuChung"
                      value={formData.trieuChung}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-main btn-round-full">
                    Đặt lịch ngay <i className="icofont-simple-right ml-2"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
