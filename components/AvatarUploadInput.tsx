'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';

interface AvatarUploadInputProps {
  defaultUrl?: string;
  nama?: string;
}

export default function AvatarUploadInput({
  defaultUrl = '',
  nama = 'Penulis',
}: AvatarUploadInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultUrl);
  const [hasNewFile, setHasNewFile] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setHasNewFile(true);
      setIsRemoved(false);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreviewUrl('');
    setHasNewFile(false);
    setIsRemoved(true);
  };

  const initialLetter = (nama || 'P').trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#6B625D] uppercase tracking-wider font-serif">
        Foto Profil Penulis
      </label>

      {/* Hidden file input and removal flag */}
      <input
        ref={fileInputRef}
        type="file"
        name="foto_file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="hidden"
        name="foto_url_existing"
        value={isRemoved ? '' : defaultUrl}
      />
      <input
        type="hidden"
        name="hapus_foto"
        value={isRemoved ? 'true' : 'false'}
      />

      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DED6]">
        {/* Avatar Preview Display */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-[#FFFDF9] border-2 border-[#E8DED6] flex items-center justify-center overflow-hidden shadow-2xs">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`Avatar ${nama}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-2xl font-bold text-[#C85A32]">
                {initialLetter}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleChooseFile}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#C85A32] hover:bg-[#A94728] text-white shadow-sm transition cursor-pointer"
            title="Unggah foto baru"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upload Controls & Instructions */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={handleChooseFile}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFDF9] hover:bg-white text-[#2C2A29] hover:text-[#C85A32] border border-[#E8DED6] hover:border-[#C85A32]/40 rounded-xl text-xs font-medium shadow-2xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{previewUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF9] hover:bg-red-50 text-red-600 border border-[#E8DED6] hover:border-red-200 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-[#6B625D]">
            {hasNewFile
              ? 'Foto baru terpilih dan siap disimpan.'
              : isRemoved
              ? 'Foto profil akan dihapus dan menggunakan inisial nama.'
              : 'Pilih file gambar (JPG, PNG, atau WEBP) dari perangkat Anda.'}
          </p>
        </div>
      </div>
    </div>
  );
}
