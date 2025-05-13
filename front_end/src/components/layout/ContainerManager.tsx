import { Link, useLocation } from "react-router-dom";

interface ContainerManagerProps {
  role: "admin" | "doctor" | "patient";
  children: React.ReactNode;
}

function ContainerManager({ role = 'doctor', children }: ContainerManagerProps) {
  const location = useLocation();

  const adminMenu = [
    { path: "/admin/dashboard", label: "Tổng quan" },
    { path: "/clinic", label: "Quản lý phòng khám" },
    { path: "/account", label: "Quản lý tài khoản" },
    { path: "/shift", label: "Quản lý ca khám" },
    { path: "/schedule", label: "Quản lý lịch khám" },
    { path: "/bill", label: "Quản lý hóa đơn" },
    { path: "/service", label: "Quản lý dịch vụ" },
    { path: "/", label: "Đăng xuất" },
  ];

  const doctorMenu = [
    { path: "/doctor/profile", label: "Thông tin tài khoản" },
    { path: "/doctor/regis-shift", label: "Đăng ký ca khám" },
    { path: "/doctor/my-shifts", label: "Ca khám của tôi" },
    { path: "/notification", label: "Thông báo" },
    { path: "/doctor/patients", label: "Bệnh nhân của tôi" },
    { path: "/", label: "Đăng xuất" },
  ];

  const patientMenu = [
    { path: "/patient/profile", label: "Thông tin tài khoản" },
    { path: "/patient/appointments", label: "Lịch khám của tôi" },
    { path: "/patient/bills", label: "Hóa đơn" },
    { path: "/notification", label: "Thông báo" },
    { path: "/", label: "Đăng xuất" },
  ];

  let menuItems = adminMenu; // default

  if (role === "doctor") menuItems = doctorMenu;
  else if (role === "patient") menuItems = patientMenu;

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
                className={`nav-link text-white ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.label}
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
