import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../store/user";
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
  FaUsers,
  FaCheckCircle,
  FaPrescriptionBottleAlt,
  FaBell,
} from "react-icons/fa";

interface ContainerManagerProps {
  children: React.ReactNode;
}

function ContainerManager({ children }: ContainerManagerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: any) => state.user.user);

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(updateUser({}));
    navigate('/login');
  };

  const adminMenu = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: <FaHome /> },
    { path: "/clinic", label: "Quản lý phòng khám", icon: <FaClinicMedical /> },
    { path: "/account", label: "Quản lý tài khoản", icon: <FaUserCog /> },
    { path: "/shift", label: "Cập nhật ca khám", icon: <FaClock /> },
    { path: "/schedule", label: "Cập nhật lịch khám", icon: <FaCalendarAlt /> },
    { path: "/bill", label: "Cập nhật hóa đơn", icon: <FaFileInvoice /> },
    { path: "/service", label: "Cập nhật dịch vụ", icon: <FaTools /> },
    { path: "/", label: "Đăng xuất", icon: <FaSignOutAlt /> },
  ];

  const doctorMenu = [
    {
      path: "/doctor/profile",
      label: "Thông tin tài khoản",
      icon: <FaUserCog />,
    },
    {
      path: "/doctor/regis-shift",
      label: "Đăng ký ca khám",
      icon: <FaClock />,
    },
    {
      path: "/doctor/my-shifts",
      label: "Ca khám của tôi",
      icon: <FaCalendarAlt />,
    },
    { path: "/notification", label: "Thông báo", icon: <FaBell /> },
    {
      path: "/doctor/patients",
      label: "Bệnh nhân của tôi",
      icon: <FaUsers />,
    },
    { path: "/", label: "Đăng xuất", icon: <FaSignOutAlt /> },
  ];

  const clinicMenu = [
    { path: "/phongkham", label: "Phòng khám", icon: <FaClinicMedical /> },
    { path: "/account", label: "Cập nhật bác sĩ", icon: <FaClinicMedical /> },
    { path: "/shift", label: "Cập nhật ca khám", icon: <FaClinicMedical /> },
    {
      path: "/schedule",
      label: "Cập nhật lịch khám",
      icon: <FaClinicMedical />,
    },
    { path: "/bill", label: "Cập nhật hóa đơn", icon: <FaClinicMedical /> },
    { path: "/", label: "Đăng xuất", icon: <FaClinicMedical /> },
  ];

  // bệnh nhân
  const patientMenu = [
    {
      path: "/profile",
      label: "Thông tin tài khoản",
      icon: <FaClinicMedical />,
    },
    {
      path: "/my-appointments",
      label: "Lịch khám của tôi",
      icon: <FaCalendarAlt />,
    },
    { path: "/my-bills", label: "Hóa đơn", icon: <FaFileInvoice /> },
    { path: "/notification", label: "Thông báo", icon: <FaBell /> },
    { path: "/", label: "Đăng xuất", icon: <FaSignOutAlt /> },
  ];

  // lễ tân
  const receptionistMenu = [
    { path: "/le-tan", label: "Trang Lễ Tân", icon: <FaHome /> },
    { path: "/profile", label: "Thông tin cá nhân", icon: <FaUserCog /> },
    { path: "/le-tan/appointments", label: "Cập nhật lịch khám", icon: <FaCalendarAlt /> },
    { path: "/le-tan/appointments/create", label: "Tạo lịch khám mới", icon: <FaCalendarAlt /> },
    { path: "/le-tan/doctor-schedule", label: "Lịch làm việc bác sĩ", icon: <FaUsers /> },
    { path: "/le-tan/patients", label: "Cập nhật bệnh nhân", icon: <FaUsers /> },
    { path: "/le-tan/checkin", label: "Xác nhận đến khám", icon: <FaCheckCircle /> },
    { path: "/le-tan/medical-records", label: "Phiếu khám bệnh", icon: <FaPrescriptionBottleAlt /> },
    { path: "/le-tan/billing", label: "Thanh toán", icon: <FaFileInvoice /> },
    { path: "/le-tan/shifts", label: "Sắp xếp ca khám", icon: <FaClock /> },
    { path: "/le-tan/notifications", label: "Gửi thông báo", icon: <FaBell /> },
    { path: "/notification", label: "Thông báo của tôi", icon: <FaBell /> },
    { path: "/", label: "Đăng xuất", icon: <FaSignOutAlt /> },
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
      menuItems = receptionistMenu;
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
              {item.label === "Đăng xuất" ? (
                <button
                  onClick={handleLogout}
                  className="nav-link d-flex align-items-center gap-2 text-white border-0 bg-transparent w-100 text-start"
                  style={{ cursor: 'pointer' }}
                >
                  <span>{item.icon}</span>
                  <span className="ml-2">{item.label}</span>
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center gap-2 ${location.pathname === item.path
                    ? "active text-primary fw-bold"
                    : "text-white"
                    }`}
                >
                  <span>{item.icon}</span>
                  <span className="ml-2">{item.label}</span>
                </Link>
              )}
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
