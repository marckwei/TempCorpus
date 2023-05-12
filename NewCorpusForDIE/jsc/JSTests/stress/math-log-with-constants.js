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

// Basic cases of Math.log() when the value passed are constants.

// log(NaN).
function logNaN() {
    return Math.log(NaN);
}
noInline(logNaN);

function testLogNaN() {
    for (var i = 0; i < 10000; ++i) {
        var result = logNaN();
        if (!isNaN(result))
            throw "logNaN() = " + result + ", expected NaN";
    }
}
testLogNaN();


// log(0).
function logZero() {
    return Math.log(0);
}
noInline(logZero);

function testLogZero() {
    for (var i = 0; i < 10000; ++i) {
        var result = logZero();
        if (result !== -Infinity)
            throw "logZero() = " + result + ", expected -Infinity";
    }
}
testLogZero();


// log(1).
function logOne() {
    return Math.log(1);
}
noInline(logOne);

function testLogOne() {
    for (var i = 0; i < 10000; ++i) {
        var result = logOne();
        if (result !== 0)
            throw "logOne(1) = " + result + ", expected 0";
    }
}
testLogOne();


// log(-1).
function logMinusOne() {
    return Math.log(-1);
}
noInline(logMinusOne);

function testLogMinusOne() {
    for (var i = 0; i < 10000; ++i) {
        var result = logMinusOne();
        if (!isNaN(result))
            throw "logMinusOne() = " + result + ", expected NaN";
    }
}
testLogMinusOne();


// log(Infinity).
function logInfinity() {
    return Math.log(Infinity);
}
noInline(logInfinity);

function testLogInfinity() {
    for (var i = 0; i < 10000; ++i) {
        var result = logInfinity();
        if (result !== Infinity)
            throw "logInfinity() = " + result + ", expected Infinity";
    }
}
testLogInfinity();


// log(-Infinity).
function logMinusInfinity() {
    return Math.log(-Infinity);
}
noInline(logMinusInfinity);

function testLogMinusInfinity() {
    for (var i = 0; i < 10000; ++i) {
        var result = logMinusInfinity();
        if (!isNaN(result))
            throw "logMinusInfinity() = " + result + ", expected NaN";
    }
}
testLogMinusInfinity();


// log(integer).
function logInteger() {
    return Math.log(42);
}
noInline(logInteger);

function testLogInteger() {
    for (var i = 0; i < 10000; ++i) {
        var result = logInteger();
        if (result !== 3.7376696182833684)
            throw "logInteger() = " + result + ", expected 3.7376696182833684";
    }
}
testLogInteger();


// log(double).
function logDouble() {
    return Math.log(Math.PI);
}
noInline(logDouble);

function testLogDouble() {
    for (var i = 0; i < 10000; ++i) {
        var result = logDouble();
        if (result !== 1.1447298858494002)
            throw "logDouble() = " + result + ", expected 1.1447298858494002";
    }
}
testLogDouble();