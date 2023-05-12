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

// Test a bunch of things about typed array constructors with iterators.

// Test that the dfg actually respects iterators.
let foo = [1,2,3,4];

function iterator() {
    return { i: 0,
             next: function() {
                 if (this.i < foo.length/2) {
                     return { done: false,
                              value: foo[this.i++]
                            };
                 }
                 return { done: true };
             }
           };
}

foo[Symbol.iterator] = iterator;

(function body() {

    for (var i = 1; i < 100000; i++) {
        if (new Int32Array(foo).length !== 2)
            throw "iterator did not run";
    }

})();

// Test that the optimizations used for iterators during construction is valid.

foo = { 0:0, 1:1, 2:2, 3:3 };
count = 4;
foo.__defineGetter__("length", function() {
    return count--;
});

foo[Symbol.iterator] = Array.prototype[Symbol.iterator];

if (new Int32Array(foo).length !== 2)
    throw "iterator did not run";

// Test that we handle length is unset... whoops.

foo = { 0:0, 2:2, 3:3 };

if (new Int32Array(foo).length !== 0)
    throw "did not handle object with unset length";

// Test that we handle prototypes with accessors.

foo = { 0:0, 2:2, 3:3 };
foo[Symbol.iterator] = Array.prototype[Symbol.iterator];
foo.length = 4;
bar = { };

bar.__defineGetter__("1", function() {
    foo.length = 0;
    return 1;
});


foo.__proto__ = bar;

if (new Int32Array(foo).length !== 2)
    throw "did not handle object with accessor on prototype";
