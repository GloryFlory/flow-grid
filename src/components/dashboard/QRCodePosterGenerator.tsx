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
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function QRCodePosterGenerator({
  festivalName,
  festivalSlug,
  festivalDates,
  logoUrl,
  isPremium = false,
  primaryColor = '#4a90e2',
  secondaryColor = '#7b68ee',
  accentColor = '#ff6b6b',
}: QRCodePosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [customPrimaryColor, setCustomPrimaryColor] = useState(primaryColor);
  const [customSecondaryColor, setCustomSecondaryColor] = useState(secondaryColor);
  const [customAccentColor, setCustomAccentColor] = useState(accentColor);
  const [selectedFont, setSelectedFont] = useState('modern');

  const scheduleUrl = `https://tryflowgrid.com/${festivalSlug}/schedule`;

  const fontOptions = [
    { value: 'modern', label: 'Modern', font: 'var(--font-domine), serif', weight: 700, size: '48px', transform: 'uppercase' as const },
    { value: 'bold', label: 'Bold', font: 'var(--font-space-grotesk), sans-serif', weight: 700, size: '48px', transform: 'uppercase' as const },
    { value: 'futuristic', label: 'Futuristic', font: 'var(--font-metamorphous), cursive', weight: 400, size: '48px', transform: 'uppercase' as const },
    { value: 'playful', label: 'Playful', font: 'var(--font-henny-penny), cursive', weight: 400, size: '48px', transform: 'uppercase' as const },
    { value: 'handwritten', label: 'Handwritten', font: 'var(--font-italianno), cursive', weight: 400, size: '64px', transform: 'capitalize' as const },
  ];

  const currentFont = fontOptions.find(f => f.value === selectedFont) || fontOptions[0];

  // Proxy logo URL to avoid CORS issues with html2canvas
  const proxiedLogoUrl = logoUrl && logoUrl.startsWith('http') 
    ? `/api/proxy-image?url=${encodeURIComponent(logoUrl)}`
    : logoUrl;

  // Helper function to convert image URL to base64
  const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return '';
    }
  };

  const exportAsPNG = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);

    try {
      // Wait a bit for images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(posterRef.current, {
        scale: 3, // High DPI for printing (300 DPI equivalent)
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true, // Enable CORS for external images
        allowTaint: false,
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
      // Wait a bit for images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true, // Enable CORS for external images
        allowTaint: false,
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
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Printable QR Code Poster
          </h3>
          <p className="text-sm text-gray-600">
            High-resolution A4 poster for printing (8.3" × 11.7")
          </p>
        </div>

        {/* Color Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Border:
            </label>
            <input
              type="color"
              value={customPrimaryColor}
              onChange={(e) => setCustomPrimaryColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Background:
            </label>
            <input
              type="color"
              value={customSecondaryColor}
              onChange={(e) => setCustomSecondaryColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Text:
            </label>
            <input
              type="color"
              value={customAccentColor}
              onChange={(e) => setCustomAccentColor(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
          </div>
        </div>

        {/* Font Chooser */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Font Style:
          </label>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Poster Preview */}
      <div className="flex justify-center bg-gray-100 p-8 rounded-lg">
        <div
          ref={posterRef}
          className="relative shadow-2xl"
          style={{
            width: '595px', // A4 width at 72 DPI
            height: '842px', // A4 height at 72 DPI
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Solid Background Color */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: customSecondaryColor,
            }}
          />

          {/* Bold Border Frame */}
          <div
            className="absolute inset-0 m-8"
            style={{
              border: `12px solid ${customPrimaryColor}`,
              borderRadius: '8px',
            }}
          />

          {/* Content Container */}
          <div className="absolute inset-0 m-8 p-12 flex flex-col items-center justify-between">
            {/* Logo Section - 20% of A4 height */}
            {proxiedLogoUrl && (
              <div className="flex justify-center">
                <img
                  src={proxiedLogoUrl}
                  alt={`${festivalName} logo`}
                  className="object-contain filter drop-shadow-lg"
                  style={{ maxHeight: '168px', width: 'auto' }}
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Main CTA - Centered between logo and QR */}
            <div className="text-center flex-shrink-0">
              <div
                className="tracking-wider"
                style={{
                  color: customAccentColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontFamily: currentFont.font,
                  fontWeight: currentFont.weight,
                  letterSpacing: '0.08em',
                  lineHeight: '1.2',
                  fontSize: currentFont.size,
                  textTransform: currentFont.transform,
                }}
              >
                Check the
                <br />
                Schedule
              </div>
            </div>

              {/* QR Code - 20% of A4 height, same as logo */}
              <div className="flex justify-center">
                <div
                  className="p-4 bg-white rounded-lg"
                  style={{
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <QRCodeSVG
                    value={scheduleUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>
              </div>

            {/* Footer - Powered by Flow Grid - with logo and frame */}
            <div className="w-full flex justify-center items-center">
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  border: `2px solid ${customPrimaryColor}`,
                  backgroundColor: 'rgb(255, 255, 255)',
                  boxShadow: 'none',
                  opacity: 1,
                }}
              >
                <span className="text-xs font-medium" style={{ color: '#374151' }}>
                  Powered by
                </span>
                <img
                  src="/flow-grid-logo.png"
                  alt="Flow Grid"
                  className="h-6 object-contain"
                  style={{ opacity: 1 }}
                  crossOrigin="anonymous"
                />
                <span className="text-sm font-bold" style={{ color: '#1f2937' }}>
                  Flow Grid
                </span>
              </div>
            </div>
          </div>
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

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span> Printing Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Download as PDF for best print quality</li>
          <li>• Print on A4 paper (8.3" × 11.7") or US Letter</li>
          <li>• Use high-quality color printing for vibrant results</li>
          <li>• Place at entrance, registration desk, or around your venue</li>
          <li>• Test QR code with your phone before printing large quantities</li>
        </ul>
      </div>
    </div>
  );
}
