const splash = document.getElementById('splash');
const fittingRoom = document.getElementById('fittingRoom');
const startBtn = document.getElementById('startBtn');
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output');
const canvasCtx = canvasElement.getContext('2d');
const clothingImg = document.getElementById('clothingImg');
const selector = document.getElementById('clothingSelector');

canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;

startBtn.onclick = () => {
  splash.style.display = 'none';
  fittingRoom.style.display = 'block';
  initCameraAndPose();
};

selector.addEventListener('change', () => {
  const selected = selector.value;
  clothingImg.src = `clothes/${selected}.png`;
});

function initCameraAndPose() {
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

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });
  camera.start();
}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const left = results.poseLandmarks[11];
    const right = results.poseLandmarks[12];

    const x = (left.x + right.x) / 2 * canvasElement.width;
    const y = (left.y + right.y) / 2 * canvasElement.height;

    const width = Math.abs(left.x - right.x) * canvasElement.width * 1.5;
    const height = width * 1.2;

    canvasCtx.drawImage(clothingImg, x - width / 2, y - height / 2, width, height);
  }

  canvasCtx.restore();
}
