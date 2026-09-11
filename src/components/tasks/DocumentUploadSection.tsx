import React, { useState, useRef } from 'react';
import { TaskAttachment, DocumentCategory } from '../../types';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

interface DocumentUploadSectionProps {
  attachments: TaskAttachment[];
  onChange: (attachments: TaskAttachment[]) => void;
  currentUserName?: string;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  attachments,
  onChange,
  currentUserName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const inferCategory = (fileName: string): DocumentCategory => {
    const lower = fileName.toLowerCase();
    if (lower.includes('prd') || lower.includes('product-requirement') || lower.includes('product_req')) {
      return 'PRD';
    }
    if (lower.includes('frd') || lower.includes('functional-requirement') || lower.includes('functional_spec')) {
      return 'FRD';
    }
    if (lower.includes('spec') || lower.includes('technical') || lower.includes('architecture') || lower.includes('api')) {
      return 'TECH_SPEC';
    }
    if (lower.includes('design') || lower.includes('wireframe') || lower.includes('mockup') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.svg')) {
      return 'DESIGN';
    }
    return 'PRD';
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const newAttachments: TaskAttachment[] = [];
    const maxSizeBytes = 2.5 * 1024 * 1024; // 2.5 MB per file for safe browser storage

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        setUploadError(`File "${file.name}" exceeds the 2.5MB limit. Please attach smaller files or link external documents.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const attachment: TaskAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          category: inferCategory(file.name),
          dataUrl,
          uploadedAt: new Date().toISOString(),
          uploadedByName: currentUserName || 'System User',
        };

        onChange([...attachments, attachment]);
      };
      reader.onerror = () => {
        setUploadError(`Failed to read file "${file.name}". Please try again.`);
      };
      reader.readAsDataURL(file);
    });

    // Reset native input so the user can re-select the same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const handleCategoryChange = (id: string, newCategory: DocumentCategory) => {
    onChange(
      attachments.map((a) => (a.id === id ? { ...a, category: newCategory } : a))
    );
  };

  const addSamplePrd = () => {
    const samplePrdContent = `# Product Requirements Document (PRD)\n## Feature: RBAC Authorization & Service Isolation\n**Author:** Sarah Chen (Product Operations)\n**Date:** September 2026\n\n### 1. Objective & Scope\nImplement robust role-based access control (RBAC) ensuring that Admins, Managers, and Employees have strictly bounded access to project deliverables and operational KPIs.\n\n### 2. User Personas\n- **Admin:** Complete company visibility, team user creation, PIN resets, and audit log exports.\n- **Manager:** Team task assignments, workload balancing, blocker escalation reviews.\n- **Employee:** Direct assignment execution, blocker flagging, and daily progress reporting.\n\n### 3. Acceptance Criteria\n- Every task must have exactly one owner.\n- Single-action operational accountability enforced.\n- Zero unhandled exceptions during deadline transitions.`;

    const blob = new Blob([samplePrdContent], { type: 'text/markdown' });
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: TaskAttachment = {
        id: `att-prd-${Date.now()}`,
        name: 'GNT_Core_Security_PRD_v2.1.md',
        size: blob.size,
        type: 'text/markdown',
        category: 'PRD',
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
        uploadedByName: currentUserName || 'Product Team',
      };
      onChange([...attachments, attachment]);
    };
    reader.readAsDataURL(blob);
  };

  const addSampleFrd = () => {
    const sampleFrdContent = `# Functional Requirements Document (FRD)\n## Feature: Multi-Currency Settlement & Ledger Sync\n**Technical Architect:** Marcus Vance\n**Module:** Apex Banking Core\n\n### 1. Functional Specifications\n- REST API Endpoint: POST /api/v1/settlements/reconcile\n- Payload: { currency: "JPY", batchId: "TX-20260904", threshold: 0.0001 }\n- Audit Log: Every delta greater than 0.01 JPY automatically notifies the Lead Manager.\n\n### 2. SLA & Constraints\n- P99 Response Time: < 350ms\n- Idempotency: Supported via UUID idempotency keys\n- Retry Strategy: Exponential backoff with 3 maximum attempts.`;

    const blob = new Blob([sampleFrdContent], { type: 'text/markdown' });
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: TaskAttachment = {
        id: `att-frd-${Date.now()}`,
        name: 'Apex_Ledger_Settlement_FRD_v1.4.docx',
        size: blob.size,
        type: 'text/markdown',
        category: 'FRD',
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
        uploadedByName: currentUserName || 'Architecture Lead',
      };
      onChange([...attachments, attachment]);
    };
    reader.readAsDataURL(blob);
  };

  const getFileIcon = (fileName: string, category: DocumentCategory) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg') return <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />;
    if (category === 'PRD') return <FileCheck className="w-4 h-4 text-indigo-600 shrink-0" />;
    if (category === 'FRD') return <FileCode className="w-4 h-4 text-blue-600 shrink-0" />;
    return <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  const getCategoryBadgeClass = (cat: DocumentCategory) => {
    switch (cat) {
      case 'PRD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FRD':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TECH_SPEC':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DESIGN':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="section-task-document-upload" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-slate-700 text-xs">
            Requirements & Specification Documents (PRD / FRD)
          </label>
          <p className="text-[11px] text-slate-500">
            Attach PRD, FRD, architecture specs, or acceptance guidelines for the task owner
          </p>
        </div>

        {/* Quick Sample Attachments */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={addSamplePrd}
            className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200/80 transition-colors flex items-center gap-1 cursor-pointer"
            title="Attach pre-structured PRD document"
          >
            <Plus className="w-3 h-3" />
            <span>+ Sample PRD</span>
          </button>
          <button
            type="button"
            onClick={addSampleFrd}
            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200/80 transition-colors flex items-center gap-1 cursor-pointer"
            title="Attach pre-structured FRD document"
          >
            <Plus className="w-3 h-3" />
            <span>+ Sample FRD</span>
          </button>
        </div>
      </div>

      {/* Hidden native input supporting click selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.md,.markdown,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.zip"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        id="task-file-input"
      />

      {/* Drag & Drop Area */}
      <div
        id="task-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.005]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-0.5">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            <span className="text-blue-600 hover:underline">Click to browse files</span> or drag and drop PRD / FRD here
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Supports PDF, DOCX, Markdown (.md), Text (.txt), Excel (.xlsx), PNG up to 20MB
          </p>
        </div>
      </div>

      {uploadError && (
        <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
      )}

      {/* Uploaded Documents List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
            <span>Attached Documents ({attachments.length})</span>
            <span className="text-[10px] text-slate-400">Classify as PRD, FRD, or Tech Spec</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {attachments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {getFileIcon(doc.name, doc.category)}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 truncate max-w-xs sm:max-w-sm" title={doc.name}>
                        {doc.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        ({formatFileSize(doc.size)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">
                        Uploaded by {doc.uploadedByName || 'User'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Selector & Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <select
                    value={doc.category}
                    onChange={(e) => handleCategoryChange(doc.id, e.target.value as DocumentCategory)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-hidden ${getCategoryBadgeClass(
                      doc.category
                    )}`}
                    title="Change document category"
                  >
                    <option value="PRD">PRD</option>
                    <option value="FRD">FRD</option>
                    <option value="TECH_SPEC">Tech Spec</option>
                    <option value="DESIGN">Design</option>
                    <option value="OTHER">General</option>
                  </select>

                  {doc.dataUrl && (
                    <a
                      href={doc.dataUrl}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Preview or Download document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remove document"
                    aria-label={`Remove ${doc.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
