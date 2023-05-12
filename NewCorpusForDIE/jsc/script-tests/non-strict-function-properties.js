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

description('Test caller and arguments properties in function in non strict mode');

function foo() {
    return 1;
}

shouldBe('Object.getOwnPropertyNames(function () {}).length', '3');

shouldBeFalse('Object.getOwnPropertyNames(function () {}).includes("caller")');
shouldBeFalse('Object.getOwnPropertyNames(function () {}).includes("arguments")');

shouldBeFalse('(function(){}).hasOwnProperty("caller")');
shouldBeTrue('(function(){}).__proto__.hasOwnProperty("caller")');

shouldBeFalse('(function(){}).hasOwnProperty("arguments")');
shouldBeTrue('(function(){}).__proto__.hasOwnProperty("arguments")');

shouldBe('typeof Object.getOwnPropertyDescriptor(foo, "arguments")', '"undefined"');
shouldBe('typeof Object.getOwnPropertyDescriptor(foo, "caller")', '"undefined"');

shouldBe('foo.caller', 'null');
shouldBe('foo.arguments', 'null');

foo.caller = 10;
foo.arguments = 10;

shouldBe('foo.caller', 'null');
shouldBe('foo.arguments', 'null');

var boo = function () { return boo.arguments; };

shouldBe('boo("abc")[0]','"abc"');

boo.arguments = 'not-expected-value';
shouldBe('boo("expected-value")[0]','"expected-value"');

var f = function () { return f.caller;  };
var g = function (cb) { return cb(); };

shouldBe('g(f)','g');

var doSetCaller = function (value, doDelete) {
	var f = function () {};
	if (doDelete)
		delete f.__proto__.caller;
	f.__proto__.caller = value;
	return f;
};

var value = "property-value";

shouldThrow("doSetCaller(value, false)", "'TypeError: \\'arguments\\', \\'callee\\', and \\'caller\\' cannot be accessed in this context.'");
shouldBe("doSetCaller(value, true).__proto__.caller", "value");


var doSetArguments = function (value, doDelete) {
	var f = function () {};
	if (doDelete)
		delete f.__proto__.arguments;
	f.__proto__.arguments = value;
	return f;
};

shouldThrow("doSetArguments(value, false)", "'TypeError: \\'arguments\\', \\'callee\\', and \\'caller\\' cannot be accessed in this context.'");
shouldBe("doSetArguments(value, true).__proto__.arguments", "value");
