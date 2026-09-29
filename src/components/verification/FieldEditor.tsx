import React, { useState } from 'react';
import { ExtractedRecord, ExtractedField } from '../../types';
import { ConfidenceBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { Edit2, Check, X, MapPin, Layers, Users, Trees, FileCheck, History } from 'lucide-react';

interface FieldEditorProps {
  extractedRecord: ExtractedRecord;
  onCorrectField: (fieldPath: string, originalValue: any, newValue: any, notes?: string) => Promise<void>;
  onSelectField: (boundingBox?: [number, number, number, number], fieldName?: string) => void;
  activeFieldName?: string;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  extractedRecord,
  onCorrectField,
  onSelectField,
  activeFieldName,
}) => {
  const { language, t } = useLanguage();
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const startEdit = (path: string, currentVal: any) => {
    setEditingPath(path);
    setEditValue(String(currentVal !== undefined ? currentVal : ''));
    setEditNotes('');
  };

  const cancelEdit = () => {
    setEditingPath(null);
    setEditValue('');
    setEditNotes('');
  };

  const handleSave = async (path: string, originalVal: any) => {
    try {
      setIsSubmitting(true);
      await onCorrectField(path, originalVal, editValue, editNotes);
      setEditingPath(null);
    } catch (err) {
      console.error('Failed to save correction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldRow = (
    label: string,
    path: string,
    field?: ExtractedField<any>,
    type: 'text' | 'number' = 'text'
  ) => {
    const isEditing = editingPath === path;
    const isTarget = activeFieldName === label;
    const val = field?.value ?? '—';
    const conf = field?.confidence ?? 0;
    const isEdited = field?.isEdited;

    return (
      <div
        key={path}
        onClick={() => onSelectField(field?.boundingBox, label)}
        className={`p-2.5 rounded-lg border transition text-xs flex flex-col justify-between cursor-pointer ${
          isTarget
            ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300'
            : conf < 75
            ? 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-600 truncate">{label}</span>
          <div className="flex items-center space-x-1.5">
            <ConfidenceBadge score={conf} />
            {!isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(path, field?.value);
                }}
                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                title="Edit field value"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 bg-white"
              placeholder="Corrected value..."
              autoFocus
            />
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded text-slate-600 placeholder:text-slate-400"
              placeholder="Optional notes for ML training loop..."
            />
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                onClick={cancelEdit}
                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                <X className="w-3.5 h-3.5 inline mr-1" />
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleSave(path, field?.value)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
              >
                <Check className="w-3.5 h-3.5 inline mr-1" />
                Save &amp; Log
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-slate-900 font-bold text-sm tracking-tight">{String(val)}</div>
            {isEdited && (
              <div className="mt-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span>Edited: original was &apos;{String(field?.originalValue)}&apos;</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Geographical Location Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>{t('locationHierarchy')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {renderFieldRow(t('state'), 'location.state', extractedRecord.location?.state)}
          {renderFieldRow(t('district'), 'location.district', extractedRecord.location?.district)}
          {renderFieldRow(t('tehsil'), 'location.tehsil', extractedRecord.location?.tehsil)}
          {renderFieldRow(t('village'), 'location.village', extractedRecord.location?.village)}
        </div>
      </div>

      {/* 2. Parcel Geometry & Numbers */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2.5">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>{t('parcelDetails')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {renderFieldRow(t('surveyNumber'), 'parcel.surveyNumber', extractedRecord.parcel?.surveyNumber)}
          {renderFieldRow(t('khasraNumber'), 'parcel.khasraNumber', extractedRecord.parcel?.khasraNumber)}
          {renderFieldRow(t('khataNumber'), 'parcel.khataNumber', extractedRecord.parcel?.khataNumber)}
          {renderFieldRow(t('area'), 'parcel.plotArea', extractedRecord.parcel?.plotArea, 'number')}
          {renderFieldRow(t('areaUnit'), 'parcel.areaUnit', extractedRecord.parcel?.areaUnit)}
          {renderFieldRow(language === 'mr' ? 'प्रमाणित क्षेत्र (एकर)' : 'Normalized (Acre)', 'parcel.normalizedAreaAcres', extractedRecord.parcel?.normalizedAreaAcres, 'number')}
        </div>
      </div>

      {/* 3. Ownership Details */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2.5">
          <Users className="w-4 h-4 text-blue-600" />
          <span>{t('ownershipSchedule')}</span>
        </div>
        <div className="space-y-2">
          {extractedRecord.ownership?.owners?.map((owner, idx) => (
            <div key={owner.id || idx} className="p-2.5 bg-white rounded border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                {language === 'mr' ? `कब्जेदार क्रमांक #${idx + 1}` : `Owner #${idx + 1}`}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {renderFieldRow(t('ownerName'), `ownership.owners[${idx}].name`, owner.name)}
                {renderFieldRow(t('fatherHusbandName'), `ownership.owners[${idx}].fatherOrHusbandName`, owner.fatherOrHusbandName)}
                {renderFieldRow(t('sharePercentage'), `ownership.owners[${idx}].sharePercentage`, owner.sharePercentage, 'number')}
                {renderFieldRow(t('ownershipClass'), `ownership.owners[${idx}].ownershipType`, owner.ownershipType)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Land Classification */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2.5">
          <Trees className="w-4 h-4 text-amber-600" />
          <span>{t('landClassification')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {renderFieldRow(language === 'mr' ? 'जमीन वर्गीकरण (जिरायत/बागायत)' : 'Classification', 'land.landClassification', extractedRecord.land?.landClassification)}
          {renderFieldRow(language === 'mr' ? 'जमिनीचा वापर' : 'Land Use', 'land.landUse', extractedRecord.land?.landUse)}
          {renderFieldRow(language === 'mr' ? 'जलसिंचन साधन' : 'Irrigation Source', 'land.irrigationSource', extractedRecord.land?.irrigationSource)}
          {renderFieldRow(language === 'mr' ? 'मुख्य पिके' : 'Primary Crops', 'land.cropType', extractedRecord.land?.cropType)}
        </div>
      </div>

      {/* 5. Mutation & Registration */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2.5">
          <FileCheck className="w-4 h-4 text-purple-600" />
          <span>{t('mutationRegistration')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {renderFieldRow(language === 'mr' ? 'फेरफार क्र.' : 'Mutation No', 'mutation.mutationNumber', extractedRecord.mutation?.mutationNumber)}
          {renderFieldRow(language === 'mr' ? 'फेरफार दिनांक' : 'Mutation Date', 'mutation.mutationDate', extractedRecord.mutation?.mutationDate)}
          {renderFieldRow(language === 'mr' ? 'दस्त नोंदणी क्र.' : 'Registration No', 'registration.registrationNumber', extractedRecord.registration?.registrationNumber)}
          {renderFieldRow(language === 'mr' ? 'दुय्यम निबंधक कार्यालय' : 'Sub-Registrar', 'registration.subRegistrarOffice', extractedRecord.registration?.subRegistrarOffice)}
        </div>
      </div>
    </div>
  );
};
