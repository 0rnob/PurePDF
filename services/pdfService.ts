// This tells TypeScript that global variables from scripts exist.
declare const PDFLib: any;
declare const pdfjsLib: any;
declare const JSZip: any;
import type { EditObject } from '../types';

/** Helper to ensure pdfjs worker is configured */
const ensurePdfjsWorker = () => {
  if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions.workerSrc === '') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

const getPdfDoc = async (file: File, password?: string) => {
  if (!PDFLib) throw new Error("pdf-lib is not loaded.");
  const { PDFDocument } = PDFLib;
  const arrayBuffer = await file.arrayBuffer();
  try {
    // The load function will throw an error for encrypted PDFs if no password is provided,
    // or if the provided password is wrong.
    return await PDFDocument.load(arrayBuffer, { password });
  } catch (e: any) {
    // Catch the specific error and provide a more user-friendly message for tools that don't handle passwords.
    if (e.constructor.name === 'PDFEncryptedError' && !password) {
      throw new Error(`File "${file.name}" is password-protected. Please use the Unlock PDF tool first.`);
    }
    // Re-throw other errors to be handled by the specific tool page.
    throw e;
  }
}

/**
 * Merges an array of PDF files into a single PDF document.
 * @param files An array of File objects, which must be PDFs.
 * @returns A Promise that resolves with a Uint8Array of the merged PDF.
 */
export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const { PDFDocument } = PDFLib;
  const mergedPdfDoc = await PDFDocument.create();

  for (const file of files) {
    const pdfDoc = await getPdfDoc(file);
    const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
  }
  return await mergedPdfDoc.save();
};

/**
 * Splits a PDF into multiple documents.
 * @param file The source PDF file.
 * @param pageIndices An array of 0-based page indices to extract. If undefined, splits all pages.
 * @returns A promise that resolves to an array of objects with filename and PDF bytes.
 */
export const splitPdf = async (file: File, pageIndices?: number[]): Promise<{filename: string, bytes: Uint8Array}[]> => {
  const { PDFDocument } = PDFLib;
  const originalPdfDoc = await getPdfDoc(file);
  const originalName = file.name.replace(/\.pdf$/i, '');
  const results: {filename: string, bytes: Uint8Array}[] = [];

  if (pageIndices && pageIndices.length > 0) {
    // Extract specified pages into a single new PDF
    const newPdfDoc = await PDFDocument.create();
    const copiedPages = await newPdfDoc.copyPages(originalPdfDoc, pageIndices);
    copiedPages.forEach(page => newPdfDoc.addPage(page));
    results.push({
        filename: `${originalName}_extracted.pdf`,
        bytes: await newPdfDoc.save(),
    });
  } else if (!pageIndices) {
     // Split every page into a new PDF
     for (let i = 0; i < originalPdfDoc.getPageCount(); i++) {
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(originalPdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
        results.push({
            filename: `${originalName}_page_${i + 1}.pdf`,
            bytes: await newPdfDoc.save(),
        });
     }
  }
  return results;
}

/**
 * Rotates specified pages in a PDF document.
 * @param file The source PDF file.
 * @param angle The angle of rotation (90, 180, 270).
 * @param pageIndices An array of 0-based page indices to rotate. If undefined, rotates all pages.
 * @returns A Promise that resolves with a Uint8Array of the rotated PDF.
 */
export const rotatePdf = async (file: File, angle: 90 | 180 | 270, pageIndices?: number[]): Promise<Uint8Array> => {
    const { degrees } = PDFLib;
    const pdfDoc = await getPdfDoc(file);
    const pagesToRotate = pageIndices ?? pdfDoc.getPageIndices();

    pagesToRotate.forEach(pageIndex => {
        const page = pdfDoc.getPage(pageIndex);
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + angle) % 360));
    });

    return await pdfDoc.save();
}

/**
 * Converts an array of image files into a single PDF document.
 * @param files An array of image File objects (JPEG or PNG).
 * @returns A Promise that resolves with a Uint8Array of the new PDF.
 */
export const imagesToPdf = async (files: File[]): Promise<Uint8Array> => {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
        const bytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') {
            image = await pdfDoc.embedJpg(bytes);
        } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(bytes);
        } else {
            console.warn(`Unsupported image type: ${file.type}. Skipping.`);
            continue;
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }
    return await pdfDoc.save();
}

export interface PageNumberOptions {
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    start: number;
    size: number;
    pageIndices?: number[];
}

/**
 * Adds page numbers to a PDF document.
 * @param file The source PDF file.
 * @param options Configuration for page numbering.
 * @returns A Promise that resolves with a Uint8Array of the numbered PDF.
 */
export const addPageNumbers = async (file: File, options: PageNumberOptions): Promise<Uint8Array> => {
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await getPdfDoc(file);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const pagesToNumber = options.pageIndices ?? pdfDoc.getPageIndices();

    pagesToNumber.forEach((pageIndex, i) => {
        const page = pages[pageIndex];
        const { width, height } = page.getSize();
        const pageNum = options.start + i;
        const text = `${pageNum}`;
        const textWidth = font.widthOfTextAtSize(text, options.size);
        const margin = 30;

        let x, y;
        if (options.position.includes('left')) x = margin;
        else if (options.position.includes('center')) x = width / 2 - textWidth / 2;
        else x = width - textWidth - margin;

        if (options.position.includes('top')) y = height - options.size - margin;
        else y = margin;

        page.drawText(text, { x, y, size: options.size, font, color: rgb(0, 0, 0) });
    });

    return await pdfDoc.save();
}

import type { WatermarkOptions } from '../types';
/**
 * Adds a text watermark to a PDF.
 */
export const addWatermark = async (file: File, options: WatermarkOptions): Promise<Uint8Array> => {
    const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
    const pdfDoc = await getPdfDoc(file);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const { text, fontSize, color, opacity, position } = options;

    const textColor = {
      r: parseInt(color.slice(1, 3), 16) / 255,
      g: parseInt(color.slice(3, 5), 16) / 255,
      b: parseInt(color.slice(5, 7), 16) / 255,
    };
    
    for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        let x, y, rotate;
        
        if (position === 'center') {
            x = width / 2 - textWidth / 2;
            y = height / 2;
            rotate = degrees(45);
        } else {
             const margin = 20;
             if (position.includes('left')) x = margin;
             if (position.includes('right')) x = width - textWidth - margin;
             if (position.includes('top')) y = height - fontSize - margin;
             if (position.includes('bottom')) y = margin;
             rotate = degrees(0);
        }

        page.drawText(text, {
            x,
            y,
            font,
            size: fontSize,
            color: rgb(textColor.r, textColor.g, textColor.b),
            opacity,
            rotate,
        });
    }

    return await pdfDoc.save();
}

// FIX: Add unlockPdf function to resolve import error in UnlockPdfPage.tsx
/**
 * Unlocks a password-protected PDF.
 * @param file The source PDF file.
 * @param password The password to unlock the PDF.
 * @returns A Promise that resolves with a Uint8Array of the unlocked PDF.
 */
export const unlockPdf = async (file: File, password: string): Promise<Uint8Array> => {
    const pdfDoc = await getPdfDoc(file, password);
    // Saving the document after loading it with the correct password will remove the encryption.
    return await pdfDoc.save();
};

/**
 * Crops pages in a PDF document.
 * @param file The source PDF file.
 * @param cropValues The values (in points) to crop from each side.
 * @returns A Promise that resolves with a Uint8Array of the cropped PDF.
 */
export const cropPdf = async (file: File, cropValues: { top: number, bottom: number, left: number, right: number }): Promise<Uint8Array> => {
    const pdfDoc = await getPdfDoc(file);
    const pages = pdfDoc.getPages();
    const { top, bottom, left, right } = cropValues;

    for (const page of pages) {
        const { width, height } = page.getSize();
        
        const newWidth = width - left - right;
        const newHeight = height - top - bottom;

        if (newWidth <= 0 || newHeight <= 0) {
            throw new Error("Crop values are too large, resulting in a page with no area.");
        }
        
        page.setCropBox(
            left,      // x
            bottom,    // y
            newWidth,  // width
            newHeight, // height
        );
    }
    
    return await pdfDoc.save();
};

/**
 * "Compresses" a PDF by re-saving it with object streams.
 * This can reduce file size by optimizing the PDF structure, but does not re-compress images.
 * @param file The source PDF file.
 * @returns A Promise that resolves with a Uint8Array of the compressed PDF.
 */
export const compressPdf = async (file: File): Promise<Uint8Array> => {
    const pdfDoc = await getPdfDoc(file);
    
    // Using object streams can help reduce file size by grouping objects.
    return await pdfDoc.save({ useObjectStreams: true });
};

/**
 * Renders all pages of a PDF to image data URLs.
 * @param file The PDF file.
 * @returns An array of data URLs for each page.
 */
export const renderPdfToImages = async (file: File): Promise<string[]> => {
    ensurePdfjsWorker();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const images: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg'));
    }
    return images;
};

/**
 * Reorganizes a PDF based on a new page order, rotations, and deletions.
 * @param file The source PDF file.
 * @param newOrder An array of the original 0-based page indices in the new desired order.
 * @param rotations A map of original page index to its new rotation angle.
 * @returns The bytes of the newly organized PDF.
 */
export const organizePdf = async (file: File, newOrder: number[], rotations: Map<number, number>): Promise<Uint8Array> => {
    const { PDFDocument, degrees } = PDFLib;
    const pdfDoc = await getPdfDoc(file);
    const newPdfDoc = await PDFDocument.create();
    
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, newOrder);

    copiedPages.forEach((page, index) => {
        const originalIndex = newOrder[index];
        const rotationAngle = rotations.get(originalIndex);
        if (rotationAngle) {
            page.setRotation(degrees(rotationAngle));
        }
        newPdfDoc.addPage(page);
    });

    return await newPdfDoc.save();
};

/**
 * Creates a ZIP file from multiple image data URLs.
 */
export const createZipFromImages = async (images: {name: string, data: string}[]): Promise<Blob> => {
    if (!JSZip) throw new Error("JSZip is not loaded.");
    const zip = new JSZip();
    for (const image of images) {
        // data is a data URL like "data:image/jpeg;base64,..."
        const base64Data = image.data.split(',')[1];
        zip.file(image.name, base64Data, { base64: true });
    }
    return await zip.generateAsync({ type: 'blob' });
}

/**
 * Applies a comprehensive set of edits to a PDF.
 * @param file The source PDF file.
 * @param newOrder An array of the original 0-based page indices in the new desired order.
 * @param rotations A map of original page index to its new rotation angle.
 * @param edits A map of original page index to an array of EditObjects to be added.
 * @returns The bytes of the newly edited PDF.
 */
export const applyEditsToPdf = async (
    file: File,
    newOrder: number[],
    rotations: Map<number, number>,
    edits: Map<number, EditObject[]>
): Promise<Uint8Array> => {
    const { PDFDocument, degrees, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await getPdfDoc(file);
    const newPdfDoc = await PDFDocument.create();
    const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);

    const copiedPages = await newPdfDoc.copyPages(pdfDoc, newOrder);

    for (let i = 0; i < copiedPages.length; i++) {
        const page = copiedPages[i];
        const originalIndex = newOrder[i];
        
        // Apply rotation
        const rotationAngle = rotations.get(originalIndex);
        if (rotationAngle) {
            page.setRotation(degrees(rotationAngle));
        }
        
        const { width, height } = page.getSize();
        
        // Apply edits
        const pageEdits = edits.get(originalIndex);
        if (pageEdits) {
            for (const edit of pageEdits) {
                // pdf-lib origin is bottom-left, UI is top-left. Convert y-coordinate.
                if (edit.type === 'text') {
                    const y = height - edit.y - edit.fontSize;
                    const color = { r: parseInt(edit.color.slice(1,3), 16)/255, g: parseInt(edit.color.slice(3,5), 16)/255, b: parseInt(edit.color.slice(5,7), 16)/255 };
                    page.drawText(edit.text, { x: edit.x, y, font, size: edit.fontSize, color: rgb(color.r, color.g, color.b) });
                } else if (edit.type === 'image') {
                    const y = height - edit.y - edit.height;
                    const image = edit.mimeType === 'image/png' ? await newPdfDoc.embedPng(edit.bytes) : await newPdfDoc.embedJpg(edit.bytes);
                    page.drawImage(image, { x: edit.x, y, width: edit.width, height: edit.height });
                } else if (edit.type === 'shape' && edit.shape === 'rectangle') {
                    const y = height - edit.y - edit.height;
                    const borderColor = { r: parseInt(edit.color.slice(1,3), 16)/255, g: parseInt(edit.color.slice(3,5), 16)/255, b: parseInt(edit.color.slice(5,7), 16)/255 };
                    const fillColor = { r: parseInt(edit.fill.slice(1,3), 16)/255, g: parseInt(edit.fill.slice(3,5), 16)/255, b: parseInt(edit.fill.slice(5,7), 16)/255 };
                    page.drawRectangle({ x: edit.x, y, width: edit.width, height: edit.height, borderColor: rgb(borderColor.r, borderColor.g, borderColor.b), color: rgb(fillColor.r, fillColor.g, fillColor.b), borderWidth: edit.strokeWidth });
                }
            }
        }

        newPdfDoc.addPage(page);
    }
    
    return await newPdfDoc.save();
};