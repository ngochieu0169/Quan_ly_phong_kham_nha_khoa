import React from "react";

interface Account {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  dob: string;
  avatar: string;
}

const mockAccounts: Account[] = [
  {
    id: 1,
    avatar: "https://img.icons8.com/office/80/user.png",
    username: "admin123",
    fullName: "Nguyễn Văn A",
    role: "Quản trị viên",
    email: "admin@example.com",
    phone: "0901234567",
    dob: "1990-01-15",
  },
  {
    id: 2,
    avatar: "https://img.icons8.com/office/80/user.png",
    username: "bs.tran",
    fullName: "Trần Thị B",
    role: "Bác sĩ",
    email: "tran@example.com",
    phone: "0912345678",
    dob: "1985-05-10",
  },
];

function AccountManager() {
  return (
    <div className="container-fluid">
      <h4 className="mb-4">Quản lý tài khoản</h4>
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="thead-dark">
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Tên tài khoản</th>
              <th>Người dùng</th>
              <th>Quyền</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày sinh</th>
            </tr>
          </thead>
          <tbody>
            {mockAccounts.map((account, index) => (
              <tr key={account.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={account.avatar}
                    alt={account.fullName}
                    width="48"
                    height="48"
                    className="rounded-circle"
                  />
                </td>
                <td>{account.username}</td>
                <td>{account.fullName}</td>
                <td>{account.role}</td>
                <td>{account.email}</td>
                <td>{account.phone}</td>
                <td>{account.dob}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountManager;
