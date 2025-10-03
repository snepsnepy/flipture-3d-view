import React, { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { PDFtoIMG } from "../utils/pdfUtils";

export const pageAtom = atom(0);
export const scrollProgressAtom = atom(0);
export const pageFocusAtom = atom("right"); // "left" or "right" - which page of the spread is focused

export const UI = ({
  onPagesChange,
  pdfUrl,
  flipbookTitle,
  companyName,
  loading,
  error,
}) => {
  const [page, setPage] = useAtom(pageAtom);
  const [pageFocus, setPageFocus] = useAtom(pageFocusAtom);
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

      {/* Company Name - Top Left Corner */}
      {isFullyLoaded && (
        <div className="fixed md:top-6 md:left-6 top-4 left-1/2 transform -translate-x-1/2 md:translate-x-0 z-40 pointer-events-none">
          <h1 className="font-poppins text-white text-base leading-4 md:text-2xl tracking-wide drop-shadow-lg text-center md:text-left">
            {companyName}
          </h1>
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
        className={`fixed inset-0 flex items-center justify-center select-none text-center flex-col gap-2 ${
          isFullyLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          opacity: isFullyLoaded ? 1 - scrollProgress : 0,
        }}
      >
        {/* FLIPBOOK TITLE */}
        <h1 className="shrink-0 text-white text-4xl leading-3 md:text-[150px] md:leading-[130px] font-delight font-black -tracking-[0.1rem] pt-4 max-w-[380px] md:max-w-4xl mx-auto">
          {flipbookTitle}
        </h1>

        {/* CTA */}
        <div className="mt-4 flex flex-row items-center gap-x-2">
          <p className="text-white text-xs md:text-sm leading-3 font-poppins tracking-wide">
            <span className="md:hidden">Swipe up to start reading</span>
            <span className="hidden md:inline">Scroll up to start reading</span>
          </p>
          <div className="flex flex-row items-center gap-x-2 ">
            <svg
              className="animate-bounce md:hidden"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="#fff"
                d="M5.325 3.95q-.175.625-.25 1.263T5 6.5q0 1.575.45 3.038t1.3 2.762q.2.275.175.6t-.25.55t-.525.2t-.5-.3q-1.05-1.5-1.6-3.25T3.5 6.5q0-.675.075-1.35T3.8 3.8L2.575 5.025q-.225.225-.525.225t-.525-.225T1.3 4.5t.225-.525L3.8 1.7q.3-.3.7-.3t.7.3l2.275 2.275Q7.7 4.2 7.7 4.5t-.225.525t-.525.213t-.525-.213zM16.45 20.825q-.575.2-1.162.188t-1.138-.288L8.5 18.1q-.375-.175-.525-.562T8 16.775l.05-.1q.25-.5.7-.812t1-.363l1.7-.125L8.65 7.7q-.15-.4.025-.763t.575-.512t.762.025t.513.575l3.25 8.925q.175.475-.1.888t-.775.462l-1.175.075L15 18.9q.175.075.375.088t.375-.038l3.925-1.425q.775-.275 1.125-1.038t.075-1.537L19.5 11.2q-.15-.4.025-.763t.575-.512t.762.025t.513.575l1.375 3.75q.575 1.575-.113 3.062T20.375 19.4zm-3-11.675q.4-.15.763.025t.512.575l1.025 2.8q.15.4-.025.775t-.575.525t-.775-.025t-.525-.575l-1-2.825q-.15-.4.025-.763t.575-.512m3.15-.075q.4-.15.763.025t.512.575l.675 1.875q.15.4-.012.763t-.563.512t-.775-.025t-.525-.575L16 10.35q-.15-.4.025-.762t.575-.513m.375 6.05"
              />
            </svg>

            <svg
              className="hidden md:block animate-bounce"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              >
                <path
                  strokeDasharray="20"
                  strokeDashoffset="20"
                  d="M12 21l0 -17.5"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.2s"
                    values="20;0"
                  />
                </path>
                <path
                  strokeDasharray="12"
                  strokeDashoffset="12"
                  d="M12 3l7 7M12 3l-7 7"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.2s"
                    dur="0.2s"
                    values="12;0"
                  />
                </path>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Controls */}
      {isFullyLoaded && (
        <div
          className="md:hidden fixed bottom-8 left-0 right-0 flex justify-center items-center gap-4 px-4 z-20 transition-opacity duration-500"
          style={{
            opacity: scrollProgress, // Show when book is centered (scrollProgress increases)
          }}
        >
          {/* Previous Page Button */}
          <button
            onClick={() => {
              // Check if we're in focus mode and can switch focus instead of turning page
              if (page > 0 && page < pages.length && pageFocus === "right") {
                // Switch focus to left page instead of turning page
                setPageFocus("left");
              } else {
                // Normal previous page behavior
                const newPage = Math.max(0, page - 1);
                setPage(newPage);
                // When going back: cover gets "right", other pages get "right" (to show the last page of the spread)
                setPageFocus(newPage === 0 ? "right" : "right");
              }
            }}
            disabled={page === 0 && pageFocus === "left"}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              page === 0 && pageFocus === "left"
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:scale-95"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Page Indicator */}
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            {page === 0
              ? "Cover"
              : page === pages.length
              ? "Back"
              : `Page ${page}${pageFocus === "right" ? "R" : "L"}`}
          </div>

          {/* Next Page Button */}
          <button
            onClick={() => {
              // Check if we're in focus mode and can switch focus instead of turning page
              if (page > 0 && page < pages.length && pageFocus === "left") {
                // Switch focus to right page instead of turning page
                setPageFocus("right");
              } else {
                // Normal next page behavior
                const newPage = Math.min(pages.length, page + 1);
                setPage(newPage);
                // When opening from cover (page 0 -> 1), start with right focus
                // Otherwise reset to left focus for new spreads
                setPageFocus(page === 0 && newPage === 1 ? "right" : "left");
              }
            }}
            disabled={page === pages.length && pageFocus === "right"}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              page === pages.length && pageFocus === "right"
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:scale-95"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};
