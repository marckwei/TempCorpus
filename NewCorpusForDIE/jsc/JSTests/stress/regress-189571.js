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

function assert(name, actual, expected) {
    if (actual != expected) {
        print("FAILED test " + name + ": expected " + expected + ", actual: " + actual);
        throw "FAILED";
    }
}

function checkResult(name, result, expectedK, expectedProp) {
    assert(name, result[0], expectedK);
    assert(name, result[1], expectedProp);
}

// ForIn on Indexed properties.

function testIndexedProperties(o) {
    for (var k in o) {
        {
            function k() { }
        }
        return [ k, o[k] ];
    }
}

var o = [42];
for (var i = 0; i < 10000; ++i) {
    var result = testIndexedProperties(o);
    checkResult("testIndexedProperties", result, "function k() { }", undefined);
}

function testIndexedProperties2(o) {
    for (var k in o) {
        {
            k = "boo";
            function k() { }
        }
        return [ k, o[k] ];
    }
}

var o = [42];
for (var i = 0; i < 10000; ++i) {
    var result = testIndexedProperties2(o);
    checkResult("testIndexedProperties2", result, "boo", undefined);
}

function testIndexedProperties3(o) {
    for (var k in o) {
        try {
        } finally {
            {
                function k() { }
            }
        }
        return [ k, o[k] ];
    }
}

var o = [42];
for (var i = 0; i < 10000; ++i) {
    var result = testIndexedProperties3(o);
    checkResult("testIndexedProperties3", result, "function k() { }", undefined);
}

function testIndexedProperties4(o) {
    for (var k in o) {
        try {
        } finally {
            {
                k = "boo";
                function k() { }
            }
        }
        return [ k, o[k] ];
    }
}

var o = [42];
for (var i = 0; i < 10000; ++i) {
    var result = testIndexedProperties4(o);
    checkResult("testIndexedProperties4", result, "boo", undefined);
}

// ForIn on Structure properties.

function testStructureProperties(o) {
    for (var k in o) {
        {
            function k() { }
        }
        return [ k, o[k] ];
    }
}

var o = {a: 42};
for (var i = 0; i < 10000; ++i) {
    var result = testStructureProperties(o);
    checkResult("testStructureProperties", result, "function k() { }", undefined);
}

function testStructureProperties2(o) {
    for (var k in o) {
        {
            k = 0x1234;
            function k() { }
        }
        return [ k, o[k] ];
    }
}

var o = {a: 42};
for (var i = 0; i < 10000; ++i) {
    var result = testStructureProperties2(o);
    checkResult("testStructureProperties2", result, 0x1234, undefined);
}

function testStructureProperties3(o) {
    for (var k in o) {
        try {
        } finally {
            {
                function k() { }
            }
        }
        return [ k, o[k] ];
    }
}

var o = {a: 42};
for (var i = 0; i < 10000; ++i) {
    var result = testStructureProperties3(o);
    checkResult("testStructureProperties3", result, "function k() { }", undefined);
}

function testStructureProperties4(o) {
    for (var k in o) {
        try {
        } finally {
            {
                k = 0x1234;
                function k() { }
            }
        }
        return [ k, o[k] ];
    }
}

var o = {a: 42};
for (var i = 0; i < 10000; ++i) {
    var result = testStructureProperties4(o);
    checkResult("testStructureProperties4", result, 0x1234, undefined);
}
