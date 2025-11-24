import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { Save, FileText, FileDown, Edit3 } from 'lucide-react';
import { fetchUserNote, saveUserNote } from '../../services/api';
import '../../styles/pages/PersonalNotes.css';

const PersonalNotes = ({ lessonId }) => {
    const [noteContent, setNoteContent] = useState("");
    const [noteTitle, setNoteTitle] = useState("Moje Notatki"); 
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
            setNoteTitle(data.title || "Moje Notatki");
        } catch (error) {
            console.error("Failed to load note", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveUserNote(lessonId, noteContent, noteTitle);
            setLastSaved(new Date());
        } catch (error) {
            alert("Błąd zapisu notatki.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadTxt = () => {
        if (!noteContent) return;
        
        const element = document.createElement("a");
        const file = new Blob([`${noteTitle}\n\n${noteContent}`], {type: 'text/plain;charset=utf-8'});
        element.href = URL.createObjectURL(file);
        const safeFilename = noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        element.download = `${safeFilename}_lekcja_${lessonId}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDownloadPdf = () => {
        if (!noteContent) return;

        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(noteTitle, 10, 15);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Data pobrania: ${new Date().toLocaleString()}`, 10, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        
        const splitText = doc.splitTextToSize(noteContent, 190);
        doc.text(splitText, 10, 35);
        
        const safeFilename = noteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${safeFilename}_lekcja_${lessonId}.pdf`);
    };

    if (isLoading) return <div className="notes-wrapper">Ładowanie notatek...</div>;

    return (
        <div className="notes-wrapper">
            <div className="notes-header">
                <div className="notes-title-container">
                    <input 
                        type="text" 
                        className="notes-title-input"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Wpisz tytuł..."
                    />
                    <Edit3 size={14} className="edit-icon" />
                </div>

                <div className="notes-controls">
                    <button 
                        className="icon-btn" 
                        title="Pobierz jako TXT" 
                        onClick={handleDownloadTxt}
                        disabled={!noteContent}
                    >
                        <FileText size={18} />
                    </button>
                    <button 
                        className="icon-btn" 
                        title="Pobierz jako PDF" 
                        onClick={handleDownloadPdf}
                        disabled={!noteContent}
                    >
                        <FileDown size={18} />
                    </button>
                </div>
            </div>
            
            <div className="notes-status-bar">
                 {lastSaved ? `Zapisano: ${lastSaved.toLocaleTimeString()}` : "Gotowy do edycji"}
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
                    <Save size={18} />
                    {isSaving ? "Zapisywanie..." : "Zapisz"}
                </button>
            </div>
        </div>
    );
};

export default PersonalNotes;