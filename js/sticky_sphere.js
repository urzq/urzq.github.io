"strict";

let renderer, camera, scene, light;
let normalizedMousePos = new THREE.Vector3(0, 0, 0);
const frustumSize = 1;

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

const mainSphereDescriptor = new SphereDescriptor(0, 0, 0.2, 0x37474f);
let mainSphere;

init();
render();

function init() {
  const canvas = document.querySelector("#c");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const aspectRatio = width / height;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height, false);

  canvas.addEventListener("mousemove", onMouseMove);

  canvas.addEventListener(
    "touchmove",
    function (e) {
      var touch = e.touches[0];
      var mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      canvas.dispatchEvent(mouseEvent);
    },
    false
  );

  camera = new THREE.OrthographicCamera(
    (-aspectRatio * frustumSize) / 2,
    (aspectRatio * frustumSize) / 2,
    frustumSize / 2,
    -frustumSize / 2,
    /*near*/ 0,
    /*far*/ 10
  );
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(1, 1, 1);

  const color = 0xffffff;
  light = new THREE.PointLight(color, 0.7);
  light.position.set(0, 0, 1);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(color, 0.6);
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

  let rayStart = normalizedMousePos.clone();
  // The point is unprojected onto the near plane.
  rayStart.z = -1.0;
  rayStart.unproject(camera);

  let rayEnd = normalizedMousePos.clone();
  // The point is unprojected onto the far plane.
  rayEnd.z = 1.0;
  rayEnd.unproject(camera);

  const camRay = new THREE.Line3(rayStart, rayEnd);
  let target = new THREE.Vector3();
  plane.intersectLine(camRay, target);

  mainSphere.position.copy(target);
  light.position.set(mainSphere.position.x, mainSphere.position.y, 1);

  let minDist = Number.MAX_VALUE;

  for (const sphereDescriptor of sphereDescriptors) {
    const dist = sphereDescriptor.distanceToPoint(mainSphere.position);
    if (dist < minDist) {
      minDist = dist;
    }
  }
  mainSphere.scale.setScalar(minDist);

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

function onMouseMove(event) {
  // Make the sphere follow the mouse
  let x = event.pageX - event.currentTarget.offsetLeft;
  let y = event.pageY - event.currentTarget.offsetTop;
  let w = event.currentTarget.offsetWidth;
  let h = event.currentTarget.offsetHeight;

  normalizedMousePos = new THREE.Vector3((x / w) * 2 - 1, -(y / h) * 2 + 1, 1);
}
