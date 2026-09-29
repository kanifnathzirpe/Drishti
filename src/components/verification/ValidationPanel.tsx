import React from 'react';
import { ValidationResult } from '../../types';
import { ValidationBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ValidationPanelProps {
  validationResults: ValidationResult[];
  onRerunValidation: () => Promise<void>;
  isValidating?: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResults,
  onRerunValidation,
  isValidating = false,
}) => {
  const { language, t } = useLanguage();
  const errors = validationResults.filter((r) => r.severity === 'ERROR' && r.status === 'FAIL');
  const warnings = validationResults.filter((r) => r.severity === 'WARNING' && r.status === 'FAIL');

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {language === 'mr'
              ? 'महसूल नियम पडताळणी (Rule Engine)'
              : language === 'hi'
              ? 'राजस्व नियम सत्यापन (Rule Engine)'
              : 'Rule Engine Validation'}
          </h3>
          <p className="text-[11px] text-slate-500">
            {language === 'mr'
              ? `${errors.length} त्रुटी • ${warnings.length} सूचना`
              : language === 'hi'
              ? `${errors.length} त्रुटियां • ${warnings.length} चेतावनियां`
              : `${errors.length} Errors • ${warnings.length} Warnings`}
          </p>
        </div>

        <button
          disabled={isValidating}
          onClick={onRerunValidation}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
          <span>{t('rerunValidation')}</span>
        </button>
      </div>

      <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
        {validationResults.length === 0 ? (
          <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded border border-emerald-200 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'mr'
                ? 'सर्व महसूल नियम तपासण्या यशस्वीरीत्या पूर्ण झाल्या.'
                : language === 'hi'
                ? 'सभी नियम सत्यापन सफलतापूर्वक उत्तीर्ण हुए।'
                : 'All business validation checks passed without errors.'}
            </span>
          </div>
        ) : (
          validationResults.map((r) => (
            <div
              key={r.id}
              className={`p-2.5 rounded-md border text-xs ${
                r.severity === 'ERROR'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                  : 'bg-amber-50/50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  {r.severity === 'ERROR' ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  {r.ruleName}
                </span>
                <ValidationBadge severity={r.severity} />
              </div>
              <p className="text-[11px] mt-0.5 text-slate-700">{r.message}</p>
              {(r.expected || r.actual) && (
                <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px] font-mono bg-white/60 p-1.5 rounded border border-slate-200/50">
                  <div>
                    <span className="text-slate-400 block font-sans">
                      {language === 'mr' ? 'अपेक्षित:' : language === 'hi' ? 'अपेक्षित:' : 'Expected:'}
                    </span>
                    <span className="text-emerald-700 font-bold">{r.expected || 'Valid'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">
                      {language === 'mr' ? 'वास्तविक:' : language === 'hi' ? 'वास्तविक:' : 'Actual:'}
                    </span>
                    <span className="text-rose-700 font-bold">{r.actual || 'Invalid'}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
