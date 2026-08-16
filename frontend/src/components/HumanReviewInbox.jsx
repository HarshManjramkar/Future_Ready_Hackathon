import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  User, 
  Phone, 
  CreditCard,
  ArrowRight
} from 'lucide-react';

export default function HumanReviewInbox({ onVerificationComplete }) {
  const [unreviewed, setUnreviewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);
  const [formEdits, setFormEdits] = useState({});

  useEffect(() => {
    fetchUnreviewed();
  }, []);

  const fetchUnreviewed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/document/unreviewed');
      const data = await res.json();
      setUnreviewed(data.documents || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFieldChange = (docKey, valueStr) => {
    setFormEdits(prev => ({
      ...prev,
      [docKey]: valueStr
    }));
  };

  const handleApprove = async (idx) => {
    const doc = unreviewed[idx];
    const docKey = doc.id || doc.student_info?.aadhaar_number || doc.student_info?.full_name || `doc-${idx}`;
    let verifiedData = { ...doc };
    delete verifiedData.image_data; // Don't send the heavy image back

    if (formEdits[docKey]) {
      try {
        verifiedData = JSON.parse(formEdits[docKey]);
      } catch (e) {
        alert("Invalid JSON format in the editor. Please fix syntax errors before verifying.");
        return;
      }
    }

    try {
      const res = await fetch('/api/document/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: idx,
          verified_data: verifiedData
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        const updated = [...unreviewed];
        updated.splice(idx, 1);
        setUnreviewed(updated);
        setApprovedCount(prev => prev + 1);
        if (onVerificationComplete) onVerificationComplete();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
              Edge-Case Verification
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Human-in-the-Loop Safety</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Human Review Inbox
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            When Gemini Vision detects smudged or uncertain handwriting (confidence &lt; 80%), it routes the form here for 1-click administrative verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 app-subcard rounded-xl text-xs font-mono">
            Approved Today: <strong className="text-emerald-500 font-bold">{approvedCount}</strong>
          </div>
        </div>
      </div>

      {/* Inbox List */}
      {unreviewed.length > 0 ? (
        <div className="space-y-6">
          {unreviewed.map((doc, idx) => {
            const docKey = doc.id || doc.student_info?.aadhaar_number || doc.student_info?.full_name || `doc-${idx}`;
            // Extract image_data so it doesn't clutter the JSON editor
            const { image_data, ...docWithoutImage } = doc;
            const currentJsonStr = formEdits[docKey] !== undefined ? formEdits[docKey] : JSON.stringify(docWithoutImage, null, 2);

            return (
              <div key={docKey} className="glass-panel p-6 rounded-2xl border-2 border-amber-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--panel-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {doc.student_info?.full_name || 'Smudged Student Form'}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Applying for: {doc.student_info?.class_applying_for || 'Grade 10'} • Flag Reason: Low OCR Confidence on Mobile & Aadhaar
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApprove(idx)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Commit to Roster</span>
                  </button>
                </div>

                {/* Side-by-side Image and Editor */}
                <div className="flex flex-col md:flex-row gap-6 mt-4">
                  {/* Left: Image Thumbnail */}
                  {image_data && (
                    <div className="w-full md:w-1/3 flex flex-col gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Original Document</span>
                      <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50 p-2 flex items-center justify-center min-h-[300px]">
                        <img src={image_data} alt="Scanned form" className="w-full h-auto object-contain max-h-[400px] rounded-lg shadow-lg" />
                      </div>
                    </div>
                  )}

                  {/* Right: JSON Editor */}
                  <div className={`w-full ${image_data ? 'md:w-2/3' : 'md:w-full'} flex flex-col gap-2`}>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Extracted Payload (Editable JSON)</span>
                    <textarea 
                      value={currentJsonStr}
                      onChange={(e) => handleFieldChange(docKey, e.target.value)}
                      className="w-full h-full min-h-[300px] p-4 bg-slate-900/80 border border-slate-700/50 rounded-xl text-xs font-mono text-emerald-400 outline-none focus:border-emerald-500/50 transition resize-y"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Inbox Fully Cleared!</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>0 edge-case forms pending review. All parsed records committed to active student database.</p>
        </div>
      )}
    </div>
  );
}
