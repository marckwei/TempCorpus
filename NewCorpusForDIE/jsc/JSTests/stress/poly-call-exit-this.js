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

(function() {
    function foo(x) { return 1 + this.f; }
    function bar(x) { return x + this.f; }
    function baz(x) { return x + 1 + this.f; }
    
    var n = 1000000;
    
    var result = (function(o) {
        var f = {fun:foo, f:1};
        var g = {fun:bar, f:2};
        var h = {fun:baz, f:3};
        
        var result = 0;
        for (var i = 0; i < n; ++i) {
            if (i == n - 1)
                f = h;
            result += f.fun(o.f);
            
            var tmp = f;
            f = g;
            g = tmp;
        }
        
        return result;
    })({f:42});
    
    if (result != ((n / 2 - 1) * (42 + 2)) + (n / 2 * (1 + 1) + (42 + 1 + 3)))
        throw "Error: bad result: " + result;
})();
