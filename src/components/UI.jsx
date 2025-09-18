import React, { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import { PDFtoIMG } from "../utils/pdfUtils";

export const pageAtom = atom(0);

export const UI = ({ onPagesChange }) => {
  const [page, setPage] = useAtom(pageAtom);
  const [pdfImages, setPdfImages] = useState([]);

  // Create pages array based on pdfImages
  const pages = React.useMemo(() => {
    if (pdfImages.length === 0) return [];

    const pagesArray = [
      {
        front: "book-cover",
        back: pdfImages[0],
      },
    ];

    for (let i = 1; i < pdfImages.length - 1; i += 2) {
      pagesArray.push({
        front: pdfImages[i % pdfImages.length],
        back: pdfImages[(i + 1) % pdfImages.length],
      });
    }

    pagesArray.push({
      front: pdfImages[pdfImages.length - 1],
      back: "book-back",
    });

    return pagesArray;
  }, [pdfImages]);

  // Update parent component when pages change
  React.useEffect(() => {
    if (onPagesChange) {
      onPagesChange(pages);
    }
  }, [pages, onPagesChange]);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch((error) => {
      // Silently handle the error - audio will play on subsequent user interactions
    });
  }, [page]);

  // Process PDF to images on component mount
  useEffect(() => {
    const processPDF = async () => {
      try {
        const pages = await PDFtoIMG("/files/test-file.pdf");
        const images = pages.map((page) => page.dataUrl);
        setPdfImages(images);
        // console.log("PDF converted to images:", images);
        // console.log("Number of pages:", images.length);
      } catch (error) {
        console.error("Error processing PDF:", error);
      }
    };

    processPDF();
  }, []);

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-end flex-col">
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
                  {index === 0 ? "Cover" : `Page ${index}`}
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
      </main>

      <div className="fixed items-center select-none w-full text-center">
        <h1 className="shrink-0 text-white text-5xl lg:text-9xl font-poppins font-semibold pt-4">
          Your Flipbook Title
        </h1>
      </div>
    </>
  );
};
