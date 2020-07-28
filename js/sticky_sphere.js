"use strict";

// All the spheres are lying on this plane.
const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

const sphereDescriptors = [
  new SphereDescriptor(0.74, 0.12, 0.02, 0xff9800),
  new SphereDescriptor(0.1, -0.3, 0.17, 0xffb74d),
  new SphereDescriptor(0.2, 0.2, 0.1, 0xffa726),
  new SphereDescriptor(-0.2, 0.1, 0.01, 0xff9800),
  new SphereDescriptor(0.4, -0.3, 0.05, 0xfb8c00),
  new SphereDescriptor(-0.3, -0.3, 0.05, 0xf57c00),
  new SphereDescriptor(-0.1, 0.3, 0.05, 0xef6c00),
  new SphereDescriptor(-0.68, -0.12, 0.2, 0xe65100),
];

// The sphere we control with the mouse.
const mainSphereDescriptor = new SphereDescriptor(0, 0, 0.2, 0x37474f);

let renderer, camera, scene, light, mainSphere;
let normalizedMousePos = new THREE.Vector3(0, 0, 0);

init();
render();

function init() {
  const canvas = document.querySelector("canvas");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height, false);

  canvas.addEventListener("mousemove", onMouseMove);

  canvas.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    },
    false
  );

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(1, 1, 1);

  const lightColor = 0xffffff;
  light = new THREE.PointLight(lightColor, 0.7);
  light.position.set(0, 0, 1);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(lightColor, 0.6);
  scene.add(ambientLight);

  for (const sphereDescriptor of sphereDescriptors) {
    const sphere = createSphereWithDescriptor(sphereDescriptor);
    scene.add(sphere);
  }

  mainSphere = createSphereWithDescriptor(mainSphereDescriptor);
  scene.add(mainSphere);
}

function SphereDescriptor(positionX, positionY, radius, color) {
  this.position = new THREE.Vector3(positionX, positionY, 0);
  this.radius = radius;
  this.color = color;
  this.distanceToPoint = sphereDistanceToPoint;
}

function sphereDistanceToPoint(position) {
  const centerDistance = this.position.distanceTo(position);
  return Math.max(centerDistance - this.radius, 0);
}

function createSphereWithDescriptor(descriptor) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);

  const material = new THREE.MeshPhongMaterial({
    color: descriptor.color,
    shininess: 0.2,
  });

  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.copy(descriptor.position);
  sphere.scale.setScalar(descriptor.radius);

  return sphere;
}

function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  tiltCamera();

  const mouseWorldPos = unprojectMouseIntoPlane();
  mainSphere.position.copy(mouseWorldPos);
  light.position.set(mouseWorldPos.x, mouseWorldPos.y, 1);

  const distanceToClosestSphere = computeDistanceToClosestSphere(mainSphere.position);
  mainSphere.scale.setScalar(distanceToClosestSphere);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// See https://threejsfundamentals.org/threejs/lessons/threejs-responsive.html for in-depth explanations ;)
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

// Change slighly the camera's position based on where the mouse cursor is on the screen.
function tiltCamera() {
  // [0, 1]
  const xRatio = (normalizedMousePos.x + 1) / 2;
  const angle = THREE.MathUtils.lerp(
    (5 * Math.PI) / 8,
    (3 * Math.PI) / 8,
    xRatio
  );
  const hypotenuse = 1.3;
  const x = Math.cos(angle) * hypotenuse;
  const z = Math.sin(angle) * hypotenuse;

  camera.position.set(x, 0, z);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
}

function unprojectMouseIntoPlane() {
  let rayStart = normalizedMousePos.clone();
  // The point is unprojected into the near plane.
  rayStart.z = -1.0;
  rayStart.unproject(camera);

  let rayEnd = normalizedMousePos.clone();
  // The point is unprojected into the far plane.
  rayEnd.z = 1.0;
  rayEnd.unproject(camera);

  const ray = new THREE.Line3(rayStart, rayEnd);
  const target = new THREE.Vector3();
  plane.intersectLine(ray, target);

  return target;
}

function computeDistanceToClosestSphere(position) {
  let minDist = Number.MAX_VALUE;

  for (const sphereDescriptor of sphereDescriptors) {
    const dist = sphereDescriptor.distanceToPoint(position);
    if (dist < minDist) {
      minDist = dist;
    }
  }
  return minDist;
}

function onMouseMove(event) {
  // Convert the mouse position into normalized screen space [-1, +1]
  const x = event.pageX - event.currentTarget.offsetLeft;
  const y = event.pageY - event.currentTarget.offsetTop;
  const width = event.currentTarget.offsetWidth;
  const height = event.currentTarget.offsetHeight;

  normalizedMousePos = new THREE.Vector3((x / width) * 2 - 1, -(y / height) * 2 + 1, 1);
}
