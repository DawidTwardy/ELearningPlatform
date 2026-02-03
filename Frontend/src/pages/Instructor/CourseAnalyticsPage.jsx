import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseAnalytics } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../styles/components/CourseAnalyticsPage.css';

const CourseAnalyticsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getAnalytics = async () => {
            if (!courseId) {
                setError("Brak identyfikatora kursu w adresie URL.");
                setLoading(false);
                return;
            }

            try {
                const data = await fetchCourseAnalytics(courseId);
                setAnalytics(data);
            } catch (err) {
                setError(err.message || "Nie udało się załadować analityki kursu. Spróbuj ponownie później.");
                console.error("Error fetching course analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        getAnalytics();
    }, [courseId]);

    if (loading) {
        return <div className="analytics-container">Ładowanie analityki...</div>;
    }

    if (error) {
        return (
            <div className="analytics-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Powrót
                </button>
                <div className="error-message" style={{ marginTop: '20px', color: '#ff4d4d' }}>{error}</div>
            </div>
        );
    }

    if (!analytics) {
        return <div className="analytics-container">Brak danych analitycznych dla tego kursu.</div>;
    }

    return (
        <div className="analytics-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                Powrót
            </button>
            
            <h1 className="analytics-title">Statystyki Kursu: {analytics.courseTitle}</h1>

            <div className="analytics-summary-grid">
                <div className="summary-card">
                    <h3>Liczba Studentów</h3>
                    <p>{analytics.totalStudents}</p>
                </div>
                <div className="summary-card">
                    <h3>Średni Wynik Quizów</h3>
                    <p>{analytics.averageQuizScore}%</p>
                </div>
                <div className="summary-card">
                    <h3>Średnie Ukończenie</h3>
                    <p>{analytics.completionRate}%</p>
                </div>
            </div>

            <div className="analytics-chart-card">
                <h3>Wzrost Zapisów</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={analytics.enrollmentGrowth}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="date" stroke="#ccc" tick={{ fill: '#ccc' }} />
                        <YAxis allowDecimals={false} stroke="#ccc" tick={{ fill: '#ccc' }} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.1)' }} 
                            contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#eee' }} 
                            itemStyle={{ color: '#eee' }}
                        />
                        <Legend wrapperStyle={{ color: '#eee' }} />
                        <Bar dataKey="count" name="Nowi studenci" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="analytics-chart-card" style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Zgłoszenia od Użytkowników</h3>
                {analytics.reports && analytics.reports.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #555' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Data</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Treść zgłoszenia</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.reports.map((report) => (
                                    <tr key={report.id} style={{ borderBottom: '1px solid #444', backgroundColor: report.isRead ? 'transparent' : 'rgba(211, 47, 47, 0.1)' }}>
                                        <td style={{ padding: '10px' }}>
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '10px' }}>{report.message}</td>
                                        <td style={{ padding: '10px' }}>
                                            {report.isRead ? 
                                                <span style={{ color: '#aaa' }}>Przeczytane</span> : 
                                                <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>Nowe</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: '#aaa' }}>Brak zgłoszeń dla tego kursu.</p>
                )}
            </div>
        </div>
    );
};

export default CourseAnalyticsPage;