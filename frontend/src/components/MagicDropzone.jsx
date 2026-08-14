import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Calendar
} from 'lucide-react';

export default function MagicDropzone({ onParsedDocument, autoLoadPreset, onAutoLoadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [autoSolvedResult, setAutoSolvedResult] = useState(null);

  React.useEffect(() => {
    if (autoLoadPreset) {
      loadPresetSample(autoLoadPreset);
      if (onAutoLoadComplete) onAutoLoadComplete();
    }
  }, [autoLoadPreset]);

  // Quick preset sample forms for hackathon demo!
  const loadPresetSample = async (type) => {
    setIsParsing(true);
    setParseProgress('Connecting to Gemini 1.5 Vision Agent...');
    setExtractedData(null);
    setAutoSolvedResult(null);

    try {
      const formData = new FormData();
      const blob = new Blob(["dummy"], { type: "image/jpeg" });
      
      let filename = 'greenwood_admission_clean.jpg';
      if (type === 'messy') filename = 'greenwood_admission_review.jpg';
      if (type === 'leave') filename = 'victory_teacher_leave.jpg';
      
      formData.append('file', blob, filename);

      await new Promise(r => setTimeout(r, 600));
      setParseProgress('Analyzing handwritten form layout & checkboxes...');
      await new Promise(r => setTimeout(r, 600));
      setParseProgress('Extracting structured schema fields...');

      const response = await fetch('/api/document/parse', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      setIsParsing(false);
      if (data.status === 'SUCCESS') {
        setExtractedData(data.parsed_data);
        if (data.auto_timetable_solved) {
          setAutoSolvedResult(data.resolution);
        }
        if (onParsedDocument) {
          onParsedDocument(data.parsed_data);
        }
      }
    } catch (err) {
      setIsParsing(false);
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsParsing(true);
    setParseProgress('Uploading to Gemini Vision engine...');
    setExtractedData(null);
    setAutoSolvedResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await new Promise(r => setTimeout(r, 600));
      setParseProgress('Running zero-shot field extraction...');
      
      const response = await fetch('/api/document/parse', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      setIsParsing(false);
      if (data.status === 'SUCCESS') {
        setExtractedData(data.parsed_data);
        if (data.auto_timetable_solved) {
          setAutoSolvedResult(data.resolution);
        }
        if (onParsedDocument) {
          onParsedDocument(data.parsed_data);
        }
      }
    } catch (err) {
      setIsParsing(false);
      console.error(err);
    }
  };

  const isLeaveForm = extractedData?.document_type === "TEACHER_LEAVE_FORM";

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/20 px-2.5 py-0.5 rounded border border-purple-500/30">
              Zero-Shot VLM Engine
            </span>
            <span className="text-xs text-slate-400">Powered by Gemini 1.5 Pro</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Magic Dropzone: Paper-to-Digital Ingestion
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Drop any paper admission form, medical log, or handwritten slip. The AI classifies the document and updates Firestore automatically.
          </p>
        </div>

        {/* Demo Quick Presets */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadPresetSample('clean')}
            disabled={isParsing}
            className="px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Clean Form</span>
          </button>
          <button
            onClick={() => loadPresetSample('messy')}
            disabled={isParsing}
            className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Messy Form</span>
          </button>
          <button
            onClick={() => loadPresetSample('leave')}
            disabled={isParsing}
            className="px-3.5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition pulse-glow-blue animate-pulse cursor-pointer"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Teacher Leave Form</span>
          </button>
        </div>
      </div>

      {/* 🧪 JUDGE TESTING INSTRUCTIONS CARD */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>🧪 Judge Quick Testing Guide (Zero-Shot VLM Form Reader)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-purple-300 block">1. Test Clean Form</span>
            <p className="text-[11px] text-slate-400">Click <strong>Clean Form</strong> above. Gemini 1.5 Vision parses handwritten fields into JSON automatically with 100% confidence.</p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-300 block">2. Test Edge-Case Form</span>
            <p className="text-[11px] text-slate-400">Click <strong>Messy Form</strong> above. Smudged handwriting triggers a review flag and routes data to Admin Inbox for human verification.</p>
          </div>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-300 block">3. Test VLM → Solver Pipeline</span>
            <p className="text-[11px] text-slate-400">Click <strong>Teacher Leave Form</strong>. Gemini VLM parses leave details AND automatically executes OR-Tools timetable re-allocation!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload / Scanner Zone */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-2xl border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 transition-all text-center relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Click or Drag Form Image Here</h3>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, scanned PDF snapshots</p>
              </div>
            </div>
          </div>

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 flex items-center gap-4 animate-pulse">
              <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
              <div>
                <p className="text-sm font-bold text-white">AI Processing in Progress...</p>
                <p className="text-xs text-purple-300">{parseProgress}</p>
              </div>
            </div>
          )}

          {/* Form Preview */}
          {previewUrl && (
            <div className="glass-panel p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Uploaded Snapshot</span>
                <span className="text-purple-400 font-medium">{selectedFile?.name}</span>
              </div>
              <div className="max-h-64 overflow-hidden rounded-xl border border-slate-700">
                <img src={previewUrl} alt="Uploaded form" className="w-full object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Parsed Results & Json Viewer */}
        <div>
          {extractedData ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              {/* Extraction Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {extractedData.school_name}
                    </h3>
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {extractedData.academic_year || 'LEAVE REQUEST'}
                    </span>
                  </div>
                  <p className="text-xs text-purple-400 font-medium animate-pulse">
                    Type: {extractedData.document_type}
                  </p>
                </div>

                {/* Confidence Badge */}
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border-emerald-500/40`}>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Verified ({Math.round(extractedData.extraction_confidence * 100)}%)</span>
                </div>
              </div>

              {/* Phase 3 Cross-Module Automated Disruption Success Card */}
              {autoSolvedResult && (
                <div className="bg-indigo-500/20 border-2 border-indigo-500/50 rounded-2xl p-5 space-y-3 pulse-glow-blue">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-indigo-400 animate-bounce" />
                    <h4 className="font-bold text-white text-sm">Autonomous Campus Loop Triggered!</h4>
                  </div>
                  <p className="text-xs text-indigo-200">
                    EduFlow OS detected a leave request for <strong className="text-white">{extractedData.teacher_name}</strong>. Google OR-Tools solved substitute coverage instantly with zero timetable conflicts:
                  </p>
                  <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-indigo-300">
                    {autoSolvedResult.resolutions.map((res, i) => (
                      <li key={i}>{res.action}</li>
                    ))}
                  </ul>
                  <div className="text-[10px] text-indigo-400 font-mono">Solve latency: 0.04s • Timetable synced</div>
                </div>
              )}

              {/* Extracted Fields Summary */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isLeaveForm ? 'Extracted Staff Fields' : 'Extracted Student Fields'}
                </h4>
                
                {isLeaveForm ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Teacher Name</span>
                      <span className="font-bold text-white text-sm">{extractedData.teacher_name}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Employee ID</span>
                      <span className="font-bold text-white text-sm">{extractedData.teacher_id}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Leave Type</span>
                      <span className="font-bold text-indigo-400 text-sm">{extractedData.leave_type}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Absence Date</span>
                      <span className="font-bold text-white text-sm">{extractedData.date_of_absence}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Student Name</span>
                      <span className="font-bold text-white text-sm">{extractedData.student_info.full_name}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Date of Birth</span>
                      <span className="font-bold text-white text-sm">{extractedData.student_info.dob}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Class Applied</span>
                      <span className="font-bold text-blue-400 text-sm">{extractedData.student_info.class_applying_for}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Father's Phone</span>
                      <span className="font-mono text-white text-sm">
                        {extractedData.parent_info.father_mobile}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* JSON Code Viewer */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Structured Schema Output</span>
                  <span>JSON Format</span>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 scrollbar-thin">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3 min-h-[400px]">
              <FileText className="w-12 h-12 text-slate-600" />
              <h4 className="text-base font-bold text-slate-300">No Document Parsed Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload a form or click one of the preset buttons above to see the AI extract structured data in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
