'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { HighlightText, stripHtmlPreserveBreaks } from '../lib/search-utils';

interface KaryaSnippetPreviewProps {
  isiTulisan: string;
  kategori: string;
  searchQuery?: string;
  isMatchedInContent?: boolean;
  snippet?: string;
  maxPoemLines?: number;
}

export default function KaryaSnippetPreview({
  isiTulisan,
  kategori,
  searchQuery = '',
  isMatchedInContent = false,
  snippet = '',
  maxPoemLines = 3,
}: KaryaSnippetPreviewProps) {
  // Jika pencarian cocok di tengah teks, tampilkan potongan kalimat relevan
  if (searchQuery.trim() && isMatchedInContent && snippet) {
    return (
      <div className="my-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DED6]">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#C85A32] mb-1 uppercase tracking-wider">
          <Quote className="w-3 h-3 text-[#C85A32]" />
          Ditemukan dalam bait teks:
        </div>
        <p className="text-[#2C2A29] leading-relaxed font-serif text-sm italic line-clamp-2 whitespace-pre-line">
          &ldquo;
          <HighlightText text={snippet} query={searchQuery} />
          &rdquo;
        </p>
      </div>
    );
  }

  const cleanText = stripHtmlPreserveBreaks(isiTulisan);
  const normalizedCategory = (kategori || '').toLowerCase().trim();

  // Deteksi apakah karya berformat sajak/puisi/pantun
  const hasVerseLines = cleanText.includes('\n');
  const isPoeticCategory =
    normalizedCategory === 'puisi' ||
    normalizedCategory === 'pantun' ||
    normalizedCategory.includes('syair') ||
    normalizedCategory.includes('sajak') ||
    (hasVerseLines &&
      !normalizedCategory.includes('cerpen') &&
      !normalizedCategory.includes('novel') &&
      !normalizedCategory.includes('cerbung') &&
      !normalizedCategory.includes('cerita') &&
      !normalizedCategory.includes('catatan'));

  if (isPoeticCategory) {
    const stanzas = cleanText
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const firstStanza = stanzas[0] || cleanText;
    const allLines = firstStanza
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const previewLines = allLines.slice(0, maxPoemLines);
    const hasMore = allLines.length > maxPoemLines || stanzas.length > 1;

    return (
      <div className="my-2 pl-3.5 border-l-2 border-[#C85A32]/60 py-0.5">
        <div className="font-serif text-[#2C2A29] text-sm sm:text-[15px] leading-relaxed italic space-y-0.5">
          {previewLines.map((line, idx) => (
            <p key={idx} className="tracking-normal truncate">
              {searchQuery.trim() ? (
                <HighlightText text={line} query={searchQuery} />
              ) : (
                line
              )}
            </p>
          ))}
          {hasMore && (
            <p className="text-[11px] text-[#6B625D] not-italic pt-0.5">
              &hellip; (baca selengkapnya)
            </p>
          )}
        </div>
      </div>
    );
  }

  // Untuk Cerpen, Novel, Catatan Sastra
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const firstParagraph = paragraphs[0] || cleanText;

  return (
    <div className="my-2 text-sm sm:text-[15px] leading-relaxed text-[#6B625D] font-serif italic line-clamp-2 sm:line-clamp-3">
      {searchQuery.trim() ? (
        <HighlightText text={firstParagraph} query={searchQuery} />
      ) : (
        firstParagraph
      )}
    </div>
  );
}
