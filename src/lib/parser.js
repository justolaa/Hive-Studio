import { remark } from 'remark';
import html from 'remark-html';

export async function parseToHiveHtml(rawText, templateConfig) {
  if (!templateConfig) return "";

  const c = templateConfig;
  let processingText = rawText;
  const placeholders = {};
  let placeholderIndex = 0;

  // STEP 0: Auto-Fix Images
  processingText = processingText.replace(
    /<center>\s*!\[.*?\]\((.*?)\)\s*<\/center>/g, 
    '<center><img src="$1" /></center>'
  );

  // STEP 1: Extract [dual] blocks
  const dualRegex = /\[dual\]([\s\S]*?)---([\s\S]*?)\[\/dual\]/g;
  
  processingText = processingText.replace(dualRegex, (match, sideA, sideB) => {
    const rawMarkdownA = sideA.trim();
    const rawMarkdownB = sideB.trim();

    // UPDATED: The Right Column is now wrapped in <blockquote>
    // This gives the translation that nice "grey bar" look automatically.
    const columnHtml = `
<div class="${c.dualWrapper}">
<div class="${c.left}">
${rawMarkdownA}
</div>
<div class="${c.right}">
<blockquote>
${rawMarkdownB}
</blockquote>
</div>
</div>
<hr />
`;

    const key = `%%%DUAL_BLOCK_${placeholderIndex++}%%%`;
    placeholders[key] = columnHtml;
    
    return `\n\n${key}\n\n`;
  });

  // STEP 2: Convert rest to HTML
  const file = await remark()
    .use(html, { sanitize: false }) 
    .process(processingText);
    
  let finalHtml = String(file);

  // STEP 3: Restore placeholders
  Object.keys(placeholders).forEach((key) => {
    const pWrappedRegex = new RegExp(`<p>\\s*${key}\\s*<\\/p>`, 'g');
    if (pWrappedRegex.test(finalHtml)) {
      finalHtml = finalHtml.replace(pWrappedRegex, placeholders[key]);
    } else {
      finalHtml = finalHtml.replace(key, placeholders[key]);
    }
  });
  
  // STEP 4: Final Wrap
  return `<div class="${c.containerClass}">${finalHtml}</div>`;
}