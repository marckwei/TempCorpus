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

var assert = function (result, expected, message) {
  if (result !== expected) {
    throw new Error('Error in assert. Expected "' + expected + '" but was "' + result + '":' + message );
  }
};

var assertThrow = function (cb, errorText) {
    var error = null;
    try {
        cb();
    } catch (e) {
         error = e.toString();
    }
    if (error === null) 
        throw new Error('Expected error');
    if (error !== errorText)
        throw new Error('Expected error ' + errorText + ' but was ' + error);
};

{ 
  eval('{ function foo() {} }');
  assert(this.hasOwnProperty("foo"), true);
  assert(typeof foo, 'function');
}

Object.defineProperty(this, "globalNonWritable", {
  value: false,
  configurable: true,
  writable: false,
  enumerable: true
});
eval("{function globalNonWritable() { return 1; }}");
var globalNonWritableDescriptor
    = Object.getOwnPropertyDescriptor(this, "globalNonWritable");
assert(globalNonWritableDescriptor.enumerable, true);

Object.freeze(this);
{
  let error = false;
  try {
    eval('{ function boo() {} }');
  } catch (e) {
    error = true;
  }
  assert(this.hasOwnProperty("boo"), false);
  assert(error, false);
  assertThrow(() => boo, 'ReferenceError: Can\'t find variable: boo');
}
