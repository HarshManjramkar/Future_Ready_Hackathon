import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, Sparkles, UserCheck, Zap, ShieldCheck, Loader2 } from 'lucide-react';

export default function DropzoneExtractionView({ extractedData, timetableResult, previewUrl }) {
  const [notifyState, setNotifyState] = useState({});

  if (!extractedData) return null;

  const isReviewRequired = extractedData.requires_human_review || (extractedData.extraction_confidence < 0.80);
  const isHighRisk = ['MEDICAL_RECORD_FORM', 'FIELD_TRIP_PERMISSION', 'TEACHER_LEAVE_FORM'].includes(extractedData.document_type);

  const handleNotify = async (phone, studentName, docType) => {
    setNotifyState(prev => ({...prev, [phone]: 'sending'}));
    try {
      await fetch('/api/document/notify-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, student_name: studentName, document_type: docType })
      });
      setNotifyState(prev => ({...prev, [phone]: 'sent'}));
    } catch(err) {
      setNotifyState(prev => ({...prev, [phone]: 'idle'}));
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6 animate-fadeIn">
      {/* Timetable Disruption Bridge Notification */}
      {timetableResult && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Multi-Agent Workflow Triggered</h4>
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                Teacher sick leave extracted &rarr; <strong>Timetable Disruption Solver</strong> automatically resolved {timetableResult.total_affected_periods} affected periods!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-500 text-slate-950 rounded-lg">Auto-Reassigned</span>
        </div>
      )}

      {/* Anti-Fraud High-Risk Banner */}
      {isHighRisk && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">Anti-Fraud Protection Active</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {extractedData.document_type} detected. Digital/Physical signatures can be forged by students. Verify via WhatsApp.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-rose-500 text-white rounded-lg whitespace-nowrap">High Risk</span>
        </div>
      )}

      {/* Extraction Results Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--panel-border)' }}>
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-sky-500" />
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{extractedData.document_type || 'Extracted Document'}</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{extractedData.school_name || 'Victory High School'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isReviewRequired ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
          }`}>
            {isReviewRequired ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Confidence: {Math.round((extractedData.extraction_confidence || 0.95) * 100)}%
          </span>
          {isReviewRequired && (
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full animate-pulse">
              Routed to Human Review Inbox
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Extraction Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 block">Uploaded Source Document</span>
            <div className="rounded-xl overflow-hidden border max-h-[360px] flex items-center justify-center app-subcard" style={{ borderColor: 'var(--panel-border)' }}>
              <img src={previewUrl} alt="Source form preview" className="w-full object-contain max-h-[360px]" />
            </div>
          </div>
        )}

        {/* Structured Key-Value Extracted Cards */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">Structured Extraction (Zero-Shot VLM)</span>
          <div className="p-4 rounded-xl app-subcard space-y-4 text-xs max-h-[360px] overflow-y-auto">
            {Object.entries(extractedData).map(([sectionKey, sectionValue]) => {
              // Skip metadata fields
              if (['extraction_confidence', 'requires_human_review', 'document_type', 'school_name', 'raw_text'].includes(sectionKey)) {
                return null;
              }

              // Format section title
              const sectionTitle = sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              // If it's an object (like student_info)
              if (typeof sectionValue === 'object' && sectionValue !== null) {
                return (
                  <div key={sectionKey} className="space-y-1 pb-3 border-b last:border-0" style={{ borderColor: 'var(--panel-border)' }}>
                    <span className="font-bold text-sky-500 block mb-2">{sectionTitle}</span>
                    {Object.entries(sectionValue).map(([k, v]) => {
                      const isPhone = (k.includes('mobile') || k.includes('phone') || k.includes('contact')) && v && String(v).length > 5;
                      const phoneVal = String(v);
                      return (
                        <div key={k} className="flex items-center justify-between py-0.5">
                          <span>
                            <strong>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {phoneVal}
                          </span>
                          {isHighRisk && isPhone && (
                            <button 
                              onClick={() => handleNotify(phoneVal, extractedData.student_info?.full_name || 'Student', extractedData.document_type)}
                              disabled={notifyState[phoneVal] === 'sent' || notifyState[phoneVal] === 'sending'}
                              className={`ml-2 px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1.5 transition ${
                                notifyState[phoneVal] === 'sent' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                                'bg-green-600/20 text-green-500 hover:bg-green-600/40 border border-green-600/30'
                              }`}
                            >
                              {notifyState[phoneVal] === 'sending' ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                               notifyState[phoneVal] === 'sent' ? <CheckCircle className="w-3 h-3" /> : 
                               <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-3 h-3" alt="WA" />}
                              {notifyState[phoneVal] === 'sending' ? 'Dispatching...' : 
                               notifyState[phoneVal] === 'sent' ? 'WhatsApp Verified' : 'Verify via WhatsApp'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // If it's a primitive value at the root level
              const isPhoneRoot = (sectionKey.includes('mobile') || sectionKey.includes('phone') || sectionKey.includes('contact')) && sectionValue && String(sectionValue).length > 5;
              const rootPhoneVal = String(sectionValue);

              return (
                <div key={sectionKey} className="flex items-center justify-between py-0.5">
                  <p>
                    <strong className="text-amber-500">{sectionTitle}:</strong> {rootPhoneVal}
                  </p>
                  {isHighRisk && isPhoneRoot && (
                    <button 
                      onClick={() => handleNotify(rootPhoneVal, extractedData.student_info?.full_name || 'Student', extractedData.document_type)}
                      disabled={notifyState[rootPhoneVal] === 'sent' || notifyState[rootPhoneVal] === 'sending'}
                      className={`ml-2 px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1.5 transition ${
                        notifyState[rootPhoneVal] === 'sent' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                        'bg-green-600/20 text-green-500 hover:bg-green-600/40 border border-green-600/30'
                      }`}
                    >
                      {notifyState[rootPhoneVal] === 'sending' ? <Loader2 className="w-3 h-3 animate-spin" /> : 
                       notifyState[rootPhoneVal] === 'sent' ? <CheckCircle className="w-3 h-3" /> : 
                       <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-3 h-3" alt="WA" />}
                      {notifyState[rootPhoneVal] === 'sending' ? 'Dispatching...' : 
                       notifyState[rootPhoneVal] === 'sent' ? 'WhatsApp Verified' : 'Verify via WhatsApp'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
