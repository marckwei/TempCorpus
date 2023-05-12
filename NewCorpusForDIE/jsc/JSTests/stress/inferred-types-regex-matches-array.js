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

let objX = {objProperty: {fetchme: 1234}};
let objY = {doubleProperty: 2130562.5098039214};

function createArray() {
    let protoWithIndexedAccessors = {};
    Object.defineProperty(protoWithIndexedAccessors, 1337, { get() { return 1337; } });

    function helper(i) {
        let a = new Array;
        if (i > 0) {
            Object.setPrototypeOf(a, protoWithIndexedAccessors);
        }
        return a;
    }

    for (let i = 1; i < 10000; i++) {
        helper(i);
    }
    return helper(0);
}

let obj = {};
obj.inlineProperty1 = 1337;
obj.inlineProperty2 = 1338;
obj.oolProperty1 = objX;

let a = createArray();
a.index = 42;
a.input = "foobar";
a.groups = obj;

global = a;
global = a;

Object.defineProperty(Array.prototype, 1337, { get() { return 1337; } });

function foo() {
    return global.groups.oolProperty1.objProperty.fetchme;
}

for (let i = 0; i < 10000; i++) {
    try {
        foo(i);
    } catch { }
}

try {
    let match = "foo".match(/(?<oolProperty1>foo)/);
    match.groups.oolProperty1 = objY;
    global = match;
    foo();
} catch { }
