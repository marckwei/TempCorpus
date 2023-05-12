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

//@ requireOptions("--useRecursiveJSONParse=0")

function assert(b) {
    if (!b)
        throw new Error;
}

assert(JSON.stringify(JSON.parse('[1337,42]', function (x, y) {
    if (this instanceof Array) {
        Object.defineProperty(this, '1', {value: Array.prototype});
        return y;
    }
    return this;
})) === '{"":[1337,[]]}');

assert(JSON.stringify(JSON.parse('[0, 1]', function(x, y) {
    this[1] = Array.prototype;
    return y;
})) === '[0,[]]');

assert(JSON.stringify(JSON.parse('{"x":22, "y":44}', function(a, b) {
    this.y = Array.prototype;
    return b;
})) === '{"x":22,"y":[]}');

Array.prototype[0] = 42;
assert(JSON.stringify(JSON.parse('{"x":22, "y":44}', function(a, b) {
    this.y = Array.prototype;
    return b;
})) === '{"x":22,"y":[42]}');
