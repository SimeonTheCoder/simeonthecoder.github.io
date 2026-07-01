import { parseMarkdown } from './markdown-renderer.js';

const str = await parseMarkdown('README.md');
document.querySelector('md-container').innerHTML = str;
