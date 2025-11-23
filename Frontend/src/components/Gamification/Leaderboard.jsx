import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../../services/api';
import '../../styles/components/Gamification.css';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchLeaderboard();
                setUsers(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div>Ładowanie rankingu...</div>;

    return (
        <div className="leaderboard-container">
            <h3 className="section-title" style={{fontSize: '1.3em'}}>🏆 Ranking Top 10</h3>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Użytkownik</th>
                        <th>Streak</th>
                        <th style={{textAlign: 'right'}}>Punkty</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u, index) => (
                        <tr key={index}>
                            <td className="rank-cell">{index + 1}</td>
                            <td>{u.userName}</td>
                            <td>{u.currentStreak} 🔥</td>
                            <td className="points-cell">{u.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;