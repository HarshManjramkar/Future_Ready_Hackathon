import React, { useState } from 'react';
import { UploadCloud, Sparkles, Loader2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import DropzoneExtractionView from './DropzoneExtractionView';

export default function MagicDropzone() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [timetableResult, setTimetableResult] = useState(null);

  const sampleForms = {
    clean: { name: '1_Admission_Form_Clean.png', url: '/sample_forms/1_Admission_Form_Clean.png' },
    messy: { name: '2_Admission_Form_Smudged_EdgeCase.png', url: '/sample_forms/2_Admission_Form_Smudged_EdgeCase.png' },
    leave: { name: '3_Teacher_Sick_Leave_Form.png', url: '/sample_forms/3_Teacher_Sick_Leave_Form.png' }
  };

  const processFormFile = async (fileObj, sampleType = null) => {
    setIsParsing(true);
    setParseProgress('Extracting image bytes & querying Gemini 3.5 Flash Vision...');
    setExtractedData(null);
    setTimetableResult(null);

    try {
      const formData = new FormData();
      formData.append('file', fileObj);
      if (sampleType) formData.append('sample_type', sampleType);

      const res = await fetch('/api/document/process', { method: 'POST', body: formData });
      const data = await res.json();
      
      setParseProgress('Validating calibrated JSON schema...');
      setTimeout(() => {
        setIsParsing(false);
        const resultData = data.parsed_data || data;
        setExtractedData(resultData);
        if (data.auto_timetable_solved) setTimetableResult(data.resolution);
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      }, 700);
    } catch (err) {
      console.error(err);
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      processFormFile(file);
    }
  };

  const loadPresetSample = async (type) => {
    const sample = sampleForms[type];
    if (!sample) return;
    setPreviewUrl(sample.url);
    setSelectedFile({ name: sample.name });
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], sample.name, { type: blob.type || 'image/png' });
      processFormFile(file, type);
    } catch (err) {
      processFormFile(new File(["demo"], sample.name, { type: "image/png" }), type);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header & Preset Buttons */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/30">
              Zero-Shot VLM Ingestion
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Google Gemini 3.5 Vision Engine</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Magic Dropzone: AI Document Reader
          </h2>
          <p className="text-xs mt-1 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Drop any paper admission form, medical slip, or faculty leave note. Gemini Vision parses uncalibrated layouts instantly.
          </p>
        </div>

        {/* Quick Sample Presets & Judges Test Kit */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 mr-2 hidden lg:block">Auto-Test:</span>
            <button onClick={() => loadPresetSample('clean')} className="px-3 py-1.5 app-subcard hover:border-sky-500/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Sample 1: Clean Form</span>
            </button>
            <button onClick={() => loadPresetSample('messy')} className="px-3 py-1.5 app-subcard hover:border-amber-500/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer">
              <span className="text-amber-500">⚠</span>
              <span>Sample 2: Smudged Review</span>
            </button>
            <button onClick={() => loadPresetSample('leave')} className="px-3 py-1.5 app-subcard hover:border-emerald-500/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sample 3: Teacher Sick Leave</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center mt-1 pt-3 border-t border-slate-700/30">
            <span className="text-[11px] font-bold text-emerald-400 mr-1 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              Judges' Manual Test Kit:
            </span>
            <a href="/judge_samples/1_Handwritten_Admission_Form.png" download className="text-[10px] px-2 py-1 bg-slate-800/50 hover:bg-slate-700/80 rounded border border-slate-600/50 text-slate-300 hover:text-white transition cursor-pointer font-medium flex items-center gap-1">
              <span>↓</span> Handwritten Admission
            </a>
            <a href="/judge_samples/2_Digitally_Filled_Medical_Form.png" download className="text-[10px] px-2 py-1 bg-slate-800/50 hover:bg-slate-700/80 rounded border border-slate-600/50 text-slate-300 hover:text-white transition cursor-pointer font-medium flex items-center gap-1">
              <span>↓</span> Digital Medical
            </a>
            <a href="/judge_samples/3_Handwritten_Teacher_Leave.png" download className="text-[10px] px-2 py-1 bg-slate-800/50 hover:bg-slate-700/80 rounded border border-slate-600/50 text-slate-300 hover:text-white transition cursor-pointer font-medium flex items-center gap-1">
              <span>↓</span> Handwritten Leave
            </a>
            <a href="/judge_samples/4_Clean_Field_Trip_Permission.png" download className="text-[10px] px-2 py-1 bg-slate-800/50 hover:bg-slate-700/80 rounded border border-slate-600/50 text-slate-300 hover:text-white transition cursor-pointer font-medium flex items-center gap-1">
              <span>↓</span> Clean Field Trip
            </a>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <label className="glass-panel p-10 rounded-2xl border-2 border-dashed border-sky-500/30 hover:border-sky-500/60 transition flex flex-col items-center justify-center cursor-pointer space-y-3 group">
        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
        <div className="p-4 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-500 transition">
          {isParsing ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8" />}
        </div>
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {isParsing ? parseProgress : 'Click to Upload or Drag & Drop Document Image'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Supports JPG, PNG, Scanned PDFs • Zero Template Setup Required
          </p>
        </div>
      </label>

      {/* Extraction Results */}
      <DropzoneExtractionView extractedData={extractedData} timetableResult={timetableResult} previewUrl={previewUrl} />
    </div>
  );
}
