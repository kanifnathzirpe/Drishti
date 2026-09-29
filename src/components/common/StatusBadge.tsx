import React from 'react';
import { ProcessingStatus, WorkflowStatus, Severity } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const StatusBadge: React.FC<{ status: ProcessingStatus | WorkflowStatus | string }> = ({ status }) => {
  const { language } = useLanguage();

  const getBadgeStyle = () => {
    switch (status) {
      case 'APPROVED':
      case 'AUTO_ACCEPTED':
      case 'SYNCED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'REVIEW_REQUIRED':
      case 'IN_REVIEW':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'PROCESSING':
      case 'QUEUED':
        return 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'ESCALATED':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getLocalizedText = (s: string) => {
    if (language === 'mr') {
      switch (s) {
        case 'APPROVED':
          return 'मंजूर (Approved)';
        case 'AUTO_ACCEPTED':
          return 'आपोआप मंजूर';
        case 'SYNCED':
          return 'DILRMP सिंक पूर्ण';
        case 'REVIEW_REQUIRED':
          return 'पडताळणी आवश्यक';
        case 'IN_REVIEW':
          return 'पडताळणी सुरू';
        case 'PENDING':
          return 'प्रलंबित';
        case 'PROCESSING':
          return 'प्रक्रिया चालू';
        case 'QUEUED':
          return 'रांगेत समाविष्ट';
        case 'REJECTED':
          return 'नाकारले (Rejected)';
        case 'FAILED':
          return 'त्रुटी / अयशस्वी';
        case 'ESCALATED':
          return 'वरिष्ठांकडे वर्ग';
        case 'UPLOADED':
          return 'अपलोड झाले';
        default:
          return s.replace(/_/g, ' ');
      }
    }

    if (language === 'hi') {
      switch (s) {
        case 'APPROVED':
          return 'स्वीकृत (Approved)';
        case 'AUTO_ACCEPTED':
          return 'स्वतः स्वीकृत';
        case 'SYNCED':
          return 'DILRMP सिंक संपन्न';
        case 'REVIEW_REQUIRED':
          return 'सत्यापन आवश्यक';
        case 'IN_REVIEW':
          return 'सत्यापन जारी';
        case 'PENDING':
          return 'प्रलंबित';
        case 'PROCESSING':
          return 'प्रक्रिया चालू';
        case 'QUEUED':
          return 'कतारबद्ध';
        case 'REJECTED':
          return 'अस्वीकृत';
        case 'FAILED':
          return 'अयशस्वी';
        case 'ESCALATED':
          return 'उच्चाधिकारी को प्रेषित';
        case 'UPLOADED':
          return 'अपलोड हुआ';
        default:
          return s.replace(/_/g, ' ');
      }
    }

    return s.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {getLocalizedText(status)}
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ score: number; showPercent?: boolean }> = ({ score, showPercent = true }) => {
  const getConfidenceStyle = () => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 75) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${getConfidenceStyle()}`}>
      {score}{showPercent ? '%' : ''}
    </span>
  );
};

export const ValidationBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const { language } = useLanguage();

  const getLabel = () => {
    if (language === 'mr') {
      if (severity === 'ERROR') return 'त्रुटी (ERROR)';
      if (severity === 'WARNING') return 'सूचना (WARNING)';
      return 'माहिती (INFO)';
    }
    if (language === 'hi') {
      if (severity === 'ERROR') return 'त्रुटि (ERROR)';
      if (severity === 'WARNING') return 'चेतावनी (WARNING)';
      return 'सूचना (INFO)';
    }
    return severity;
  };

  switch (severity) {
    case 'ERROR':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">{getLabel()}</span>;
    case 'WARNING':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">{getLabel()}</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{getLabel()}</span>;
  }
};
