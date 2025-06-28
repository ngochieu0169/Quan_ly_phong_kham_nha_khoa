import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appointmentService, medicalRecordService, userService, appointmentServiceExtended, serviceService, invoiceService, invoiceServiceExtended } from '../../../services';

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
  hasInvoice?: boolean;
}

interface PatientDetail {
  thongTin: Patient;
  lichSuKham: MedicalRecord[];
}

interface Service {
  maDichVu: number;
  tenDichVu: string;
  donGia: number;
  moTa: string;
  tenLoaiDichVu: string;
}

interface ServiceUsage {
  maDichVu: number;
  tenDichVu: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}

function MyPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [medicalForm, setMedicalForm] = useState({
    ketQuaChuanDoan: '',
    ngayTaiKham: '',
    createInvoiceAfter: true // Default to true for better UX
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceUsages, setServiceUsages] = useState<ServiceUsage[]>([]);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<any>(null);
  const [loadingPatientDetail, setLoadingPatientDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments'>('appointments');
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showInvoiceAfterRecord, setShowInvoiceAfterRecord] = useState(false);
  const [newMedicalRecord, setNewMedicalRecord] = useState<any>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('=== DEBUG MyPatients ===');
    console.log('User from localStorage:', user);
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.nhaSi?.maNhaSi || currentUser.bacsiData?.maNhaSi)) {
      fetchMyPatients();
      fetchServices();
      fetchTodayAppointments();
    }
  }, [currentUser]);

  // Refresh data khi component được focus lại (để cập nhật sau khi phân công bác sĩ)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser && (currentUser.nhaSi?.maNhaSi || currentUser.bacsiData?.maNhaSi)) {
        fetchMyPatients();
        fetchTodayAppointments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [currentUser]);

  const fetchMyPatients = async () => {
    try {
      setLoading(true);

      // Xử lý cả hai cấu trúc dữ liệu: nhaSi và bacsiData
      const doctorId = currentUser?.nhaSi?.maNhaSi || currentUser?.bacsiData?.maNhaSi;

      if (!doctorId) {
        toast.error('Không tìm thấy thông tin bác sĩ');
        return;
      }

      // Sử dụng API mới để lấy danh sách bệnh nhân của bác sĩ
      const patientsRes = await appointmentServiceExtended.getPatientsByDoctor(doctorId);

      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesRes = await serviceService.all();
      setServices(servicesRes.data.data); // API trả về { data: [...] }
    } catch (error) {
      toast.error('Không thể tải danh sách dịch vụ');
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const doctorId = currentUser?.nhaSi?.maNhaSi || currentUser?.bacsiData?.maNhaSi;

      if (!doctorId) {
        toast.error('Không tìm thấy thông tin bác sĩ');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const appointmentsRes = await appointmentServiceExtended.getByDoctor(doctorId, {
        startDate: today,
        endDate: today
      });

      // Lọc chỉ lấy appointments chưa có phiếu khám
      const appointmentsWithStatus = await Promise.all(
        appointmentsRes.data.map(async (appointment: any) => {
          try {
            const medicalRecordsRes = await medicalRecordService.all({ maLichKham: appointment.maLichKham });
            const hasRecord = medicalRecordsRes.data.length > 0;
            console.log(`DEBUG: Appointment ${appointment.maLichKham} - hasRecord: ${hasRecord}, records count: ${medicalRecordsRes.data.length}`);
            return { ...appointment, hasRecord };
          } catch (error) {
            console.log(`DEBUG: Error checking record for appointment ${appointment.maLichKham}:`, error);
            return { ...appointment, hasRecord: false };
          }
        })
      );

      console.log('DEBUG: Final appointments with status:', appointmentsWithStatus);

      setTodayAppointments(appointmentsWithStatus);
    } catch (error) {
      toast.error('Không thể tải lịch khám hôm nay');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchPatientDetail = async (patient: Patient) => {
    try {
      setLoadingPatientDetail(true);

      // Xử lý cả hai cấu trúc dữ liệu: nhaSi và bacsiData
      const doctorId = currentUser?.nhaSi?.maNhaSi || currentUser?.bacsiData?.maNhaSi;

      if (!doctorId) {
        toast.error('Không tìm thấy thông tin bác sĩ');
        return;
      }

      // Lấy lịch khám của bệnh nhân này với bác sĩ hiện tại với cache buster
      const appointmentsRes = await appointmentServiceExtended.getByDoctor(doctorId, {
        startDate: '1900-01-01', // Lấy tất cả lịch sử để đảm bảo không bị miss data
        endDate: new Date().toISOString().split('T')[0]
      } as any);

      const patientAppointments = appointmentsRes.data.filter((a: any) => a.maBenhNhan === patient.maNguoiDung);

      console.log('DEBUG: Patient appointments for', patient.hoTen, ':', patientAppointments);

      // Lấy hồ sơ khám bệnh cho các lịch khám này
      const medicalRecordsPromises = patientAppointments.map((a: any) =>
        medicalRecordService.all({ maLichKham: a.maLichKham })
      );

      const medicalRecordsResponses = await Promise.all(medicalRecordsPromises);
      const allMedicalRecords = medicalRecordsResponses.flatMap(res => res.data);

      // Lấy hóa đơn của bệnh nhân này với bác sĩ hiện tại - tối ưu hơn
      let patientInvoices: any[] = [];
      // Force refresh để lấy hóa đơn mới nhất - luôn dùng fallback cho chắc chắn
      console.log('DEBUG: Force refresh - getting all invoices to ensure fresh data');
      const allInvoicesRes = await invoiceService.all();
      const allInvoices = allInvoicesRes.data;
      patientInvoices = allInvoices.filter((inv: any) =>
        allMedicalRecords.some(record => record.maPhieuKham === inv.maPhieuKham)
      );
      console.log('DEBUG: Filtered', patientInvoices.length, 'invoices from', allInvoices.length, 'total for patient records');

      console.log('DEBUG: Medical records:', allMedicalRecords.map(r => ({
        maPhieuKham: r.maPhieuKham,
        maLichKham: r.maLichKham,
        ketQuaChuanDoan: r.ketQuaChuanDoan
      })));
      console.log('DEBUG: Patient invoices:', patientInvoices.map((inv: any) => ({
        maHoaDon: inv.maHoaDon,
        maPhieuKham: inv.maPhieuKham,
        soTien: inv.soTien
      })));

      const patientDetail: PatientDetail = {
        thongTin: patient,
        lichSuKham: allMedicalRecords
          .map((record: any) => {
            const appointment = patientAppointments.find((a: any) => a.maLichKham === record.maLichKham);

            // Kiểm tra xem phiếu khám cụ thể này đã có hóa đơn hợp lệ chưa
            const hasInvoice = patientInvoices.some((invoice: any) =>
              invoice.maPhieuKham === record.maPhieuKham &&
              invoice.soTien &&
              parseFloat(invoice.soTien) > 0
            );

            console.log(`DEBUG: Record ${record.maPhieuKham} has invoice:`, hasInvoice,
              'Invoice found:', patientInvoices.find(inv => inv.maPhieuKham === record.maPhieuKham));

            return {
              ...record,
              ngayKham: appointment?.ngayKham,
              trieuChung: appointment?.trieuChung,
              hasInvoice: hasInvoice
            };
          })
          .sort((a, b) => new Date(b.ngayKham || '').getTime() - new Date(a.ngayKham || '').getTime()) // Sắp xếp theo ngày khám mới nhất
      };

      setSelectedPatient(patientDetail);
      if (!showDetailModal) {
        setShowDetailModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching patient detail:', error);
      toast.error('Không thể tải chi tiết bệnh nhân: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingPatientDetail(false);
    }
  };

  const handleCreateMedicalRecord = (appointment: any) => {
    // Đảm bảo appointment có đủ thông tin
    const appointmentData = {
      maLichKham: appointment.maLichKham,
      hoTen: appointment.tenBenhNhan || appointment.hoTen,
      trieuChung: appointment.trieuChung,
      ...appointment
    };

    setSelectedAppointment(appointmentData);
    setMedicalForm({
      ketQuaChuanDoan: '',
      ngayTaiKham: '',
      createInvoiceAfter: true
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

      const response = await medicalRecordService.create(medicalData);

      // Tạo object medical record mới để có thể tạo hóa đơn ngay
      const newRecord = {
        maPhieuKham: response.data.insertId || response.data.maPhieuKham,
        ketQuaChuanDoan: medicalData.ketQuaChuanDoan,
        ngayTaiKham: medicalData.ngayTaiKham,
        maLichKham: medicalData.maLichKham,
        hasInvoice: false
      };

      setNewMedicalRecord(newRecord);
      setShowMedicalModal(false);

      // Kiểm tra xem user có muốn tạo hóa đơn ngay không
      if (medicalForm.createInvoiceAfter) {
        setShowInvoiceAfterRecord(true); // Hiển thị modal xác nhận tạo hóa đơn
      } else {
        toast.success('Tạo phiếu khám thành công!');
        setNewMedicalRecord(null);
      }

      fetchMyPatients();
      fetchTodayAppointments(); // Refresh appointments list
    } catch (error) {
      toast.error('Tạo phiếu khám thất bại');
    }
  };

  const handleCreateInvoice = (medicalRecord: any) => {
    // Kiểm tra nếu record đã có hóa đơn thì không cho phép xuất nữa
    if (medicalRecord.hasInvoice) {
      toast.warning('Phiếu khám này đã được xuất hóa đơn rồi!');
      return;
    }

    setSelectedMedicalRecord(medicalRecord);
    setServiceUsages([{
      maDichVu: 0,
      tenDichVu: '',
      soLuong: 1,
      donGia: 0,
      thanhTien: 0
    }]);
    setShowServiceModal(true);
  };

  const addServiceUsage = () => {
    setServiceUsages([...serviceUsages, {
      maDichVu: 0,
      tenDichVu: '',
      soLuong: 1,
      donGia: 0,
      thanhTien: 0
    }]);
  };

  const removeServiceUsage = (index: number) => {
    setServiceUsages(serviceUsages.filter((_, i) => i !== index));
  };

  const updateServiceUsage = (index: number, field: keyof ServiceUsage, value: any) => {
    const updated = [...serviceUsages];
    updated[index] = { ...updated[index], [field]: value };

    // Auto calculate total when service or quantity changes
    if (field === 'maDichVu') {
      const service = services.find(s => s.maDichVu === value);
      if (service) {
        updated[index].tenDichVu = service.tenDichVu;
        updated[index].donGia = service.donGia;
        updated[index].thanhTien = service.donGia * updated[index].soLuong;
      }
    } else if (field === 'soLuong') {
      updated[index].thanhTien = updated[index].donGia * value;
    }

    setServiceUsages(updated);
  };

  const handleSaveInvoice = async () => {
    if (!selectedMedicalRecord) return;

    const validServices = serviceUsages.filter(usage => usage.maDichVu > 0 && usage.soLuong > 0);

    if (validServices.length === 0) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ');
      return;
    }

    const totalAmount = validServices.reduce((sum, usage) => sum + usage.thanhTien, 0);

    try {
      const invoiceData = {
        soTien: totalAmount,
        phuongThuc: 'Chưa xác định',
        trangThai: 'Chưa thu tiền',
        ngaytao: new Date().toISOString(),
        ngayThanhToan: null,
        maPhieuKham: selectedMedicalRecord.maPhieuKham,
        services: validServices.map(service => ({
          maDichVu: service.maDichVu,
          soLuong: service.soLuong,
          ghiChu: `${service.tenDichVu} - ${service.soLuong}x${service.donGia}`
        }))
      };

      await invoiceServiceExtended.createWithDetails(invoiceData);
      toast.success('🎉 Tạo hóa đơn thành công! Hóa đơn đã được chuyển đến bộ phận thu ngân để thanh toán.', {
        autoClose: 5000
      });
      setShowServiceModal(false);
      setSelectedMedicalRecord(null);
      setServiceUsages([]);

      // Hiển thị loading toast
      const toastId = toast.loading('🔄 Đang cập nhật thông tin hóa đơn...', {
        autoClose: false
      });

      // Delay để đảm bảo database transaction đã commit hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refresh patient detail để cập nhật trạng thái đã xuất hóa đơn
      if (selectedPatient) {
        await fetchPatientDetail(selectedPatient.thongTin);
      }

      // Đóng loading toast
      toast.dismiss(toastId);
    } catch (error: any) {
      console.error('Invoice creation error:', error);

      // Handle specific error from backend
      if (error.response?.status === 400 && error.response?.data?.error?.includes('trùng lặp')) {
        toast.error('Phiếu khám này đã có hóa đơn rồi! Vui lòng refresh trang để cập nhật trạng thái.');
        setShowServiceModal(false);
        setSelectedMedicalRecord(null);

        // Delay nhỏ để đảm bảo database đã commit
        await new Promise(resolve => setTimeout(resolve, 500));

        // Refresh để cập nhật trạng thái
        if (selectedPatient) {
          await fetchPatientDetail(selectedPatient.thongTin);
        }
      } else {
        toast.error('Tạo hóa đơn thất bại');
      }
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

  // Filter appointments  
  const filteredAppointments = todayAppointments.filter(appointment => {
    if (appointmentFilter === 'pending') return !appointment.hasRecord;
    if (appointmentFilter === 'completed') return appointment.hasRecord;
    return true; // 'all'
  });

  return (
    <div className="container-fluid">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Quản lý khám bệnh</h4>
        <div className="d-flex align-items-center">
          <span className="text-muted me-3">
            {activeTab === 'appointments'
              ? `Hôm nay: ${todayAppointments.length} lịch khám`
              : `Tổng: ${filteredPatients.length} bệnh nhân`
            }
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-3">
        <div className="card-header p-0">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <i className="icofont-calendar me-2"></i>
                Lịch khám hôm nay
                {todayAppointments.filter(a => !a.hasRecord).length > 0 && (
                  <span className="badge bg-danger ms-2">
                    {todayAppointments.filter(a => !a.hasRecord).length}
                  </span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => setActiveTab('patients')}
              >
                <i className="icofont-users me-2"></i>
                Danh sách bệnh nhân
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'appointments' ? (
        <>
          {/* Today's Appointments */}
          <div className="card mb-3">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="icofont-calendar me-2"></i>
                  Lịch khám hôm nay ({new Date().toLocaleDateString('vi-VN')})
                </h6>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value as 'all' | 'pending' | 'completed')}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">Tất cả ({todayAppointments.length})</option>
                    <option value="pending">Chưa khám ({todayAppointments.filter(a => !a.hasRecord).length})</option>
                    <option value="completed">Đã khám ({todayAppointments.filter(a => a.hasRecord).length})</option>
                  </select>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchTodayAppointments}
                    disabled={loadingAppointments}
                  >
                    <i className="icofont-refresh me-1"></i>Làm mới
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loadingAppointments ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Đang tải lịch khám...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="icofont-calendar fs-3"></i>
                  <p className="mt-2">
                    {appointmentFilter === 'pending' ? 'Không có lịch khám nào chưa khám' :
                      appointmentFilter === 'completed' ? 'Không có lịch khám nào đã khám' :
                        'Không có lịch khám nào hôm nay'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Giờ khám</th>
                        <th>Bệnh nhân</th>
                        <th>Liên hệ</th>
                        <th>Triệu chứng</th>
                        <th>Trạng thái</th>
                        <th>Phiếu khám</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map(appointment => (
                        <tr key={appointment.maLichKham}>
                          <td>
                            <span className="fw-bold text-primary">
                              {appointment.gioBatDau?.slice(0, 5)} - {appointment.gioKetThuc?.slice(0, 5)}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong>{appointment.tenBenhNhan}</strong>
                              <br />
                              <small className="text-muted">
                                {appointment.gioiTinh} • {calculateAge(appointment.ngaySinh)} tuổi
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <i className="icofont-phone me-1"></i>{appointment.soDienThoai}
                              <br />
                              <small className="text-muted">
                                <i className="icofont-email me-1"></i>{appointment.eMail}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="text-wrap" style={{ maxWidth: '200px' }}>
                              {appointment.trieuChung || 'Không có'}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadge(appointment.trangThai)}>
                              {appointment.trangThai}
                            </span>
                          </td>
                          <td>
                            {appointment.hasRecord ? (
                              <span className="badge bg-success">
                                <i className="icofont-check me-1"></i>Đã tạo
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                <i className="icofont-clock-time me-1"></i>Chưa tạo
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {appointment.hasRecord ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => fetchPatientDetail({
                                      maNguoiDung: appointment.maBenhNhan,
                                      hoTen: appointment.tenBenhNhan,
                                      ngaySinh: appointment.ngaySinh,
                                      gioiTinh: appointment.gioiTinh,
                                      eMail: appointment.eMail,
                                      soDienThoai: appointment.soDienThoai,
                                      diaChi: appointment.diaChi,
                                      anh: appointment.anh
                                    })}
                                    title="Xem lịch sử khám bệnh"
                                  >
                                    <i className="icofont-eye me-1"></i>Chi tiết
                                  </button>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleCreateMedicalRecord(appointment)}
                                    title="Tạo phiếu khám mới"
                                  >
                                    <i className="icofont-stethoscope me-1"></i>Khám thêm
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleCreateMedicalRecord(appointment)}
                                  title="Tạo phiếu khám đầu tiên"
                                >
                                  <i className="icofont-stethoscope me-1"></i>Khám bệnh
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Filters for Patients */}
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
        </>
      )}

      {/* Patient List - only show when patients tab is active */}
      {activeTab === 'patients' && (
        <>
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
                          <strong>{patient.soLanKham}</strong>
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
        </>
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
                      <div className="card-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                        {loadingPatientDetail ? (
                          <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Đang tải lịch sử khám bệnh...</p>
                          </div>
                        ) : selectedPatient.lichSuKham.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead style={{ position: 'sticky', top: '0', backgroundColor: '#fff', zIndex: 10 }}>
                                <tr>
                                  <th>Ngày khám</th>
                                  <th>Triệu chứng</th>
                                  <th>Chẩn đoán</th>
                                  <th>Tái khám</th>
                                  <th>Trạng thái HĐ</th>
                                  <th>Thao tác</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPatient.lichSuKham.map(record => (
                                  <tr key={record.maPhieuKham}>
                                    <td>{formatDate(record.ngayKham)}</td>
                                    <td>{record.trieuChung || '-'}</td>
                                    <td>{record.ketQuaChuanDoan}</td>
                                    <td>{formatDate(record.ngayTaiKham) || 'Không'}</td>
                                    <td>
                                      {record.hasInvoice ? (
                                        <span className="badge bg-success">
                                          <i className="icofont-check me-1"></i>Đã xuất
                                        </span>
                                      ) : (
                                        <span className="badge bg-warning text-dark">
                                          <i className="icofont-clock-time me-1"></i>Chưa xuất
                                        </span>
                                      )}
                                    </td>
                                    <td>
                                      {record.hasInvoice ? (
                                        <button
                                          className="btn btn-sm btn-secondary"
                                          disabled
                                          title="Phiếu khám này đã được xuất hóa đơn"
                                        >
                                          <i className="icofont-check me-1"></i>Đã xuất
                                        </button>
                                      ) : (
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() => handleCreateInvoice(record)}
                                          title="Xuất phiếu khám"
                                        >
                                          <i className="icofont-bill me-1"></i>Xuất phiếu
                                        </button>
                                      )}
                                    </td>
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
                  className="btn btn-outline-primary me-2"
                  disabled={loadingPatientDetail}
                  onClick={() => {
                    if (selectedPatient) {
                      fetchPatientDetail(selectedPatient.thongTin);
                    }
                  }}
                >
                  {loadingPatientDetail ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <i className="icofont-refresh me-1"></i>Làm mới
                    </>
                  )}
                </button>
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
                  <p className="form-control-plaintext fw-bold">{selectedAppointment.hoTen || selectedAppointment.tenBenhNhan}</p>
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

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="createInvoiceAfter"
                      checked={medicalForm.createInvoiceAfter}
                      onChange={(e) => setMedicalForm({ ...medicalForm, createInvoiceAfter: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="createInvoiceAfter">
                      <i className="icofont-bill me-1"></i>
                      Xuất hóa đơn ngay sau khi lưu phiếu khám
                    </label>
                  </div>
                  <small className="text-muted">
                    Nếu chọn, bạn sẽ được chuyển đến màn hình chọn dịch vụ để tạo hóa đơn
                  </small>
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

      {/* Invoice Confirmation Modal - Show after creating medical record */}
      {showInvoiceAfterRecord && newMedicalRecord && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="icofont-check-circled text-success me-2"></i>
                  Tạo phiếu khám thành công!
                </h5>
              </div>
              <div className="modal-body">
                <div className="alert alert-success" role="alert">
                  <i className="icofont-check-circled me-2"></i>
                  Phiếu khám đã được tạo thành công với mã: <strong>PK{newMedicalRecord.maPhieuKham.toString().padStart(6, '0')}</strong>
                </div>

                <div className="mb-3">
                  <h6>Chẩn đoán:</h6>
                  <p className="border rounded p-2 bg-light">{newMedicalRecord.ketQuaChuanDoan}</p>
                </div>

                <div className="text-center">
                  <div className="alert alert-info" role="alert">
                    <i className="icofont-info-circle me-2"></i>
                    <strong>Tiếp theo:</strong> Bạn sẽ chọn các dịch vụ đã thực hiện để tạo hóa đơn cho bệnh nhân
                  </div>
                  <p className="mb-3">
                    <i className="icofont-question-circle me-2"></i>
                    Tiến hành <strong>chọn dịch vụ và xuất hóa đơn</strong> ngay bây giờ?
                  </p>
                  <small className="text-muted">
                    Hoặc bạn có thể xuất hóa đơn sau từ lịch sử khám bệnh của bệnh nhân
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowInvoiceAfterRecord(false);
                    setNewMedicalRecord(null);
                    toast.success('Tạo phiếu khám thành công!');
                  }}
                >
                  <i className="icofont-close me-1"></i>Bỏ qua
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    setShowInvoiceAfterRecord(false);
                    setSelectedMedicalRecord(newMedicalRecord);
                    setServiceUsages([{
                      maDichVu: 0,
                      tenDichVu: '',
                      soLuong: 1,
                      donGia: 0,
                      thanhTien: 0
                    }]);
                    setShowServiceModal(true);
                    setNewMedicalRecord(null);
                  }}
                >
                  <i className="icofont-bill me-1"></i>Xuất hóa đơn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Selection Modal */}
      {showServiceModal && selectedMedicalRecord && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="icofont-bill me-2"></i>
                  Xuất phiếu khám - Chọn dịch vụ
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowServiceModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="alert alert-info" role="alert">
                  <i className="icofont-info-circle me-2"></i>
                  <strong>Hướng dẫn:</strong> Chọn các dịch vụ đã thực hiện trong quá trình khám bệnh. Hóa đơn sẽ được tạo và chuyển đến bộ phận thu ngân.
                </div>

                <div className="alert alert-warning" role="alert">
                  <i className="icofont-warning-alt me-2"></i>
                  <strong>Lưu ý:</strong> Mỗi phiếu khám chỉ được xuất hóa đơn một lần duy nhất. Vui lòng kiểm tra kỹ thông tin trước khi tạo.
                </div>

                <div className="mb-3">
                  <label className="form-label">Phiếu khám</label>
                  <p className="form-control-plaintext fw-bold">
                    PK{selectedMedicalRecord.maPhieuKham.toString().padStart(6, '0')} - {selectedMedicalRecord.ketQuaChuanDoan}
                  </p>
                </div>

                {/* Service Selection */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label">Dịch vụ sử dụng</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addServiceUsage}
                    >
                      <i className="icofont-plus me-1"></i>Thêm dịch vụ
                    </button>
                  </div>

                  {serviceUsages.map((usage, index) => (
                    <div key={index} className="row mb-2 align-items-end">
                      <div className="col-md-5">
                        <label className="form-label">Dịch vụ</label>
                        <select
                          className="form-select"
                          value={usage.maDichVu}
                          onChange={(e) => updateServiceUsage(index, 'maDichVu', parseInt(e.target.value))}
                        >
                          <option value={0}>Chọn dịch vụ...</option>
                          {services.map(service => (
                            <option key={service.maDichVu} value={service.maDichVu}>
                              {service.tenDichVu} - {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(service.donGia)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Số lượng</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={usage.soLuong}
                          onChange={(e) => updateServiceUsage(index, 'soLuong', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Thành tiền</label>
                        <input
                          type="text"
                          className="form-control"
                          value={new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(usage.thanhTien)}
                          readOnly
                        />
                      </div>
                      <div className="col-md-2">
                        {serviceUsages.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger w-100"
                            onClick={() => removeServiceUsage(index)}
                          >
                            <i className="icofont-close"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="row">
                  <div className="col-md-8"></div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <h6 className="card-title">Tổng tiền</h6>
                        <h4 className="text-primary">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(serviceUsages.reduce((sum, usage) => sum + usage.thanhTien, 0))}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowServiceModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveInvoice}
                >
                  <i className="icofont-save me-2"></i>Tạo hóa đơn
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
