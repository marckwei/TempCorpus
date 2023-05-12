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

//@ requireOptions("--useSamplingProfiler=true", "--useObjectAllocationSinking=false", "--sampleInterval=10")
// Note that original test was using --useProbeOSRExit=1

function foo(ranges) {
    const CHUNK_SIZE = 95;
    for (const [start, end] of ranges) {
        const codePoints = [];
        for (let length = 0, codePoint = start; codePoint <= end; codePoint++) {
            codePoints[length++] = codePoint;
            if (length === CHUNK_SIZE) {
                length = 0;
                codePoints.length = 0;
                String.fromCodePoint(...[]);
            }
        }
        String.fromCodePoint(...codePoints);
    }
}

for (let i=0; i<3; i++) {
    let x = foo([
        [ 0, 10000 ],
        [ 68000, 1114111 ]
    ]);
}
