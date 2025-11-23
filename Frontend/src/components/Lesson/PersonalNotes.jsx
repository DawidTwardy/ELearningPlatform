import React, { useState, useEffect } from 'react';
import { fetchUserNote, saveUserNote } from '../../services/api';
import '../../styles/pages/PersonalNotes.css';

const PersonalNotes = ({ lessonId }) => {
    const [noteContent, setNoteContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        if (lessonId) {
            loadNote();
        }
    }, [lessonId]);

    const loadNote = async () => {
        setIsLoading(true);
        try {
            const data = await fetchUserNote(lessonId);
            setNoteContent(data.content || "");
        } catch (error) {
            console.error("Failed to load note", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveUserNote(lessonId, noteContent);
            setLastSaved(new Date());
        } catch (error) {
            alert("Błąd zapisu notatki.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="notes-wrapper">Ładowanie notatek...</div>;

    return (
        <div className="notes-wrapper">
            <div className="notes-header">
                <h3>Moje Notatki</h3>
                <div className="notes-info">
                    {lastSaved ? `Zapisano: ${lastSaved.toLocaleTimeString()}` : "Zmiany niezapisane"}
                </div>
            </div>
            
            <textarea
                className="notes-textarea"
                placeholder="Zapisz tutaj swoje przemyślenia dotyczące tej lekcji..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
            />
            
            <div className="notes-actions">
                <button 
                    className="save-note-btn" 
                    onClick={handleSave} 
                    disabled={isSaving}
                >
                    {isSaving ? "Zapisywanie..." : "Zapisz notatkę"}
                </button>
            </div>
        </div>
    );
};

export default PersonalNotes;