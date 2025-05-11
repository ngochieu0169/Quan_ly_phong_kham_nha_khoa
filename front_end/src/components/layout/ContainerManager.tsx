import { Link, Outlet, useLocation } from "react-router-dom";

function ContainerManager() {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", label: "Tổng quan" },
    { path: "/admin/phong-kham", label: "Quản lý phòng khám" },
    { path: "/admin/tai-khoan", label: "Quản lý tài khoản" },
    { path: "/admin/ca-kham", label: "Quản lý ca khám" },
    { path: "/admin/lich-kham", label: "Quản lý lịch khám" },
    { path: "/admin/hoa-don", label: "Quản lý hóa đơn" },
    { path: "/admin/dich-vu", label: "Quản lý dịch vụ" },
    { path: "/", label: "Đăng xuất" },
  ];

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
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ContainerManager;
