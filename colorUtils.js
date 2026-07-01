export function fromHex(hex) {
	const rBits = hex.slice(1, 3);
	const gBits = hex.slice(3, 5);
	const bBits = hex.slice(5, 7);

	const r = parseInt(rBits, 16) / 255.0;
	const g = parseInt(gBits, 16) / 255.0;
	const b = parseInt(bBits, 16) / 255.0;

	return {
		r,
		g,
		b,
	};
}

export function toHex(color) {
	if (color.toString().startsWith('#')) return color;

	const rBits = Math.floor(color.r * 255)
		.toString(16)
		.padStart(2, '0');
	const gBits = Math.floor(color.g * 255)
		.toString(16)
		.padStart(2, '0');
	const bBits = Math.floor(color.b * 255)
		.toString(16)
		.padStart(2, '0');

	return `#${rBits}${gBits}${bBits}`;
}

export function lerp(colA, colB, t) {
	if (colA.toString().startsWith('#')) colA = fromHex(colA);
	if (colB.toString().startsWith('#')) colB = fromHex(colB);

	return {
		r: colA.r * (1 - t) + colB.r * t,
		g: colA.g * (1 - t) + colB.g * t,
		b: colA.b * (1 - t) + colB.b * t,
	};
}

export function normalize(col) {
	if (col.toString().startsWith('#')) col = fromHex(col);

	const l = Math.sqrt(col.r * col.r + col.g * col.g + col.b * col.b);

	return {
		r: col.r / l,
		g: col.g / l,
		b: col.b / l,
	};
}

export function copy(a, b) {
	a.r = b.r;
	a.g = b.g;
	a.b = b.b;
}
