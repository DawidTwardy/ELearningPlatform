import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import '../../styles/components/CalendarConfigModal.css';

const DAYS = [
    { id: 'MO', label: 'Pon' },
    { id: 'TU', label: 'Wt' },
    { id: 'WE', label: 'Śr' },
    { id: 'TH', label: 'Czw' },
    { id: 'FR', label: 'Pt' },
    { id: 'SA', label: 'Sob' },
    { id: 'SU', label: 'Ndz' },
];

const CalendarConfigModal = ({ isOpen, onClose, onConfirm, courseTitle }) => {
    const [time, setTime] = useState('18:00');
    const [selectedDays, setSelectedDays] = useState(['MO', 'WE', 'FR']); // Domyślnie: Pon, Śr, Pt

    if (!isOpen) return null;

    const toggleDay = (dayId) => {
        setSelectedDays(prev => 
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const handleConfirm = () => {
        if (selectedDays.length === 0) {
            alert("Wybierz przynajmniej jeden dzień.");
            return;
        }
        onConfirm(time, selectedDays);
    };

    return (
        <div className="modal-overlay">
            <div className="calendar-modal">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className="modal-header">
                    <Calendar size={24} className="modal-icon" />
                    <h3>Zaplanuj naukę</h3>
                </div>
                <p className="modal-subtitle">Kiedy chcesz się uczyć kursu <strong>{courseTitle}</strong>?</p>

                <div className="form-group">
                    <label><Clock size={16}/> Godzina rozpoczęcia</label>
                    <input 
                        type="time" 
                        className="time-input"
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                    />
                </div>

                <div className="form-group">
                    <label>Dni tygodnia</label>
                    <div className="days-grid">
                        {DAYS.map(day => (
                            <button
                                key={day.id}
                                className={`day-btn ${selectedDays.includes(day.id) ? 'active' : ''}`}
                                onClick={() => toggleDay(day.id)}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="btn-confirm" onClick={handleConfirm}>
                    Pobierz Kalendarz (.ics)
                </button>
            </div>
        </div>
    );
};

export default CalendarConfigModal;