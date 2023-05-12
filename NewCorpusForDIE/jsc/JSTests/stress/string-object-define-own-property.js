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
        throw new Error('bad value: ' + actual);
}

var string = new String("Cocoa");
shouldBe(Reflect.defineProperty(string, 0, {
}), true);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    configurable: false
}), true);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    configurable: true
}), false);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    enumerable: true
}), true);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    enumerable: false
}), false);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    writable: false,
}), true);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    writable: false,
    value: 'C',
    configurable: true
}), false);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    writable: true,
    value: 52,
}), false);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    value: 52,
}), false);
shouldBe(Reflect.get(string, 0), 'C');

shouldBe(Reflect.defineProperty(string, 0, {
    writable: false,
    value: 'C',
    configurable: false
}), true);
shouldBe(Reflect.get(string, 0), 'C');

// Out of range.
shouldBe(Reflect.defineProperty(string, 2000, {
    value: 'Cappuccino'
}), true);
shouldBe(Reflect.get(string, 2000), 'Cappuccino');
shouldBe(Reflect.defineProperty(string, "Hello", {
    value: 'Cappuccino'
}), true);
shouldBe(Reflect.get(string, "Hello"), 'Cappuccino');
