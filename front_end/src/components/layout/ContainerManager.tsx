import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
// import icon
import {
  FaHome,
  FaUserCog,
  FaClinicMedical,
  FaClock,
  FaCalendarAlt,
  FaFileInvoice,
  FaTools,
  FaSignOutAlt,
} from "react-icons/fa";

interface ContainerManagerProps {
  children: React.ReactNode;
}

function ContainerManager({ children }: ContainerManagerProps) {
  const location = useLocation();

  const user = useSelector((state: any) => state.user.user);

  const adminMenu = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: <FaHome /> },
    { path: "/clinic", label: "Quản lý phòng khám", icon: <FaClinicMedical /> },
    { path: "/account", label: "Quản lý tài khoản", icon: <FaUserCog /> },
    { path: "/shift", label: "Quản lý ca khám", icon: <FaClock /> },
    { path: "/schedule", label: "Quản lý lịch khám", icon: <FaCalendarAlt /> },
    { path: "/bill", label: "Quản lý hóa đơn", icon: <FaFileInvoice /> },
    { path: "/service", label: "Quản lý dịch vụ", icon: <FaTools /> },
    { path: "/", label: "Đăng xuất", icon: <FaSignOutAlt /> },
  ];

  const doctorMenu = [
    {
      path: "/doctor/profile",
      label: "Thông tin tài khoản",
      icon: <FaClinicMedical />,
    },
    {
      path: "/doctor/regis-shift",
      label: "Đăng ký ca khám",
      icon: <FaClinicMedical />,
    },
    {
      path: "/doctor/my-shifts",
      label: "Ca khám của tôi",
      icon: <FaClinicMedical />,
    },
    { path: "/notification", label: "Thông báo", icon: <FaClinicMedical /> },
    {
      path: "/doctor/patients",
      label: "Bệnh nhân của tôi",
      icon: <FaClinicMedical />,
    },
    { path: "/", label: "Đăng xuất", icon: <FaClinicMedical /> },
  ];

  const clinicMenu = [
    { path: "/phong-kham", label: "Phòng khám", icon: <FaClinicMedical /> },
    { path: "/account", label: "Quản lý bác sĩ", icon: <FaClinicMedical /> },
    { path: "/shift", label: "Quản lý ca khám", icon: <FaClinicMedical /> },
    {
      path: "/schedule",
      label: "Quản lý lịch khám",
      icon: <FaClinicMedical />,
    },
    { path: "/bill", label: "Quản lý hóa đơn", icon: <FaClinicMedical /> },
    { path: "/", label: "Đăng xuất", icon: <FaClinicMedical /> },
  ];

  // bệnh nhân
  const patientMenu = [
    {
      path: "/patient/profile",
      label: "Thông tin tài khoản",
      icon: <FaClinicMedical />,
    },
    {
      path: "/patient/appointments",
      label: "Lịch khám của tôi",
      icon: <FaClinicMedical />,
    },
    { path: "/patient/bills", label: "Hóa đơn", icon: <FaClinicMedical /> },
    { path: "/notification", label: "Thông báo", icon: <FaClinicMedical /> },
    { path: "/", label: "Đăng xuất", icon: <FaClinicMedical /> },
  ];

  let menuItems = adminMenu; // default

  switch (user.maQuyen) {
    case 1:
      menuItems = adminMenu;
      break;
    case 2:
      menuItems = doctorMenu;
      break;
    case 3:
      menuItems = adminMenu;
      break;
    case 4:
      menuItems = patientMenu;
      break;
    case 5:
      menuItems = clinicMenu;
      break;
    default:
      menuItems = adminMenu;
  }

  return (
    <div className="admin-layout d-flex">
      {/* Sidebar */}
      <aside className="sidebar text-white p-3">
        <div className="sidebar-header mb-4 text-center">
          <h4 className="fw-bold">Nha Khoa ABC</h4>
        </div>
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item mb-2">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center gap-2 ${
                  location.pathname === item.path
                    ? "active text-primary fw-bold"
                    : "text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="ml-2">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <div className="main-content flex-grow-1 p-4 bg-light">
        <div className="content-wrapper card shadow-sm p-4">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ContainerManager;
