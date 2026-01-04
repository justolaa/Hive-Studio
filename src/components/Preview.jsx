import { useEffect, useRef } from 'react';

const HIVE_STYLES = `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
  <style>
    /* Basic Hive Settings */
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
      color: #212529; /* Darker text for visibility */
      padding: 20px; 
      background-color: #fff;
      line-height: 1.6;
    }
    
    /* Column Utilities - FORCED WIDTHS */
    .pull-left { float: left; width: 48%; padding-right: 1%; box-sizing: border-box; }
    .pull-right { float: right; width: 48%; padding-left: 1%; box-sizing: border-box; }
    
    /* Clearfix ensures the text below columns doesn't overlap */
    .clearfix::after { content: ""; clear: both; display: table; }
    
    /* Images */
    img { max-width: 100%; height: auto; border-radius: 4px; display: block; }
    .cinephile-mode img { margin: 15px auto; }
    .standard-mode img { margin: 15px 0; }
    
    /* Typography */
    h1, h2 { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
    p { margin-bottom: 1rem; }
  </style>
`;

export default function Preview({ htmlContent }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>${HIVE_STYLES}</head>
          <body>${htmlContent || '<p style="color:#999; text-align:center; margin-top:50px;">Preview area...</p>'}</body>
        </html>
      `);
      doc.close();
    }
  }, [htmlContent]);

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-inner overflow-hidden flex flex-col">
      <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 border-b">
        PEAKD / ECENCY PREVIEW
      </div>
      <iframe 
        ref={iframeRef} 
        className="w-full h-full flex-1" 
        title="Hive Preview"
      />
    </div>
  );
}