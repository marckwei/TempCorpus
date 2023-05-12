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

// WeakSet constructor with adder change.

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== errorMessage)
            throw new Error(`Bad error: ${error}`);
    }
    if (!errorThrown)
        throw new Error("Didn't throw!");
}

var originalAdder = WeakSet.prototype.add;
var counter = 0;

WeakSet.prototype.add = function (key) {
    counter++;
    return originalAdder.call(this, key);
};

var obj0 = {};
var obj1 = {};
var obj2 = [];
var obj3 = new Date();
var obj4 = new Error();
var obj5 = JSON;

var values = [
    obj0,
    obj1,
    obj2,
    obj3,
    obj4,
    obj5,
    obj4,
    obj3,
    obj2,
    obj1,
    obj0,
];
var set = new WeakSet(values);
if (counter !== values.length)
    throw new Error("bad counter " + counter);

WeakSet.prototype.add = function () {
    throw new Error("adder called");
};

var set = new WeakSet();
var set = new WeakSet([]);

shouldThrow(() => {
    new WeakSet([ 0 ]);
}, "Error: adder called");

WeakSet.prototype.add = "foo";
shouldThrow(() => {
    new WeakSet([ 0 ]);
}, "TypeError: 'add' property of a WeakSet should be callable.");
