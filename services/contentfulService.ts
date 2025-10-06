import type { Post } from '../types';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '5 Tips for Efficiently Merging Your PDF Documents',
    description: `Combining multiple PDF files into a single, organized document is a common task, whether you're compiling reports, archiving invoices, or creating a project portfolio. While it seems simple, a few best practices can save you time and prevent headaches.\n\nHere are five tips for merging your PDFs like a pro using our Merge PDF tool:\n\n1.  **Name Files Logically Before Merging:** Before you even upload your files, give them names that indicate their order (e.g., "01_CoverPage.pdf", "02_Introduction.pdf"). This makes it much easier to arrange them correctly in the tool.\n\n2.  **Check the Order Twice:** Our tool allows you to drag and drop files to reorder them. Always double-check the sequence before hitting the "Merge" button. For long documents, it's easy to misplace a file.\n\n3.  **Consider File Size:** If you are merging very large PDFs, especially those with high-resolution images, the final file can become massive. If the final size is a concern, consider compressing the individual PDFs first using our Compress PDF tool.\n\n4.  **Remove Unnecessary Pages First:** Don't merge first and then try to remove unwanted pages. Use a tool like Split PDF or Organize PDF to extract only the pages you need from each source document. This keeps your final merged file clean and concise.\n\n5.  **Use AI for a Smart Filename:** Don't just settle for "merged.pdf". Use our "Suggest Name (AI)" feature to get a smart, descriptive filename based on the content of your source documents. It's a small step that greatly improves document management.`,
    author: 'Jane Doe',
    date: 'October 26, 2023',
  },
  {
    id: '2',
    title: 'How to Reduce PDF File Size Without Losing Quality',
    description: `Large PDF files are cumbersome. They are slow to email, difficult to upload, and can take up unnecessary storage space. Fortunately, compressing a PDF doesn't have to mean sacrificing quality. Our Compress PDF tool is designed to intelligently reduce file size while maintaining the best possible fidelity.\n\nThe magic behind compression lies in a few key techniques:\n\n- **Image Optimization:** The biggest contributor to PDF size is often embedded images. Compression tools can downsample high-resolution images to a more web-friendly resolution (like 150 DPI) and apply efficient compression algorithms like JPEG or ZIP.\n\n- **Removing Redundant Data:** PDFs can accumulate unused objects, duplicate fonts, and other metadata that bloats the file. A good compression tool will safely remove this data without affecting the visible content.\n\n- **Object Stream Compression:** The internal structure of a PDF consists of various objects. By grouping these into compressed streams, the overall file size can be significantly reduced. This is a lossless technique, meaning it doesn't reduce the quality of your content at all.\n\nOur tool focuses primarily on these lossless and near-lossless techniques to ensure your document remains crisp and readable while becoming much more portable.`,
    author: 'John Smith',
    date: 'October 22, 2023',
  },
  {
    id: '3',
    title: 'Unlocking the Power of PDF Conversion: JPG to PDF and Back',
    description: `PDFs are fantastic for sharing, but they aren't always the right format for the job. Sometimes you need the flexibility of an image file, or you need to bundle multiple images into a single, easy-to-share PDF. This is where conversion comes in.\n\n**JPG to PDF: Creating a Standardized Package**\n\nConverting JPGs to a PDF is perfect for:\n- **Portfolios:** Combine your design mockups or photographs into one file.\n- **Invoices & Receipts:** Scan or photograph receipts and save them as a single PDF for expense reports.\n- **Presentations:** Ensure your images and layouts are viewed exactly as you intended, regardless of the device.\n\nOur Image to PDF tool lets you drag and drop multiple images, reorder them, and convert them into a professional-looking PDF document in seconds.\n\n**PDF to JPG: Extracting What You Need**\n\nConversely, you might need to pull images out of a PDF. Use cases include:\n- **Reusing Graphics:** Extract a logo or chart from a report for use in a presentation.\n- **Web Content:** Convert a PDF page into a JPG to post on social media or a blog.\n- **Viewing Flexibility:** Sometimes, an image is just easier to view or share quickly than a full PDF document.\n\nOur PDF to JPG tool efficiently renders each page of your PDF into a high-quality JPG image, which are then bundled into a convenient ZIP file for you to download.`,
    author: 'Alex Johnson',
    date: 'October 18, 2023',
  },
   {
    id: '4',
    title: 'A Guide to Organizing Your PDFs Like a Pro',
    description: `A 50-page PDF report has been sent to you, but pages 10-15 are irrelevant, and the appendix at the end needs to be at the beginning. What do you do? This is a common scenario where a powerful organization tool is essential.\n\nOur Organize PDF tool gives you a bird's-eye view of your entire document, allowing you to manipulate it with ease. Here's how to use it effectively:\n\n1.  **Visualize and Reorder:** Once you upload your file, you'll see a thumbnail for every page. Simply drag and drop the pages into the new desired order. It's as simple as shuffling virtual cards.\n\n2.  **Delete with Confidence:** Hover over any page you don't need and click the trash icon. The page is instantly removed from the sequence. This is perfect for removing blank pages or irrelevant sections before sharing a document.\n\n3.  **Rotate on the Fly:** Is a page scanned upside down or sideways? A single click of the rotate button will fix its orientation without needing a separate tool.\n\n4.  **Combine Actions:** The best part is you can do all of this in one session. Reorder pages, delete some, and rotate others before clicking "Save". This saves you from having to process the same file through multiple tools, streamlining your workflow.`,
    author: 'Emily White',
    date: 'October 15, 2023',
  },
   {
    id: '5',
    title: '7 Hidden PDF Tricks You Didn’t Know You Needed',
    description: `PDFs are everywhere — from resumes to eBooks to legal documents. But most people only use them to view files, missing out on some powerful tricks that make life easier.\n\nIn this post, we’ll uncover seven hidden PDF tips that can save you time, improve productivity, and even boost your document security.\n\n1. **Unlock a Secured File:** Ever received a PDF that you can't edit or print? If you have the password, our Unlock PDF tool can remove these restrictions, giving you a fully accessible document.\n\n2. **Add a Watermark for Branding:** Protect your work or brand your documents by adding a text watermark. You can control the text, position, color, and transparency to fit your needs.\n\n3. **Crop Margins for Better Reading:** Some PDFs have excessive white space, making them hard to read on smaller screens. Use the Crop PDF tool to trim the margins and focus on the content.\n\n4. **Add Page Numbers in a Snap:** When you combine multiple documents, page numbering can get lost. Our Add Page Numbers tool lets you insert and style page numbers exactly where you want them.\n\n5. **Convert a Single Page to an Image:** Instead of taking a screenshot, use the PDF to JPG tool to get a high-resolution image of any page in your document.\n\n6. **Rotate a Single Page:** Don't let one incorrectly scanned page ruin your document. The Organize PDF tool lets you rotate individual pages without affecting the rest of the file.\n\n7. **Merge Non-PDF files:** While our main tool merges PDFs, don't forget you can first convert images to a PDF and then merge that with your other documents for an all-in-one file.`,
    author: 'Chris Green',
    date: 'October 12, 2023',
  },
];


/**
 * Fetches blog posts from a mock source.
 * @returns A promise that resolves to an array of Post objects.
 */
export const getBlogPosts = async (): Promise<Post[]> => {
  // Returning mock data instead of fetching from Contentful.
  return Promise.resolve(MOCK_POSTS);
};
