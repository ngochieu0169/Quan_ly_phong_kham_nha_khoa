import React, { useEffect, useState } from "react";
import axios from "axios";
import EmptySchedule from "./emptySchedule";
import { format } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [selectedDate, setSelectedDate] = useState<string>("");
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/phongkham")
      .then((res) => setPhongKhams(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPhongKham) {
      axios
        .get(
          `http://localhost:3000/api/users/full?maQuyen=2&maPhongKham=${selectedPhongKham}`
        )
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
  const handleSelect = (payload: { date: string; slot: Slot | null }) => {
    setSelectedDate(payload.date);
    setSelectedSlot({ start: payload.start, end: payload.end });
    console.log(payload);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const payloadCa = {
      ngayKham: format(new Date(selectedDate), "dd-MM-yyyy"),
      gioBatDau: selectedSlot.start,
      gioKetThuc: selectedSlot.end,
      moTa: formData.trieuChung,
      maNhaSi: Number(selectedDoctor) || null,
    };
    axios
      .post("http://localhost:3000/api/cakham", payloadCa)
      .then((res1) => {
        console.log("res:", res1);
        const maCaKham = res1.data.data.insertId;
        const payloadLich = {
          ngayDatLich: format(Date.now(), "dd-MM-yyyy"),
          trieuChung: formData.trieuChung,
          trangThai: "chờ",
          maBenhNhan: user.maNguoiDung,
          maNguoiDat: isRegisterForOther ? user.tenTaiKhoan : user.tenTaiKhoan,
          quanHeBenhNhanVaNguoiDat: isRegisterForOther
            ? formData.moiQuanHe
            : null,
          maCaKham,
        };
        return axios.post("http://localhost:3000/api/lichkham", payloadLich);
      })
      .then(() => {
        toast.success("Đặt lịch thành công");
        // reset toàn bộ
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
        toast.success("Đăng ký thành công");
      })
      .catch((err) => {
        // console.error(err);
        // alert("Đặt lịch thất bại.");
        toast.error("Đăng ký thất bại. Vui lòng thử lại.");
      });
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
                            key={doc.maNguoiDung}
                            value={doc.bacsiData?.maNhaSi}
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
                    <EmptySchedule onSlotSelect={handleSelect} />
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
