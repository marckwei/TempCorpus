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

//@ runDefault("--validateOptions=true", "--useConcurrentJIT=false", "--useConcurrentGC=false", "--validateBCE=true", "--thresholdForJITSoon=1", "--thresholdForJITAfterWarmUp=7", "--thresholdForOptimizeAfterWarmUp=7", "--thresholdForOptimizeAfterLongWarmUp=7", "--thresholdForOptimizeSoon=1", "--thresholdForFTLOptimizeAfterWarmUp=10")

function assert(b) {
    if (!b)
        throw new Error;
}

function main() {
    let v17 = {__proto__:[42,1]};
    v17[2] = 4;
        
    let v92 = 0;
    for (let v95 = 0; v95 < 100; v95++) {
        function doEvery(e, i) {
            assert(e === 42);
            assert(i === 0);
            function doMap() {
                v139 = v92++;
            }   
            noInline(doMap);
            [0].map(doMap);
        }   
        noInline(doEvery);
        v17.every(doEvery);
    }   
    assert(v139 === 99);
}
main();
