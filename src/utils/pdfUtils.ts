import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs`;

interface PDFConversionOptions {
  scale?: number;
  useSystemFonts?: boolean;
}

interface PDFPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Converts a PDF document to an array of image data URLs
 * @param url - The URL of the PDF file to convert
 * @param options - Configuration options for the conversion
 * @returns Promise that resolves to an array of PDFPage objects
 */
export async function PDFtoIMG(
  url: string,
  options: PDFConversionOptions = {}
): Promise<PDFPage[]> {
  const { scale = 2, useSystemFonts = true } = options;

  try {
    console.log(`Starting PDF conversion for: ${url}`);

    // Fetch and load PDF document
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
    }

    const pdfBytes = await response.arrayBuffer();
    const doc = await pdfjsLib.getDocument({
      data: new Uint8Array(pdfBytes),
      useSystemFonts,
    }).promise;

    console.log(`PDF loaded successfully. Pages: ${doc.numPages}`);

    // Convert each page to image
    const pages: PDFPage[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Create canvas for rendering
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error(`Failed to get 2D context for page ${pageNum}`);
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/png", 1.0);

        pages.push({
          pageNumber: pageNum,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });

        console.log(`Page ${pageNum} converted successfully`);
      } catch (pageError) {
        console.error(`Error converting page ${pageNum}:`, pageError);
        throw new Error(
          `Failed to convert page ${pageNum}: ${
            pageError instanceof Error ? pageError.message : "Unknown error"
          }`
        );
      }
    }

    console.log(`PDF conversion completed. ${pages.length} pages converted.`);
    return pages;
  } catch (error) {
    console.error("PDF conversion failed:", error);
    throw new Error(
      `PDF conversion failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
