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

//@ runDefault
//@ runNoJIT

function shouldMatch(regexp, str) {
    let result = regexp.test(str);
    if (result !== true)
        throw new Error("Expected " + regexp + ".test(\"" + str + "\") to be true, but wasn't");
}

function shouldntMatch(regexp, str) {
    let result = regexp.test(str);
    if (result !== false)
        throw new Error("Expected " + regexp + ".test(\"" + str + "\") to be false, but wasn't");
}

let s = String.fromCodePoint(0x10000);

shouldMatch(/./, s);
shouldMatch(/./u, s);
shouldMatch(/../, s);
shouldntMatch(/../u, s);
shouldntMatch(/.../, s);
shouldntMatch(/.../u, s);

shouldMatch(/./s, s);
shouldMatch(/./su, s);
shouldMatch(/../s, s);
shouldntMatch(/../su, s);
shouldntMatch(/.../s, s);
shouldntMatch(/.../su, s);
