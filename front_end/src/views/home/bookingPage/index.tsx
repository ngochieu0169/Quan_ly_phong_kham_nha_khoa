import React, { useState } from "react";
import DoctorSchedule from "./doctorSchedule";

function BookingPage() {
  const [isRegisterForOther, setIsRegisterForOther] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDoctor(e.target.value);
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

                <form className="appoinment-form" method="post" action="#">
                  <div className="row">
                    {/* Phòng khám */}
                    <div className="col-lg-6">
                      <label className="form-label">
                        Chọn phòng khám <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <select className="form-control">
                          <option>Phòng khám 1</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <label className="form-label">
                        Tên bệnh nhân <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tên bệnh nhân"
                        />
                      </div>
                    </div>

                    {/* Nếu đăng ký hộ thì hiển thị thêm */}
                    {isRegisterForOther && (
                      <>
                        <div className="col-lg-6">
                          <label className="form-label">
                            Tên người đặt hộ <span className="required">*</span>
                          </label>
                          <div className="form-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tên người đặt hộ"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <label className="form-label">
                            Mối quan hệ <span className="required">*</span>
                          </label>
                          <div className="form-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="VD: Anh/em/bố/mẹ"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Các trường thông tin bình thường */}
                    <div className="col-lg-6">
                      <label className="form-label">
                        Số điện thoại <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="09xxxxxxx"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">
                        Tuổi <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Tuổi"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label className="form-label">
                        Giới tính <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <select className="form-control">
                          <option>Nam</option>
                          <option>Nữ</option>
                          <option>Khác</option>
                        </select>
                      </div>
                    </div>

                    {/* Bác sĩ */}
                    <div className="col-lg-6">
                      <label className="form-label">Bác sĩ chỉ định</label>
                      <div className="form-group">
                        <select
                          className="form-control"
                          id="exampleFormControlSelect2"
                          onChange={handleDoctorChange}
                        >
                          <option value="">Chọn bác sĩ</option>
                          <option value="1">Bác sĩ 1</option>
                          <option value="2">Bác sĩ 2</option>
                          <option value="3">Bác sĩ 3</option>
                        </select>
                      </div>
                    </div>

                    {selectedDoctor && (
                      <div className="mt-4 mb-4">
                        <h5>Lịch khám của bác sĩ đã chọn:</h5>
                        <DoctorSchedule />
                      </div>
                    )}
                  </div>

                  {/* Mô tả triệu chứng */}
                  <div className="form-group-2 mb-4">
                    <label className="form-label">
                      Mô tả triệu chứng <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={6}
                      placeholder="Đau/nhức răng..."
                    ></textarea>
                  </div>

                  <a
                    className="btn btn-main btn-round-full"
                    href="confirmation.html"
                  >
                    Đặt lịch ngay <i className="icofont-simple-right ml-2"></i>
                  </a>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BookingPage;
