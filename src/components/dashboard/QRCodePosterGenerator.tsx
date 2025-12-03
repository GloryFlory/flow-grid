'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Image as ImageIcon, FileText, Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import FontPicker from '@/components/FontPicker';

interface QRCodePosterGeneratorProps {
  festivalName: string;
  festivalSlug: string;
  festivalId: string;
  festivalDates?: string;
  logoUrl?: string;
  isPremium?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  headerFont?: string | null;
}

export default function QRCodePosterGenerator({
  festivalName,
  festivalSlug,
  festivalId,
  festivalDates,
  logoUrl,
  isPremium = false,
  primaryColor = '#4a90e2',
  secondaryColor = '#7b68ee',
  accentColor = '#ff6b6b',
  headerFont = null,
}: QRCodePosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [customPrimaryColor, setCustomPrimaryColor] = useState(primaryColor);
  const [customSecondaryColor, setCustomSecondaryColor] = useState(secondaryColor);
  const [customAccentColor, setCustomAccentColor] = useState(accentColor);
  const [posterFont, setPosterFont] = useState<string | null>(headerFont);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [hideWatermark, setHideWatermark] = useState(false);

  // Sync posterFont with headerFont prop when it changes (e.g., async loading)
  useEffect(() => {
    // If headerFont is set from props and posterFont hasn't been manually changed
    if (headerFont) {
      setPosterFont(headerFont);
    }
  }, [headerFont]);

  const scheduleUrl = `https://tryflowgrid.com/${festivalSlug}/schedule`;

  // Extract font name from FontPicker value
  const getFontName = (fontValue: string | null): string => {
    if (!fontValue) return '';
    if (fontValue.startsWith('var(')) {
      // Extract name from var(--font-name)
      const match = fontValue.match(/var\(--font-([^)]+)\)/);
      return match ? match[1].replace(/-/g, ' ') : '';
    }
    if (fontValue.startsWith('custom:')) {
      // Extract name from custom:FontName|url or custom:FontName
      const customPart = fontValue.replace('custom:', '');
      return customPart.split('|')[0];
    }
    return fontValue; // Google Font name
  };

  // Convert FontPicker value to CSS font-family
  const getFontFamily = (fontValue: string | null): string => {
    if (!fontValue) return 'var(--font-domine), serif';
    if (fontValue.startsWith('var(')) return fontValue;
    if (fontValue.startsWith('custom:')) {
      // Extract just the font name from custom:FontName|url
      const customPart = fontValue.replace('custom:', '');
      const fontName = customPart.split('|')[0];
      return `"${fontName}", serif`;
    }
    return `"${fontValue}", serif`;
  };

  // Load Google Font dynamically
  useEffect(() => {
    if (!posterFont) {
      setFontLoaded(true);
      return;
    }
    
    // Skip if it's a preset font (var(--font-xxx)) - already loaded
    if (posterFont.startsWith('var(')) {
      setFontLoaded(true);
      return;
    }
    
    // Handle custom fonts with URL
    if (posterFont.startsWith('custom:') && posterFont.includes('|')) {
      const [, rest] = posterFont.split('custom:');
      const [fontName, fontUrl] = rest.split('|');
      if (fontUrl) {
        setFontLoaded(false);
        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        fontFace.load().then(loadedFont => {
          document.fonts.add(loadedFont);
          setFontLoaded(true);
        }).catch(err => {
          console.error('Failed to load custom font:', err);
          setFontLoaded(true);
        });
      } else {
        setFontLoaded(true);
      }
      return;
    }
    
    // Handle custom fonts without URL (legacy)
    if (posterFont.startsWith('custom:')) {
      setFontLoaded(true);
      return;
    }
    
    // Load Google Font
    setFontLoaded(false);
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(posterFont)}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    link.onload = () => setFontLoaded(true);
    link.onerror = () => setFontLoaded(true);
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [posterFont]);

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

        {/* Font Chooser - Pro Feature */}
        <div className="py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700">Poster Font</span>
            {!fontLoaded && <span className="text-xs text-orange-500">(Loading...)</span>}
            {isPremium ? (
              <span className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full">Pro</span>
            ) : (
              <Link href="/pricing" className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                <Lock className="w-3 h-3" />
                Pro Feature
              </Link>
            )}
          </div>
          {isPremium ? (
            <FontPicker
              value={posterFont || ''}
              onChange={setPosterFont}
              festivalId={festivalId}
            />
          ) : (
            <div className="p-3 bg-white border border-gray-200 rounded-lg opacity-60">
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4" />
                <span className="text-sm">200+ Google Fonts available with Pro</span>
              </div>
            </div>
          )}
        </div>

        {/* Remove Watermark Toggle - Pro Feature */}
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Remove "Powered by Flow Grid"</span>
            {isPremium && (
              <span className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full">Pro</span>
            )}
          </div>
          {isPremium ? (
            <button
              onClick={() => setHideWatermark(!hideWatermark)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hideWatermark ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hideWatermark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          ) : (
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700">
              <Lock className="w-4 h-4" />
              Upgrade
            </Link>
          )}
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
                  fontFamily: getFontFamily(posterFont),
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  lineHeight: '1.2',
                  fontSize: '48px',
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

            {/* Footer - Powered by Flow Grid - with logo and frame (hidden for Pro with toggle) */}
            {/* Always reserve space to prevent layout shift */}
            <div className="w-full flex justify-center items-center" style={{ minHeight: '40px' }}>
              {!(isPremium && hideWatermark) && (
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
              )}
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
