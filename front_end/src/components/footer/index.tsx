function TheFooter() {
    return (
     
<footer className="footer section gray-bg">
	<div className="container">
		<div className="row">
			<div className="col-lg-4 mr-auto col-sm-6">
				<div className="widget mb-5 mb-lg-0">
					<div className="logo mb-4">
						<img src="images/logo.png" alt="" className="img-fluid"/>
					</div>
					<p>Hệ thống nha khoa hàng đầu Đà Nẵng. Sứ mệnh của chúng tôi là cung cấp dịch vụ nha khoa tốt nhất đến mọi người</p>

					<ul className="list-inline footer-socials mt-4">
						<li className="list-inline-item">
							<a href="https://www.facebook.com/themefisher"><i className="icofont-facebook"></i></a>
						</li>
						<li className="list-inline-item">
							<a href="https://twitter.com/themefisher"><i className="icofont-twitter"></i></a>
						</li>
						<li className="list-inline-item">
							<a href="https://www.pinterest.com/themefisher/"><i className="icofont-linkedin"></i></a>
						</li>
					</ul>
				</div>
			</div>

			<div className="col-lg-2 col-md-6 col-sm-6">
				<div className="widget mb-5 mb-lg-0">
					<h4 className="text-capitalize mb-3">Phòng khám</h4>
					<div className="divider mb-4"></div>

					<ul className="list-unstyled footer-menu lh-35">
						<li><a href="#!">Nha khoa Việt Hàn </a></li>
						<li><a href="#!">Nha khoa Hồng Vân</a></li>
						<li><a href="#!">Nha khoa ABC</a></li>
				
					</ul>
				</div>
			</div>

			<div className="col-lg-2 col-md-6 col-sm-6">
				<div className="widget mb-5 mb-lg-0">
					<h4 className="text-capitalize mb-3">Hỗ trợ</h4>
					<div className="divider mb-4"></div>

					<ul className="list-unstyled footer-menu lh-35">
						<li><a href="#!">Quy định</a></li>
						<li><a href="#!">Đặt lịch</a></li>
						<li><a href="#!">Tái khám </a></li>
						<li><a href="#!">Hỏi đáp</a></li>
					</ul>
				</div>
			</div>

			<div className="col-lg-3 col-md-6 col-sm-6">
				<div className="widget widget-contact mb-5 mb-lg-0">
					<h4 className="text-capitalize mb-3">Liên hệ</h4>
					<div className="divider mb-4"></div>

					<div className="footer-contact-block mb-4">
						<div className="icon d-flex align-items-center">
							<i className="icofont-email mr-3"></i>
							<span className="h6 mb-0">Hỗ trợ 24/7</span>
						</div>
						<h4 className="mt-2"><a href="mailto:support@email.com">Support@email.com</a></h4>
					</div>

					<div className="footer-contact-block">
						<div className="icon d-flex align-items-center">
							<i className="icofont-support mr-3"></i>
							<span className="h6 mb-0">Thời gian làm việc : 08:30 - 18:00</span>
						</div>
						<h4 className="mt-2"><a href="tel:+23-345-67890">+23-456-6588</a></h4>
					</div>
				</div>
			</div>
		</div>
	</div>
</footer>
    );
  }
  
  export default TheFooter;
  