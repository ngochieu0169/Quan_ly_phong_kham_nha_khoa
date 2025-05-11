import { useState } from 'react';
import { Link } from 'react-router-dom';

function TheHeader() {
  // Giả lập logic đăng nhập, bạn có thể thay bằng context hoặc Redux thực tế
  const [isLoggedIn, setIsLoggedIn] = useState(false); // đổi thành true để test "Cá nhân"

  

  return (
    <div>
      <header>
        <div className="header-top-bar">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <ul className="top-bar-info list-inline-item pl-0 mb-0">
                  <li className="list-inline-item">
                    <a href="mailto:support@gmail.com">
                      <i className="icofont-support-faq mr-2"></i>
                      nhakhoaABC@gmail.com
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <i className="icofont-location-pin mr-2"></i>
                    Đà Nẵng - Việt Nam
                  </li>
                </ul>
              </div>
              <div className="col-lg-6">
                <div className="text-lg-right top-right-bar mt-2 mt-lg-0">
                  <a href="tel:+23-345-67890">
                    <span>Hotline : </span>
                    <span className="h4">823-4565-13456</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="navbar navbar-expand-lg navigation" id="navbar">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <img src={'/images/logo.png'} alt="" className="img-fluid" />
            </Link>

            <button
              className="navbar-toggler collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#navbarmain"
              aria-controls="navbarmain"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="icofont-navigation-menu"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarmain">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="/">Trang chủ</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">Về chúng tôi</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/services">Dịch vụ</Link>
                </li>
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle" to="#" data-toggle="dropdown">
                    Phòng khám <i className="icofont-thin-down"></i>
                  </Link>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/clinics">Danh sách phòng khám</Link></li>
                    <li><Link className="dropdown-item" to="/clinic-detail">Chi tiết phòng khám</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle" to="#" data-toggle="dropdown">
                    Bác sĩ <i className="icofont-thin-down"></i>
                  </Link>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/doctors">Danh sách bác sĩ</Link></li>
                    <li><Link className="dropdown-item" to="/doctor-detail">Chi tiết bác sĩ</Link></li>
                    <li><Link className="dropdown-item" to="/appointment">Đặt lịch khám</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <Link className="nav-link dropdown-toggle" to="#" data-toggle="dropdown">
                    Thông tin thêm <i className="icofont-thin-down"></i>
                  </Link>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/blog">Blog</Link></li>
                    <li><Link className="dropdown-item" to="/blog-detail">Chi tiết blog</Link></li>
                  </ul>
                </li>

                {/* Đăng nhập hoặc Cá nhân */}
                {!isLoggedIn ? (
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Đăng nhập</Link>
                  </li>
                ) : (
                  <li className="nav-item dropdown">
                    <Link className="nav-link dropdown-toggle" to="#" data-toggle="dropdown">
                      Cá nhân <i className="icofont-thin-down"></i>
                    </Link>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/profile">Hồ sơ</Link></li>
                      <li><Link className="dropdown-item" to="/my-appointments">Lịch đã đặt</Link></li>
                      <li><Link className="dropdown-item" to="/logout">Đăng xuất</Link></li>
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default TheHeader;
