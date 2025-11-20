import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseAnalytics } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../styles/pages/InstructorDashboard.css'; 

const CourseAnalyticsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchCourseAnalytics(courseId);
                setStats(data);
            } catch (err) {
                setError("Nie udało się pobrać statystyk.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [courseId]);

    if (loading) return <div className="loading-container">Ładowanie statystyk...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!stats) return <div className="error-container">Brak danych.</div>;

    return (
        <main className="main-content">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <button onClick={() => navigate(-1)} className="back-btn" style={{marginBottom: '10px', cursor:'pointer'}}>
                            &larr; Powrót
                        </button>
                        <h2 className="page-title">Statystyki Kursu: {stats.courseTitle}</h2>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Liczba Studentów</h3>
                        <p className="stat-value">{stats.totalStudents}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Średni Wynik Quizów</h3>
                        <p className="stat-value">{stats.averageQuizScore}%</p>
                    </div>
                    <div className="stat-card">
                        <h3>Średnie Ukończenie</h3>
                        <p className="stat-value">{stats.completionRate}%</p>
                    </div>
                </div>

                <div className="chart-section" style={{ marginTop: '40px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Przyrost Studentów (Dzienne zapisy)</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.enrollmentGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" name="Nowi studenci" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CourseAnalyticsPage;