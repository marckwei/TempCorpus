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

function assert(a) {
    if (!a)
        throw Error("Bad assertion!");
}

function testProperties(o, initProperty, testProperty, shouldThrow) {
    Object.defineProperty(arguments, 0, initProperty);

    if (shouldThrow) {
        try {
            Object.defineProperty(arguments, 0, testProperty);
            assert(false);
        } catch(e) {
            assert(e instanceof TypeError);
        }
    } else {
        assert(Object.defineProperty(arguments, 0, testProperty));
    }
}

testProperties("foo", {configurable: false}, {writable: true}, false);
testProperties("foo", {configurable: false}, {configurable: true}, true);
testProperties("foo", {configurable: false, enumareble: true}, {enumerable: false}, true);
testProperties("foo", {configurable: false, writable: false}, {writable: false}, false);
testProperties("foo", {configurable: false, writable: false}, {writable: true}, true);
testProperties("foo", {configurable: false, writable: false, value: 50}, {value: 30}, true);
testProperties("foo", {configurable: false, writable: false, value: 30}, {value: 30}, false);
testProperties("foo", {configurable: false, get: () => {return 0}}, {get: () => {return 10}}, true);
let getterFoo = () => {return 0};
testProperties("foo", {configurable: false, get: getterFoo}, {get: getterFoo}, false);
testProperties("foo", {configurable: false, set: (x) => {return 0}}, {get: (x) => {return 10}}, true);
let setterFoo = (x) => {return 0};
testProperties("foo", {configurable: false, set: setterFoo}, {set: setterFoo}, false);

