import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/pages/CourseDetailsPage.css';
import { fetchCourseDetails, enrollInCourse, fetchUserEnrollment, fetchCourseReviews, resolveImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CourseRatingForm from './CourseRatingForm';
import StarRating from '../../components/Course/StarRating';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const courseData = await fetchCourseDetails(id);
      setCourse(courseData);

      const reviewsData = await fetchCourseReviews(id);
      setReviews(reviewsData);

      if (user) {
          const status = await fetchUserEnrollment(id);
          setIsEnrolled(status.isEnrolled);
      }
    } catch (error) {
      console.error("Error loading course details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleEnroll = async () => {
      if (!user) {
          navigate('/login');
          return;
      }
      try {
          await enrollInCourse(id);
          setIsEnrolled(true);
          alert("Zapisano na kurs!");
      } catch (error) {
          alert("Błąd zapisu na kurs");
      }
  };

  const handleContinue = () => {
      navigate(`/course-view/${id}`);
  };

  const handleReviewAdded = () => {
      setShowReviewForm(false);
      loadData(); 
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (!course) return <div className="error">Kurs nie znaleziony</div>;

  return (
    <div className="course-details-page">
      <div className="course-hero">
          <div className="course-hero-content">
              <h1>{course.title}</h1>
              <p className="course-description-short">{course.description.substring(0, 150)}...</p>
              
              <div className="course-meta-large">
                  <div className="instructor-info-large">
                       {/* Awatar instruktora w sekcji Hero */}
                       <img 
                            src={resolveImageUrl(course.instructor?.avatarUrl) || '/src/icon/usericon.png'} 
                            alt="Instructor" 
                            className="instructor-avatar-medium"
                            onError={(e) => {e.target.onerror = null; e.target.src = '/src/icon/usericon.png'}}
                        />
                      <span>Instruktor: {course.instructorName}</span>
                  </div>
                  <div className="rating-large">
                      <StarRating rating={course.averageRating} />
                      <span>({course.reviewsCount} opinii)</span>
                  </div>
              </div>

              <div className="action-buttons">
                  {isEnrolled ? (
                      <button onClick={handleContinue} className="btn-primary-large">Kontynuuj naukę</button>
                  ) : (
                      <button onClick={handleEnroll} className="btn-primary-large">
                          {course.price > 0 ? `Kup za ${course.price} PLN` : "Zapisz się za darmo"}
                      </button>
                  )}
              </div>
          </div>
      </div>

      <div className="course-content-layout">
          <div className="main-column">
              <section className="description-section">
                  <h2>Opis kursu</h2>
                  <div dangerouslySetInnerHTML={{ __html: course.description }} />
              </section>

              <section className="curriculum-section">
                  <h2>Program kursu</h2>
                  <div className="curriculum-list">
                      {course.sections?.map(section => (
                          <div key={section.id} className="section-item-details">
                              <h3>{section.title}</h3>
                              <ul>
                                  {section.lessons?.map(lesson => (
                                      <li key={lesson.id}>{lesson.title}</li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>
              </section>
              
              <section className="reviews-section">
                  <div className="reviews-header">
                      <h2>Opinie studentów</h2>
                      {isEnrolled && !showReviewForm && (
                          <button onClick={() => setShowReviewForm(true)} className="add-review-btn">
                              Dodaj opinię
                          </button>
                      )}
                  </div>

                  {showReviewForm && (
                      <CourseRatingForm 
                          courseId={id} 
                          onReviewSubmit={handleReviewAdded} 
                          onCancel={() => setShowReviewForm(false)}
                      />
                  )}

                  <div className="reviews-list">
                      {reviews.length === 0 ? (
                          <p>Brak opinii dla tego kursu.</p>
                      ) : (
                          reviews.map(review => (
                              <div key={review.id} className="review-card">
                                  <div className="review-header">
                                      <div className="reviewer-info">
                                          {/* Awatar recenzenta */}
                                          <img 
                                            src={resolveImageUrl(review.avatarUrl) || '/src/icon/usericon.png'} 
                                            alt={review.userName} 
                                            className="reviewer-avatar"
                                            onError={(e) => {e.target.onerror = null; e.target.src = '/src/icon/usericon.png'}}
                                          />
                                          <span className="reviewer-name">{review.userName}</span>
                                      </div>
                                      <span className="review-date">{new Date(review.createdDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="review-rating">
                                      <StarRating rating={review.rating} />
                                  </div>
                                  <p className="review-text">{review.comment}</p>
                              </div>
                          ))
                      )}
                  </div>
              </section>
          </div>
          
          <div className="sidebar-column">
               <div className="course-features">
                   <h3>Ten kurs zawiera:</h3>
                   <ul>
                       <li>Poziom: {course.level}</li>
                       <li>Kategoria: {course.category}</li>
                       <li>Certyfikat ukończenia</li>
                   </ul>
               </div>
          </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;