import React, { useState } from 'react';
import { verifyCertificate } from '../../services/api';
import '../../styles/pages/CertificateVerificationPage.css';

const CertificateVerificationPage = () => {
    const [certId, setCertId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!certId.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await verifyCertificate(certId.trim());
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Nie znaleziono certyfikatu o podanym ID lub wystąpił błąd.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-content verification-page">
            <div className="verification-container">
                <h2 className="page-title">Weryfikacja Certyfikatu</h2>
                <p className="verification-subtitle">Wprowadź unikalny identyfikator certyfikatu, aby potwierdzić jego autentyczność.</p>

                <form onSubmit={handleVerify} className="verification-form">
                    <input
                        type="text"
                        className="verification-input"
                        placeholder="Np. A1B2C3D4..."
                        value={certId}
                        onChange={(e) => setCertId(e.target.value)}
                    />
                    <button type="submit" className="verification-button" disabled={loading}>
                        {loading ? 'Sprawdzanie...' : 'Weryfikuj'}
                    </button>
                </form>

                {error && <div className="verification-error">{error}</div>}

                {result && result.isValid && (
                    <div className="verification-result success">
                        <h3>✅ Certyfikat jest autentyczny</h3>
                        <div className="result-details">
                            <div className="result-row">
                                <span className="result-label">Student:</span>
                                <span className="result-value">{result.studentName}</span>
                            </div>
                            <div className="result-row">
                                <span className="result-label">Kurs:</span>
                                <span className="result-value">{result.courseTitle}</span>
                            </div>
                            <div className="result-row">
                                <span className="result-label">Instruktor:</span>
                                <span className="result-value">{result.instructor}</span>
                            </div>
                            <div className="result-row">
                                <span className="result-label">Data ukończenia:</span>
                                <span className="result-value">{new Date(result.completionDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default CertificateVerificationPage;