import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
    fetchCourseDetails, 
    updateCourse, 
    uploadFileWithProgress,
    resolveImageUrl 
} from '../../services/api';
import '../../styles/pages/CourseEditPage.css';
import { 
  getEmptyContentForType, 
  LessonContentInput,
  QuizEditor,
  LessonResourcesEditor 
} from './CourseEditorComponents';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

const deepParseCourseContent = (course) => {
    if (!course || !course.sections) return course;

    const parsedSections = course.sections.map(section => {
        if (section.lessons) {
            section.lessons = section.lessons.map(lesson => {
                let parsedContent = lesson.content;
                try {
                    if (typeof lesson.content === 'string' && lesson.content.trim().startsWith('{')) {
                        parsedContent = JSON.parse(lesson.content);
                    }
                } catch (e) {
                    console.warn(e);
                }

                let inferredType = 'video';
                if (parsedContent) {
                    if (parsedContent.text !== undefined && parsedContent.text !== "") {
                        inferredType = 'text';
                    } else if (parsedContent.url !== undefined) {
                        if (parsedContent.fileName && parsedContent.fileName.toLowerCase().endsWith('.pdf')) {
                            inferredType = 'pdf';
                        } else {
                            inferredType = 'video';
                        }
                    }
                }

                return { 
                    ...lesson, 
                    content: parsedContent || {}, 
                    type: lesson.type || inferredType,
                    resources: lesson.resources || lesson.Resources || [] 
                };
            });
        }
        
        if (section.quiz && section.quiz.questions) {
             section.quiz.questions = section.quiz.questions.map(q => ({
                 ...q,
                 type: q.type || q.questionType || q.QuestionType || 'single'
             }));
        }

        return section;
    });

    return { ...course, sections: parsedSections };
};

const CourseEditPage = ({ course: propCourse, onBack }) => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState({
        title: '',
        description: '',
        category: '',
        price: 0,
        level: 'Beginner',
        language: 'Polish',
        imageUrl: '',
        sections: []
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadTimeLeft, setUploadTimeLeft] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [expandedSections, setExpandedSections] = useState({});
    const [openItems, setOpenItems] = useState({});

    const uploadStartTimeRef = useRef(null);

    const courseId = paramId || (propCourse && propCourse.id);

    useEffect(() => {
        const loadCourse = async () => {
            if (!courseId || courseId === 'undefined') {
                setLoading(false);
                return;
            }

            try {
                const data = await fetchCourseDetails(courseId);
                const parsedData = deepParseCourseContent(data);
                setCourse({
                    ...parsedData,
                    sections: parsedData.sections || []
                });
            } catch (error) {
                console.error(error);
                alert("Nie udało się pobrać danych kursu.");
            } finally {
                setLoading(false);
            }
        };
        loadCourse();
    }, [courseId]);

    const formatTime = (seconds) => {
        if (!seconds || !isFinite(seconds)) return "Obliczanie...";
        if (seconds < 60) return `${Math.round(seconds)} sek`;
        const minutes = Math.floor(seconds / 60);
        const remSec = Math.round(seconds % 60);
        return `${minutes} min ${remSec} sek`;
    };

    const handleFileUpload = async (file, field, sectionIndex = null, lessonIndex = null, isResource = false) => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadTimeLeft(null);
        uploadStartTimeRef.current = Date.now();

        try {
            const result = await uploadFileWithProgress(file, (percent, loaded, total) => {
                setUploadProgress(percent);
                const currentTime = Date.now();
                const timeElapsed = (currentTime - uploadStartTimeRef.current) / 1000;
                if (timeElapsed > 0 && loaded > 0) {
                    const uploadSpeed = loaded / timeElapsed;
                    const remainingBytes = total - loaded;
                    const secondsLeft = remainingBytes / uploadSpeed;
                    setUploadTimeLeft(secondsLeft);
                }
            });

            if (result && result.url) {
                if (sectionIndex !== null && lessonIndex !== null) {
                    const updatedSections = [...course.sections];
                    if (isResource) {
                         const lesson = updatedSections[sectionIndex].lessons[lessonIndex];
                         if (!lesson.resources) lesson.resources = [];
                         lesson.resources.push({ name: file.name, fileUrl: result.url });
                    } else {
                        const lesson = updatedSections[sectionIndex].lessons[lessonIndex];
                        lesson.content = { url: result.url, fileName: file.name, text: '' };
                        lesson.videoUrl = result.url;
                    }
                    setCourse(prev => ({ ...prev, sections: updatedSections }));
                } else if (field === 'imageUrl') {
                    setCourse(prev => ({ ...prev, imageUrl: result.url }));
                }
            }
        } catch (error) {
            console.error(error);
            alert("Błąd podczas przesyłania pliku.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadTimeLeft(null);
        }
    };

    const toggleItem = (id) => {
        setOpenItems(prev => ({
          ...prev,
          [id]: !prev[id]
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const prepareSectionsForBackend = (secs) => {
                return secs.map((section, index) => {
                    const lessons = (section.lessons || []).map(lesson => {
                        let contentStr = "";
                        if (typeof lesson.content === 'object' && lesson.content !== null) {
                            contentStr = JSON.stringify(lesson.content);
                        } else {
                            contentStr = lesson.content || "";
                        }
                        
                        const resources = (lesson.resources || []).filter(r => r.fileUrl || r.url).map(r => ({
                            Id: r.id && typeof r.id === 'number' && r.id < 2000000000 ? r.id : 0,
                            Name: r.name || r.fileName,
                            FileUrl: r.fileUrl || r.url
                        }));

                        return {
                            Id: lesson.id && typeof lesson.id === 'number' && lesson.id < 2000000000 ? lesson.id : 0,
                            Title: lesson.title,
                            Content: contentStr,
                            VideoUrl: lesson.videoUrl || "",
                            SectionId: section.id && typeof section.id === 'number' && section.id < 2000000000 ? section.id : 0,
                            Resources: resources
                        };
                    });

                    let quiz = null;
                    if(section.quiz) {
                        quiz = {
                            Id: section.quiz.id && typeof section.quiz.id === 'number' && section.quiz.id < 2000000000 ? section.quiz.id : 0,
                            Title: section.quiz.title,
                            Questions: (section.quiz.questions || []).map(q => ({
                                Id: q.id && typeof q.id === 'number' && q.id < 2000000000 ? q.id : 0,
                                Text: q.text,
                                QuestionType: q.type,
                                Options: (q.options || []).map(o => ({
                                    Id: o.id && typeof o.id === 'number' && o.id < 2000000000 ? o.id : 0,
                                    Text: o.text,
                                    IsCorrect: o.isCorrect
                                }))
                            }))
                        };
                    }

                    return {
                        Id: section.id && typeof section.id === 'number' && section.id < 2000000000 ? section.id : 0,
                        Title: section.title,
                        Order: index + 1,
                        Lessons: lessons,
                        Quiz: quiz
                    };
                });
            };

            const courseDataToSend = {
                Id: course.id,
                Title: course.title,
                Description: course.description,
                Category: course.category,
                Price: course.price,
                Level: course.level,
                Language: course.language,
                ImageUrl: course.imageUrl,
                Sections: prepareSectionsForBackend(course.sections)
            };

            await updateCourse(courseId, courseDataToSend);
            
            alert("Kurs zaktualizowany pomyślnie!");
            if (onBack) onBack();
            else navigate('/instructor/courses');
        } catch (error) {
            console.error(error);
            alert("Nie udało się zaktualizować kursu: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const updateSectionField = (sectionId, field, value) => {
        setCourse(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
        }));
    };

    const updateLessonField = (sectionId, lessonId, field, value) => {
        setCourse(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        lessons: s.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l)
                    };
                }
                return s;
            })
        }));
    };

    const handleLessonTypeChange = (sectionId, lessonId, newType) => {
        setCourse(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        lessons: s.lessons.map(l => l.id === lessonId ? { ...l, type: newType, content: getEmptyContentForType(newType) } : l)
                    };
                }
                return s;
            })
        }));
    };

    const handleLessonTextChange = (sectionId, lessonId, contentField, value) => {
        setCourse(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id === sectionId) {
                    return {
                        ...s,
                        lessons: s.lessons.map(l => l.id === lessonId ? { ...l, content: { ...l.content, [contentField]: value } } : l)
                    };
                }
                return s;
            })
        }));
    };

    const handleAddResource = (sectionId, lessonId, file) => {
        handleFileUpload(file, 'resource', 
            course.sections.findIndex(s => s.id === sectionId), 
            course.sections.find(s => s.id === sectionId).lessons.findIndex(l => l.id === lessonId), 
            true
        );
    };

    const handleRemoveResource = (sectionId, lessonId, resIndex) => {
        setCourse(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if(s.id === sectionId) {
                    return {
                        ...s,
                        lessons: s.lessons.map(l => {
                            if(l.id === lessonId) {
                                const newRes = [...(l.resources || [])];
                                newRes.splice(resIndex, 1);
                                return { ...l, resources: newRes };
                            }
                            return l;
                        })
                    };
                }
                return s;
            })
        }));
    };

    const addSection = () => {
        setCourse(prev => ({
            ...prev,
            sections: [...prev.sections, { id: Date.now(), title: "Nowa Sekcja", lessons: [], quiz: { questions: [] } }]
        }));
    };

    const deleteSection = (sectionId) => {
        if(confirm("Usunąć sekcję?")) {
            setCourse(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }));
        }
    };

    const addLesson = (sectionId) => {
        setCourse(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if(s.id === sectionId) {
                    return {
                        ...s,
                        lessons: [...s.lessons, { id: Date.now(), title: "Nowa Lekcja", type: 'video', content: {}, resources: [] }]
                    };
                }
                return s;
            })
        }));
    };

    const deleteLesson = (sectionId, lessonId) => {
        if(confirm("Usunąć lekcję?")) {
            setCourse(prev => ({
                ...prev,
                sections: prev.sections.map(s => {
                    if(s.id === sectionId) {
                        return { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) };
                    }
                    return s;
                })
            }));
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, type } = result;
        if (!destination) return;

        const newSections = [...course.sections];

        if (type === 'section') {
            const [removed] = newSections.splice(source.index, 1);
            newSections.splice(destination.index, 0, removed);
        } else if (type === 'lesson') {
            const sourceSecIdx = newSections.findIndex(s => `lessons-${s.id}` === source.droppableId);
            const destSecIdx = newSections.findIndex(s => `lessons-${s.id}` === destination.droppableId);
            
            if (sourceSecIdx === -1 || destSecIdx === -1) return;

            const sourceLessons = [...newSections[sourceSecIdx].lessons];
            const [removed] = sourceLessons.splice(source.index, 1);

            if (sourceSecIdx === destSecIdx) {
                sourceLessons.splice(destination.index, 0, removed);
                newSections[sourceSecIdx] = { ...newSections[sourceSecIdx], lessons: sourceLessons };
            } else {
                const destLessons = [...newSections[destSecIdx].lessons];
                destLessons.splice(destination.index, 0, removed);
                newSections[sourceSecIdx] = { ...newSections[sourceSecIdx], lessons: sourceLessons };
                newSections[destSecIdx] = { ...newSections[destSecIdx], lessons: destLessons };
            }
        }
        setCourse(prev => ({ ...prev, sections: newSections }));
    };

    if (loading && courseId) return <div className="loading">Ładowanie...</div>;
    if (!courseId) return <div className="error-message">Błąd: Brak ID kursu do edycji.</div>;

    return (
        <div className="edit-course-container">
            {isUploading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff'
                }}>
                    <h3>Trwa przesyłanie pliku...</h3>
                    <div style={{ width: '60%', height: '10px', backgroundColor: '#333', borderRadius: '5px', marginTop: '15px' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#4CAF50', borderRadius: '5px', transition: 'width 0.2s' }}></div>
                    </div>
                    <p style={{ marginTop: '10px' }}>Postęp: {Math.round(uploadProgress)}%</p>
                    {uploadTimeLeft !== null && <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Pozostały czas: {formatTime(uploadTimeLeft)}</p>}
                </div>
            )}

            <div className="edit-header">
                <h2 className="page-title">Edytuj Kurs</h2>
                <div className="edit-actions">
                    <button className="edit-btn-secondary" onClick={() => onBack ? onBack() : navigate('/instructor/courses')}>Anuluj</button>
                    <button className="edit-btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="edit-form">
                <div className="edit-form-group">
                    <label>Tytuł Kursu</label>
                    <input type="text" className="edit-input" value={course.title} onChange={(e) => setCourse({...course, title: e.target.value})} required />
                </div>

                <div className="edit-form-group text-editor-wrapper-quill">
                    <label>Opis</label>
                    <ReactQuill theme="snow" value={course.description} onChange={(val) => setCourse({...course, description: val})} />
                </div>

                <div className="edit-form-group">
                    <label>Zdjęcie Okładkowe</label>
                    <div className="file-upload-wrapper">
                        <div className={course.imageUrl ? "file-name-display" : "file-name-display-empty"}>
                            {course.imageUrl ? <span>{course.imageUrl.split('/').pop()}</span> : "Brak wybranego pliku..."}
                        </div>
                        <input type="file" id="cover-upload" hidden accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0], 'imageUrl')} />
                        <button type="button" className="edit-btn-upload" onClick={() => document.getElementById('cover-upload').click()}>
                            Wybierz Plik
                        </button>
                    </div>
                    {course.imageUrl && <img src={resolveImageUrl(course.imageUrl)} alt="Podgląd" style={{ maxWidth: '200px', marginTop: '15px', borderRadius: '8px' }} />}
                </div>

                <hr className="edit-divider" />

                <h3>Sekcje i Lekcje</h3>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="all-sections" type="section">
                        {(provided) => (
                            <div className="sections-list" ref={provided.innerRef} {...provided.droppableProps}>
                                {course.sections.map((section, index) => {
                                    const lessonsId = `lessons-${section.id}`;
                                    const quizId = `quiz-${section.id}`;
                                    return (
                                        <Draggable key={section.id} draggableId={`section-${section.id}`} index={index}>
                                            {(provided) => (
                                                <div className="section-item" ref={provided.innerRef} {...provided.draggableProps} style={{...provided.draggableProps.style, marginBottom: '20px'}}>
                                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                                        <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#aaa' }}><GripVertical size={24} /></div>
                                                        <input type="text" className="edit-input-section" value={section.title} onChange={(e) => updateSectionField(section.id, 'title', e.target.value)} style={{ flex: 1 }} />
                                                        <button type="button" className="edit-btn-secondary" style={{backgroundColor:'#ff4444'}} onClick={() => deleteSection(section.id)}>Usuń Sekcję</button>
                                                    </div>

                                                    <h4 className={`collapsible-header ${openItems[lessonsId] ? 'open' : ''}`} onClick={() => toggleItem(lessonsId)}>
                                                        Lekcje ({section.lessons.length})
                                                    </h4>

                                                    {openItems[lessonsId] && (
                                                        <Droppable droppableId={lessonsId} type="lesson">
                                                            {(provided) => (
                                                                <div className="lessons-list" ref={provided.innerRef} {...provided.droppableProps} style={{minHeight:'10px'}}>
                                                                    {section.lessons.map((lesson, lIndex) => (
                                                                        <Draggable key={lesson.id} draggableId={`lesson-${lesson.id}`} index={lIndex}>
                                                                            {(provided) => (
                                                                                <div className="lesson-item" ref={provided.innerRef} {...provided.draggableProps} style={{...provided.draggableProps.style, marginBottom:'15px'}}>
                                                                                    <div className="lesson-item-header">
                                                                                        <div {...provided.dragHandleProps} style={{cursor:'grab', color:'#aaa'}}><GripVertical size={20} /></div>
                                                                                        <input type="text" className="edit-input-lesson" value={lesson.title} onChange={(e) => updateLessonField(section.id, lesson.id, 'title', e.target.value)} />
                                                                                        <select className="edit-lesson-type" value={lesson.type} onChange={(e) => handleLessonTypeChange(section.id, lesson.id, e.target.value)}>
                                                                                            <option value="video">Wideo</option>
                                                                                            <option value="pdf">PDF</option>
                                                                                            <option value="text">Tekst</option>
                                                                                        </select>
                                                                                        <button type="button" className="edit-btn-secondary" style={{backgroundColor:'#ff4444', padding:'5px 10px'}} onClick={() => deleteLesson(section.id, lesson.id)}>Usuń</button>
                                                                                    </div>
                                                                                    
                                                                                    <LessonContentInput 
                                                                                        lesson={lesson}
                                                                                        onTextChange={(field, value) => handleLessonTextChange(section.id, lesson.id, field, value)}
                                                                                        onFileChange={(file) => handleFileUpload(file, 'content', course.sections.indexOf(section), lIndex)}
                                                                                    />

                                                                                    <LessonResourcesEditor 
                                                                                        resources={lesson.resources}
                                                                                        onAddResource={(file) => handleAddResource(section.id, lesson.id, file)}
                                                                                        onRemoveResource={(resIdx) => handleRemoveResource(section.id, lesson.id, resIdx)}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                    <button type="button" className="edit-btn-add-lesson" onClick={() => addLesson(section.id)}>+ Dodaj lekcję</button>
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    )}

                                                    <h4 className={`collapsible-header ${openItems[quizId] ? 'open' : ''}`} onClick={() => toggleItem(quizId)}>
                                                        Test podsumowujący ({section.quiz?.questions?.length || 0} pytań)
                                                    </h4>
                                                    
                                                    {openItems[quizId] && (
                                                        <QuizEditor 
                                                            quiz={section.quiz}
                                                            onQuizChange={(newQuiz) => updateSectionField(section.id, 'quiz', newQuiz)}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <button type="button" className="edit-btn-add-section" onClick={addSection}>+ Dodaj Nową Sekcję</button>
            </form>
        </div>
    );
};

export default CourseEditPage;