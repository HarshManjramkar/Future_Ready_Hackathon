import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Sparkles, UserCheck, Zap } from 'lucide-react';

export default function DropzoneExtractionView({ extractedData, timetableResult, previewUrl }) {
  if (!extractedData) return null;

  const isReviewRequired = extractedData.requires_human_review || (extractedData.extraction_confidence < 0.80);

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
          <div className="p-4 rounded-xl app-subcard space-y-3 text-xs max-h-[360px] overflow-y-auto">
            {extractedData.student_info && (
              <div className="space-y-1">
                <span className="font-bold text-sky-500 block">Student Information</span>
                <p><strong>Name:</strong> {extractedData.student_info.full_name}</p>
                <p><strong>DOB:</strong> {extractedData.student_info.dob}</p>
                <p><strong>Grade:</strong> {extractedData.student_info.class_applying_for}</p>
                <p><strong>Aadhaar:</strong> {extractedData.student_info.aadhaar_number}</p>
              </div>
            )}

            {extractedData.teacher_name && (
              <div className="space-y-1">
                <span className="font-bold text-amber-500 block">Faculty Leave Details</span>
                <p><strong>Teacher:</strong> {extractedData.teacher_name} ({extractedData.teacher_id})</p>
                <p><strong>Type:</strong> {extractedData.leave_type}</p>
                <p><strong>Date:</strong> {extractedData.date_of_absence}</p>
                <p><strong>Reason:</strong> {extractedData.reason}</p>
              </div>
            )}

            {extractedData.parent_info && (
              <div className="space-y-1 pt-2 border-t" style={{ borderColor: 'var(--panel-border)' }}>
                <span className="font-bold text-sky-500 block">Guardian Details</span>
                <p><strong>Father:</strong> {extractedData.parent_info.father_name} ({extractedData.parent_info.father_mobile})</p>
                <p><strong>Email:</strong> {extractedData.parent_info.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
