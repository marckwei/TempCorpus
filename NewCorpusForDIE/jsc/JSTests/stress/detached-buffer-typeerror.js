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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

function shouldThrowTypeError(func) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof TypeError))
        throw new Error('Expected TypeError!');
}

function viewLength(view) {
  return view.byteLength;
}
noInline(viewLength);

function viewOffset(view) {
  return view.byteOffset;
}
noInline(viewOffset);

function loadU8(view, offset) {
  return view.getUint8(offset);
}
noInline(loadU8);

function storeU8(view, offset, value) {
  return view.setUint8(offset, value);
}
noInline(storeU8);

const buffer = new ArrayBuffer(1);
const view = new DataView(buffer);

for (let i = 0; i < 1e5; i++) {
  storeU8(view, 0, 0xff);
  shouldBe(loadU8(view, 0), 0xff);
  shouldBe(viewLength(view), 1);
  shouldBe(viewOffset(view), 0);
}

transferArrayBuffer(buffer);

shouldThrowTypeError(() => storeU8(view, 0, 0xff));
shouldThrowTypeError(() => loadU8(view, 0));
shouldThrowTypeError(() => viewLength(view));
shouldThrowTypeError(() => viewOffset(view));
