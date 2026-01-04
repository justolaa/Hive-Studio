import { remark } from 'remark';
import html from 'remark-html';

// NOTICE: We removed 'import { TEMPLATES }'
// Now the parser accepts the specific 'config' object directly.

export async function parseToHiveHtml(rawText, templateConfig) {
  // Fallback if config isn't ready yet
  if (!templateConfig) return "";

  const c = templateConfig;

  let processingText = rawText;
  const placeholders = {};
  let placeholderIndex = 0;

  // -------------------------------------------------------
  // STEP 0: Auto-Fix Common User Mistakes
  // -------------------------------------------------------
  processingText = processingText.replace(
    /<center>\s*!\[.*?\]\((.*?)\)\s*<\/center>/g, 
    '<center><img src="$1" /></center>'
  );

  // -------------------------------------------------------
  // STEP 1: Extract [dual] blocks
  // -------------------------------------------------------
  const dualRegex = /\[dual\]([\s\S]*?)---([\s\S]*?)\[\/dual\]/g;
  
  processingText = processingText.replace(dualRegex, (match, sideA, sideB) => {
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
  // STEP 2: Convert rest to HTML
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
    finalHtml = finalHtml.replace(key, placeholders[key]);
  });
  
  // -------------------------------------------------------
  // STEP 4: Final Wrap
  // -------------------------------------------------------
  return `<div class="${c.containerClass}">${finalHtml}</div>`;
}