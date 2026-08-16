import React, { useState } from 'react';
import { X, Settings, Download, Printer } from 'lucide-react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import PristineTimetablePDF from './pdf/PristineTimetablePDF';
import PristineIDCardPDF from './pdf/PristineIDCardPDF';

export default function PrintStudio({ isOpen, onClose, type, payload }) {
  const [options, setOptions] = useState({
    hideEmpty: true,
    highContrast: false,
  });

  if (!isOpen) return null;

  // Determine which document to render based on type
  const renderDocument = () => {
    if (type === 'timetable') {
      return (
        <PristineTimetablePDF 
          schedule={payload.schedule || []} 
          days={payload.days || []} 
          periods={payload.periods || []} 
          options={options} 
        />
      );
    }
    if (type === 'idcard') {
      return (
        <PristineIDCardPDF 
          cards={payload.cards || []} 
          options={options} 
        />
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-950/80 backdrop-blur-md">
      {/* Studio Sidebar (Configuration) */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-slate-100 font-display tracking-wide">Print Studio</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Output Configuration
            </h3>

            <label className="flex items-center justify-between p-3.5 bg-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-800/80 transition-all border border-slate-700/50 group">
              <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">Hide Empty Periods</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={options.hideEmpty}
                  onChange={(e) => setOptions({...options, hideEmpty: e.target.checked})}
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-800/80 transition-all border border-slate-700/50 group">
              <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">High Contrast Mode</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={options.highContrast}
                  onChange={(e) => setOptions({...options, highContrast: e.target.checked})}
                />
                <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              </div>
            </label>
          </div>
          
          <div className="p-4 bg-sky-500/10 rounded-xl border border-sky-500/20">
            <p className="text-xs text-sky-400 leading-relaxed">
              <strong>Vector Engine Active.</strong> This document is being rendered natively via Yoga Flexbox to ensure absolute precision and infinite zoom fidelity.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <PDFDownloadLink
            document={renderDocument()}
            fileName={type === 'timetable' ? 'Pristine_Timetable.pdf' : 'Pristine_ID_Cards.pdf'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-[0_0_20px_color(display-p3 0.055 0.647 0.914 / 0.3)] hover:shadow-[0_0_25px_color(display-p3 0.055 0.647 0.914 / 0.5)] font-semibold transition-all active:scale-95"
          >
            {({ loading }) =>
              loading ? (
                <span className="animate-pulse">Rendering Vector PDF...</span>
              ) : (
                <>
                  <Download className="w-5 h-5" /> {type === 'timetable' ? 'Download Timetable' : 'Download Digital Id'}
                </>
              )
            }
          </PDFDownloadLink>
        </div>
      </div>

      {/* PDF Live Preview Window */}
      <div className="flex-1 p-8 flex flex-col h-full bg-slate-950/50">
        <div className="flex-1 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-4">
          <PDFViewer width="100%" height="100%" className="rounded-xl border-none">
            {renderDocument()}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
