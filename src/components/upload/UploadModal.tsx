import React, { useState } from 'react';
import { api } from '../../services/api';
import { DocumentType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (docId: string, autoProcess: boolean) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const { language: currentLang, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [tehsil, setTehsil] = useState('Haveli');
  const [village, setVillage] = useState('Wagholi');
  const [documentType, setDocumentType] = useState<DocumentType>('Record of Rights');
  const [language, setLanguage] = useState('Marathi');
  const [autoProcess, setAutoProcess] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 25 * 1024 * 1024) {
      setError('File size exceeds maximum 25MB limit.');
      return;
    }

    setFile(selected);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleQuickDemoLoad = (demoType: string) => {
    if (demoType === '7/12') {
      setFile(new File([''], 'Wagholi_Survey_142_RoR_7_12.svg', { type: 'image/svg+xml' }));
      setFileBase64('/samples/Wagholi_Survey_142_RoR_7_12.svg');
      setState('Maharashtra');
      setDistrict('Pune');
      setTehsil('Haveli');
      setVillage('Wagholi');
      setDocumentType('Record of Rights');
      setLanguage('Marathi');
    } else if (demoType === 'khasra') {
      setFile(new File([''], 'Rampur_Khasra_Khatauni_Hindi.svg', { type: 'image/svg+xml' }));
      setFileBase64('/samples/document_template.svg');
      setState('Uttar Pradesh');
      setDistrict('Lucknow');
      setTehsil('Bakshi Ka Talab');
      setVillage('Rampur');
      setDocumentType('Land Register');
      setLanguage('Hindi');
    } else if (demoType === 'ferfar') {
      setFile(new File([''], 'Koregaon_Mutation_Ferfar_4402.svg', { type: 'image/svg+xml' }));
      setFileBase64('/samples/document_template.svg');
      setState('Maharashtra');
      setDistrict('Pune');
      setTehsil('Haveli');
      setVillage('Koregaon Bhima');
      setDocumentType('Mutation Register');
      setLanguage('Marathi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !fileBase64) {
      setError('Please select or drag a land record document image or PDF.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const res = await api.uploadDocument({
        fileName: file ? file.name : 'Uploaded_Land_Record.svg',
        fileBase64: fileBase64 || '/samples/Wagholi_Survey_142_RoR_7_12.svg',
        fileType: file?.type || 'image/svg+xml',
        fileSize: file?.size || 1024 * 500,
        state,
        district,
        tehsil,
        village,
        documentType,
        language,
      });

      if (res.success && res.document) {
        onUploadSuccess(res.document.id, autoProcess);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {currentLang === 'mr' ? 'नवीन भू-अभिलेख दस्तऐवज अपलोड करा' : currentLang === 'hi' ? 'नया भू-अभिलेख दस्तावेज़ अपलोड करें' : 'Upload Land Record Document'}
            </h2>
            <p className="text-xs text-slate-500">
              {currentLang === 'mr'
                ? 'स्कॅन केलेला ७/१२ उतारा, फेरफार नोंद, ८-अ किंवा खरेदीखत सिस्टीममध्ये दाखल करा'
                : currentLang === 'hi'
                ? 'स्कैन किया गया 7/12, खसरा-खतौनी, दाखिल-खारिज या बैनामा दस्तावेज़ अपलोड करें'
                : 'Ingest physical survey, 7/12 RoR, Khasra, or Mutation records'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Pickers */}
        <div className="px-6 pt-4 pb-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {currentLang === 'mr' ? 'नमुना कागदपत्रे (डेमो):' : currentLang === 'hi' ? 'नमूना दस्तावेज़ (डेमो):' : 'Quick Demo Presets:'}
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickDemoLoad('7/12')}
              className="text-xs px-2.5 py-1 rounded bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-medium"
            >
              {currentLang === 'mr' ? 'महाराष्ट्र ७/१२ उतारा (मराठी)' : 'Maharashtra 7/12 RoR (Marathi)'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLoad('ferfar')}
              className="text-xs px-2.5 py-1 rounded bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-medium"
            >
              {currentLang === 'mr' ? 'फेरफार नोंदवही (मराठी)' : 'Mutation Register (Ferfar)'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLoad('khasra')}
              className="text-xs px-2.5 py-1 rounded bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-800 font-medium"
            >
              {currentLang === 'mr' ? 'यूपी खसरा-खतौनी (हिन्दी)' : 'UP Khasra-Khatauni (Hindi)'}
            </button>
          </div>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition bg-slate-50/50">
            <input
              type="file"
              id="file-upload"
              accept=".png,.jpg,.jpeg,.svg,.pdf,.tiff"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
              {file ? (
                <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{file.name}</span>
                  <span className="text-slate-400 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-800">
                    {currentLang === 'mr'
                      ? 'स्कॅन केलेला भू-अभिलेख येथे ड्रॅग करा किंवा फाइल निवडण्यासाठी क्लिक करा'
                      : currentLang === 'hi'
                      ? 'स्कैन किया गया भू-अभिलेख यहाँ ड्रैग करें या फाइल चुनें'
                      : 'Click to browse or drag and drop scanned land record'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {currentLang === 'mr'
                      ? 'PNG, JPG, SVG, PDF स्वरूप (कमाल मर्यादा २५ MB)'
                      : 'Supports high-resolution PNG, JPG, SVG, PDF up to 25MB'}
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('state')}</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                <option value="Gujarat">Gujarat (गुजरात)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('district')}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('tehsil')}</label>
              <input
                type="text"
                value={tehsil}
                onChange={(e) => setTehsil(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('village')}</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {currentLang === 'mr' ? 'दस्तऐवज प्रकार' : currentLang === 'hi' ? 'दस्तावेज़ वर्गीकरण' : 'Document Classification'}
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white"
              >
                <option value="Record of Rights">
                  {currentLang === 'mr' ? 'अधिकार अभिलेख (७/१२ उतारा)' : 'Record of Rights (7/12, RoR)'}
                </option>
                <option value="Mutation Register">
                  {currentLang === 'mr' ? 'फेरफार नोंदवही (गाव नमुना ६-ड)' : 'Mutation Register (Ferfar Nond)'}
                </option>
                <option value="Land Register">
                  {currentLang === 'mr' ? 'खाते नोंदवही (८-अ / खतौनी)' : 'Land Register / Khasra-Khatauni'}
                </option>
                <option value="Sale Deed">
                  {currentLang === 'mr' ? 'खरेदीखत / विक्री दस्ताऐवज' : 'Sale Deed / Registered Conveyance'}
                </option>
                <option value="Cadastral Map">
                  {currentLang === 'mr' ? 'भू-नकाशा / गाव नकाशा' : 'Cadastral Map Sheet'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {currentLang === 'mr' ? 'मूळ भाषा' : currentLang === 'hi' ? 'मूल भाषा' : 'Source Language'}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-md p-2 bg-white font-medium"
              >
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="English">English</option>
                <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              </select>
            </div>
          </div>

          {/* Auto Process toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="auto-proc"
              checked={autoProcess}
              onChange={(e) => setAutoProcess(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="auto-proc" className="text-xs font-medium text-slate-700 cursor-pointer">
              {currentLang === 'mr'
                ? 'अपलोडनंतर लगेच जेमिनी OCR व महसूल नियम तपासणी सुरू करा'
                : currentLang === 'hi'
                ? 'अपलोड के तुरंत बाद जेमिनी OCR व नियम सत्यापन चलाएं'
                : 'Instantly run Gemini multimodal OCR, validation rules & confidence routing'}
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition"
            >
              {currentLang === 'mr' ? 'रद्द करा' : currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition disabled:opacity-50"
            >
              {uploading
                ? (currentLang === 'mr' ? 'अपलोड व प्रक्रिया सुरू...' : 'Uploading & Processing...')
                : (currentLang === 'mr' ? 'कागदपत्र अपलोड करा' : currentLang === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'Upload Document')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
