import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, shiftService, userService, dentistService } from '../../../services';
import axios from 'axios';

interface Appointment {
  maLichKham: number;
  maBenhNhan: number;
  maCaKham: number;
  trieuChung: string;
  ngayDatLich: string;
  trangThai: string;
  // Extended fields
  tenBenhNhan?: string;
  soDienThoai?: string;
  tenNhaSi?: string;
  gioBatDau?: string;
  gioKetThuc?: string;
  maNhaSi?: string; // Thêm trường này để kiểm tra ca có bác sĩ chưa
}

interface Shift {
  maCaKham: number;
  ngayKham: string;
  gioBatDau: string;
  gioKetThuc: string;
  maNhaSi?: string;
  tenNhaSi?: string;
}

interface Patient {
  maNguoiDung: number;
  hoTen: string;
  soDienThoai: string;
  eMail: string;
}

interface Dentist {
  maNhaSi: string;
  hoTen: string;
  maPhongKham: number;
}

function ScheduleManagerPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Lấy ca khám theo ngày đã chọn
      const caKhamRes = await axios.get(`http://localhost:3000/api/cakham/by-date?date=${selectedDate}`);
      const shiftsWithAppointments = caKhamRes.data;

      // Lấy thông tin bệnh nhân và bác sĩ
      const [patientsRes, dentistsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/users/full?maQuyen=4'), // Bệnh nhân
        axios.get('http://localhost:3000/api/users/full?maQuyen=2')  // Bác sĩ
      ]);

      // Lọc và làm giàu dữ liệu cho các lịch khám đã có
      const enrichedAppointments = shiftsWithAppointments
        .filter((shift: any) => shift.maLichKham) // Chỉ lấy ca khám đã có lịch khám
        .map((shift: any) => {
          const patient = patientsRes.data.find((p: any) => p.maNguoiDung === shift.maBenhNhan);
          const dentist = dentistsRes.data.find((d: any) => d.bacsiData?.maNhaSi === shift.maNhaSi);

          return {
            maLichKham: shift.maLichKham,
            maBenhNhan: shift.maBenhNhan,
            maCaKham: shift.maCaKham,
            trieuChung: shift.trieuChung,
            ngayDatLich: shift.ngayKham, // Use ngayKham as the appointment date
            trangThai: shift.trangThaiLich || 'Chờ',
            gioBatDau: shift.gioBatDau,
            gioKetThuc: shift.gioKetThuc,
            maNhaSi: shift.maNhaSi,
            tenBenhNhan: patient?.hoTen,
            soDienThoai: patient?.soDienThoai,
            tenNhaSi: dentist?.hoTen || shift.tenNhaSi
          };
        });

      setAppointments(enrichedAppointments);
      setPatients(patientsRes.data);
      setDentists(dentistsRes.data.map((d: any) => ({
        maNhaSi: d.bacsiData?.maNhaSi,
        hoTen: d.hoTen,
        maPhongKham: d.bacsiData?.maPhongKham
      })).filter((d: any) => d.maNhaSi));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu lịch khám');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:3000/api/lichkham/${appointmentId}`, {
        trangThai: newStatus
      });
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleAssignDentist = async () => {
    if (!selectedAppointment || !selectedDentist) {
      toast.error('Vui lòng chọn bác sĩ');
      return;
    }

    try {
      // Cập nhật ca khám với bác sĩ được chọn
      await axios.put(`http://localhost:3000/api/cakham/${selectedAppointment.maCaKham}`, {
        maNhaSi: selectedDentist
      });

      toast.success('Phân công bác sĩ thành công');
      setShowAssignModal(false);
      setSelectedAppointment(null);
      setSelectedDentist('');
      fetchData();
    } catch (error) {
      toast.error('Phân công bác sĩ thất bại');
    }
  };

  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleOpenAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'chờ': 'warning',
      'Chờ': 'warning',
      'xác nhận': 'success',
      'Xác nhận': 'success',
      'hoàn thành': 'primary',
      'Hoàn thành': 'primary',
      'hủy': 'danger',
      'Hủy': 'danger'
    };
    return `badge bg-${statusMap[status] || 'secondary'}`;
  };

  const getStatusActions = (appointment: Appointment) => {
    const actions = [];

    // Nút phân công bác sĩ cho ca mặc định
    if (!appointment.maNhaSi) {
      actions.push(
        <button
          key="assign"
          className="btn btn-sm btn-warning me-1"
          onClick={() => handleOpenAssignModal(appointment)}
          title="Phân công bác sĩ"
        >
          <i className="icofont-doctor"></i>
        </button>
      );
    }

    if (appointment.trangThai === 'chờ' || appointment.trangThai === 'Chờ') {
      actions.push(
        <button
          key="confirm"
          className="btn btn-sm btn-success me-1"
          onClick={() => handleUpdateStatus(appointment.maLichKham, 'xác nhận')}
          title="Xác nhận"
        >
          <i className="icofont-check"></i>
        </button>
      );
      actions.push(
        <button
          key="cancel"
          className="btn btn-sm btn-danger me-1"
          onClick={() => handleUpdateStatus(appointment.maLichKham, 'hủy')}
          title="Hủy"
        >
          <i className="icofont-close"></i>
        </button>
      );
    } else if (appointment.trangThai === 'xác nhận' || appointment.trangThai === 'Xác nhận') {
      actions.push(
        <button
          key="complete"
          className="btn btn-sm btn-primary me-1"
          onClick={() => handleUpdateStatus(appointment.maLichKham, 'hoàn thành')}
          title="Hoàn thành"
        >
          <i className="icofont-check-alt"></i>
        </button>
      );
    }

    return actions;
  };

  // Group appointments by time slots
  const groupAppointmentsByTime = () => {
    const timeSlots = [
      { start: '08:00', end: '09:00', label: 'Ca 8-9h' },
      { start: '09:00', end: '10:00', label: 'Ca 9-10h' },
      { start: '10:00', end: '11:00', label: 'Ca 10-11h' },
      { start: '13:00', end: '14:00', label: 'Ca 13-14h' },
      { start: '14:00', end: '15:00', label: 'Ca 14-15h' },
      { start: '15:00', end: '16:00', label: 'Ca 15-16h' },
      { start: '16:00', end: '17:00', label: 'Ca 16-17h' },
    ];

    return timeSlots.map(slot => {
      const slotAppointments = appointments.filter(appointment =>
        formatTime(appointment.gioBatDau) === slot.start
      );

      return {
        ...slot,
        appointments: slotAppointments
      };
    });
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus && appointment.trangThai !== filterStatus) {
      return false;
    }
    return true;
  });

  const appointmentStats = {
    total: appointments.length,
    waiting: appointments.filter(a => a.trangThai === 'chờ' || a.trangThai === 'Chờ').length,
    confirmed: appointments.filter(a => a.trangThai === 'xác nhận' || a.trangThai === 'Xác nhận').length,
    completed: appointments.filter(a => a.trangThai === 'hoàn thành' || a.trangThai === 'Hoàn thành').length,
    cancelled: appointments.filter(a => a.trangThai === 'hủy' || a.trangThai === 'Hủy').length,
    needAssign: appointments.filter(a => !a.maNhaSi).length
  };

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Quản lý lịch khám</h4>
        <div className="d-flex align-items-center gap-3">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '200px' }}
          />
          <button className="btn btn-primary" onClick={fetchData}>
            <i className="icofont-refresh me-2"></i>Làm mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>{appointmentStats.total}</h4>
              <small>Tổng lịch hẹn</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>{appointmentStats.waiting}</h4>
              <small>Chờ xác nhận</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{appointmentStats.confirmed}</h4>
              <small>Đã xác nhận</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{appointmentStats.completed}</h4>
              <small>Hoàn thành</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h4>{appointmentStats.cancelled}</h4>
              <small>Đã hủy</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-secondary text-white">
            <div className="card-body text-center">
              <h4>{appointmentStats.needAssign}</h4>
              <small>Cần phân công</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="d-flex align-items-center gap-3">
            <label className="form-label mb-0">Lọc theo trạng thái:</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="">Tất cả</option>
              <option value="chờ">Chờ xác nhận</option>
              <option value="xác nhận">Đã xác nhận</option>
              <option value="hoàn thành">Hoàn thành</option>
              <option value="hủy">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {groupAppointmentsByTime().map((timeSlot, index) => (
            <div key={index} className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="icofont-clock-time me-2"></i>
                    {timeSlot.label} ({timeSlot.start} - {timeSlot.end})
                  </h6>
                </div>
                <div className="card-body">
                  {timeSlot.appointments.length > 0 ? (
                    <div className="list-group">
                      {timeSlot.appointments
                        .filter(appointment => filterStatus === '' || appointment.trangThai === filterStatus)
                        .map(appointment => (
                          <div key={appointment.maLichKham} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <h6 className="mb-0">{appointment.tenBenhNhan}</h6>
                                  <span className={getStatusBadge(appointment.trangThai)}>
                                    {appointment.trangThai}
                                  </span>
                                </div>

                                <p className="mb-1 text-muted">
                                  <i className="icofont-doctor me-1"></i>
                                  Nha sĩ: {appointment.tenNhaSi ||
                                    <span className="text-warning fw-bold">Chưa phân công</span>
                                  }
                                  {!appointment.maNhaSi && (
                                    <span className="badge bg-warning text-dark ms-2">Ca mặc định</span>
                                  )}
                                </p>

                                <p className="mb-1 text-muted">
                                  <i className="icofont-phone me-1"></i>
                                  {appointment.soDienThoai}
                                </p>

                                <p className="mb-2 small">
                                  <strong>Triệu chứng:</strong> {appointment.trieuChung}
                                </p>

                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => handleViewDetail(appointment)}
                                  >
                                    <i className="icofont-eye me-1"></i>Chi tiết
                                  </button>
                                  {getStatusActions(appointment)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted">
                      <i className="icofont-calendar fs-3"></i>
                      <p className="mt-2 mb-0">Không có lịch hẹn nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment List View */}
      <div className="card mt-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="icofont-list me-2"></i>Danh sách chi tiết
          </h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thời gian</th>
                  <th>Bệnh nhân</th>
                  <th>Nha sĩ</th>
                  <th>Triệu chứng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment, index) => (
                  <tr key={appointment.maLichKham}>
                    <td>{index + 1}</td>
                    <td>
                      {formatTime(appointment.gioBatDau)} - {formatTime(appointment.gioKetThuc)}
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">{appointment.tenBenhNhan}</div>
                        <small className="text-muted">{appointment.soDienThoai}</small>
                      </div>
                    </td>
                    <td>
                      {appointment.tenNhaSi ||
                        <span className="text-warning fw-bold">Chưa phân công</span>
                      }
                      {!appointment.maNhaSi && (
                        <span className="badge bg-warning text-dark ms-2 small">Ca mặc định</span>
                      )}
                    </td>
                    <td>
                      <span title={appointment.trieuChung}>
                        {appointment.trieuChung.length > 50
                          ? appointment.trieuChung.substring(0, 50) + '...'
                          : appointment.trieuChung
                        }
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(appointment.trangThai)}>
                        {appointment.trangThai}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleViewDetail(appointment)}
                        >
                          <i className="icofont-eye"></i>
                        </button>
                        {getStatusActions(appointment)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAppointments.length === 0 && (
              <div className="text-center py-4 text-muted">
                <i className="icofont-calendar fs-3"></i>
                <p className="mt-2">Không có lịch hẹn nào trong ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="icofont-calendar me-2"></i>
                  Chi tiết lịch khám
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mã lịch khám</label>
                    <p className="form-control-plaintext">LK{selectedAppointment.maLichKham.toString().padStart(6, '0')}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ngày đặt</label>
                    <p className="form-control-plaintext">
                      {new Date(selectedAppointment.ngayDatLich).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Thời gian khám</label>
                    <p className="form-control-plaintext">
                      {formatTime(selectedAppointment.gioBatDau)} - {formatTime(selectedAppointment.gioKetThuc)}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Trạng thái</label>
                    <p className="form-control-plaintext">
                      <span className={getStatusBadge(selectedAppointment.trangThai)}>
                        {selectedAppointment.trangThai}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Bệnh nhân</label>
                    <p className="form-control-plaintext">{selectedAppointment.tenBenhNhan}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <p className="form-control-plaintext">{selectedAppointment.soDienThoai}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nha sĩ phụ trách</label>
                    <p className="form-control-plaintext">{selectedAppointment.tenNhaSi || 'Chưa phân công'}</p>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Triệu chứng</label>
                    <p className="form-control-plaintext">{selectedAppointment.trieuChung}</p>
                  </div>
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
                <div className="d-flex gap-2">
                  {getStatusActions(selectedAppointment)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="icofont-doctor me-2"></i>
                  Phân công bác sĩ cho ca mặc định
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAssignModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="icofont-info-circle me-2"></i>
                  Đây là ca khám mặc định chưa có bác sĩ phụ trách. Vui lòng chọn bác sĩ phù hợp.
                </div>

                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-0">Thông tin lịch khám</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Bệnh nhân:</strong> {selectedAppointment.tenBenhNhan}
                        </p>
                        <p className="mb-2">
                          <strong>Số điện thoại:</strong> {selectedAppointment.soDienThoai}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Thời gian:</strong> {formatTime(selectedAppointment.gioBatDau)} - {formatTime(selectedAppointment.gioKetThuc)}
                        </p>
                        <p className="mb-2">
                          <strong>Trạng thái:</strong>
                          <span className={`ms-2 ${getStatusBadge(selectedAppointment.trangThai)}`}>
                            {selectedAppointment.trangThai}
                          </span>
                        </p>
                      </div>
                      <div className="col-12">
                        <p className="mb-0">
                          <strong>Triệu chứng:</strong> {selectedAppointment.trieuChung}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="icofont-doctor me-1"></i>
                    Chọn bác sĩ phụ trách: *
                  </label>
                  <select
                    className="form-select"
                    value={selectedDentist}
                    onChange={(e) => setSelectedDentist(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {dentists.map((dentist) => (
                      <option key={dentist.maNhaSi} value={dentist.maNhaSi}>
                        Dr. {dentist.hoTen}
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">
                    Sau khi phân công, bác sĩ sẽ nhận được thông báo về ca khám này.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  <i className="icofont-close me-1"></i>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleAssignDentist}
                  disabled={!selectedDentist}
                >
                  <i className="icofont-doctor me-1"></i>
                  Phân công bác sĩ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleManagerPage;
