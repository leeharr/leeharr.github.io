const myWorker = new Worker("static/js/testworker.js");

if (crossOriginIsolated) {
  console.log('ISOLATED');
  const buffer = new SharedArrayBuffer(16);
  myWorker.postMessage(buffer);
} else {
  console.log('NOT ISOLATED');
  const buffer = new ArrayBuffer(16);
  myWorker.postMessage(buffer);
}
