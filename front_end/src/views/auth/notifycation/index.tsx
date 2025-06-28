import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { notificationService } from '../../../services';

interface Notification {
  maThongBao: number;
  maNguoiNhan: string;
  tieuDe: string;
  noiDung: string;
  ngayTao: string;
  daDoc?: boolean;
}

function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user?.tenTaiKhoan) {
      fetchNotifications(user.tenTaiKhoan);
    }
  }, []);

  const fetchNotifications = async (userTaiKhoan?: string) => {
    try {
      setLoading(true);
      const res = await notificationService.all();

      const currentUserTaiKhoan = userTaiKhoan || currentUser?.tenTaiKhoan;

      // Filter notifications for current user
      const userNotifications = res.data.filter((notif: Notification) =>
        notif.maNguoiNhan === currentUserTaiKhoan
      );

      // Sort by date (newest first)
      const sortedNotifications = userNotifications.sort((a: Notification, b: Notification) =>
        new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
      );

      setNotifications(sortedNotifications);
    } catch (error) {
      toast.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      // In a real app, you would have an API to mark as read
      // For now, we'll update the local state
      setNotifications(prev =>
        prev.map(n =>
          n.maThongBao === notification.maThongBao
            ? { ...n, daDoc: true }
            : n
        )
      );
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleViewDetail = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);

    // Mark as read when viewing detail
    if (!notification.daDoc) {
      handleMarkAsRead(notification);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;

    try {
      await notificationService.delete(id);
      toast.success('Xóa thông báo thành công');
      fetchNotifications();
    } catch (error) {
      toast.error('Xóa thông báo thất bại');
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, daDoc: true }))
    );
    toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getNotificationIcon = (title: string) => {
    if (title.includes('lịch') || title.includes('hẹn')) {
      return 'icofont-calendar';
    } else if (title.includes('thanh toán') || title.includes('hóa đơn')) {
      return 'icofont-money';
    } else if (title.includes('khám') || title.includes('phiếu')) {
      return 'icofont-stethoscope';
    } else if (title.includes('khuyến mãi') || title.includes('giảm giá')) {
      return 'icofont-sale-discount';
    } else {
      return 'icofont-info-circle';
    }
  };

  const getNotificationColor = (title: string) => {
    if (title.includes('lịch') || title.includes('hẹn')) {
      return 'primary';
    } else if (title.includes('thanh toán') || title.includes('hóa đơn')) {
      return 'warning';
    } else if (title.includes('khám') || title.includes('phiếu')) {
      return 'success';
    } else if (title.includes('khuyến mãi') || title.includes('giảm giá')) {
      return 'danger';
    } else {
      return 'info';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.daDoc;
    if (filter === 'read') return notification.daDoc;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.daDoc).length;

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Thông báo</h4>
          {unreadCount > 0 && (
            <small className="text-muted">
              Bạn có <span className="fw-bold text-danger">{unreadCount}</span> thông báo chưa đọc
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          {unreadCount > 0 && (
            <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllAsRead}>
              <i className="icofont-check-alt me-2"></i>Đánh dấu tất cả đã đọc
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => fetchNotifications()}>
            <i className="icofont-refresh me-2"></i>Làm mới
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('unread')}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('read')}
            >
              Đã đọc ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            {filteredNotifications.length > 0 ? (
              <div className="list-group">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.maThongBao}
                    className={`list-group-item list-group-item-action ${!notification.daDoc ? 'bg-light border-primary' : ''}`}
                  >
                    <div className="d-flex align-items-start">
                      <div className={`me-3 text-${getNotificationColor(notification.tieuDe)}`}>
                        <i className={`${getNotificationIcon(notification.tieuDe)} fs-4`}></i>
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className={`mb-0 ${!notification.daDoc ? 'fw-bold' : ''}`}>
                            {notification.tieuDe}
                            {!notification.daDoc && (
                              <span className="badge bg-danger ms-2">Mới</span>
                            )}
                          </h6>
                          <small className="text-muted">{formatDate(notification.ngayTao)}</small>
                        </div>

                        <p className="mb-2 text-muted">
                          {notification.noiDung.length > 100
                            ? notification.noiDung.substring(0, 100) + '...'
                            : notification.noiDung
                          }
                        </p>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetail(notification)}
                          >
                            <i className="icofont-eye me-1"></i>Xem chi tiết
                          </button>

                          {!notification.daDoc && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleMarkAsRead(notification)}
                            >
                              <i className="icofont-check me-1"></i>Đánh dấu đã đọc
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteNotification(notification.maThongBao)}
                          >
                            <i className="icofont-trash me-1"></i>Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="icofont-notification fs-1"></i>
                <p className="mt-2">
                  {filter === 'unread'
                    ? 'Không có thông báo chưa đọc'
                    : filter === 'read'
                      ? 'Không có thông báo đã đọc'
                      : 'Chưa có thông báo nào'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center">
                  <i className={`${getNotificationIcon(selectedNotification.tieuDe)} text-${getNotificationColor(selectedNotification.tieuDe)} me-2`}></i>
                  {selectedNotification.tieuDe}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <small className="text-muted">
                    <i className="icofont-clock-time me-1"></i>
                    {formatDate(selectedNotification.ngayTao)} • {new Date(selectedNotification.ngayTao).toLocaleTimeString('vi-VN')}
                  </small>
                </div>

                <div className="border-start border-3 border-primary ps-3">
                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {selectedNotification.noiDung}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteNotification(selectedNotification.maThongBao);
                    setShowDetailModal(false);
                  }}
                >
                  <i className="icofont-trash me-2"></i>Xóa thông báo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
