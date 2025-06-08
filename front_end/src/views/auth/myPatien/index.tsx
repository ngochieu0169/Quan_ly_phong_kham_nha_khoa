import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, medicalRecordService, userService } from '../../../services';

interface Patient {
  maNguoiDung: number;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  eMail: string;
  soDienThoai: string;
  diaChi: string;
  anh: string | null;
  // From appointment
  maLichKham?: number;
  ngayDatLich?: string;
  trieuChung?: string;
  trangThai?: string;
  // Statistics
  soLanKham?: number;
  lanKhamGanNhat?: string;
}

interface MedicalRecord {
  maPhieuKham: number;
  ketQuaChuanDoan: string;
  ngayTaiKham: string | null;
  maLichKham: number;
  ngayKham?: string;
  trieuChung?: string;
}

interface PatientDetail {
  thongTin: Patient;
  lichSuKham: MedicalRecord[];
}

function MyPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [medicalForm, setMedicalForm] = useState({
    ketQuaChuanDoan: '',
    ngayTaiKham: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user?.nhaSi) {
      fetchMyPatients();
    }
  }, []);

  const fetchMyPatients = async () => {
    try {
      setLoading(true);

      // Get all appointments for this dentist
      const appointmentsRes = await appointmentService.all();
      const allAppointments = appointmentsRes.data;

      // Filter appointments for current dentist (through shifts)
      const myAppointments = allAppointments.filter((appointment: any) =>
        appointment.maNhaSi === currentUser?.nhaSi?.maNhaSi ||
        appointment.tenNhaSi === currentUser?.nhaSi?.hoTen
      );

      // Get unique patients
      const patientIds = [...new Set(myAppointments.map((a: any) => a.maBenhNhan))] as number[];
      const patientPromises = patientIds.map(id => userService.get(id));

      const patientsData = await Promise.all(patientPromises);

      // Combine patient info with appointment statistics
      const patientsWithStats = patientsData.map((patientRes: any) => {
        const patient = patientRes.data;
        const patientAppointments = myAppointments.filter((a: any) => a.maBenhNhan === patient.maNguoiDung);
        const latestAppointment = patientAppointments.sort((a: any, b: any) =>
          new Date(b.ngayDatLich).getTime() - new Date(a.ngayDatLich).getTime()
        )[0];

        return {
          ...patient,
          soLanKham: patientAppointments.length,
          lanKhamGanNhat: latestAppointment?.ngayDatLich,
          maLichKham: latestAppointment?.maLichKham,
          trieuChung: latestAppointment?.trieuChung,
          trangThai: latestAppointment?.trangThai
        };
      });

      setPatients(patientsWithStats);
    } catch (error) {
      toast.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetail = async (patient: Patient) => {
    try {
      // Get patient appointments
      const appointmentsRes = await appointmentService.all();
      const patientAppointments = appointmentsRes.data.filter((a: any) =>
        a.maBenhNhan === patient.maNguoiDung &&
        (a.maNhaSi === currentUser?.nhaSi?.maNhaSi || a.tenNhaSi === currentUser?.nhaSi?.hoTen)
      );

      // Get medical records for these appointments
      const medicalRecordsPromises = patientAppointments.map((a: any) =>
        medicalRecordService.all({ maLichKham: a.maLichKham })
      );

      const medicalRecordsResponses = await Promise.all(medicalRecordsPromises);
      const allMedicalRecords = medicalRecordsResponses.flatMap(res => res.data);

      const patientDetail: PatientDetail = {
        thongTin: patient,
        lichSuKham: allMedicalRecords.map((record: any) => {
          const appointment = patientAppointments.find((a: any) => a.maLichKham === record.maLichKham);
          return {
            ...record,
            ngayKham: appointment?.ngayDatLich,
            trieuChung: appointment?.trieuChung
          };
        })
      };

      setSelectedPatient(patientDetail);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết bệnh nhân');
    }
  };

  const handleCreateMedicalRecord = (appointment: any) => {
    setSelectedAppointment(appointment);
    setMedicalForm({
      ketQuaChuanDoan: '',
      ngayTaiKham: ''
    });
    setShowMedicalModal(true);
  };

  const handleSaveMedicalRecord = async () => {
    if (!selectedAppointment || !medicalForm.ketQuaChuanDoan.trim()) {
      toast.error('Vui lòng nhập kết quả chẩn đoán');
      return;
    }

    try {
      const medicalData = {
        ketQuaChuanDoan: medicalForm.ketQuaChuanDoan,
        ngayTaiKham: medicalForm.ngayTaiKham || null,
        maLichKham: selectedAppointment.maLichKham
      };

      await medicalRecordService.create(medicalData);
      toast.success('Tạo phiếu khám thành công');
      setShowMedicalModal(false);
      fetchMyPatients();
    } catch (error) {
      toast.error('Tạo phiếu khám thất bại');
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusMap: { [key: string]: string } = {
      'Chờ': 'warning',
      'Xác nhận': 'success',
      'Hoàn thành': 'primary',
      'Hủy': 'danger'
    };
    return `badge bg-${statusMap[status || ''] || 'secondary'}`;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchSearch =
      patient.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.soDienThoai.includes(searchTerm) ||
      patient.eMail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = !filterStatus || patient.trangThai === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Danh sách bệnh nhân của tôi</h4>
        <div className="d-flex align-items-center">
          <span className="text-muted me-3">
            Tổng: <strong>{filteredPatients.length}</strong> bệnh nhân
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chờ">Chờ khám</option>
                <option value="Xác nhận">Đã xác nhận</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={fetchMyPatients}>
                <i className="icofont-refresh me-2"></i>Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredPatients.map(patient => (
            <div key={patient.maNguoiDung} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {patient.anh ? (
                      <img
                        src={patient.anh}
                        alt={patient.hoTen}
                        className="rounded-circle me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3"
                        style={{ width: '60px', height: '60px' }}
                      >
                        {patient.hoTen.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{patient.hoTen}</h6>
                      <p className="text-muted mb-0 small">
                        {calculateAge(patient.ngaySinh)} tuổi • {patient.gioiTinh}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Số lần khám:</small>
                      <span className="badge bg-info">{patient.soLanKham}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Lần cuối:</small>
                      <small>{formatDate(patient.lanKhamGanNhat)}</small>
                    </div>
                    {patient.trangThai && (
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Trạng thái:</small>
                        <span className={getStatusBadge(patient.trangThai)}>
                          {patient.trangThai}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => fetchPatientDetail(patient)}
                    >
                      <i className="icofont-eye me-2"></i>Xem chi tiết
                    </button>
                    {patient.trangThai === 'Xác nhận' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleCreateMedicalRecord(patient)}
                      >
                        <i className="icofont-stethoscope me-2"></i>Tạo phiếu khám
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPatients.length === 0 && !loading && (
        <div className="text-center py-5 text-muted">
          <i className="icofont-users fs-1"></i>
          <p className="mt-2">Chưa có bệnh nhân nào</p>
        </div>
      )}

      {/* Patient Detail Modal */}
      {showDetailModal && selectedPatient && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="icofont-user me-2"></i>
                  Chi tiết bệnh nhân: {selectedPatient.thongTin.hoTen}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Patient Info */}
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Thông tin cá nhân</h6>
                      </div>
                      <div className="card-body text-center">
                        {selectedPatient.thongTin.anh ? (
                          <img
                            src={selectedPatient.thongTin.anh}
                            alt={selectedPatient.thongTin.hoTen}
                            className="rounded-circle mb-3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                            style={{ width: '100px', height: '100px', fontSize: '2rem' }}
                          >
                            {selectedPatient.thongTin.hoTen.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <h6>{selectedPatient.thongTin.hoTen}</h6>
                        <p className="text-muted">{calculateAge(selectedPatient.thongTin.ngaySinh)} tuổi</p>

                        <div className="text-start mt-3">
                          <p className="mb-2">
                            <strong>Giới tính:</strong> {selectedPatient.thongTin.gioiTinh}
                          </p>
                          <p className="mb-2">
                            <strong>Ngày sinh:</strong> {formatDate(selectedPatient.thongTin.ngaySinh)}
                          </p>
                          <p className="mb-2">
                            <strong>SĐT:</strong> {selectedPatient.thongTin.soDienThoai}
                          </p>
                          <p className="mb-2">
                            <strong>Email:</strong> {selectedPatient.thongTin.eMail}
                          </p>
                          <p className="mb-0">
                            <strong>Địa chỉ:</strong> {selectedPatient.thongTin.diaChi || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Lịch sử khám bệnh</h6>
                      </div>
                      <div className="card-body">
                        {selectedPatient.lichSuKham.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Ngày khám</th>
                                  <th>Triệu chứng</th>
                                  <th>Chẩn đoán</th>
                                  <th>Tái khám</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPatient.lichSuKham.map(record => (
                                  <tr key={record.maPhieuKham}>
                                    <td>{formatDate(record.ngayKham)}</td>
                                    <td>{record.trieuChung || '-'}</td>
                                    <td>{record.ketQuaChuanDoan}</td>
                                    <td>{formatDate(record.ngayTaiKham) || 'Không'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            <i className="icofont-file-document fs-3"></i>
                            <p className="mt-2">Chưa có lịch sử khám bệnh</p>
                          </div>
                        )}
                      </div>
                    </div>
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Modal */}
      {showMedicalModal && selectedAppointment && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Tạo phiếu khám</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMedicalModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Bệnh nhân</label>
                  <p className="form-control-plaintext fw-bold">{selectedAppointment.hoTen}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Triệu chứng</label>
                  <p className="form-control-plaintext">{selectedAppointment.trieuChung}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Kết quả chẩn đoán <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={medicalForm.ketQuaChuanDoan}
                    onChange={(e) => setMedicalForm({ ...medicalForm, ketQuaChuanDoan: e.target.value })}
                    placeholder="Nhập kết quả chẩn đoán, điều trị..."
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ngày tái khám (nếu có)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={medicalForm.ngayTaiKham}
                    onChange={(e) => setMedicalForm({ ...medicalForm, ngayTaiKham: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMedicalModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveMedicalRecord}
                >
                  <i className="icofont-save me-2"></i>Lưu phiếu khám
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPatients;
