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

var testCase = function (actual, expected, message) {
  if (actual !== expected) {
    throw message + ". Expected '" + expected + "', but was '" + actual + "'";
  }
};


var obj = { name:'obj', method: function () { return (value) => this.name + "-name-" + value; }};

for (var i=0; i<10000; i++) {
  testCase(obj.method()('test' + i.toString()), 'obj-name-test' + i.toString(), "Error: this is not lexically binded inside of the arrow function #1");
}

for (var i=0; i<10000; i++) {
  var result1 = obj.method()('test' + i.toString());
  testCase(result1, 'obj-name-test' + i.toString(), "Error: this is not lexically binded inside of the arrow function #1");
}

obj.name='newObj';

for (var i=0; i<10000; i++) {
  testCase(obj.method()('test' + i.toString()), 'newObj-name-test' + i.toString(), "Error: this is not lexically binded inside of the arrow function #5");
}

for (var i=0; i<10000; i++) {
  var result2 = obj.method()('test' + i.toString());
  testCase(result2, 'newObj-name-test' + i.toString(), "Error: this is not lexically binded inside of the arrow function #5");
}
