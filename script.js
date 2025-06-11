const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('prenda-info');
const nombrePrenda = document.getElementById('nombre-prenda');

let usandoFrontal = true;
let cameraInstance;

const prendas = [
  { src: "camisetas/peixe.png", nombre: "Peixe Shirt" },
  { src: "camisetas/moria.png", nombre: "Moria Skirt" },
  { src: "camisetas/nusa.png", nombre: "Nusa Trouser" },
  { src: "camisetas/jacket.png", nombre: "Jacket" }
];

let indexActual = 0;
const imagenes = prendas.map(prenda => {
  const img = new Image();
  img.src = prenda.src;
  return img;
});

function cambiarPrenda(dir) {
  indexActual = (indexActual + dir + prendas.length) % prendas.length;
  nombrePrenda.textContent = prendas[indexActual].nombre;
}
document.getElementById('anterior').onclick = () => cambiarPrenda(-1);
document.getElementById('siguiente').onclick = () => cambiarPrenda(1);

canvas.addEventListener('click', () => {
  info.classList.toggle('hidden');
});

document.getElementById('cambiar-camara').onclick = () => {
  usandoFrontal = !usandoFrontal;
  iniciarCamara();
};

function iniciarCamara() {
  if (cameraInstance) {
    cameraInstance.stop();
  }

  const constraints = {
    video: {
      facingMode: usandoFrontal ? "user" : "environment",
      width: { ideal: 640 },
      height: { ideal: 480 }
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    video.srcObject = stream;
  });

  const camera = new Camera(video, {
    onFrame: async () => await pose.send({ image: video }),
    width: 640,
    height: 480
  });
  cameraInstance = camera;
  camera.start();
}

function onResults(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    const ls = results.poseLandmarks[11]; // Left shoulder
    const rs = results.poseLandmarks[12]; // Right shoulder
    const lhip = results.poseLandmarks[23]; // Left hip

    const x = ls.x * canvas.width;
    const y = ls.y * canvas.height;
    const width = (rs.x - ls.x) * canvas.width * 1.4;
    const height = (lhip.y - ls.y) * canvas.height * 1.5;

    const img = imagenes[indexActual];
    const drawX = usandoFrontal ? canvas.width - x - width : x;
    ctx.drawImage(img, drawX, y, width, height);
  }
}

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

nombrePrenda.textContent = prendas[indexActual].nombre;
iniciarCamara();
