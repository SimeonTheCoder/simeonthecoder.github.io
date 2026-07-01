import { parseMarkdown } from './markdown-renderer.js';
import { updateTheme } from './theme.js';
import { pages } from './pages.js';

// updateTheme(225);
updateTheme(45);

function createMenuItem(title, path) {
	const li = document.createElement('li');
	const a = document.createElement('a');
	a.textContent = title;

	if (path) a.href = '?page=/' + path;

	li.appendChild(a);

	return li;
}

function createMenu() {
	const menu = document.getElementById('menu');
	menu.innerHTML = '';

	for (let key in pages) {
		const page = pages[key];

		const title =
			page.title || key.slice(0, 1).toUpperCase() + key.slice(1);

		const listItem = createMenuItem(title, !page.filename ? null : key);

		if (page.sub) {
			const subMenu = document.createElement('ul');
			subMenu.className = 'dropdown-menu';

			for (let subpageKey in page.sub) {
				const subpage = page.sub[subpageKey];

				const currTitle =
					subpage.title ||
					subpageKey.slice(0, 1).toUpperCase() + subpageKey.slice(1);

				const currLi = createMenuItem(
					currTitle,
					!subpage.filename ? null : `${key}/${subpageKey}`,
				);

				subMenu.appendChild(currLi);
			}

			listItem.appendChild(subMenu);
		}

		menu.appendChild(listItem);
	}
}

createMenu();

async function createRoutes(pages) {
	const routes = {};

	for (let key in pages) {
		const page = pages[key];

		if (page.filename) {
			routes[`/${key}`] = await parseMarkdown(page.filename);
		}

		if (!page.sub) continue;

		for (let subpage in page.sub) {
			routes[`/${key}/${subpage}`] = await parseMarkdown(
				page.sub[subpage].filename,
			);
		}
	}

	return routes;
}

const routes = await createRoutes(pages);
console.log(routes);

const params = {};

try {
	window.location.search
		.split('?')[1]
		.split('&')
		.forEach((e) => {
			const [key, val] = e.split('=');
			params[key] = val;
		});
} catch (e) {}

console.log(params);

let currPage = params['page'] || '/home';

document.querySelector('.md-container').innerHTML = routes[currPage];
