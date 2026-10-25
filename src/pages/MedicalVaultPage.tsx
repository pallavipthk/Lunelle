import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  Trash2, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  Eye,
  Lock
} from 'lucide-react';
import { api } from '../api';
import { VaultDocument } from '../types';
import { useNotifications } from '../context/NotificationContext';

export const MedicalVaultPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Upload fields
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'Lab Report' | 'Prescription' | 'Doctor Note' | 'Scan / Imaging' | 'Insurance' | 'Other'>('Prescription');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docNotes, setDocNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVaultFiles();
      setDocuments(res.files || []);
    } catch (err) {
      console.error('Failed to load vault files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      showToast('info', 'File Required', 'Please select a document or image to store.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document', fileToUpload);
      formData.append('title', docTitle.trim() || fileToUpload.name);
      formData.append('category', docCategory);
      formData.append('document_date', docDate);
      formData.append('notes', docNotes);

      await api.uploadVaultDocument(formData);
      showToast('success', 'Document Secured', 'File uploaded into your private medical vault.');
      setIsUploading(false);
      setFileToUpload(null);
      setDocTitle('');
      setDocNotes('');
      loadVault();
    } catch (err: any) {
      showToast('error', 'Upload Error', err.message || 'Failed to upload document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove "${title}" from your vault?`)) return;
    try {
      await api.deleteVaultDocument(id);
      showToast('success', 'Deleted', 'Document deleted.');
      loadVault();
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete file.');
    }
  };

  const filtered = documents.filter(doc => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.file_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-soft">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
            Private Medical Vault
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
            Encrypted private file manager for prescriptions, scans, ultrasound reports, and records.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(!isUploading)}
          className="flex items-center gap-2 px-4 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Cancel' : 'Upload Document'}</span>
        </button>
      </div>

      {/* Upload Form */}
      {isUploading && (
        <form onSubmit={handleUploadSubmit} className="p-6 rounded-card bg-white border border-border-soft shadow-soft space-y-4 max-w-xl">
          <h3 className="font-serif text-base font-bold text-deep-sage">
            Add Document to Medical Vault
          </h3>

          <div className="border-2 border-dashed border-border-soft rounded-2xl p-6 text-center hover:bg-[#FAF8F2]">
            <Lock className="w-8 h-8 text-botanical-green mx-auto mb-2" />
            <p className="text-xs font-semibold text-text-primary">
              Select PDF, Imaging Scan, or Prescription Image
            </p>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
              onChange={e => setFileToUpload(e.target.files?.[0] || null)}
              className="mt-3 text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-4 file:rounded-pill file:border-0 file:text-xs file:font-semibold file:bg-pale-sage file:text-deep-sage"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                placeholder="e.g. Thyroid Ultrasound Scan, Gynecologist Prescription"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Category
              </label>
              <select
                value={docCategory}
                onChange={e => setDocCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Scan / Imaging">Scan / Ultrasound</option>
                <option value="Doctor Note">Doctor Consultation Note</option>
                <option value="Insurance">Insurance / Bill</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Document Date
              </label>
              <input
                type="date"
                value={docDate}
                onChange={e => setDocDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={docNotes}
                onChange={e => setDocNotes(e.target.value)}
                placeholder="e.g. Prescribed after annual checkup"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Securing File...' : 'Upload & Secure'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-card border border-border-soft shadow-soft">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vault documents..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Prescription', 'Lab Report', 'Scan / Imaging', 'Doctor Note'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-pill whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-pale-sage text-deep-sage font-bold border border-botanical-green/40'
                  : 'bg-[#FAF8F2] text-text-secondary border border-border-soft'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-card bg-white border border-border-soft text-center shadow-soft">
          <ShieldCheck className="w-10 h-10 text-botanical-green mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-base font-bold text-deep-sage mb-1">
            Vault is empty
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Upload scans, prescriptions, or clinical summaries for secure, private safekeeping.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-card bg-white border border-border-soft shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pale-sage text-deep-sage font-semibold uppercase tracking-wider">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono">
                    {doc.document_date}
                  </span>
                </div>

                <h3 className="font-serif text-sm font-bold text-deep-sage mb-1 truncate">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-text-secondary truncate">
                  {doc.file_name} ({(doc.file_size / 1024).toFixed(1)} KB)
                </p>

                {doc.notes && (
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2 italic">
                    "{doc.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between">
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-deep-sage font-semibold hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview / Open</span>
                </a>

                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="text-text-secondary hover:text-red-700 p-1"
                  title="Delete document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
