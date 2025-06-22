import React from 'react';

function AdminDashboard() {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">Trang Quản Trị</h2>
                    <div className="row">
                        <div className="col-md-3 mb-4">
                            <div className="card text-white bg-primary">
                                <div className="card-header">
                                    <h5 className="card-title">Phòng Khám</h5>
                                </div>
                                <div className="card-body">
                                    <h3>0</h3>
                                    <p>Tổng số phòng khám</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="card text-white bg-success">
                                <div className="card-header">
                                    <h5 className="card-title">Tài Khoản</h5>
                                </div>
                                <div className="card-body">
                                    <h3>0</h3>
                                    <p>Tổng số tài khoản</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="card text-white bg-warning">
                                <div className="card-header">
                                    <h5 className="card-title">Lịch Khám</h5>
                                </div>
                                <div className="card-body">
                                    <h3>0</h3>
                                    <p>Tổng số lịch khám</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 mb-4">
                            <div className="card text-white bg-info">
                                <div className="card-header">
                                    <h5 className="card-title">Doanh Thu</h5>
                                </div>
                                <div className="card-body">
                                    <h3>0đ</h3>
                                    <p>Tổng doanh thu</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Chức năng quản lý</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <a href="/clinic" className="btn btn-outline-primary w-100 p-3">
                                                <i className="fa fa-clinic-medical"></i>
                                                <br />Quản lý phòng khám
                                            </a>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <a href="/account" className="btn btn-outline-success w-100 p-3">
                                                <i className="fa fa-user-cog"></i>
                                                <br />Quản lý tài khoản
                                            </a>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <a href="/shift" className="btn btn-outline-warning w-100 p-3">
                                                <i className="fa fa-clock"></i>
                                                <br />Quản lý ca khám
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
