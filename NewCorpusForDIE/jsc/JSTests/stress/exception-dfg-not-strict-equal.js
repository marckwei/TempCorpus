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

;(function () {
function foo(a, b) {
    var result = null;
    try {
        result = a == b;
    } catch(e) {
    }
}
noInline(foo);

for (var i = 0; i < 1000; i++) {
    foo(10, 20);
    foo({}, {});
    foo(10, 10.0);
    foo("hello", "hello");
    foo(null, undefined);
    foo(false, 0);
}

var o = {
    valueOf: function() { return {}; },
    toString: function() { return {}; }
};
foo(o, "hello");
})();


function assert(b) {
    if (!b)
        throw new Error("Bad assertion");
}
noInline(assert);


;(function() {

var _shouldDoSomethingInFinally = false;
function shouldDoSomethingInFinally() { return _shouldDoSomethingInFinally; }
noInline(shouldDoSomethingInFinally);

function foo(a, b) {
    var result = null;
    try {
        result = a == b;
    } finally {
        if (shouldDoSomethingInFinally())
            assert(result === null);
    }
    return result;
}
noInline(foo);

for (var i = 0; i < 1000; i++) {
    foo(10, 20);
    foo({}, {});
    foo(10, 10.0);
    foo("hello", "hello");
    foo(null, undefined);
    foo(false, 0);
}

var o = {
    valueOf: function() { return {}; },
    toString: function() { return {}; }
};
try {
    _shouldDoSomethingInFinally = true;
    foo(o, "hello");
} catch(e) {}

})();
