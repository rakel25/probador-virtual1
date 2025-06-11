const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

const camisetas = [];
const nombres = ['azul.png', 'morada.png', 'naranja.png', 'verde.png'];

let camisetaActual = 0;
let cargadas = 0;

nombres.forEach((nombre, i) => {
  camisetas[i] = new Image();
  camisetas[i].src = `camisetas/${nombre}`;
  camisetas[i].onload = () => {
    cargadas++;
    if (cargadas === nombres.length) {
      iniciarCamara();
    }
  };
});

function cambiarCamiseta(index) {
  camisetaActual = index;
}

function iniciarCamara() {
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 720,
    height: 1280
  });
  camera.start();
}

function onResults(results) {
  const width = canvasElement.width = videoElement.videoWidth;
  const height = canvasElement.height = videoElement.videoHeight;

  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.drawImage(results.image, 0, 0, width, height);

  if (results.poseLandmarks) {
    const shoulders = {
      left: results.poseLandmarks[11],
      right: results.poseLandmarks[12]
    };
    const hips = {
      left: results.poseLandmarks[23],
      right: results.poseLandmarks[24]
    };

    if (shoulders.left && shoulders.right && hips.left && hips.right) {
      const topX = shoulders.left.x * width;
      const topY = shoulders.left.y * height;

      const shoulderWidth = (shoulders.right.x - shoulders.left.x) * width * 1.2;
      const torsoHeight = ((hips.left.y + hips.right.y) / 2 - (shoulders.left.y + shoulders.right.y) / 2) * height * 2;

      const x = shoulders.left.x * width - shoulderWidth * 0.1;
      const y = shoulders.left.y * height + 20;

      canvasCtx.drawImage(camisetas[camisetaActual], x, y, shoulderWidth, torsoHeight);
    }
  }
}
