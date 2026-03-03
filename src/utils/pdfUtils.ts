import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs`;

interface PDFConversionOptions {
  scale?: number;
  maxDimension?: number; // Hard cap on canvas longest side (px) — overrides scale if needed
  useSystemFonts?: boolean;
  maxConcurrentPages?: number;
  onProgress?: (completed: number, total: number) => void;
  enableCaching?: boolean;
}

interface PDFPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

// Simple in-memory cache for converted pages
const pageCache = new Map<string, PDFPage[]>();

/**
 * Converts a single PDF page to image data URL
 * @param doc - PDF document object
 * @param pageNum - Page number to convert
 * @param scale - Scale factor for rendering
 * @returns Promise that resolves to PDFPage object
 */
async function convertPage(
  doc: any,
  pageNum: number,
  scale: number,
  maxDimension: number,
): Promise<PDFPage> {
  const page = await doc.getPage(pageNum);

  // Calculate the scale that fits within maxDimension, then take the smaller
  // of that and the requested scale. This ensures PDFs with large internal
  // page sizes (A3, print-ready, custom) never produce oversized canvases.
  const baseViewport = page.getViewport({ scale: 1.0 });
  const fitScale = Math.min(
    maxDimension / baseViewport.width,
    maxDimension / baseViewport.height,
  );
  const effectiveScale = Math.min(scale, fitScale);

  const viewport = page.getViewport({ scale: effectiveScale });

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

  // WebP offers the best size/quality ratio; falls back to PNG in unsupported environments
  const dataUrl = canvas.toDataURL("image/webp", 0.9);

  return {
    pageNumber: pageNum,
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}

/**
 * Processes pages in batches with concurrency control
 * @param doc - PDF document object
 * @param totalPages - Total number of pages
 * @param scale - Scale factor for rendering
 * @param maxConcurrent - Maximum concurrent page conversions
 * @param onProgress - Progress callback function
 * @returns Promise that resolves to an array of PDFPage objects
 */
async function processPagesInBatches(
  doc: any,
  totalPages: number,
  scale: number,
  maxDimension: number,
  maxConcurrent: number,
  onProgress?: (completed: number, total: number) => void,
): Promise<PDFPage[]> {
  const pages: PDFPage[] = new Array(totalPages);
  let completed = 0;

  // Process pages in batches
  for (let start = 1; start <= totalPages; start += maxConcurrent) {
    const end = Math.min(start + maxConcurrent - 1, totalPages);
    const batchPromises: Promise<void>[] = [];

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const promise = convertPage(doc, pageNum, scale, maxDimension)
        .then((page) => {
          pages[pageNum - 1] = page; // Store in correct position
          completed++;
          onProgress?.(completed, totalPages);
        })
        .catch((error) => {
          console.error(`Error converting page ${pageNum}:`, error);
          throw new Error(
            `Failed to convert page ${pageNum}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
        });

      batchPromises.push(promise);
    }

    // Wait for current batch to complete before starting next batch
    await Promise.all(batchPromises);
  }

  return pages;
}

/**
 * Converts a PDF document to an array of image data URLs
 * @param url - The URL of the PDF file to convert
 * @param options - Configuration options for the conversion
 * @returns Promise that resolves to an array of PDFPage objects
 */
export async function PDFtoIMG(
  url: string,
  options: PDFConversionOptions = {},
): Promise<PDFPage[]> {
  const {
    scale = 2,
    maxDimension = 2048,
    useSystemFonts = true,
    maxConcurrentPages = 3,
    onProgress,
    enableCaching = true,
  } = options;

  try {
    // console.log(`Starting PDF conversion for: ${url}`);

    // Check cache first if enabled
    if (enableCaching) {
      const cacheKey = `${url}_${scale}_${useSystemFonts}`;
      const cachedPages = pageCache.get(cacheKey);
      if (cachedPages) {
        // console.log(`Using cached pages for: ${url}`);
        onProgress?.(cachedPages.length, cachedPages.length);
        return cachedPages;
      }
    }

    // Fetch and load PDF document
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`,
      );
    }

    const pdfBytes = await response.arrayBuffer();
    const doc = await pdfjsLib.getDocument({
      data: new Uint8Array(pdfBytes),
      useSystemFonts,
    }).promise;

    // console.log(`PDF loaded successfully. Pages: ${doc.numPages}`);

    // Convert pages in parallel batches

    const pages = await processPagesInBatches(
      doc,
      doc.numPages,
      scale,
      maxDimension,
      maxConcurrentPages,
      onProgress,
    );

    // Cache the results if enabled
    if (enableCaching) {
      const cacheKey = `${url}_${scale}_${useSystemFonts}`;
      pageCache.set(cacheKey, pages);
    }

    // console.log(`PDF conversion completed. ${pages.length} pages converted.`);
    return pages;
  } catch (error) {
    console.error("PDF conversion failed:", error);
    throw new Error(
      `PDF conversion failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Clears the page cache to free up memory
 */
export function clearPageCache(): void {
  pageCache.clear();
  // console.log("Page cache cleared");
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: pageCache.size,
    keys: Array.from(pageCache.keys()),
  };
}
