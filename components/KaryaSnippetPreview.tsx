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
  if (searchQuery.trim() && isMatchedInContent && snippet) {
    return (
      <div className="my-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D9]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] mb-1 uppercase tracking-wider">
          <Quote className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Ditemukan dalam bait teks:</span>
        </div>
        <p className="text-[#242120] leading-relaxed font-serif text-base italic line-clamp-2 whitespace-pre-line">
          &ldquo;
          <HighlightText text={snippet} query={searchQuery} />
          &rdquo;
        </p>
      </div>
    );
  }

  const cleanText = stripHtmlPreserveBreaks(isiTulisan);
  const normalizedCategory = (kategori || '').toLowerCase().trim();

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
      <div className="my-3 pl-4 border-l-2 border-[#C85A32]/50 py-0.5">
        <div className="font-serif text-[#242120] text-base sm:text-[17px] leading-relaxed italic space-y-1">
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
            <p className="text-xs text-[#5C544F] not-italic pt-1">
              &hellip; (baca selengkapnya untuk bait utuh)
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
    <div className="my-3 text-base sm:text-[17px] leading-relaxed text-[#383330] font-serif italic line-clamp-3">
      {searchQuery.trim() ? (
        <HighlightText text={firstParagraph} query={searchQuery} />
      ) : (
        firstParagraph
      )}
    </div>
  );
}
