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
function fooMaker(aParam) {
    var a = aParam;
    return function(bParam) {
        var b = bParam;
        return function(cParam) {
            var c = cParam;
            return function(dParam) {
                var d = dParam;
                return function(eParam) {
                    var e = eParam;
                    return function (fParam) {
                        var f = a + b + c + d + e + fParam;
                        for (var i = 0; i < 1000; ++i)
                            f += a;
                        return f;
                    };
                };
            };
        };
    };
}

var foo = fooMaker(42)(1)(2)(3)(4);

noInline(foo);

for (var i = 0; i < 20000; ++i) {
    var result = foo(5);
    if (result != 42057)
        throw "Error: bad result: " + result;
}

var result = fooMaker(23)(2)(3)(4)(5)(5);
if (result != 23042)
    throw "Error: bad result: " + result;
