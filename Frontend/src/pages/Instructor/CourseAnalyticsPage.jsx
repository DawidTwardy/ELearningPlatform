import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseAnalytics, deleteAnalyticsReport } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../styles/components/CourseAnalyticsPage.css';

const CourseAnalyticsPage = () => {
    const { id } = useParams();
    const courseId = id;
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getAnalytics = async () => {
            setLoading(true);
            try {
                if (!courseId) {
                    throw new Error("Brak identyfikatora kursu.");
                }
                const data = await fetchCourseAnalytics(courseId);
                setAnalytics(data);
                setError(null);
            } catch (err) {
                setError("Nie udało się załadować analityki kursu. Spróbuj ponownie później.");
                console.error("Error fetching course analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        getAnalytics();
    }, [courseId]);

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm("Czy na pewno chcesz usunąć to zgłoszenie?")) return;

        try {
            await deleteAnalyticsReport(reportId);
            // Aktualizujemy stan lokalnie, usuwając zgłoszenie z listy
            setAnalytics(prev => ({
                ...prev,
                reports: prev.reports.filter(r => r.id !== reportId)
            }));
        } catch (err) {
            alert("Nie udało się usunąć zgłoszenia.");
            console.error(err);
        }
    };

    if (loading) {
        return <div className="analytics-container">Ładowanie analityki...</div>;
    }

    if (error) {
        return (
            <div className="analytics-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Powrót
                </button>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="analytics-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Powrót
                </button>
                <div>Brak danych analitycznych dla tego kursu.</div>
            </div>
        );
    }

    const enrollmentData = Array.isArray(analytics.enrollmentGrowth) ? analytics.enrollmentGrowth : [];
    const reportData = Array.isArray(analytics.reports) ? analytics.reports : [];

    return (
        <div className="analytics-container">
            <button className="back-button" onClick={() => navigate(-1)}>
                Powrót
            </button>
            
            <h1 className="analytics-title">Statystyki Kursu: {analytics.courseTitle || 'Ładowanie...'}</h1>

            <div className="analytics-summary-grid">
                <div className="summary-card">
                    <h3>Liczba Studentów</h3>
                    <p>{analytics.totalStudents ?? 0}</p>
                </div>
                <div className="summary-card">
                    <h3>Średni Wynik Quizów</h3>
                    <p>{analytics.averageQuizScore ?? 0}%</p>
                </div>
                <div className="summary-card">
                    <h3>Średnie Ukończenie</h3>
                    <p>{analytics.completionRate ?? 0}%</p>
                </div>
            </div>

            <div className="analytics-chart-card">
                <h3>Wzrost Zapisów</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={enrollmentData}
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
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>Zgłoszenia treści (od Użytkowników)</h3>
                {reportData.length > 0 ? (
                    <div className="reports-table-container">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Treść zgłoszenia</th>
                                    <th>Status</th>
                                    <th>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((report) => (
                                    <tr key={report.id} className={report.isRead ? 'report-read' : 'report-unread'}>
                                        <td>
                                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''} {report.createdAt ? new Date(report.createdAt).toLocaleTimeString() : ''}
                                        </td>
                                        <td>{report.message}</td>
                                        <td>
                                            {report.isRead ? 
                                                <span className="status-read">Przeczytane</span> : 
                                                <span className="status-new">Nowe</span>
                                            }
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleDeleteReport(report.id)}
                                                style={{
                                                    backgroundColor: '#d32f2f',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Usuń
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: '#aaa', textAlign: 'center' }}>Brak zgłoszeń treści dla tego kursu.</p>
                )}
            </div>
        </div>
    );
};

export default CourseAnalyticsPage;