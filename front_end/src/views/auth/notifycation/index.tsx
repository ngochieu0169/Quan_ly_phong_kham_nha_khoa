import React, { useState } from 'react';

const notifications = [
  {
    id: 1,
    title: 'Lịch khám mới đã được cập nhật',
    content: 'Lịch khám của bạn đã được cập nhật cho tuần tới, vui lòng kiểm tra trong mục ca khám.',
    time: '2025-05-13 08:30',
  },
  {
    id: 2,
    title: 'Bệnh nhân hủy lịch hẹn',
    content: 'Bệnh nhân Trần Văn B đã hủy lịch hẹn vào ngày 14/05/2025 lúc 10:00. Vui lòng cập nhật lại lịch trống.',
    time: '2025-05-12 17:45',
  },
  {
    id: 3,
    title: 'Thông báo bảo trì hệ thống',
    content: 'Hệ thống sẽ bảo trì vào lúc 22:00 ngày 15/05/2025. Trong thời gian này bạn sẽ không thể truy cập hệ thống.',
    time: '2025-05-11 14:00',
  },
  // thêm thông báo nếu cần
];

const NotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const openModal = (notification: any) => {
    setSelectedNotification(notification);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Thông báo</h4>
      <ul className="list-group">
        {notifications.map((n) => (
          <li
            key={n.id}
            className="list-group-item list-group-item-action"
            onClick={() => openModal(n)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong>{n.title}</strong>
              <small className="text-muted">{n.time}</small>
            </div>
            <p className="mb-0 text-truncate" style={{ maxWidth: '100%' }}>
              {n.content}
            </p>
          </li>
        ))}
      </ul>

      {/* Modal chi tiết thông báo */}
      {selectedNotification && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedNotification.title}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Thời gian:</strong> {selectedNotification.time}</p>
                <p>{selectedNotification.content}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
