import React, { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { PDFtoIMG } from "../utils/pdfUtils";

export const pageAtom = atom(0);
export const scrollProgressAtom = atom(0);

export const UI = ({
  onPagesChange,
  pdfUrl,
  flipbookTitle,
  loading,
  error,
}) => {
  const [page, setPage] = useAtom(pageAtom);
  const [scrollProgress] = useAtom(scrollProgressAtom);
  const [pdfImages, setPdfImages] = useState([]);
  const [conversionProgress, setConversionProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  // Create pages array based on pdfImages
  const pages = React.useMemo(() => {
    if (pdfImages.length === 0) return [];

    const pagesArray = [
      {
        front: "book-cover",
        back: "blank-page", // Blank page after cover
      },
    ];

    // Handle single page PDF case
    if (pdfImages.length === 1) {
      pagesArray.push({
        front: pdfImages[0],
        back: "book-back", // Single page goes directly to back cover
      });
    } else {
      // Multiple pages case
      pagesArray.push({
        front: pdfImages[0],
        back: pdfImages[1],
      });

      // Start from index 2 since we've already used the first two PDF pages
      for (let i = 2; i < pdfImages.length - 1; i += 2) {
        pagesArray.push({
          front: pdfImages[i],
          back: pdfImages[i + 1] || "blank-page",
        });
      }

      // Add the last page if there's an odd number of PDF pages (and more than 1)
      if (pdfImages.length > 2 && pdfImages.length % 2 === 1) {
        pagesArray.push({
          front: pdfImages[pdfImages.length - 1],
          back: "book-back",
        });
      } else {
        // If even number of pages, add final page with back cover
        pagesArray.push({
          front: "blank-page",
          back: "book-back",
        });
      }
    }

    return pagesArray;
  }, [pdfImages]);

  // Update parent component when pages change
  React.useEffect(() => {
    if (onPagesChange) {
      onPagesChange(pages);
    }
  }, [pages, onPagesChange]);

  // Mark as fully loaded when pages are ready and give a small delay for smooth transition
  React.useEffect(() => {
    if (pages.length > 0 && !isConverting) {
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
      }, 1500); // 1 second delay to ensure everything is ready

      return () => clearTimeout(timer);
    }
  }, [pages.length, isConverting]);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch((error) => {
      // Silently handle the error - audio will play on subsequent user interactions
    });
  }, [page]);

  // Process PDF to images when pdfUrl is available
  useEffect(() => {
    const processPDF = async () => {
      if (!pdfUrl) return;

      try {
        setIsConverting(true);
        setConversionError(null);
        setConversionProgress({ completed: 0, total: 0 });

        const pages = await PDFtoIMG(pdfUrl, {
          onProgress: (completed, total) => {
            setConversionProgress({ completed, total });
          },
          maxConcurrentPages: 3, // Process 3 pages at once
          enableCaching: true, // Cache for faster subsequent loads
        });

        const images = pages.map((page) => page.dataUrl);
        setPdfImages(images);
        setIsConverting(false);
      } catch (error) {
        console.error("Error processing PDF:", error);
        setConversionError(error.message);
        setIsConverting(false);
      }
    };

    // Only process PDF if we have a URL and we're not loading from Supabase
    if (pdfUrl && !loading) {
      processPDF();
    }
  }, [pdfUrl, loading]);

  return (
    <>
      {/* Main Loader - Shows until flipbook is fully ready */}
      {(!isFullyLoaded || loading) && (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0046FF] via-[#001BB7] to-[#000080] flex items-center justify-center z-50">
          <div className="text-center">
            {/* Animated Logo/Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin"></div>
                {/* Inner pulsing circle */}
                <div className="absolute inset-2 border-4 border-white rounded-full animate-pulse"></div>
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>

            {/* Loading Text */}
            <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
              {loading
                ? "Loading Flipbook Data..."
                : isConverting
                ? "Preparing Your Flipbook"
                : "Loading..."}
            </h2>

            {/* Progress Indicator */}
            {isConverting && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-white/80 text-sm mb-2">
                  <span>Converting PDF</span>
                  <span>
                    {conversionProgress.total > 0
                      ? `${conversionProgress.completed}/${conversionProgress.total}`
                      : "Loading..."}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-[#FFCC00] to-purple-400 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width:
                        conversionProgress.total > 0
                          ? `${
                              (conversionProgress.completed /
                                conversionProgress.total) *
                              100
                            }%`
                          : "0%",
                    }}
                  ></div>
                </div>

                <p className="text-white/60 text-sm">
                  {conversionProgress.total > 0
                    ? `${Math.round(
                        (conversionProgress.completed /
                          conversionProgress.total) *
                          100
                      )}% complete`
                    : "Preparing conversion..."}
                </p>
              </div>
            )}

            {/* Loading Animation for when not converting */}
            {!isConverting && pages.length === 0 && (
              <div className="flex justify-center space-x-1">
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            )}

            {/* Final loading state */}
            {!isConverting && pages.length > 0 && (
              <div className="text-white/60 text-sm">
                Finalizing your experience...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {(conversionError || error) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {error ? "Failed to Load Flipbook" : "Conversion Failed"}
            </h3>
            <p className="text-gray-600 mb-6">{error || conversionError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* <main
        className={`pointer-events-none select-none z-10 fixed inset-0 flex justify-end flex-col transition-opacity duration-1000 ${
          isFullyLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-2 sm:gap-4 max-w-full p-4 lg:p-10">
            {pages.length > 0 &&
              [...pages].map((_, index) => (
                <button
                  key={index}
                  className={`whitespace-nowrap py-2 lg:py-3 px-6 lg:px-8 border border-white rounded-full text-white hover:cursor-pointer hover:text-white font-poppins text-base lg:text-lg tracking-wide hover:scale-105 transition-all duration-300 ${
                    index === page
                      ? "bg-white !text-black "
                      : "bg-black/30 text-white"
                  }`}
                  onClick={() => setPage(index)}
                >
                  {index === 0
                    ? "Cover"
                    : index === 1
                    ? "Page 1"
                    : `Page ${index}`}
                </button>
              ))}
            {pages.length > 0 && (
              <button
                className={`whitespace-nowrap py-2 lg:py-3 px-6 lg:px-8 border border-white rounded-full text-white hover:cursor-pointer hover:text-white font-poppins  text-base lg:text-lg tracking-wide hover:scale-105 transition-all duration-300 ${
                  page === pages.length
                    ? "bg-white !text-black "
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(pages.length)}
              >
                Back Cover
              </button>
            )}
          </div>
        </div>
      </main> */}

      <div
        className={`fixed inset-0 flex items-center justify-center select-none text-center ${
          isFullyLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          opacity: isFullyLoaded ? 1 - scrollProgress : 0,
        }}
      >
        <h1 className="shrink-0 text-white text-5xl lg:text-9xl font-poppins font-semibold pt-4 max-w-4xl mx-auto">
          {flipbookTitle}
        </h1>
      </div>
    </>
  );
};
