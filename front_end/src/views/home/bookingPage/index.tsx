function BookingPage() {
  return (
    <div>
      <section className="page-title bg-1">
        <div className="overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="block text-center">
                <span className="text-white">Đăng ký</span>
                <h1 className="text-capitalize mb-5 text-lg">Đặt lịch nha khoa</h1>

               
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="appoinment section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="mt-3">
                <div className="feature-icon mb-3">
                  <i className="icofont-support text-lg"></i>
                </div>
                <span className="h3">Đặt lịch khám qua tổng đài</span>
                <h2 className="text-color mt-3">+84 789 1256 </h2>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="appoinment-wrap mt-5 mt-lg-0 pl-lg-5">
                <h2 className="mb-2 title-color">Đặt lịch online</h2>
                <p className="mb-4">
                  Vui lòng cung cấp thông tin để phòng khám hỗ trợ đặt lịch trực tuyến
                </p>
                <form
                  id="#"
                  className="appoinment-form"
                  method="post"
                  action="#"
                >
                  <div className="row">
                    <div className="col-lg-6">
                      <label className="form-label">
                        Chọn phòng khám
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <select
                          className="form-control"
                          id="exampleFormControlSelect1"
                        >
                          <option>Phòng khám 1</option>
                          <option>Software Design</option>
                          <option>Development cycle</option>
                          <option>Software Development</option>
                          <option>Maintenance</option>
                          <option>Process Query</option>
                          <option>Cost and Duration</option>
                          <option>Modal Delivery</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-6">
                    <label className="form-label">
                         Bác sĩ chỉ định
                      </label>
                      <div className="form-group">
                        <select
                          className="form-control"
                          id="exampleFormControlSelect2"
                        >
                          <option>Bác sĩ 1</option>
                          <option>Software Design</option>
                          <option>Development cycle</option>
                          <option>Software Development</option>
                          <option>Maintenance</option>
                          <option>Process Query</option>
                          <option>Cost and Duration</option>
                          <option>Modal Delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-6">
                    <label className="form-label">
                        Ngày khám
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          name="date"
                          id="date"
                          type="text"
                          className="form-control"
                          placeholder="dd/mm/yyyy"
                        />
                      </div>
                    </div>
                    
                    <div className="col-lg-6">
                    <label className="form-label">
                        Chọn ca khám
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                      <select
                          className="form-control"
                          id="cakham"
                        >
                          <option>Từ 7h-9h :AM</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-6">
                    <label className="form-label">
                        Tên bệnh nhân
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          name="name"
                          id="name"
                          type="text"
                          className="form-control"
                          placeholder="Họ và tên"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                    <label className="form-label">
                        Số điện thoại
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          name="phone"
                          id="phone"
                          type="Number"
                          className="form-control"
                          placeholder="09xxxxxxx"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                    <label className="form-label">
                        Tuổi
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          name="phone"
                          id="phone"
                          type="Number"
                          className="form-control"
                          placeholder="Tuổi"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                    <label className="form-label">
                        Giới tính
                        <span className="required">*</span>
                      </label>
                      <div className="form-group">
                        <input
                          name="phone"
                          id="phone"
                          type=""
                          className="form-control"
                          placeholder="Giới tính"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group-2 mb-4">
                  <label className="form-label">
                        Mô tả triệu chứng
                        <span className="required">*</span>
                      </label>
                    <textarea
                      name="message"
                      id="message"
                      className="form-control"
                      rows={6}
                      placeholder="Đau/nhức răng..."
                    ></textarea>
                  </div>

                  <a
                    className="btn btn-main btn-round-full"
                    href="confirmation.html"
                  >
                    Đặt lịch ngay<i className="icofont-simple-right ml-2"></i>
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
