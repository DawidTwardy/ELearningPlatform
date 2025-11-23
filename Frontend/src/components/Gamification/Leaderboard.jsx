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

    if (loading) return <div style={{textAlign: 'center', padding: '20px'}}>Ładowanie rankingu...</div>;

    return (
        <div className="leaderboard-container">
            <h3 className="section-title" style={{fontSize: '1.3em'}}>🏆 Ranking Liderów</h3>
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Użytkownik</th>
                        <th>Streak</th>
                        <th className="points-header">Punkty</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u, index) => {
                        // Sprawdź, czy dodać separator (jeśli to ostatni element i jest duża różnica w rankingu)
                        const showSeparator = index === users.length - 1 && index > 0 && (u.rank - users[index - 1].rank > 1);

                        return (
                            <React.Fragment key={index}>
                                {showSeparator && (
                                    <tr className="separator-row">
                                        <td colSpan="4" style={{textAlign: 'center', color: '#555'}}>...</td>
                                    </tr>
                                )}
                                <tr className={u.isCurrentUser ? 'highlight-row' : ''}>
                                    <td className="rank-cell">{u.rank}</td>
                                    <td>
                                        {u.userName} 
                                        {u.isCurrentUser && <span style={{marginLeft: '8px', fontSize: '0.8em', color: '#aaa'}}>(Ty)</span>}
                                    </td>
                                    <td>{u.currentStreak} 🔥</td>
                                    <td className="points-cell">{u.points}</td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;