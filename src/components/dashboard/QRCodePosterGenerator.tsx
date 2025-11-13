'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Image as ImageIcon, FileText } from 'lucide-react';

interface QRCodePosterGeneratorProps {
  festivalName: string;
  festivalSlug: string;
  festivalDates?: string;
  logoUrl?: string;
  isPremium?: boolean;
  accentColor?: string;
}

export default function QRCodePosterGenerator({
  festivalName,
  festivalSlug,
  festivalDates,
  logoUrl,
  isPremium = false,
  accentColor = '#6366f1', // Default indigo
}: QRCodePosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [customColor, setCustomColor] = useState(accentColor);

  const scheduleUrl = `https://tryflowgrid.com/${festivalSlug}/schedule`;

  const exportAsPNG = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3, // High DPI for printing (300 DPI equivalent)
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `${festivalSlug}-qr-poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`${festivalSlug}-qr-poster.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Printable QR Code Poster
          </h3>
          <p className="text-sm text-gray-600">
            Download and print for entrance, registration desk, or venue signage
          </p>
        </div>

        {isPremium && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Accent Color:
            </label>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Poster Preview */}
      <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
        <div
          ref={posterRef}
          className="bg-white shadow-lg"
          style={{
            width: '420px', // Scaled down A4 (~70% of 595px)
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header Section */}
          <div className="text-center mb-6">
            {logoUrl && (
              <div className="mb-4 flex justify-center">
                <img
                  src={logoUrl}
                  alt={`${festivalName} logo`}
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
            )}

            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: customColor }}
            >
              {festivalName}
            </h1>

            {festivalDates && (
              <p className="text-lg text-gray-600 mb-3">{festivalDates}</p>
            )}

            {/* Decorative border */}
            <div
              className="mx-auto mt-4 mb-4 h-1 w-24"
              style={{ backgroundColor: customColor }}
            />
          </div>

          {/* QR Code Section */}
          <div className="flex justify-center mb-6">
            <div className="border-6 p-4 rounded-lg" style={{ borderColor: customColor }}>
              <QRCodeSVG
                value={scheduleUrl}
                size={200}
                level="H" // High error correction for logo embedding
                includeMargin={false}
                imageSettings={{
                  src: logoUrl && isPremium ? logoUrl : '/flow-grid-logo.png',
                  x: undefined,
                  y: undefined,
                  height: isPremium ? 50 : 45,
                  width: isPremium ? 50 : 45,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-6">
            <p className="text-xl font-semibold text-gray-900">
              Scan for Full Schedule
            </p>
          </div>

          {/* Decorative bottom border */}
          <div
            className="mx-auto h-1 w-24"
            style={{ backgroundColor: customColor }}
          />

          {/* Watermark for free tier */}
          {!isPremium && (
            <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-200 pt-3">
              Powered by <span className="font-semibold">FlowGrid</span> • Event
              Scheduling Made Simple
            </div>
          )}
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={exportAsPNG}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <ImageIcon className="w-5 h-5" />
          {isExporting ? 'Generating...' : 'Download PNG'}
        </button>

        <button
          onClick={exportAsPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <FileText className="w-5 h-5" />
          {isExporting ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Premium Upsell */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 text-center">
          <h4 className="font-semibold text-gray-900 mb-2">
            ✨ Upgrade for Premium QR Posters
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Embed YOUR logo in the QR code • Remove FlowGrid watermark • Custom brand colors • Multiple sizes
          </p>
          <a
            href="/pricing"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Upgrade to Premium
          </a>
        </div>
      )}
    </div>
  );
}
