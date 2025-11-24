import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import '../../styles/components/StudyPlanner.css';

const StudyPlanner = ({ totalLessons, completedLessons, enrollmentDate }) => {
  const [targetDate, setTargetDate] = useState('');
  const [plan, setPlan] = useState(null);

  // Ładujemy zapisany cel z localStorage, aby użytkownik nie musiał wpisywać go co wizytę
  useEffect(() => {
    const savedDate = localStorage.getItem(`studyTarget_${enrollmentDate}`);
    if (savedDate) {
      setTargetDate(savedDate);
      calculatePlan(savedDate);
    }
  }, [enrollmentDate]);

  const calculatePlan = (dateStr) => {
    if (!dateStr) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(dateStr);
    const start = new Date(enrollmentDate);
    
    // Obliczanie dni do końca
    const timeDiff = target - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Obliczanie dni od rozpoczęcia do celu (całkowity czas planu)
    const totalDuration = target - start;
    const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
    
    // Obliczanie dni, które upłynęły
    const daysElapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));

    const lessonsRemaining = totalLessons - completedLessons;

    // Logika tempa (Pace)
    let dailyGoal = 0;
    if (daysRemaining > 0) {
      dailyGoal = (lessonsRemaining / daysRemaining).toFixed(1);
    }

    // Logika statusu (Czy jesteś do przodu/do tyłu)
    let status = 'on-track';
    let difference = 0;

    if (totalDays > 0) {
      const expectedProgress = (daysElapsed / totalDays) * totalLessons;
      difference = Math.round(completedLessons - expectedProgress);
      
      if (difference > 1) status = 'ahead';
      if (difference < -1) status = 'behind';
    }

    setPlan({
      daysRemaining,
      dailyGoal,
      status,
      difference
    });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setTargetDate(newDate);
    localStorage.setItem(`studyTarget_${enrollmentDate}`, newDate);
    calculatePlan(newDate);
  };

  if (!enrollmentDate) return null;

  return (
    <div className="study-planner-card">
      <div className="planner-header">
        <Calendar size={20} />
        <h3>Planer Nauki</h3>
      </div>

      <div className="planner-input">
        <label>Chcę skończyć do:</label>
        <input 
          type="date" 
          value={targetDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={handleDateChange}
        />
      </div>

      {plan && (
        <div className="planner-results">
          {plan.daysRemaining <= 0 ? (
            <div className="planner-alert">
              Termin minął! Ustaw nową datę.
            </div>
          ) : plan.dailyGoal <= 0 ? (
             <div className="planner-success">
               Gratulacje! Kurs ukończony przed czasem.
             </div>
          ) : (
            <>
              <div className="planner-stat">
                <span className="stat-label">Twoje tempo:</span>
                <span className="stat-value">{plan.dailyGoal} lekcji / dzień</span>
              </div>

              <div className={`planner-status ${plan.status}`}>
                {plan.status === 'ahead' && (
                  <>
                    <TrendingUp size={16} />
                    <span>Jesteś {plan.difference} lekcji do przodu! 🔥</span>
                  </>
                )}
                {plan.status === 'behind' && (
                  <>
                    <AlertCircle size={16} />
                    <span>Musisz nadrobić {Math.abs(plan.difference)} lekcji.</span>
                  </>
                )}
                {plan.status === 'on-track' && (
                  <>
                    <CheckCircle size={16} />
                    <span>Idziesz zgodnie z planem.</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;