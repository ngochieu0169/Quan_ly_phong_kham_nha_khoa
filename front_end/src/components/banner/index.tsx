function TheBanner() {
  return (
    <div>
      <section className="banner">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12 col-xl-7">
              <div className="block">
                <div className="divider mb-3"></div>
                <span className="text-uppercase text-sm letter-spacing ">
                  Chăm sóc răng toàn diện
                </span>
                <h1 className="mb-3 mt-3">Hệ thống Nha Khoa ABC</h1>

                <p className="mb-4 pr-5">
                  Hệ thống nha khoa hàng đầu Đà Nẵng. Sứ mệnh của chúng tôi là
                  cung cấp dịch vụ nha khoa tốt nhất đến mọi người
                </p>
                <div className="btn-container ">
                  <a
                    href="appoinment.html"
                    target="_blank"
                    className="btn btn-main-2 btn-icon btn-round-full"
                  >
                    Đặt lịch khám ngay
                    <i className="icofont-simple-right ml-2  "></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="features">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="feature-block d-lg-flex">
                <div className="feature-item mb-5 mb-lg-0">
                  <div className="feature-icon mb-4">
                    <i className="icofont-surgeon-alt"></i>
                  </div>
                  <span>Dịch vụ 24/7</span>
                  <h4 className="mb-3">Đặt lịch online</h4>
                  <p className="mb-4">
                    Hỗ trợ đặt lịch bất kỳ đâu, bất kỳ nơi nào, nhanh chóng và
                    tiện lợi
                  </p>
                  <a
                    href="appoinment.html"
                    className="btn btn-main btn-round-full"
                  >
                    Đặt lịch khám ngay
                  </a>
                </div>

                <div className="feature-item mb-5 mb-lg-0">
                  <div className="feature-icon mb-4">
                    <i className="icofont-ui-clock"></i>
                  </div>
                  <span>Thời gian làm việc linh hoạt</span>
                  <h4 className="mb-3">Ca cố định</h4>
                  <ul className="w-hours list-unstyled">
                    <li className="d-flex justify-content-between">
                      Thứ 2 - Thứ 6 : <span>7:00 - 17:30</span>
                    </li>
                    <li className="d-flex justify-content-between">
                      Thứ 7 : <span>7:30 - 18:30</span>
                    </li>
                    <li className="d-flex justify-content-between">
                      Chủ nhật : <span>8:00 - 19:00</span>
                    </li>
                  </ul>
                </div>

                <div className="feature-item mb-5 mb-lg-0">
                  <div className="feature-icon mb-4">
                    <i className="icofont-support"></i>
                  </div>
                  <span>Tổng đài</span>
                  <h4 className="mb-3">1-800-700-6200</h4>
                  <p>
                    Hỗ trợ trực tuyến với đội ngũ y bác sĩ chuyên môn cao, nhiệt
                    tình
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section about">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-4 col-sm-6">
              <div className="about-img">
                <img
                  src="images/about/img-1.jpg"
                  alt=""
                  className="img-fluid"
                />
                <img
                  src="images/about/img-2.jpg"
                  alt=""
                  className="img-fluid mt-4"
                />
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="about-img mt-4 mt-lg-0">
                <img
                  src="images/about/img-3.jpg"
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="about-content pl-4 mt-4 mt-lg-0">
                <h2 className="title-color">
                  Chăm sóc răng miệng <br />& Sống khỏe mạnh
                </h2>
                <p className="mt-4 mb-5">
                  Chúng tôi cung cấp dịch vụ nha khoa tốt nhất. Không ai nên
                  chịu đựng những nỗi đau về răng miệng, hãy đến với chúng tôi
                  để được đội ngũ y bác sĩ hàng đầu tư vấn
                </p>

                <a
                  href="service.html"
                  className="btn btn-main-2 btn-round-full btn-icon"
                >
                  Dịch vụ<i className="icofont-simple-right ml-3"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cta-section ">
        <div className="container">
          <div className="cta position-relative">
            <div className="row">
              <div className="col-lg-3 col-md-6 col-sm-6">
                <div className="counter-stat">
                  <i className="icofont-doctor"></i>
                  <span className="h3 counter" data-count="58">
                    0
                  </span>
                  k<p>Bệnh nhân hài lòng</p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-6">
                <div className="counter-stat">
                  <i className="icofont-flag"></i>
                  <span className="h3 counter" data-count="700">
                    0
                  </span>
                  +<p>Lượt đề xuất</p>
                </div>
              </div>

              <div className="col-lg-3 col-md-6 col-sm-6">
                <div className="counter-stat">
                  <i className="icofont-badge"></i>
                  <span className="h3 counter" data-count="40">
                    0
                  </span>
                  +<p>Bác sĩ kinh nghiệm</p>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-6">
                <div className="counter-stat">
                  <i className="icofont-globe"></i>
                  <span className="h3 counter" data-count="20">
                    0
                  </span>
                  <p>Thương hiệu hợp tác</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section appoinment">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 ">
              <div className="appoinment-content">
                <img
                  src="images/about/img-3.jpg"
                  alt=""
                  className="img-fluid"
                />
                <div className="emergency">
                  <h2 className="text-lg">
                    <i className="icofont-phone-circle text-lg"></i>+23 345
                    67980
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
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




      
      <section className="section testimonial-2 gray-bg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="section-title text-center">
                <h2>Các chuyên gia hàng đầu về nha khoa</h2>
                <div className="divider mx-auto my-4"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12 testimonial-wrap-2">
              <div className="testimonial-block style-2  gray-bg">
                <i className="icofont-quote-right"></i>

                <div className="testimonial-thumb">
                  <img
                    src="images/team/test-thumb1.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </div>

                <div className="client-info ">
                  <h4>Dr.Nguyễn Văn A</h4>
                  <span>Dịch vụ thẩm mỹ</span>
                  <p>
                    Chuyên gia trong lĩnh vực nha khoa thẩm mỹ, nhiều năm công tác tại bệnh viện ABC và là phó khoa khoa răng hàm mặt.
                  </p>
                </div>
              </div>

              <div className="testimonial-block style-2  gray-bg">
                <div className="testimonial-thumb">
                  <img
                    src="images/team/test-thumb2.jpg"
                    alt=""
                    className="img-fluid"
                  />
                </div>

                <div className="client-info">
                  <h4>Dr. Tran Thi B</h4>
                  <span>Dịch vụ nhổ răng</span>
                  <p>
                    Nhiều năm kinh nghiệm về các ca bệnh về răng, đạt nhiều giải thưởng, vinh danh về giải pháp nhổ răng khôn
                  </p>
                </div>

                <i className="icofont-quote-right"></i>
              </div>

           
             
            </div>
          </div>
        </div>
      </section>
      <section className="section clients">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="section-title text-center">
                <h2>Đối tác</h2>
                <div className="divider mx-auto my-4"></div>
                <p>
                  Không những trong nước, chúng tôi còn hợp tác với nhiều bệnh viện chuyên răng hàm ở quốc tế. Đội ngũ y bác sĩ quốc tế và các phương pháp, dụng cụ y tế sẽ đáp ứng nhu cầu bệnh nhân
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row clients-logo">
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/1.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/2.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/3.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/4.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/5.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/6.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/3.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/4.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/5.png" alt="" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="client-thumb">
                <img src="images/about/6.png" alt="" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TheBanner;
