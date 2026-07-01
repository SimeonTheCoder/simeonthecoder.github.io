export function createSandbox(sourceCode) {
	const element = document.createElement('iframe');
	element.srcdoc = sourceCode;

	return element;
}
