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

//@ $skipModes << :lockdown if $buildType == "debug"

const numPixels = 24000000;
let source = new Uint8Array(numPixels);
let target = new Uint8Array(numPixels);

for (let i = 0; i < source.length; ++i) {
    if (Math.random() > 0.35)
        source[i] = 0;
    else
        source[i] = 1;
}

const area = {
    x: asDoubleNumber(1.0),
    y: asDoubleNumber(1.0),
    x2: asDoubleNumber(1001.0),
    y2: asDoubleNumber(1001.0),
    width: asDoubleNumber(1000.0),
    height: asDoubleNumber(1000.0),
    segmentationWidth: asDoubleNumber(6000.0),
    edgesCacheWidth: asDoubleNumber(6000.0),
};

function test(source, target, area) {
    // fast implementation that can't handle edges of segmentation area
    const segmentationWidth = area.segmentationWidth;
    const edgesCacheWidth = area.edgesCacheWidth;
    const {x2, y2} = area;

    for (let y = area.y; y < y2; ++y) {
        for (let x = area.x; x < x2; ++x) {
            const sourceIndex = (y * segmentationWidth) + x;
            const value = source[sourceIndex];

            if (value !== source[sourceIndex - 1] ||
                value !== source[sourceIndex + 1] ||
                value !== source[sourceIndex - segmentationWidth] ||
                value !== source[sourceIndex + segmentationWidth])
            {
                const targetIndex = (y * edgesCacheWidth) + x;
                target[targetIndex] = 1;
            }
        }
    }
}
noInline(test);

test(source, target, area);
