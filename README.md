# A JS Markdown Parser

```ad-info
This project can take `Markdown` files and render them. Why? *Because why not!*
```

## Supported features

It's still in early phases of development. Here are the currently supported features:

- Headers with different levels
- Blocks
    - Inline code
    - Code with syntax highlighting
    - Admonition blocks
- **Bold** & *Italic*, ==Marker==
- Lists
- HTML tags, including inline `CSS` and `JS`
- ==L==a==T==e==X== Math expressions, both inline & math blocks

The math expressions can be inline: $R = \sqrt{(a_x - b_x)^2 + (a_y - b_y)^2 + (a_z - b_z)^2}$

Or, they can be separated in a block (defined using a math block):

```math
    \vec{F} = G\dfrac{m_{1}m_{2}}{R^2}
```

Two columns are also supported. You can use HTML tags in combination with CSS to style the page further.

<div class="two-columns">
<div class="left-column">
This is the left column.

```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate(time) {
	cube.rotation.x = time / 2000;
	cube.rotation.y = time / 1000;

	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
```
</div>
<div class="right-column">

This is the right column. It contains a `three.js` snippet that runs in an iframe:

```snippet-a
<script type="module" defer>
    import setup from './test.js';
    window.parent.registerStart(setup, @SNIPPET);
</script>
```
</div>
</div>

<div class="two-columns">
<div class="left-column">
This is the left column.

```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate(time) {
	cube.rotation.x = time / 2000;
	cube.rotation.y = time / 1000;

	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
```
</div>
<div class="right-column">

This is the right column. It contains a `three.js` snippet that runs in an iframe:

```snippet-b
<script type="module" defer>
    import setup from './test.js';
    window.parent.registerStart(setup, @SNIPPET);
</script>
```
</div>
</div>

## ==Example Usage:==

```js
import { parseMarkdown } from './markdown-renderer.js';

const str = await parseMarkdown('file.md');
document.querySelector('markdownContainer').innerHTML = str;
```

# ==GIFs== and images, why not!

<img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbestanimations.com%2FAnimals%2FMammals%2FDolphins%2Fdolphin%2Fdolphin-jumping-animated-gif-4.gif&f=1&nofb=1&ipt=939a9d194bb236a4fb85d9b017d3c4a3f6e690beb9969d83dadcfcbd3d87103f">

<button style="background-color: black; color: white; padding: 20px; border: 0px; border-radius: 20px" onclick="(() => {alert('JS also works!')})()">Press me 👉👈</button>