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

// Simple assignment (not FunctionCallBracketNode).

shouldBe(function () {
    var object = {
        null: 'ok'
    };

    return object[object = null];
}(), 'ok');

shouldBe(function (value) {
    var object = { };
    object.null = 'ok';

    return object[object = value];
}(null), 'ok');

shouldBe(function () {
    var object = {
        null: 'ok'
    };

    return object['null'];
}(), 'ok');

shouldBe(function (value) {
    var object = { };
    object.null = 'ok';

    return object['null'];
}(null), 'ok');

shouldBe(function () {
    var object = {
        null: 'ok'
    };

    function fill() {
        return object = null;
    }

    return object[fill()];
}(), 'ok');

shouldBe(function (value) {
    var object = { };
    object.null = 'ok';

    function fill() {
        return object = value;
    }

    return object[fill()];
}(null), 'ok');

// FunctionCallBracketNode.

shouldBe(function () {
    var object = {
        null: function () {
            return 'ok';
        }
    };

    return object[object = null]();
}(), 'ok');

shouldBe(function (value) {
    var object = { };
    object.null = function () {
        return 'ok';
    };

    return object[object = value]();
}(null), 'ok');

shouldBe(function () {
    var object = {
        null: function () {
            return 'ok';
        }
    };

    return object['null']();
}(), 'ok');

shouldBe(function (value) {
    var object = { };
    object.null = function () {
        return 'ok';
    };

    return object['null']();
}(null), 'ok');

shouldBe(function () {
    var object = {
        null: function () {
            return 'ok';
        }
    };

    function fill() {
        return object = null;
    }

    return object[fill()]();
}(), 'ok');

shouldBe(function (value) {
    var object = { };
    object.null = function () {
        return 'ok';
    };

    function fill() {
        return object = value;
    }

    return object[fill()]();
}(null), 'ok');
