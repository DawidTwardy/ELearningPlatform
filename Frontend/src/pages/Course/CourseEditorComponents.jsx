import React, { useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/pages/CourseEditPage.css';

export const getEmptyContentForType = (type) => {
  switch (type) {
    case 'video':
    case 'pdf':
      return { url: "", fileName: "" };
    case 'text':
      return { text: "" };
    default:
      return {};
  }
};

export const LessonContentInput = ({ lesson, onFileChange, onTextChange }) => {
  const content = lesson.content || {};
  const fileInputRef = useRef(null); 

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleFileSelected = (e) => {
      if (e.target.files.length > 0) {
          onFileChange(e.target.files[0]);
      }
      e.target.value = null; 
  };
  
  switch (lesson.type) {
    case 'video':
    case 'pdf':
      const fileLabel = lesson.type === 'video' ? 'Wybierz plik wideo (.mp4, .mov, .avi)' : 'Wybierz plik PDF';
      return (
        <div className="file-upload-wrapper">
          {content.fileName ? (
            <div className="file-name-display">
              Wybrany plik: <span>{content.fileName}</span>
            </div>
          ) : (
            <div className="file-name-display-empty">
              Nie wybrano pliku głównego.
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept={lesson.type === 'video' ? 'video/*' : 'application/pdf'}
            onChange={handleFileSelected} 
          />
          <button type="button" className="edit-btn-upload" onClick={triggerFileInput}>
            {fileLabel}
          </button>
        </div>
      );
    case 'text':
      return (
        <div className="text-editor-wrapper-quill">
          <ReactQuill 
            theme="snow" 
            value={content.text || ''} 
            onChange={(value) => onTextChange('text', value)}
          />
        </div>
      );
    default:
      return <div>Wybierz typ lekcji, aby edytować treść.</div>;
  }
};

export const LessonResourcesEditor = ({ resources, onAddResource, onRemoveResource }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
      if (e.target.files.length > 0) {
          onAddResource(e.target.files[0]);
      }
      e.target.value = null;
  };

  return (
    <div className="resources-editor">
      <h5>Materiały do pobrania (Załączniki):</h5>
      <ul className="resources-list">
        {(resources || []).map((res, idx) => (
          <li key={res.id || idx} className="resource-item">
            <a href={res.fileUrl || res.url} target="_blank" rel="noopener noreferrer">
               {res.name || res.fileName}
            </a>
            <button type="button" onClick={() => onRemoveResource(idx)} className="btn-remove-res">
              Usuń
            </button>
          </li>
        ))}
        {(!resources || resources.length === 0) && <li style={{color:'#666', fontSize:'0.9em', fontStyle:'italic'}}>Brak dodatkowych zasobów.</li>}
      </ul>
      <div className="add-resource-container">
         <input 
            type="file" 
            ref={fileInputRef} 
            style={{display: 'none'}} 
            onChange={handleFileChange} 
         />
         <button type="button" className="btn-add-res" onClick={() => fileInputRef.current.click()}>
            + Dodaj plik
         </button>
      </div>
    </div>
  );
};

export const OptionEditor = ({ option, questionType, onOptionChange, onCorrectChange, onDeleteOption }) => {
  return (
    <div className="option-item">
      <input 
        type={questionType === 'single' ? 'radio' : 'checkbox'}
        name={`correct-option-${option.questionId}`} 
        checked={option.isCorrect || false}
        onChange={(e) => onCorrectChange(e.target.checked)}
        className="option-checkbox"
      />
      <input 
        type="text"
        placeholder="Treść opcji"
        value={option.text || ''}
        onChange={(e) => onOptionChange('text', e.target.value)}
        className="edit-input-option"
      />
      <button 
        type="button" 
        className="edit-btn-delete-small" 
        onClick={onDeleteOption}
        title="Usuń opcję"
        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
      >
        ✕
      </button>
    </div>
  );
};

export const QuestionEditor = ({ question, onQuestionChange, onOptionChange, onAddOption, onCorrectOptionChange, onDeleteQuestion, onDeleteOption }) => {
  return (
    <div className="question-item">
      <div className="question-item-header">
        <input 
          type="text"
          placeholder="Wpisz treść pytania"
          value={question.text || ''}
          onChange={(e) => onQuestionChange('text', e.target.value)}
          className="edit-input-question"
        />
        <select
          value={question.type || 'single'}
          onChange={(e) => onQuestionChange('type', e.target.value)}
          className="edit-lesson-type"
        >
          <option value="single">Jednokrotny wybór</option>
          <option value="multiple">Wielokrotny wybór</option>
        </select>
        <button 
            type="button" 
            className="edit-btn-secondary" 
            onClick={onDeleteQuestion}
            style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#ff4444', color: 'white', borderColor: '#ff4444' }}
        >
            Usuń pytanie
        </button>
      </div>
      
      <div className="options-list">
        {question.options.map(option => (
          <OptionEditor 
            key={option.id}
            option={{...option, questionId: question.id}}
            questionType={question.type} 
            onOptionChange={(field, value) => onOptionChange(option.id, field, value)}
            onCorrectChange={(isChecked) => onCorrectOptionChange(option.id, isChecked)}
            onDeleteOption={() => onDeleteOption(option.id)}
          />
        ))}
      </div>
      
      <button type="button" className="edit-btn-add-option" onClick={onAddOption}>
        + Dodaj opcję
      </button>
    </div>
  );
};

export const QuizEditor = ({ quiz, onQuizChange }) => {
  const updateQuestion = (questionId, field, value) => {
    const newQuestions = quiz.questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    );
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  const updateOption = (questionId, optionId, field, value) => {
     const newQuestions = quiz.questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, [field]: value } : o
          )
        };
      }
      return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  const handleCorrectChange = (questionId, optionId, isChecked) => {
    const newQuestions = quiz.questions.map(q => {
      if (q.id === questionId) {
        let newOptions;
        if (q.type === 'single') {
          newOptions = q.options.map(o => ({ ...o, isCorrect: o.id === optionId }));
        } else {
          newOptions = q.options.map(o => 
            o.id === optionId ? { ...o, isCorrect: isChecked } : o
          );
        }
        return { ...q, options: newOptions };
      }
      return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      text: "Nowe pytanie",
      type: 'single',
      options: [
        { id: `o1-${Date.now()}`, text: "Opcja A", isCorrect: true },
        { id: `o2-${Date.now()}`, text: "Opcja B", isCorrect: false },
      ]
    };
    
    onQuizChange({ 
      ...(quiz || {}), 
      questions: [...(quiz?.questions || []), newQuestion] 
    });
  };

  const deleteQuestion = (questionId) => {
      if (window.confirm("Czy na pewno chcesz usunąć to pytanie?")) {
        const newQuestions = quiz.questions.filter(q => q.id !== questionId);
        onQuizChange({ ...quiz, questions: newQuestions });
      }
  };
  
  const addOption = (questionId) => {
     const newQuestions = quiz.questions.map(q => {
      if (q.id === questionId) {
        const newOption = {
          id: `o${Date.now()}`,
          text: `Nowa opcja ${q.options.length + 1}`,
          isCorrect: false
        };
        return { ...q, options: [...q.options, newOption] };
      }
      return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };

  const deleteOption = (questionId, optionId) => {
    const newQuestions = quiz.questions.map(q => {
        if (q.id === questionId) {
            return {
                ...q,
                options: q.options.filter(o => o.id !== optionId)
            };
        }
        return q;
    });
    onQuizChange({ ...quiz, questions: newQuestions });
  };
  
  return (
    <div className="quiz-editor-wrapper">
      {(quiz?.questions || []).map(q => ( 
        <QuestionEditor 
          key={q.id}
          question={q}
          onQuestionChange={(field, value) => updateQuestion(q.id, field, value)}
          onOptionChange={(optionId, field, value) => updateOption(q.id, optionId, field, value)}
          onAddOption={() => addOption(q.id)}
          onCorrectOptionChange={(optionId, isChecked) => handleCorrectChange(q.id, optionId, isChecked)}
          onDeleteQuestion={() => deleteQuestion(q.id)}
          onDeleteOption={(optionId) => deleteOption(q.id, optionId)}
        />
      ))}
      <button type="button" className="edit-btn-add-question" onClick={addQuestion}>
        + Dodaj pytanie
      </button>
    </div>
  );
};