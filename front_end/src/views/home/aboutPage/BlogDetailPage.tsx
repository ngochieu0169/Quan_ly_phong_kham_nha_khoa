import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { requestAPI } from '../../../axiosconfig';

interface BlogPost {
    id: number;
    title: string;
    summary: string;
    content: string;
    image: string;
    date: string;
    author: string;
    category: string;
    views: number;
    featured: boolean;
    relatedPosts?: BlogPost[];
}

const BlogDetailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const postId = searchParams.get('id');

    const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (postId) {
            fetchBlogDetail();
        }
    }, [postId]);

    const fetchBlogDetail = async () => {
        try {
            setLoading(true);
            const response = await requestAPI.get(`/api/blog/${postId}`);

            if (response.data.success) {
                setCurrentPost(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải chi tiết blog:', error);
        } finally {
            setLoading(false);
        }
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

    if (!currentPost) {
        return (
            <div>
                <div className="container py-5">
                    <div className="text-center">
                        <h3>Không tìm thấy bài viết</h3>
                        <Link to="/blog" className="btn btn-primary mt-3">
                            Quay lại danh sách bài viết
                        </Link>
                    </div>
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
                    background: `linear-gradient(rgba(35, 58, 102, 0.9), rgba(35, 58, 102, 0.9)), url('${currentPost.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '100px 0'
                }}
            >
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="block text-center">
                                <span className="text-white font-weight-bold text-lg">{currentPost.category}</span>
                                <h1 className="text-capitalize mb-5 text-lg text-white">{currentPost.title}</h1>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb justify-content-center">
                                        <li className="breadcrumb-item"><Link to="/" className="text-white-50">Trang chủ</Link></li>
                                        <li className="breadcrumb-item"><Link to="/blog" className="text-white-50">Blog</Link></li>
                                        <li className="breadcrumb-item active text-white">Chi tiết</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Content */}
            <section className="section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-5">
                                    {/* Post Meta */}
                                    <div className="post-meta mb-4 pb-4 border-bottom">
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <div className="author-info">
                                                    <i className="icofont-user text-primary me-2"></i>
                                                    <span className="fw-bold">{currentPost.author}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 text-md-end">
                                                <div className="post-date">
                                                    <i className="icofont-calendar text-primary me-2"></i>
                                                    <span>{new Date(currentPost.date).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="badge bg-primary">{currentPost.category}</span>
                                        </div>
                                    </div>

                                    {/* Featured Image */}
                                    <div className="featured-image mb-4">
                                        <img
                                            src={currentPost.image}
                                            alt={currentPost.title}
                                            className="img-fluid rounded"
                                            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                                        />
                                    </div>

                                    {/* Post Content */}
                                    <div
                                        className="post-content"
                                        dangerouslySetInnerHTML={{ __html: currentPost.content }}
                                    />

                                    {/* Related Posts */}
                                    {currentPost.relatedPosts && currentPost.relatedPosts.length > 0 && (
                                        <div className="related-posts mt-5 pt-4 border-top">
                                            <h5 className="mb-4" style={{ color: '#223a66' }}>Bài viết liên quan</h5>
                                            <div className="row">
                                                {currentPost.relatedPosts.map((relatedPost) => (
                                                    <div key={relatedPost.id} className="col-md-4 mb-3">
                                                        <div className="card border-0 shadow-sm h-100">
                                                            <img
                                                                src={relatedPost.image}
                                                                alt={relatedPost.title}
                                                                className="card-img-top"
                                                                style={{ height: '150px', objectFit: 'cover' }}
                                                            />
                                                            <div className="card-body p-3">
                                                                <h6 className="card-title">
                                                                    <Link
                                                                        to={`/blog-detail?id=${relatedPost.id}`}
                                                                        className="text-decoration-none"
                                                                        style={{ color: '#223a66' }}
                                                                    >
                                                                        {relatedPost.title}
                                                                    </Link>
                                                                </h6>
                                                                <small className="text-muted">
                                                                    {new Date(relatedPost.date).toLocaleDateString('vi-VN')}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Share & Back */}
                                    <div className="post-footer mt-5 pt-4 border-top">
                                        <div className="row align-items-center">
                                            <div className="col-md-6">
                                                <Link to="/blog" className="btn btn-outline-primary">
                                                    <i className="icofont-arrow-left me-2"></i>
                                                    Quay lại danh sách
                                                </Link>
                                            </div>
                                            <div className="col-md-6 text-md-end">
                                                <Link to="/booking" className="btn btn-primary">
                                                    <i className="icofont-calendar me-2"></i>
                                                    Đặt lịch khám
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        .post-content h3 {
          color: #223a66;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .post-content h4 {
          color: #3490dc;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .post-content h5 {
          color: #6c757d;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .post-content p {
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        
        .post-content ul, .post-content ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }
        
        .post-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
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
        
        .breadcrumb {
          background: none;
          padding: 0;
        }
      `}</style>
        </div>
    );
};

export default BlogDetailPage; 