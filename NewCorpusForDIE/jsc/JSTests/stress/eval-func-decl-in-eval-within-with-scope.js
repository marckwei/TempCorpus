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

function foo(withScope, firstAssertValue,  secondAssertValue) {
    with (withScope) {
        eval("{ function f() { } }");
        assert(typeof f, firstAssertValue, f);
    }
    assert(typeof f, secondAssertValue);
}

function boo(withScope, firstAssertValue,  secondAssertValue) {
    with (withScope) {
        eval(" for(var i = 0; i < 10000; i++ ){ if (i > 0) { function f() { }; } } ");
        assert(typeof f, firstAssertValue);
    }
    assert(typeof f, secondAssertValue);
}
{ 
    for (var i = 0; i < 10000; i++) {
        foo({}, 'function', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }

    boo({}, 'function', 'function');
}
{
    for (var i = 0; i < 10000; i++) {
        foo({f : 10}, 'number', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }
    boo({f : 10}, 'number', 'function');

    for (var i = 0; i < 10000; i++) {
        foo({f : {}}, 'object', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }
    boo({f : {}}, 'object', 'function');
}
{
    for (var i = 0; i < 10000; i++) {
        foo(12345, 'function', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }
    boo(12345, 'function', 'function');

    for (var i = 0; i < 10000; i++) {
        let val  = 12345;
        val.f = 10;
        foo(val, 'function', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }
    let x  = 12345;
    x.f = 10;
    boo(x, 'function', 'function');
}
{

    for (var i = 0; i < 10000; i++) {
        foo('12345', 'function', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }
    boo('12345', 'function', 'function');

    for (var i = 0; i < 10000; i++) {
        let val  = '12345';
        val.f = 10;
        foo(val, 'function', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }
    let z  = '12345';
    z.f = 10;
    boo(z, 'function', 'function');
}
{
    for (var i = 0; i < 10000; i++) {
        foo(function () {}, 'function', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }

    boo(function () {}, 'function', 'function');

    for (var i = 0; i < 10000; i++) {
        let val2 = function () {};
        val2.f = 10;
        foo(val2, 'number', 'function');
        assertThrow(() => f, "ReferenceError: Can't find variable: f");
    }

    let val3 = function () {};
    val3.f = 10;
    boo(val3, 'number', 'function');
}