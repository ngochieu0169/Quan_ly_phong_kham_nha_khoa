import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../../../axiosconfig';

interface BlogPost {
    id: number;
    title: string;
    summary: string;
    image: string;
    date: string;
    author: string;
    category: string;
    views: number;
    featured: boolean;
}

const BlogPage: React.FC = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogData();
    }, [selectedCategory]);

    const fetchBlogData = async () => {
        try {
            setLoading(true);
            console.log('Fetching blog data with category:', selectedCategory);

            const response = await requestAPI.get('/api/blog', {
                params: {
                    category: selectedCategory !== "Tất cả" ? selectedCategory : undefined
                }
            });

            console.log('Blog API response:', response.data);

            if (response.data.success) {
                setBlogPosts(response.data.data);
                console.log('Blog posts set:', response.data.data);

                // Always update categories when we get all data
                if (response.data.categories && response.data.categories.length > 0) {
                    const uniqueCategories = ["Tất cả", ...response.data.categories];
                    setCategories(uniqueCategories);
                    console.log('Categories set:', uniqueCategories);
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải blog:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter posts based on selected category
    const filteredPosts = selectedCategory === "Tất cả"
        ? blogPosts
        : blogPosts.filter(post => post.category === selectedCategory);

    console.log('Filtered posts:', filteredPosts.length, 'of', blogPosts.length);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh', paddingTop: '120px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section
                className="page-title bg-1"
                style={{
                    background: "linear-gradient(rgba(35, 58, 102, 0.9), rgba(35, 58, 102, 0.9)), url('/images/bg/bg-2.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '100px 0'
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="block text-center">
                                <span className="text-white font-weight-bold text-lg">Kiến thức nha khoa</span>
                                <h1 className="text-capitalize mb-5 text-lg text-white">Blog chăm sóc răng miệng</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="section">
                <div className="container">
                    {/* Category Filter */}
                    <div className="row mb-5">
                        <div className="col-lg-12">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h6 className="mb-3">Danh mục bài viết:</h6>
                                    <div className="btn-group flex-wrap" role="group">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                type="button"
                                                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog Posts Grid */}
                    <div className="row">
                        {filteredPosts.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <h4>Không có bài viết nào</h4>
                                <p>Hiện tại chưa có bài viết nào trong danh mục này.</p>
                                <p>Debug: Total posts: {blogPosts.length}, Selected: {selectedCategory}</p>
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                                    <div className="card blog-card h-100 shadow-sm border-0">
                                        <div className="blog-img">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="card-img-top"
                                                style={{ height: '250px', objectFit: 'cover' }}
                                            />
                                            <div className="blog-date">
                                                <span>{formatDate(post.date)}</span>
                                            </div>
                                        </div>

                                        <div className="card-body p-4">
                                            <div className="blog-meta mb-3">
                                                <span className="badge bg-primary me-2">{post.category}</span>
                                                <small className="text-muted">
                                                    <i className="icofont-user me-1"></i>
                                                    {post.author}
                                                </small>
                                            </div>

                                            <h5 className="card-title mb-3">
                                                <Link
                                                    to={`/blog-detail?id=${post.id}`}
                                                    className="text-decoration-none"
                                                    style={{ color: '#223a66' }}
                                                >
                                                    {post.title}
                                                </Link>
                                            </h5>

                                            <p className="card-text text-muted mb-4">{post.summary}</p>

                                            <Link
                                                to={`/blog-detail?id=${post.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Đọc thêm <i className="icofont-arrow-right ms-1"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* CTA Section */}
                    <div className="row mt-5">
                        <div className="col-lg-12">
                            <div className="card bg-primary text-white">
                                <div className="card-body text-center py-5">
                                    <h3 className="mb-3">Cần tư vấn thêm?</h3>
                                    <p className="mb-4">Đội ngũ bác sĩ chuyên khoa của chúng tôi luôn sẵn sàng tư vấn và giải đáp mọi thắc mắc của bạn.</p>
                                    <Link to="/booking" className="btn btn-light btn-lg">
                                        <i className="icofont-calendar me-2"></i>
                                        Đặt lịch khám ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .blog-card {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .blog-img {
          position: relative;
          overflow: hidden;
        }
        
        .blog-date {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(35, 58, 102, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .blog-img img {
          transition: transform 0.3s ease;
        }
        
        .blog-card:hover .blog-img img {
          transform: scale(1.05);
        }
        
        .page-title {
          position: relative;
        }
        
        .page-title::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(35, 58, 102, 0.9), rgba(52, 144, 220, 0.8));
        }
        
        .page-title .container {
          position: relative;
          z-index: 2;
        }
      `}</style>
        </div>
    );
};

export default BlogPage; 