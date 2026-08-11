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

export default function HumanReviewInbox() {
  const [unreviewed, setUnreviewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);

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

  const handleApprove = async (idx) => {
    const doc = unreviewed[idx];
    const fatherMobile = document.getElementById(`father-mobile-${idx}`)?.value || doc.parent_info?.father_mobile;
    const aadhaarNumber = document.getElementById(`aadhaar-number-${idx}`)?.value || doc.student_info?.aadhaar_number;

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
          address: doc.address
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        const updated = [...unreviewed];
        updated.splice(idx, 1);
        setUnreviewed(updated);
        setApprovedCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/30">
              Edge-Case Verification
            </span>
            <span className="text-xs text-slate-400">Human-in-the-Loop Safety</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Human Review Inbox
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            When Gemini Vision detects smudged or uncertain handwriting (confidence &lt; 80%), it routes the form here for 1-click administrative verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
            Approved Today: <strong className="text-emerald-400 font-bold">{approvedCount}</strong>
          </div>
        </div>
      </div>

      {/* Inbox List */}
      {unreviewed.length > 0 ? (
        <div className="space-y-6">
          {unreviewed.map((doc, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border-2 border-amber-500/40 space-y-4 pulse-glow-amber">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {doc.school_name} — Admission Form
                    </h3>
                    <p className="text-xs text-amber-300">
                      Extraction Confidence: {Math.round(doc.extraction_confidence * 100)}% • Smudged Handwriting Flagged
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(idx)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Commit to Firestore</span>
                </button>
              </div>

              {/* Form Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Student Name</span>
                  </div>
                  <p className="font-bold text-white text-sm">{doc.student_info?.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">DOB: {doc.student_info?.dob} • Class: {doc.student_info?.class_applying_for}</p>
                </div>

                <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Phone className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>Father's Mobile (Flagged)</span>
                  </div>
                  <input
                    type="text"
                    id={`father-mobile-${idx}`}
                    defaultValue={doc.parent_info?.father_mobile}
                    className="w-full bg-slate-900 border border-amber-500/50 rounded p-1.5 text-amber-200 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-400/80">AI marked digits 6-8 as uncertain. Edit above if needed.</p>
                </div>

                <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Aadhaar Number (Flagged)</span>
                  </div>
                  <input
                    type="text"
                    id={`aadhaar-number-${idx}`}
                    defaultValue={doc.student_info?.aadhaar_number}
                    className="w-full bg-slate-900 border border-amber-500/50 rounded p-1.5 text-amber-200 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-400/80">Middle 4 digits smudged on scan.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 min-h-[350px]">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Inbox Zero! No Forms Pending Review</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            All uploaded document extractions have passed confidence thresholds or have been manually verified.
          </p>
        </div>
      )}
    </div>
  );
}
