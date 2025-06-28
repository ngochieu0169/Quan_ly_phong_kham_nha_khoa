// controllers/blogController.js

// Mock data cho blog posts
const blogPosts = [
  {
    id: 1,
    title: "Cách chăm sóc răng miệng hiệu quả hàng ngày",
    summary: "Hướng dẫn chi tiết các bước chăm sóc răng miệng đúng cách để có nụ cười tự tin và sức khỏe răng miệng tốt.",
    content: `
      <h3>Tầm quan trọng của việc chăm sóc răng miệng</h3>
      <p>Chăm sóc răng miệng hàng ngày không chỉ giúp bạn có nụ cười tự tin mà còn đóng vai trò quan trọng trong việc duy trì sức khỏe tổng thể. Nhiều nghiên cứu đã chứng minh mối liên hệ giữa sức khỏe răng miệng và các bệnh lý tim mạch, tiểu đường, và nhiều vấn đề sức khỏe khác.</p>
      
      <h4>1. Đánh răng đúng cách</h4>
      <p>Đánh răng là bước cơ bản nhất trong việc chăm sóc răng miệng. Tuy nhiên, không phải ai cũng biết cách đánh răng đúng cách:</p>
      <ul>
        <li>Đánh răng ít nhất 2 lần/ngày, mỗi lần 2-3 phút</li>
        <li>Sử dụng kem đánh răng có chứa fluoride</li>
        <li>Chọn bàn chải có lông mềm, kích thước phù hợp</li>
        <li>Thay bàn chải mỗi 3-4 tháng hoặc khi lông bàn chải bị hỏng</li>
      </ul>
      
      <h4>2. Sử dụng chỉ nha khoa</h4>
      <p>Chỉ nha khoa giúp loại bỏ thức ăn thừa và mảng bám ở những vị trí mà bàn chải không thể tiếp cận được, đặc biệt là kẽ răng. Việc sử dụng chỉ nha khoa hàng ngày sẽ giúp ngăn ngừa sâu răng và viêm nướu hiệu quả.</p>
      
      <h4>3. Súc miệng bằng nước súc miệng</h4>
      <p>Nước súc miệng có thể giúp tiêu diệt vi khuẩn, làm sạch những vùng khó tiếp cận và cung cấp thêm fluoride để bảo vệ răng. Tuy nhiên, nước súc miệng chỉ là bước bổ sung, không thể thay thế việc đánh răng và sử dụng chỉ nha khoa.</p>
      
      <h4>4. Chế độ ăn uống lành mạnh</h4>
      <p>Những gì bạn ăn và uống có tác động trực tiếp đến sức khỏe răng miệng:</p>
      <ul>
        <li>Hạn chế đồ ngọt và đồ uống có đường</li>
        <li>Tăng cường thực phẩm giàu canxi như sữa, phô mai, rau xanh</li>
        <li>Ăn nhiều trái cây và rau quả tươi</li>
        <li>Uống đủ nước mỗi ngày</li>
      </ul>
      
      <h4>5. Khám răng định kỳ</h4>
      <p>Dù chăm sóc răng miệng tại nhà có kỹ lưỡng đến đâu, việc khám răng định kỳ 6 tháng/lần vẫn rất cần thiết. Bác sĩ có thể phát hiện sớm các vấn đề và điều trị kịp thời, tránh để bệnh tiến triển nặng hơn.</p>
      
      <p><strong>Kết luận:</strong> Chăm sóc răng miệng là một thói quen cần được duy trì hàng ngày. Với những bước đơn giản nhưng hiệu quả trên, bạn có thể duy trì một hàm răng khỏe mạnh và nụ cười tự tin suốt đời.</p>
    `,
    image: "/images/blog/blog-1.jpg",
    date: "2024-01-15",
    author: "BS. Nguyễn Văn A",
    category: "Chăm sóc răng miệng",
    views: 1234,
    featured: true
  },
  {
    id: 2,
    title: "Niềng răng - Giải pháp cho nụ cười hoàn hảo",
    summary: "Tìm hiểu về các phương pháp niềng răng hiện đại và lợi ích của việc chỉnh nha đối với sức khỏe răng miệng.",
    content: `
      <h3>Niềng răng là gì?</h3>
      <p>Niềng răng là phương pháp chỉnh nha sử dụng các thiết bị để di chuyển răng về vị trí đúng, tạo ra hàm răng đều và nụ cười hoàn hảo. Công nghệ niềng răng hiện đại đã phát triển rất nhiều, mang lại hiệu quả cao và thoải mái hơn cho người bệnh.</p>
      
      <h4>Các loại niềng răng phổ biến</h4>
      <h5>1. Niềng răng kim loại truyền thống</h5>
      <p>Đây là phương pháp niềng răng cổ điển và phổ biến nhất. Mắc cài kim loại được gắn lên răng và nối với nhau bằng dây thép.</p>
      
      <h5>2. Niềng răng sứ</h5>
      <p>Tương tự như niềng kim loại nhưng mắc cài làm từ sứ có màu giống răng, ít bị nhận ra hơn.</p>
      
      <h5>3. Niềng răng trong suốt (Invisalign)</h5>
      <p>Sử dụng khay niềng trong suốt có thể tháo rời, rất thẩm mỹ và thuận tiện.</p>
      
      <h4>Ai cần niềng răng?</h4>
      <ul>
        <li>Răng mọc lệch, không đều</li>
        <li>Răng thưa, có khoảng cách</li>
        <li>Răng chen chúc, chồng lên nhau</li>
        <li>Cắn sai (cắn ngược, cắn sâu, cắn hở)</li>
      </ul>
      
      <h4>Quy trình niềng răng</h4>
      <ol>
        <li><strong>Khám và tư vấn:</strong> Bác sĩ sẽ khám và đánh giá tình trạng răng miệng</li>
        <li><strong>Chụp X-quang:</strong> Để có cái nhìn tổng thể về cấu trúc răng và xương hàm</li>
        <li><strong>Lập kế hoạch điều trị:</strong> Bác sĩ sẽ đưa ra phương án niềng phù hợp</li>
        <li><strong>Gắn mắc cài:</strong> Thực hiện việc gắn mắc cài lên răng</li>
        <li><strong>Tái khám định kỳ:</strong> Thường 4-6 tuần/lần để điều chỉnh</li>
      </ol>
      
      <h4>Lưu ý trong quá trình niềng răng</h4>
      <ul>
        <li>Vệ sinh răng miệng cẩn thận hơn</li>
        <li>Tránh thức ăn cứng, dẻo</li>
        <li>Tuân thủ lịch tái khám</li>
        <li>Đeo retainer sau khi tháo niềng</li>
      </ul>
      
      <p><strong>Kết luận:</strong> Niềng răng không chỉ cải thiện thẩm mỹ mà còn giúp cải thiện chức năng nhai và sức khỏe răng miệng. Hãy tư vấn với bác sĩ chuyên khoa để có được phương án điều trị phù hợp nhất.</p>
    `,
    image: "/images/blog/blog-2.jpg",
    date: "2024-01-10",
    author: "BS. Trần Thị B",
    category: "Chỉnh nha",
    views: 987,
    featured: true
  },
  {
    id: 3,
    title: "Implant răng - Công nghệ trồng răng tiên tiến",
    summary: "Khám phá công nghệ implant răng hiện đại, quy trình thực hiện và những lưu ý quan trọng sau khi trồng răng.",
    content: `
      <h3>Implant răng là gì?</h3>
      <p>Implant răng là phương pháp trồng răng hiện đại, sử dụng trụ titan được cấy vào xương hàm để thay thế chân răng tự nhiên. Sau đó, bác sĩ sẽ gắn mão răng sứ lên trụ implant, tạo ra một chiếc răng hoàn chỉnh về cả chức năng và thẩm mỹ.</p>
      
      <h4>Ưu điểm của implant răng</h4>
      <ul>
        <li>Độ bền cao, có thể sử dụng suốt đời nếu chăm sóc tốt</li>
        <li>Không ảnh hưởng đến răng thật xung quanh</li>
        <li>Chức năng nhai tốt như răng thật</li>
        <li>Thẩm mỹ cao, không phân biệt được với răng thật</li>
        <li>Ngăn ngừa tiêu xương hàm</li>
      </ul>
      
      <h4>Quy trình thực hiện</h4>
      <ol>
        <li><strong>Khám và chẩn đoán:</strong> Đánh giá tình trạng xương hàm, chụp CT 3D</li>
        <li><strong>Cấy trụ implant:</strong> Phẫu thuật đặt trụ titan vào xương hàm</li>
        <li><strong>Thời gian lành xương:</strong> 3-6 tháng để xương hàm liền với trụ implant</li>
        <li><strong>Gắn mão răng:</strong> Làm và gắn mão răng sứ lên trụ implant</li>
      </ol>
      
      <h4>Chăm sóc sau implant</h4>
      <ul>
        <li>Vệ sinh răng miệng kỹ lưỡng</li>
        <li>Sử dụng chỉ nha khoa đặc biệt</li>
        <li>Tái khám định kỳ theo lịch hẹn</li>
        <li>Tránh cắn vật cứng</li>
      </ul>
      
      <p><strong>Lưu ý:</strong> Implant răng phù hợp với hầu hết mọi người, tuy nhiên cần có đủ xương hàm và sức khỏe tổng thể tốt. Hãy tham khảo ý kiến bác sĩ để có phương án điều trị phù hợp.</p>
    `,
    image: "/images/blog/blog-4.jpg",
    date: "2024-01-08",
    author: "BS. Lê Văn C",
    category: "Phẫu thuật",
    views: 756,
    featured: false
  },
  {
    id: 4,
    title: "Tẩy trắng răng an toàn và hiệu quả",
    summary: "Các phương pháp tẩy trắng răng an toàn, hiệu quả và cách duy trì răng trắng lâu dài.",
    content: `
      <h3>Tại sao răng bị ố vàng?</h3>
      <p>Răng có thể bị ố vàng do nhiều nguyên nhân khác nhau như tuổi tác, thói quen ăn uống (cà phê, trà, rượu vang), hút thuốc, hoặc do di truyền. Hiểu rõ nguyên nhân sẽ giúp chọn phương pháp tẩy trắng phù hợp.</p>
      
      <h4>Các phương pháp tẩy trắng răng</h4>
      <h5>1. Tẩy trắng răng tại phòng khám</h5>
      <p>Phương pháp nhanh chóng và hiệu quả nhất, sử dụng gel tẩy trắng nồng độ cao kết hợp với đèn chiếu đặc biệt.</p>
      
      <h5>2. Tẩy trắng răng tại nhà</h5>
      <p>Sử dụng khay tẩy trắng cá nhân hoặc miếng dán trắng răng theo chỉ định của bác sĩ.</p>
      
      <h5>3. Kem đánh răng tẩy trắng</h5>
      <p>Hiệu quả chậm nhưng an toàn cho việc duy trì độ trắng của răng.</p>
      
      <h4>Lưu ý khi tẩy trắng răng</h4>
      <ul>
        <li>Chỉ thực hiện khi răng khỏe mạnh</li>
        <li>Có thể gây ê buốt tạm thời</li>
        <li>Không hiệu quả với răng sứ, composite</li>
        <li>Cần duy trì bằng cách hạn chế thực phẩm gây ố vàng</li>
      </ul>
      
      <h4>Cách duy trì răng trắng</h4>
      <ul>
        <li>Vệ sinh răng miệng đúng cách</li>
        <li>Hạn chế cà phê, trà, rượu vang</li>
        <li>Bỏ thuốc lá</li>
        <li>Sử dụng ống hút khi uống đồ uống có màu</li>
        <li>Tái tẩy trắng định kỳ theo chỉ định</li>
      </ul>
    `,
    image: "/images/blog/blog-6.jpg",
    date: "2024-01-05",
    author: "BS. Phạm Thị D",
    category: "Thẩm mỹ răng",
    views: 654,
    featured: false
  },
  {
    id: 5,
    title: "Phòng ngừa sâu răng ở trẻ em",
    summary: "Hướng dẫn cha mẹ cách phòng ngừa sâu răng hiệu quả cho trẻ em và tầm quan trọng của việc khám răng định kỳ.",
    content: `
      <h3>Sâu răng ở trẻ em - Vấn đề đáng quan tâm</h3>
      <p>Sâu răng là một trong những bệnh phổ biến nhất ở trẻ em. Nếu không được phòng ngừa và điều trị kịp thời, sâu răng có thể gây đau đớn, ảnh hưởng đến việc ăn uống, nói chuyện và phát triển của trẻ.</p>
      
      <h4>Nguyên nhân gây sâu răng ở trẻ em</h4>
      <ul>
        <li>Vi khuẩn trong miệng tạo acid từ đường</li>
        <li>Thói quen ăn nhiều đồ ngọt</li>
        <li>Vệ sinh răng miệng kém</li>
        <li>Dùng bình sữa ban đêm</li>
        <li>Yếu tố di truyền</li>
      </ul>
      
      <h4>Cách phòng ngừa sâu răng</h4>
      <h5>1. Vệ sinh răng miệng đúng cách</h5>
      <ul>
        <li>Bắt đầu chăm sóc từ khi răng đầu tiên mọc</li>
        <li>Đánh răng 2 lần/ngày với kem đánh răng có fluoride</li>
        <li>Cha mẹ hỗ trợ đánh răng cho trẻ dưới 8 tuổi</li>
      </ul>
      
      <h5>2. Chế độ ăn uống lành mạnh</h5>
      <ul>
        <li>Hạn chế đồ ngọt, kẹo dẻo</li>
        <li>Tránh cho trẻ ngậm bình sữa khi ngủ</li>
        <li>Uống nước lọc thay vì nước ngọt</li>
        <li>Ăn nhiều rau xanh, trái cây tươi</li>
      </ul>
      
      <h5>3. Khám răng định kỳ</h5>
      <p>Nên đưa trẻ đi khám răng từ 6 tháng tuổi hoặc khi răng đầu tiên mọc, sau đó 6 tháng/lần.</p>
      
      <h5>4. Các biện pháp dự phòng</h5>
      <ul>
        <li>Bôi fluoride định kỳ</li>
        <li>Hàn rãnh (fissure sealant) cho răng hàm</li>
        <li>Sử dụng nước súc miệng (trẻ trên 6 tuổi)</li>
      </ul>
      
      <p><strong>Lưu ý:</strong> Răng sữa rất quan trọng cho sự phát triển của trẻ, không nên bỏ qua việc chăm sóc chỉ vì "sẽ thay răng vĩnh viễn".</p>
    `,
    image: "/images/blog/blog-7.jpg",
    date: "2024-01-03",
    author: "BS. Hoàng Văn E",
    category: "Nha khoa trẻ em",
    views: 543,
    featured: false
  },
  {
    id: 6,
    title: "Điều trị tủy răng - Khi nào cần thiết?",
    summary: "Tìm hiểu về quy trình điều trị tủy răng, dấu hiệu nhận biết và cách chăm sóc sau điều trị.",
    content: `
      <h3>Tủy răng là gì?</h3>
      <p>Tủy răng là phần mềm bên trong răng, chứa các dây thần kinh, mạch máu và mô liên kết. Khi tủy răng bị nhiễm trùng hoặc tổn thương nghiêm trọng, việc điều trị tủy răng trở nên cần thiết để cứu lấy răng.</p>
      
      <h4>Khi nào cần điều trị tủy răng?</h4>
      <ul>
        <li>Đau răng dữ dội, đặc biệt ban đêm</li>
        <li>Răng nhạy cảm kéo dài với nhiệt độ</li>
        <li>Răng đổi màu</li>
        <li>Sưng nướu quanh răng</li>
        <li>Răng bị vỡ hoặc nứt sâu</li>
        <li>Sâu răng lan sâu đến tủy</li>
      </ul>
      
      <h4>Quy trình điều trị tủy răng</h4>
      <ol>
        <li><strong>Chẩn đoán:</strong> Khám lâm sàng, chụp X-quang để đánh giá tình trạng</li>
        <li><strong>Gây tê:</strong> Gây tê cục bộ để đảm bảo không đau</li>
        <li><strong>Tạo lỗ tiếp cận:</strong> Khoan lỗ nhỏ để tiếp cận tủy răng</li>
        <li><strong>Loại bỏ tủy bị nhiễm trùng:</strong> Làm sạch hoàn toàn tủy răng</li>
        <li><strong>Vệ sinh và tạo hình ống tủy:</strong> Khử trùng và mở rộng ống tủy</li>
        <li><strong>Trám bít ống tủy:</strong> Trám kín ống tủy bằng vật liệu chuyên dụng</li>
        <li><strong>Phục hồi răng:</strong> Trám composite hoặc làm răng sứ</li>
      </ol>
      
      <h4>Chăm sóc sau điều trị</h4>
      <ul>
        <li>Tránh nhai cứng trong 24h đầu</li>
        <li>Uống thuốc giảm đau theo chỉ định</li>
        <li>Vệ sinh răng miệng nhẹ nhàng</li>
        <li>Tái khám đúng lịch hẹn</li>
        <li>Làm răng sứ để bảo vệ răng lâu dài</li>
      </ul>
      
      <h4>Tỷ lệ thành công</h4>
      <p>Điều trị tủy răng có tỷ lệ thành công rất cao (85-95%) khi được thực hiện bởi bác sĩ có kinh nghiệm. Răng sau điều trị tủy có thể sử dụng bình thường nhiều năm nếu được chăm sóc tốt.</p>
      
      <p><strong>Lưu ý:</strong> Không nên chần chừ khi có dấu hiệu đau răng. Điều trị sớm sẽ giúp bảo tồn răng tự nhiên hiệu quả nhất.</p>
    `,
    image: "/images/blog/blog-8.jpg",
    date: "2024-01-01",
    author: "BS. Ngô Thị F",
    category: "Điều trị răng",
    views: 432,
    featured: false
  }
];

const categories = [
  "Chăm sóc răng miệng",
  "Chỉnh nha",
  "Phẫu thuật",
  "Thẩm mỹ răng",
  "Nha khoa trẻ em",
  "Điều trị răng"
];

// Lấy danh sách tất cả bài viết
exports.getAll = (req, res) => {
  const { category, featured, limit, search } = req.query;

  let filteredPosts = [...blogPosts];

  // Filter by category
  if (category && category !== 'Tất cả') {
    filteredPosts = filteredPosts.filter(post => post.category === category);
  }

  // Filter by featured
  if (featured === 'true') {
    filteredPosts = filteredPosts.filter(post => post.featured);
  }

  // Search by title or summary
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.summary.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by date (newest first)
  filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Limit results
  if (limit) {
    filteredPosts = filteredPosts.slice(0, parseInt(limit));
  }

  res.json({
    success: true,
    data: filteredPosts,
    total: filteredPosts.length,
    categories: categories
  });
};

// Lấy chi tiết 1 bài viết
exports.getById = (req, res) => {
  const { id } = req.params;
  const post = blogPosts.find(p => p.id === parseInt(id));

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết'
    });
  }

  // Increment views (trong thực tế sẽ lưu vào database)
  post.views += 1;

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      image: p.image,
      date: p.date,
      category: p.category
    }));

  res.json({
    success: true,
    data: {
      ...post,
      relatedPosts
    }
  });
};

// Lấy danh sách categories
exports.getCategories = (req, res) => {
  const categoriesWithCount = categories.map(cat => ({
    name: cat,
    count: blogPosts.filter(post => post.category === cat).length
  }));

  res.json({
    success: true,
    data: categoriesWithCount
  });
};

// Lấy bài viết phổ biến (most viewed)
exports.getPopular = (req, res) => {
  const { limit = 5 } = req.query;

  const popularPosts = [...blogPosts]
    .sort((a, b) => b.views - a.views)
    .slice(0, parseInt(limit))
    .map(p => ({
      id: p.id,
      title: p.title,
      image: p.image,
      views: p.views,
      date: p.date
    }));

  res.json({
    success: true,
    data: popularPosts
  });
};

// Lấy bài viết gần đây
exports.getRecent = (req, res) => {
  const { limit = 5 } = req.query;

  const recentPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit))
    .map(p => ({
      id: p.id,
      title: p.title,
      image: p.image,
      date: p.date,
      category: p.category
    }));

  res.json({
    success: true,
    data: recentPosts
  });
};

// Lấy bài viết nổi bật cho homepage
exports.getFeatured = (req, res) => {
  const { limit = 3 } = req.query;

  const featuredPosts = blogPosts
    .filter(post => post.featured)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: featuredPosts
  });
};

// Search bài viết
exports.search = (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu từ khóa tìm kiếm'
    });
  }

  const searchTerm = q.toLowerCase();
  const results = blogPosts
    .filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.summary.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm) ||
      post.author.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: results,
    total: results.length,
    query: q
  });
}; 