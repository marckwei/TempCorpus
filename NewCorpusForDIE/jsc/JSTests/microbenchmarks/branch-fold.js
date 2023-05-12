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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
function f()
{
    var i;
    var limit = 150000;

    for (i = 0; (i < limit) == true; ++i) {
    }

    if (i != limit)
        throw "bad result";

    for (i = 0; (i < limit) === true; ++i) {
    }

    if (i != limit)
        throw "bad result";

    i = 0;
    for (var done = false; done == false; ) {
        if (!(++i < limit))
            done = true;
    }

    if (i != limit)
        throw "bad result";

    i = 0;
    while (true) {
        if ((++i < limit) == false)
            break;
    }

    if (i != limit)
        throw "bad result";

    i = 0;
    while (1) {
        if ((++i < limit) != true)
            break;
    }

    if (i != limit)
        throw "bad result";

    i = limit;
    while (--i) {
        if ((i & 1) == 0)
            continue;
    }

    if (i != 0)
        throw "bad result";
}

function g(x, y)
{
    var i;
    var limit = 150000;

    for (i = 0; i < limit; ++i) {
        if (true == false)
            break;
        if (true != true)
            break;
        if ("start" === "end")
            break;
        if (null !== null)
            break;
    }

    if (i != limit)
        throw "bad result";

    for (i = 0; i < limit; ++i) {
        if (x == false)
            break;
        if (x !== true)
            break;
        if (x != y)
            break;
        if (x !== y)
            break;
        x = x == y;
    }

    if (i != limit)
        throw "bad result";
}

f();
g(true, true);
