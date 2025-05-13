import React, { useState } from 'react';

const initialPatients = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    examDate: '2025-05-12',
    diagnosis: 'Viêm nướu răng, chảy máu chân răng',
    examNote: 'Cần vệ sinh răng miệng kỹ lưỡng và dùng nước súc miệng',
    contact: {
      phone: '0901234567',
      email: 'vana@example.com',
      address: '123 Lê Lợi, Quận 1, TP.HCM',
    },
  },
  {
    id: 2,
    name: 'Trần Thị B',
    examDate: '2025-05-13',
    diagnosis: 'Sau khi nhổ răng khôn, sưng đau',
    examNote: 'Theo dõi tình trạng sưng và tránh ăn thức ăn cứng',
    contact: {
      phone: '0912345678',
      email: 'thib@example.com',
      address: '456 Nguyễn Trãi, Quận 5, TP.HCM',
    },
  },
  {
    id: 3,
    name: 'Lê Văn C',
    examDate: '2025-05-14',
    diagnosis: 'Sâu răng hàm, đau nhức liên tục',
    examNote: 'Đã trám răng, hẹn tái khám sau 1 tuần',
    contact: {
      phone: '0933456789',
      email: 'vanc@example.com',
      address: '789 Cách Mạng Tháng 8, Quận 3, TP.HCM',
    },
  },
];

const MyPatients = () => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [modalType, setModalType] = useState<'exam' | 'contact' | null>(null);

  const openModal = (patient: any, type: 'exam' | 'contact') => {
    setSelectedPatient(patient);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setModalType(null);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Bệnh nhân của tôi</h4>
      <table className="table table-bordered table-striped">
        <thead className="table-primary">
          <tr>
            <th>Tên bệnh nhân</th>
            <th>Ngày khám</th>
            <th>Đánh giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {initialPatients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.examDate}</td>
              <td>{patient.diagnosis}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => openModal(patient, 'exam')}
                >
                  Xem phiếu khám
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => openModal(patient, 'contact')}
                >
                  Xem liên hệ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal - dùng HTML + class Bootstrap */}
      {selectedPatient && modalType && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'exam' ? 'Phiếu khám bệnh' : 'Thông tin liên hệ'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {modalType === 'exam' ? (
                  <>
                    <p><strong>Tên bệnh nhân:</strong> {selectedPatient.name}</p>
                    <p><strong>Ngày khám:</strong> {selectedPatient.examDate}</p>
                    <p><strong>Chẩn đoán:</strong> {selectedPatient.diagnosis}</p>
                    <p><strong>Ghi chú:</strong> {selectedPatient.examNote}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Điện thoại:</strong> {selectedPatient.contact.phone}</p>
                    <p><strong>Email:</strong> {selectedPatient.contact.email}</p>
                    <p><strong>Địa chỉ:</strong> {selectedPatient.contact.address}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPatients;
