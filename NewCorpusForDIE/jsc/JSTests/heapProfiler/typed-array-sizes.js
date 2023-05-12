function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

load("./driver/driver.js");

(function() {
    const bufferBytes = 4 * 2000;
    const typedArraySize = 1000;
    const typedArrayBytes = 4 * typedArraySize;
    assert(typedArrayBytes < bufferBytes, "Sizes should be different");

    let buffer = new ArrayBuffer(bufferBytes);
    let view = new Float32Array(buffer);
    let typedArray = new Uint32Array(typedArraySize);

    let snapshot = createCheapHeapSnapshot();

    let arrayBufferNodes = snapshot.nodesWithClassName("ArrayBuffer");
    let viewNodes = snapshot.nodesWithClassName("Float32Array");
    let typedArrayNodes = snapshot.nodesWithClassName("Uint32Array");
    assert(arrayBufferNodes.length === 1, "Snapshot should contain 1 'ArrayBuffer' instance");
    assert(viewNodes.length === 1, "Snapshot should contain 1 'Float32Array' instance");
    assert(typedArrayNodes.length === 1, "Snapshot should contain 1 'Uint32Array' instance");

    let arrayBufferNode = arrayBufferNodes[0];
    let viewNode = viewNodes[0];
    let typedArrayNode = typedArrayNodes[0];
    assert(arrayBufferNode.size >= bufferBytes, "ArrayBuffer node should have a large size");
    assert(viewNode.size <= 100, "Float32Array node should have a very small size, it just wraps the already large ArrayBuffer");
    assert(typedArrayNode.size >= typedArrayBytes && typedArrayNode.size < bufferBytes, "Uint32Array node should have a large size, but not as large as the ArrayBuffer");
})();
