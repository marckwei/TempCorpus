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

function field() { return "f"; }
noInline(field);

(function() {
    var o = {_f:42};
    o.__defineSetter__("f", function(value) { this._f = value * 100; });
    var n = 50000;
    function foo(o_, v_) {
        let f = field();
        var o = o_[f];
        var v = v_[f];
        o[f] = v;
        o[f] = v + 1;
    }
    noInline(foo);
    for (var i = 0; i < n; ++i) {
        foo({f:o}, {f:11});
    }
    if (o._f != (11 + 1) * 100)
        throw "Error: bad o._f: " + o._f;
    for (var i = 0; i < n; ++i) {
        foo({f:o}, {f:1000000000});
    }
    if (o._f != 100 * (1000000000 + 1))
        throw "Error: bad o._f (2): " + o._f;
})();

