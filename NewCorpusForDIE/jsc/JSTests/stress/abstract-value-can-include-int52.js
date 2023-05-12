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

//@ runDefault("--useRandomizingFuzzerAgent=1", "--jitPolicyScale=0", "--useConcurrentJIT=0", "--useConcurrentGC=0")

function foo(n) {
    while (n) {
        n >>>= 1;
    }
    return ''[0];
}
var indexP;
var indexO = 0;
for (var index = 0; index <= 100; index++) {
    if (index < 8 || index > 60 && index <= 65 || index > 1234 && index < 1234) {
        let x = foo(index);
        if (parseInt('1Z' + String.fromCharCode(index), 36) !== 71) {
            if (indexO === 0) {
                indexO = 0;
            } else {
                if (index - indexP) {
                    var hexP = foo(indexP);
                    index - index
                    index = index;
                }
            }
            indexP = index;
        }
    }
}
