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
};

function foo() {
    {   
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
        eval('eval(" { function f() { }; } ")');
        assert(typeof f, "function");
    }
    assert(typeof f, "function");
}

for (var i = 0; i < 10000; i++){
    foo();
    assertThrow(() => f, "ReferenceError: Can't find variable: f");
}

function boo() {
    {
        assertThrow(() => l, "ReferenceError: Can't find variable: l");
        eval('{ var l = 15; eval(" { function l() { }; } ")}');
        assert(typeof l, "function", "#3");
    }
    assert(typeof l, 'function', "#4");
}

for (var i = 0; i < 10000; i++){
    boo();
    assertThrow(() => l, "ReferenceError: Can't find variable: l");
}

function hoo() {
    {
        assertThrow(() => h, "ReferenceError: Can't find variable: h");
        eval('eval(" if (false){ function h() { }; } ");');
        assert(h, undefined, '');
    }
    assert(h, undefined, '');
}

for (var i = 0; i < 10000; i++){
    hoo();
    assertThrow(() => h, "ReferenceError: Can't find variable: h");
}

function joo() {
    {
        assertThrow(() => h, "ReferenceError: Can't find variable: h");
        eval('eval(" if (true){ function h() { }; } ")');
        assert(typeof h, "function" );
    }
    assert(typeof h, "function", "#10");
}

for (var i = 0; i < 10000; i++){
    joo();
    assertThrow(() => h, "ReferenceError: Can't find variable: h");
}

function koo() {
    {
        var k = 20;
        eval('var k = 15; eval(" if (true){ function k() { }; } ")');
        assert(typeof k, "function" );
    }
    assert(typeof k, "function", "#12");
}

for (var i = 0; i < 10000; i++){
    koo();
    assertThrow(() => k, "ReferenceError: Can't find variable: k");
}
