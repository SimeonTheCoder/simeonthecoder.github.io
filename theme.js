import { lerp, normalize, toHex, copy } from './colorUtils.js';

const root = document.querySelector(':root');

const accentColor = { r: 0, g: 0, b: 0 };
const accentShifted = {};
const accentShifted2 = {};
const complementary = {};
const bgStart = {};
const bgEnd = {};

export const theme = {
	fg: '#ffffff',
	// fg: '#000000',
};

function hsl2rgb(hue, saturation, luminance) {
	const a = saturation * Math.min(luminance, 1 - luminance);
	const f = (n, k = (n + hue / 30) % 12) =>
		luminance - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

	return {
		r: f(0),
		g: f(8),
		b: f(4),
	};
}

export function updateTheme(degrees) {
	copy(
		accentColor,
		lerp({ r: 1, g: 1, b: 1 }, hsl2rgb(degrees, 1.0, 0.5), 0.5),
		// lerp({ r: 0, g: 0, b: 0 }, hsl2rgb(degrees, 1.0, 0.5), 0.0),
	);

	copy(accentShifted, hsl2rgb((degrees + 90) % 360, 1.0, 0.5));
	copy(accentShifted2, hsl2rgb((degrees + 180) % 360, 1.0, 0.5));

	complementary.r = 1 - accentColor.r;
	complementary.g = 1 - accentColor.g;
	complementary.b = 1 - accentColor.b;

	bgStart.r = accentShifted.r * 0.1;
	bgStart.g = accentShifted.g * 0.1;
	bgStart.b = accentShifted.b * 0.1;

	bgEnd.r = accentShifted2.r * 0.2;
	bgEnd.g = accentShifted2.g * 0.2;
	bgEnd.b = accentShifted2.b * 0.2;

	console.log(accentColor);

	theme.accent = toHex(accentColor);
	theme.complementary = toHex(complementary);
	theme.bgStart = toHex(bgStart);
	theme.bgEnd = toHex(bgEnd);

	applyTheme();
}

function applyTheme() {
	root.style.setProperty('--accent', theme.accent);
	root.style.setProperty('--complementary', theme.complementary);
	root.style.setProperty('--fg', theme.fg);
	root.style.setProperty('--bg-gradient-start', theme.bgStart);
	root.style.setProperty('--bg-gradient-end', theme.bgEnd);
}
