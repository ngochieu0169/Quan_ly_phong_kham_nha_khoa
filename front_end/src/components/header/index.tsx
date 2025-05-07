function TheHeader() {
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
                      support@novena.com
                    </a>
                  </li>
                  <li className="list-inline-item">
                    <i className="icofont-location-pin mr-2"></i>Address
                    Ta-134/A, New York, USA{" "}
                  </li>
                </ul>
              </div>
              <div className="col-lg-6">
                <div className="text-lg-right top-right-bar mt-2 mt-lg-0">
                  <a href="tel:+23-345-67890">
                    <span>Call Now : </span>
                    <span className="h4">823-4565-13456</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="navbar navbar-expand-lg navigation" id="navbar">
          <div className="container">
            <a className="navbar-brand" href="index.html">
                <img src={'/front_end/public/images/logo.png'} alt="" className="img-fluid"/>
            </a>

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
                  <a className="nav-link" href="index.html">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="about.html">
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="service.html">
                    Services
                  </a>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="department.html"
                    id="dropdown02"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Department <i className="icofont-thin-down"></i>
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="dropdown02">
                    <li>
                      <a className="dropdown-item" href="department.html">
                        Departments
                      </a>
                    </li>
                    <li>
                      <a
                        className="dropdown-item"
                        href="department-single.html"
                      >
                        Department Single
                      </a>
                    </li>

                    <li className="dropdown dropdown-submenu dropright">
                      <a
                        className="dropdown-item dropdown-toggle"
                        href="#!"
                        id="dropdown0301"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Sub Menu
                      </a>

                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdown0301"
                      >
                        <li>
                          <a className="dropdown-item" href="index.html">
                            Submenu 01
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="index.html">
                            Submenu 02
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="doctor.html"
                    id="dropdown03"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Doctors <i className="icofont-thin-down"></i>
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="dropdown03">
                    <li>
                      <a className="dropdown-item" href="doctor.html">
                        Doctors
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="doctor-single.html">
                        Doctor Single
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="appoinment.html">
                        Appoinment
                      </a>
                    </li>

                    <li className="dropdown dropdown-submenu dropleft">
                      <a
                        className="dropdown-item dropdown-toggle"
                        href="#!"
                        id="dropdown0501"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Sub Menu
                      </a>

                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdown0501"
                      >
                        <li>
                          <a className="dropdown-item" href="index.html">
                            Submenu 01
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="index.html">
                            Submenu 02
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="blog-sidebar.html"
                    id="dropdown05"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Blog <i className="icofont-thin-down"></i>
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="dropdown05">
                    <li>
                      <a className="dropdown-item" href="blog-sidebar.html">
                        Blog with Sidebar
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="blog-single.html">
                        Blog Single
                      </a>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="contact.html">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default TheHeader;
