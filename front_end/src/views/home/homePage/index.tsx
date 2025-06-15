import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="banner">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-xl-7">
                            <div className="block">
                                <div className="divider mb-3"></div>
                                <span className="text-uppercase text-sm letter-spacing">Nha khoa uy tín</span>
                                <h1 className="mb-3 mt-3">Chăm sóc sức khỏe răng miệng toàn diện</h1>

                                <p className="mb-4 pr-5">
                                    Với đội ngũ bác sĩ chuyên nghiệp và thiết bị hiện đại,
                                    chúng tôi cam kết mang đến dịch vụ nha khoa chất lượng cao.
                                </p>
                                <div className="btn-container">
                                    <Link to="/booking" className="btn btn-main-2 btn-icon btn-round-full">
                                        Đặt lịch ngay <i className="icofont-simple-right ml-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="features">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="feature-block d-lg-flex">
                                <div className="feature-item mb-5 mb-lg-0">
                                    <div className="feature-icon mb-4">
                                        <i className="icofont-surgeon-alt"></i>
                                    </div>
                                    <span>24/7 Hỗ trợ</span>
                                    <h4 className="mb-3">Tư vấn trực tuyến</h4>
                                    <p className="mb-4">
                                        Đội ngũ bác sĩ sẵn sàng tư vấn và giải đáp mọi thắc mắc của bạn.
                                    </p>
                                    <Link to="/services" className="btn btn-main btn-round-full">
                                        Tìm hiểu thêm
                                    </Link>
                                </div>

                                <div className="feature-item mb-5 mb-lg-0">
                                    <div className="feature-icon mb-4">
                                        <i className="icofont-ui-clock"></i>
                                    </div>
                                    <span>Hẹn lịch</span>
                                    <h4 className="mb-3">Đặt lịch linh hoạt</h4>
                                    <p className="mb-4">
                                        Hệ thống đặt lịch trực tuyến tiện lợi, giúp bạn chọn thời gian phù hợp.
                                    </p>
                                    <Link to="/booking" className="btn btn-main btn-round-full">
                                        Đặt lịch ngay
                                    </Link>
                                </div>

                                <div className="feature-item mb-5 mb-lg-0">
                                    <div className="feature-icon mb-4">
                                        <i className="icofont-support"></i>
                                    </div>
                                    <span>Khẩn cấp</span>
                                    <h4 className="mb-3">Hỗ trợ khẩn cấp</h4>
                                    <p className="mb-4">
                                        Dịch vụ cấp cứu nha khoa 24/7 cho những trường hợp khẩn cấp.
                                    </p>
                                    <Link to="/clinics" className="btn btn-main btn-round-full">
                                        Liên hệ ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section about">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-4 col-sm-6">
                            <div className="about-img">
                                <img src="/images/about/img-1.jpg" alt="" className="img-fluid" />
                                <img src="/images/about/img-2.jpg" alt="" className="img-fluid mt-4" />
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="about-img mt-4 mt-lg-0">
                                <img src="/images/about/img-3.jpg" alt="" className="img-fluid" />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="about-content pl-4 mt-4 mt-lg-0">
                                <h2 className="title-color">
                                    Chăm sóc cá nhân <br />& Dịch vụ chuyên nghiệp
                                </h2>
                                <p className="mt-4 mb-5">
                                    Chúng tôi cung cấp dịch vụ nha khoa toàn diện với công nghệ tiên tiến
                                    và đội ngũ bác sĩ giàu kinh nghiệm. Sự hài lòng của bạn là ưu tiên hàng đầu.
                                </p>

                                <Link to="/services" className="btn btn-main-2 btn-round-full btn-icon">
                                    Dịch vụ của chúng tôi <i className="icofont-simple-right ml-3"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta position-relative">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="counter-stat">
                                    <i className="icofont-doctor"></i>
                                    <span className="h3">58</span>
                                    <p>Bác sĩ chuyên khoa</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="counter-stat">
                                    <i className="icofont-flag"></i>
                                    <span className="h3">700</span>
                                    <p>Ca phẫu thuật thành công</p>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="counter-stat">
                                    <i className="icofont-badge"></i>
                                    <span className="h3">40</span>
                                    <p>Giải thưởng quốc tế</p>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="counter-stat">
                                    <i className="icofont-globe"></i>
                                    <span className="h3">20</span>
                                    <p>Năm kinh nghiệm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage; 