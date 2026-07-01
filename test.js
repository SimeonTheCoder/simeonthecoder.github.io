import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js';

const w = window.innerWidth * 0.98;
const h = w / (16 / 9);

export default function run() {
	const data = {
		remember: [],
	};

	function autoDispose(property, disposeFunction) {
		data.remember.push({
			value: property,
			dispose: disposeFunction
				? disposeFunction
				: function () {
						this.value.dispose();
					},
		});

		return property;
	}

	const demo = {
		data: data,
		start() {
			const scene = autoDispose(new THREE.Scene(), () => {
				for (let obj of scene.children) scene.remove(obj);
			});
			const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);

			const renderer = autoDispose(new THREE.WebGLRenderer(), () => {
				renderer.dispose();
				renderer.domElement.remove();
			});
			renderer.setSize(w, h);

			document.body.appendChild(renderer.domElement);

			const geometry = autoDispose(new THREE.BoxGeometry(1, 1, 1));
			const material = autoDispose(
				new THREE.MeshBasicMaterial({
					color: 0x00ff00,
				}),
			);

			const cube = new THREE.Mesh(geometry, material);
			scene.add(cube);

			camera.position.z = 5;

			const animate = (time) => {
				cube.rotation.x = time / 2000;
				cube.rotation.y = time / 1000;

				renderer.render(scene, camera);
			};

			renderer.setAnimationLoop(animate);
		},
		stop() {
			for (let obj of data.remember) {
				obj.dispose();
			}
		},
	};

	return demo;
}
