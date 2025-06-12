const prendas = [
  { nombre: "PEIXE SHIRT", imagen: "camisetas/peixe.png", info: "camisetas/peixe-info.png" },
  { nombre: "MORIA SKIRT", imagen: "camisetas/moria.png", info: "camisetas/moria-info.png" },
  { nombre: "NUSA TROUSER", imagen: "camisetas/nusa.png", info: "camisetas/nusa-info.png" },
  { nombre: "JACKET", imagen: "camisetas/jacket.png", info: "camisetas/jacket-info.png" }
];

let current = 0;
let useFrontCamera = true;
let camisetaImg = new Image();

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nombrePrenda = document.getElementById('nombrePrenda');
const infoOverlay = document.getElementById('infoOverlay');
const infoImage = document.getElementById('infoImage');

document.getElementById('next').onclick = () => cambiarPrenda(1);
document.getElementById('prev').onclick = () => cambiarPrenda(-1);
document.getElementById('switchCamera').onclick = () => {
  useFrontCamera = !useFrontCamera;
  iniciarCamara();
};

canvas.onclick = () => {
  infoImage.src = prendas[current].info;
  infoOverlay.classList.remove('hidden');
};

infoImage.onclick = () => {
  infoOverlay.classList.add('hidden');
};

function cambiarPrenda(delta) {
  current = (current + delta + prendas.length) % prendas.length;
  nombrePrenda.textContent = prendas[current].nombre;
  camisetaImg.src = prendas[current].imagen;
}

function iniciarCamara() {
  if (window.stream) {
    window.stream.getTracks().forEach(t => t.stop());
  }

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: useFrontCamera ? "user" : "environment",
      width: 640,
      height: 480
    }
  }).then(stream => {
    video.srcObject = stream;
    window.stream = stream;
  });
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

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480
});

function onResults(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    const lShoulder = results.poseLandmarks[11];
    const rShoulder = results.poseLandmarks[12];

    const x = lShoulder.x * canvas.width;
    const y = lShoulder.y * canvas.height - 40;
    const width = (rShoulder.x - lShoulder.x) * canvas.width * 1.5;
    const height = width * 1.4;

    ctx.drawImage(camisetaImg, x, y, width, height);
  }

  ctx.restore();
}

cambiarPrenda(0);
iniciarCamara();
camera.start();
