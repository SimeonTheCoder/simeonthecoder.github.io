const startQueue = {};

function registerStart(setup, name) {
	const result = setup();

	const frame = {
		data: result.data,
		start: result.start,
		stop: result.stop,
		obj: document.getElementById(name),
		currState: 'stop',
	};

	frame.start = frame.start.bind(frame);
	frame.stop = frame.stop.bind(frame);

	startQueue[name] = frame;

	const observer = new IntersectionObserver((entries) => {
		const intersecting = entries[0].isIntersecting;
		setSnippetState(name, intersecting ? 'start' : 'stop');
	});

	observer.observe(frame.obj);
}

function setSnippetState(name, state) {
	if (startQueue[name].currState == state) return;

	startQueue[name][state]();
	startQueue[name].currState = state;

	if (state == 'start') resizeIframe(name);
}

function stopEverything() {
	for (let snippet in startQueue) {
		setSnippetState(snippet, 'stop');
	}
}

function resizeIframe(id) {
	const obj = document.getElementById(id);
	obj.style.height =
		obj.contentWindow.document.documentElement.scrollHeight + 'px';
}

window.addEventListener('click', (e) => {
	e.preventDefault();

	const element = e.target;

	if (e.target.nodeName == 'A') {
		stopEverything();
		// console.log(window.location.origin + e.target.href);
		// window.location.href =
		window.location = e.target.href;
	}
});
