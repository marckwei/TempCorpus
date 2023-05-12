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

// Map constructor with adder change.

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

var originalAdder = Map.prototype.set;
var counter = 0;

Map.prototype.set = function (key, value) {
    counter++;
    return originalAdder.call(this, key, value);
};

var values = [
    [ 0, 0 ],
    [ 1, 1 ],
    [ 2, 2 ],
    [ 3, 3 ],
    [ 4, 4 ],
    [ 5, 5 ],
    [ 4, 4 ],
    [ 3, 3 ],
    [ 2, 2 ],
    [ 1, 1 ],
    [ 0, 0 ],
];
var map = new Map(values);
if (map.size !== 6)
    throw "Error: bad map size " + map.size;
if (counter !== values.length)
    throw "Error: bad counter " + counter;

Map.prototype.set = function () {
    throw new Error("adder called");
};

var map = new Map();
var map = new Map([]);

shouldThrow(() => {
    new Map([ [0, 0] ]);
}, "Error: adder called");

Map.prototype.set = undefined;
shouldThrow(() => {
    new Map([ [0, 0] ]);
}, "TypeError: 'set' property of a Map should be callable.");
