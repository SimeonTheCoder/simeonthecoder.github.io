import { createSandbox } from './sandbox.js';
import { keywords, characters, vars } from './syntax-hightlighting-config.js';
import katex from 'https://esm.sh/katex';

const tab = '<span class="tab"></span>';

let isBlock = false;
let blockType = '';

let listLevel = -1;

function highlight(type, className) {
	return `<span class="${className}">${type}</span>`;
}

function renderEquation(equation) {
	return katex.renderToString(equation);
}

function finalFormatting(original) {
	let line = original.replaceAll('    ', tab);
	line = line.replaceAll('\t', tab);

	if (line.includes('$')) {
		const tokens = line.split('$');

		let result = '';

		for (let i = 0; i < tokens.length; i++)
			result += i % 2 == 0 ? tokens[i] : renderEquation(tokens[i]);

		return result;
	}

	line = line.replaceAll(/\*\*([^**]+)\*\*/g, '<b>$1</b>');
	line = line.replaceAll(/\*([^\*]+)\*/g, '<i>$1</i>');

	if (line.includes('`'))
		return line.replaceAll(
			/`([^`]+)`/g,
			'<div class="generic-block-inline">$1</div>',
		);

	line = line.replaceAll(/==([^=]+)==/g, '<span class="marker">$1</span>');

	return line;
}

function handleBlockMarker(line) {
	isBlock = !isBlock;

	if (!isBlock) return '</div>';

	blockType = line.slice(3);
	return `<div class="generic-block ${blockType}">`;
}

function handleHeader(line) {
	let count = 0;

	for (let i = 0; i < line.length; i++) {
		if (line[i] != '#') break;
		count++;
	}

	return `<h${count}>${finalFormatting(line.slice(count + 1))}</h${count}>`;
}

function handleList(line) {
	return `<li>${finalFormatting(line.slice(2))}</li>`;
}

function applySyntaxHighlighting(line) {
	let formatted = line;
	let copy = '';

	for (let i = 0; i < formatted.length; i++) {
		copy += characters.includes(formatted[i])
			? highlight(formatted[i], 'character')
			: formatted[i];
	}

	formatted = copy;

	for (let keyword of vars) {
		formatted = formatted.replaceAll(
			keyword,
			highlight(keyword, 'vartype'),
		);
	}

	for (let keyword of keywords) {
		formatted = formatted.replaceAll(
			keyword,
			highlight(keyword, 'keyword'),
		);
	}

	formatted = formatted.replaceAll(
		/'([^']+)'/g,
		'<span class="green">\'$1\'</span>',
	);

	return `${finalFormatting(formatted)}`;
}

function handleListDepth(line, indentation) {
	const correctListLevel = indentation / 4;
	const difference = listLevel - correctListLevel;

	const correction = (correctListLevel < listLevel ? '</ul>' : '<ul>').repeat(
		Math.abs(difference),
	);

	listLevel -= difference;
	return correction + handleList(line.trim());
}

function processLine(line) {
	const indentation = line.length - line.trimStart().length;
	const original = line;

	line = line.trim();

	let curr = '';

	if (listLevel >= 0 && !line.startsWith('-')) {
		curr += '</ul>'.repeat(listLevel - -1);
		listLevel = -1;
	}

	if (line == '') return curr + (isBlock ? '<br>' : '');
	if (line.startsWith('```')) return curr + handleBlockMarker(line);

	if (isBlock) {
		if (blockType.includes('ad'))
			return curr + `${finalFormatting(original)}`;
		if (blockType == 'math') return curr + `${renderEquation(original)}`;

		return curr + applySyntaxHighlighting(original) + '<br>';
	}

	if (line.startsWith('-')) return curr + handleListDepth(line, indentation);
	if (line.startsWith('#')) return curr + handleHeader(line);
	if (line.startsWith('<')) return curr + `${finalFormatting(line)}`;

	return curr + `<p>${finalFormatting(line)}</p>`;
}

function renderFile(lines) {
	let constructedHtml = '';
	let currSnippet = '';

	for (const original of lines) {
		let wasBlock = isBlock;

		const curr = processLine(original);

		if (!blockType.startsWith('snippet') || (!isBlock && !wasBlock)) {
			constructedHtml += curr;
			continue;
		}

		if (!wasBlock) continue;

		if (isBlock) {
			currSnippet += original + '\n';
			continue;
		}

		const snippetId = blockType.slice(8);

		currSnippet = currSnippet
			.replaceAll('@SNIPPET', `'${snippetId}'`)
			.replaceAll('@DOCUMENT', 'window.parent');

		const sandbox = createSandbox(currSnippet);
		sandbox.onload = 'hello';

		constructedHtml += sandbox.outerHTML.replaceAll(
			'<iframe',
			`<iframe id="${snippetId}" onload="resizeIframe(this)" `,
		);

		currSnippet = '';
		constructedHtml += curr;
	}

	return constructedHtml;
}

export async function parseMarkdown(filename) {
	const file = await fetch(filename).then((r) => r.text());
	const lines = file.split(/\n|\r\n/);

	return JSON.parse(JSON.stringify(renderFile(lines).trim()));
}
