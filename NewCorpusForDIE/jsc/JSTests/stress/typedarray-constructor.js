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

load("./resources/typedarray-constructor-helper-functions.js", "caller relative");

let TypedArray = Object.getPrototypeOf(Int32Array);

class A extends TypedArray {
    constructor() { super(); }

}

shouldThrow("new A()");

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

shouldBeTrue("testConstructor('(foo)', [1,2])");
debug("");

debug("Test that we don't premptively convert to native values and use a gc-safe temporary storage.");


done = false;
obj = {
    valueOf: function() {
        if (!done)
            throw "bad";
        return 1;
    }
};

foo = [obj, 2, 3, 4];

function iterator2() {
    done = false;
    return { i: 0,
             next: function() {
                 gc();
                 if (this.i < foo.length/2) {
                     return { done: false,
                              value: foo[this.i++]
                            };
                 }
                 done = true;
                 return { done: true };
             }
           };
}

foo[Symbol.iterator] = iterator2;

shouldBeTrue("testConstructor('(foo)', [1,2])");

shouldBeTrue("testConstructor('(true)', [0])");
shouldBeTrue("testConstructor('(`hi`)', [])");

finishJSTest();
