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

// This file tests the names of all the classes with builtin Symbol.toStringTags and Object.prototype.toString().

foo = { };
foo[Symbol.toStringTag] = "test the tag";

if (foo != "[object test the tag]")
    throw "failed on custom toStringTag";

function toStr(obj) {
    return Object.prototype.toString.call(obj);
}

function strName(str) { return "[object " + str + "]"; }

if (toStr(Symbol()) !== strName("Symbol"))
    throw "failed on Symbol";

if (toStr(Symbol.prototype) !== strName("Symbol"))
    throw "failed on Symbol.prototype";

objects = ["JSON", "Math"];

for (name of objects) {
    value = eval(name)
    if (toStr(value) !== strName(name))
        throw "failed on " + name;
}

iterators = ['Array', 'Map', 'Set', 'String'];

for (name of iterators) {
    value = eval('new ' + name + '()[Symbol.iterator]()');
    if (toStr(value) !== strName(name + ' Iterator'))
        throw 'failed on Iterator of ' + name;
    if (toStr(Object.getPrototypeOf(value)) !== strName(name + ' Iterator'))
        throw 'failed on Iterator.prototype of ' + name;
}

classes = { "ArrayBuffer": 10, "DataView": new ArrayBuffer(10), "Promise": function() { return 1 }, "Set": undefined, "WeakMap": undefined, "WeakSet": undefined };

for (name in classes) {
    value = eval(name);
    if (toStr(new value(classes[name])) !== strName(name))
        throw "failed on new object of " + name;
    if (toStr(value.prototype) !== strName(name))
        throw "failed on prototype of " + name;
}

