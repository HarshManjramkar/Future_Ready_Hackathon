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

  const handleFieldChange = (docKey, field, value) => {
    setFormEdits(prev => ({
      ...prev,
      [docKey]: { ...prev[docKey], [field]: value }
    }));
  };

  const handleApprove = async (idx) => {
    const doc = unreviewed[idx];
    const docKey = doc.id || doc.student_info?.aadhaar_number || doc.student_info?.full_name || `doc-${idx}`;
    const edits = formEdits[docKey] || {};
    const fatherMobile = edits.fatherMobile !== undefined ? edits.fatherMobile : (doc.parent_info?.father_mobile || '');
    const aadhaarNumber = edits.aadhaarNumber !== undefined ? edits.aadhaarNumber : (doc.student_info?.aadhaar_number || '');

    const studentInfo = { ...doc.student_info, aadhaar_number: aadhaarNumber };
    const parentInfo = { ...doc.parent_info, father_mobile: fatherMobile };

    try {
      const res = await fetch('/api/document/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: idx,
          student_info: studentInfo,
          parent_info: parentInfo,
          address: doc.address || {}
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
            const edits = formEdits[docKey] || {};
            const fatherMobile = edits.fatherMobile !== undefined ? edits.fatherMobile : (doc.parent_info?.father_mobile || '');
            const aadhaarNumber = edits.aadhaarNumber !== undefined ? edits.aadhaarNumber : (doc.student_info?.aadhaar_number || '');

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

                {/* Editable Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Parent Father Mobile Number (Verify Smudge)</label>
                    <input
                      type="text"
                      value={fatherMobile}
                      onChange={(e) => handleFieldChange(docKey, 'fatherMobile', e.target.value)}
                      className="w-full text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Student Aadhaar / ID Number</label>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => handleFieldChange(docKey, 'aadhaarNumber', e.target.value)}
                      className="w-full text-xs font-mono"
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
