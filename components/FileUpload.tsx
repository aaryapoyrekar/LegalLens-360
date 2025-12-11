import React, { useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  isProcessing?: boolean;
  label?: string;
  subLabel?: string;
  compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isProcessing, 
  label = "Upload Contract", 
  subLabel = "Drag & drop PDF or Image",
  compact = false
}) => {
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      onFileSelect({
        data: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="w-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <label 
        className={`
          flex flex-col items-center justify-center w-full 
          border-2 border-dashed rounded-2xl cursor-pointer 
          transition-all duration-300 group relative overflow-hidden
          ${compact ? 'h-40' : 'h-64'}
          ${isProcessing 
            ? 'bg-slate-50 border-slate-300 opacity-50 cursor-not-allowed' 
            : 'bg-white border-legal-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 relative z-10">
          <div className={`
            relative rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110
            ${compact ? 'p-2 mb-2' : 'p-4 mb-4'}
          `}>
             <Upload size={compact ? 20 : 32} strokeWidth={2} />
          </div>
          
          <p className={`font-serif text-slate-800 font-medium ${compact ? 'text-base' : 'text-xl mb-1'}`}>
            {label}
          </p>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            {subLabel}
          </p>
          
          {!compact && (
            <div className="flex flex-wrap justify-center gap-2 mt-4 opacity-60">
              <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                <FileText size={10} className="mr-1" /> PDF
              </span>
              <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                <ImageIcon size={10} className="mr-1" /> IMG
              </span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="application/pdf,image/png,image/jpeg,image/webp,image/heic"
          onChange={handleChange}
          disabled={isProcessing}
        />
      </label>
    </div>
  );
};

export default FileUpload;