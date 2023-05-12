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

function test(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function testArguments(check) {
    (function () {
        check(arguments, []);
    }());

    (function (a, b, c) {
        check(arguments, [a, b, c]);
    }());

    (function () {
        'use strict';
        check(arguments, []);
    }());

    (function (a, b, c) {
        'use strict';
        check(arguments, [a, b, c]);
    }());
}

testArguments(function (args) {
    var iteratorMethod = args[Symbol.iterator];
    test(iteratorMethod, Array.prototype.values);
    var descriptor = Object.getOwnPropertyDescriptor(args, Symbol.iterator);
    test(descriptor.writable, true);
    test(descriptor.configurable, true);
    test(descriptor.enumerable, false);
    test(descriptor.value, iteratorMethod);
});

testArguments(function (args, expected) {
    var iterator = args[Symbol.iterator]();
    test(iterator.toString(), '[object Array Iterator]');
    var index = 0;
    for (var value of iterator) {
        test(value, expected[index++]);
    }
    test(args.length, index);

    var index = 0;
    for (var value of args) {
        test(value, expected[index++]);
    }
    test(args.length, index);
});

testArguments(function (args) {
    var symbols = Object.getOwnPropertySymbols(args);
    test(symbols.length, 1);
    test(symbols[0], Symbol.iterator);
});

testArguments(function (args) {
    'use strict';
    args[Symbol.iterator] = 'not throw error';
});

testArguments(function (args) {
    'use strict';
    delete args[Symbol.iterator];
    test(args[Symbol.iterator], undefined);

    var symbols = Object.getOwnPropertySymbols(args);
    test(symbols.length, 0);
});
