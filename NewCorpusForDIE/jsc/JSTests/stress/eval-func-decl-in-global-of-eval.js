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

var assertThrow = function (cb, expected) {
    let error = null;
    try {
        cb();
    } catch(e) {
        error = e;  
    }
    if (error === null) {
        throw new Error('Error is expected. Expected "' + expected + '" but error was not thrown."');
    }
    if (error.toString() !== expected) {
        throw new Error('Error is expected. Expected "' + expected + '" but error was "' + error + '"');
    }
}


function bar() {
    {
        let f = 20;
        let value = 10; 
        eval("function f() { value = 20; }; f();");
    }
}


for (var i = 0; i < 10000; i++){
    assertThrow(() => bar(), "SyntaxError: Can't create duplicate variable in eval: 'f'");
    assertThrow(() => f, "ReferenceError: Can't find variable: f");
}

function baz() {
    {
        var l = 20;
        var value = 10;
        eval("function l() { value = 20; }; l();");
        assert(typeof l, 'function');
        assert(value, 20);
    }
    assert(typeof l, 'function');
}

for (var i = 0; i < 10000; i++){
    baz();
    assertThrow(() => l, "ReferenceError: Can't find variable: l");
}

function foobar() {
    {
        let g = 20;
        let value = 10;
        eval("function l() { value = 30; }; l();");
        assert(typeof g, 'number');
        assert(value, 30);
    }
    assertThrow(() => g, "ReferenceError: Can't find variable: g");
}

foobar();
assertThrow(() => g, "ReferenceError: Can't find variable: g");

