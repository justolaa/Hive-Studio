import { useEffect, useRef } from 'react';

const HIVE_STYLES = `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
  <style>
    /* Basic Hive Settings */
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
      color: #212529; 
      padding: 20px; 
      background-color: #fff;
      line-height: 1.6;
    }
    
    /* Columns */
    .pull-left { 
      float: left; 
      width: 48%; 
      padding-right: 10px; 
      box-sizing: border-box; 
      word-wrap: break-word; 
    }
    
    .pull-right { 
      float: right; 
      width: 48%; 
      padding-left: 10px; 
      box-sizing: border-box; 
      word-wrap: break-word; 
    }
    
    /* BLOCKQUOTE STYLING (Hive Style) */
    blockquote {
      border-left: 4px solid #e0e0e0; /* The grey bar */
      padding-left: 15px;
      color: #666; /* Slightly lighter text for translation */
      margin-bottom: 4%; /* Remove default huge margins */
      font-size: 1rem; /* Keep text size normal, not huge */
      background: transparent;
    }

    /* Images */
    img { max-width: 100%; height: auto; border-radius: 4px; display: block; }
    .cinephile-mode img { margin: 15px auto; }
    .standard-mode img { margin: 15px 0; }
    
    /* HEADERS */
    h1, h2, h3 { 
      margin-top: 30px; 
      margin-bottom: 20px; 
      clear: both; 
    }

    /* THE SEPARATOR */
    hr {
      margin-top: 20px;
      margin-bottom: 20px;
      border: 0;
      border-top: 1px solid #cccccc; 
      clear: both;
    }

    p { margin-bottom: 1rem; }

    /* Videos & Iframes */
    iframe, video { 
      max-width: 100%; 
      border-radius: 4px; 
      display: block; 
      margin: 20px auto; 
    }
       /* TABLE STYLING */
    table {
      width: 100%;
      max-width: 100%;
      margin-bottom: 1rem;
      border-collapse: collapse;
      background-color: transparent;
    }
    
    th, td {
      padding: 0.75rem;
      vertical-align: top;
      border-top: 1px solid #dee2e6;
    }
    
    thead th {
      vertical-align: bottom;
      border-bottom: 2px solid #dee2e6;
      font-weight: bold;
      text-align: left;
    }
    
    tbody + tbody {
      border-top: 2px solid #dee2e6;
    }
    
    /* Striped rows for readability */
    tbody tr:nth-of-type(odd) {
      background-color: rgba(0, 0, 0, 0.05);
    }
  </style>
`;

export default function Preview({ htmlContent, extraCss }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            ${HIVE_STYLES}
            <style>
              /* INJECT DYNAMIC CSS HERE */
              ${extraCss || ''}
            </style>
          </head>
          <body>${htmlContent || '<p style="color:#999; text-align:center; margin-top:50px;">Preview area...</p>'}</body>
        </html>
      `);
      doc.close();
    }
  }, [htmlContent, extraCss]); // Re-render when content OR css changes

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-inner overflow-hidden flex flex-col">
      <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 border-b">
        PEAKD / ECENCY PREVIEW
      </div>
      <iframe 
        ref={iframeRef} 
        className="w-full h-full flex-1" 
        title="Hive Preview"
        // ADD allow-scripts so videos can play
        sandbox="allow-same-origin allow-scripts" 
      />
    </div>
  );
}
