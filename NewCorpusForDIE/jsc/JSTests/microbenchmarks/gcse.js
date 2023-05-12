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
(function(){
    var o = {f:42};
    var p = {f:43};
    var result = 0;
    var n = 1000000;
    for (var i = 0 ; i < n; ++i) {
        var a = o.f;
        var b = o.f;
        var c = o.f;
        var d = o.f;
        if (d) {
            var e = o.f;
            var f = o.f;
            var g = o.f;
            var h = o.f;
            if (h) {
                var j = o.f;
                var k = o.f;
                var l = o.f;
                var m = o.f;
                if (m) {
                    var q = o.f;
                    var r = o.f;
                    var s = o.f;
                    var t = o.f;
                    if (t)
                        result += r;
                }
            }
        }
        var tmp = o;
        o = p;
        p = tmp;
    }
    if (result != (n / 2) * o.f + (n / 2) * p.f)
        throw "Error: bad result: " + result;
})();
