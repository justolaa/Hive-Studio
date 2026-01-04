import { remark } from 'remark';
import html from 'remark-html';
import { TEMPLATES } from './templates';

export async function parseToHiveHtml(rawText, templateId) {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const c = template.config;

  let processingText = rawText;
  const placeholders = {};
  let placeholderIndex = 0;

  // -------------------------------------------------------
  // STEP 0: Auto-Fix Common User Mistakes
  // -------------------------------------------------------
  
  // FIX 1: Convert Markdown images inside <center> to HTML images
  // Example: <center>![alt](url)</center> -> <center><img src="url" /></center>
  processingText = processingText.replace(
    /<center>\s*!\[.*?\]\((.*?)\)\s*<\/center>/g, 
    '<center><img src="$1" /></center>'
  );

  // FIX 2: Ensure plain Markdown images are not broken if they are on their own line
  // (Optional stability check)
  
  // -------------------------------------------------------
  // STEP 1: Extract [dual] blocks
  // -------------------------------------------------------
  const dualRegex = /\[dual\]([\s\S]*?)---([\s\S]*?)\[\/dual\]/g;
  
  processingText = processingText.replace(dualRegex, (match, sideA, sideB) => {
    // RAW MARKDOWN (Do not convert to HTML here, let Hive do it)
    const rawMarkdownA = sideA.trim();
    const rawMarkdownB = sideB.trim();

    const columnHtml = `
<div class="${c.dualWrapper}">
<div class="${c.left}">
${rawMarkdownA}
</div>
<div class="${c.right}">
${rawMarkdownB}
</div>
</div>
<div class="clearfix"></div>
`;

    const key = `%%%DUAL_BLOCK_${placeholderIndex++}%%%`;
    placeholders[key] = columnHtml;
    return key;
  });

  // -------------------------------------------------------
  // STEP 2: Convert the rest to HTML
  // We use { sanitize: false } to ensuring raw <img> tags are kept
  // -------------------------------------------------------
  const file = await remark()
    .use(html, { sanitize: false }) 
    .process(processingText);
    
  let finalHtml = String(file);

  // -------------------------------------------------------
  // STEP 3: Restore placeholders
  // -------------------------------------------------------
  Object.keys(placeholders).forEach((key) => {
    const regex = new RegExp(`<p>${key}</p>`);
    finalHtml = finalHtml.replace(regex, placeholders[key]);
    // Fallback in case <p> wasn't added
    finalHtml = finalHtml.replace(key, placeholders[key]);
  });
  
  // -------------------------------------------------------
  // STEP 4: Final Wrap
  // -------------------------------------------------------
  return `<div class="${c.containerClass}">${finalHtml}</div>`;
}