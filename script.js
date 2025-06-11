const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const prendas = [
  { nombre: 'Peixe Shirt', img: 'camisetas/peixe.png', etiqueta: 'camisetas/peixe_etiqueta.png' },
  { nombre: 'Moria Skirt', img: 'camisetas/moria.png', etiqueta: 'camisetas/moria_etiqueta.png' },
  { nombre: 'Nusa Trouser', img: 'camisetas/nusa.png', etiqueta: 'camisetas/nusa_etiqueta.png' },
  { nombre: 'Jacket', img: 'camisetas/jacket.png', etiqueta: 'camisetas/jacket_etiqueta.png' }
];

let actual = 0;
let camisetaImg = new Image();
camisetaImg.src = prendas[actual].img;
document.getElementById('nombre-prenda').innerText = prendas[actual].nombre;

let currentStream;
let useFrontCamera = true;

function cambiarPrenda(dir) {
  actual = (actual + dir + prendas.length) % prendas.length;
  camisetaImg.src = prendas[actual].img;
  document.getElementById('nombre-prenda').innerText = prendas[actual].nombre;
}

document.getElementById('prev').onclick = () => cambiarPrenda(-1);
document.getElementById('next').onclick = () => cambiarPrenda(1);
document.getElementById('flip').onclick = () => {
  useFrontCamera = !useFrontCamera;
  iniciarCamara();
};

canvas.addEventListener('click', () => {
  document.getElementById('etiqueta-img').src = prendas[actual].etiqueta;
  document.getElementById('etiqueta-container').style.display = 'flex';
});
document.getElementById('cerrar-etiqueta').onclick = () => {
  document.getElementById('etiqueta-container').style.display = 'none';
};

const pose = new Pose({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
pose.onResults(onResults);

function iniciarCamara() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: useFrontCamera ? 'user' : 'environment'
    }
  }).then(stream => {
    currentStream = stream;
    video.srcObject = stream;
    video.play();
    const camera = new Camera(video, {
      onFrame: async () => await pose.send({ image: video }),
      width: 640,
      height: 480
    });
    camera.start();
  });
}

function onResults(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(useFrontCamera ? -1 : 1, 1);
  ctx.translate(useFrontCamera ? -canvas.width : 0, 0);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    const ls = results.poseLandmarks[11];
    const rs = results.poseLandmarks[12];

    const x = ls.x * canvas.width;
    const y = ls.y * canvas.height;
    const width = (rs.x - ls.x) * canvas.width * 1.5;
    const height = width * 1.4;

    ctx.drawImage(camisetaImg, x - width * 0.25, y, width, height);
  }

  ctx.restore();
}

iniciarCamara();
