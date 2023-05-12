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

//@ skip if not $jitTests

function __isPropertyOfType(obj, name, type) {
    desc = Object.getOwnPropertyDescriptor(obj, name)
    return typeof type === 'undefined' || typeof desc.value === type;
}
function __getProperties(obj, type) {
    let properties = [];
    for (let name of Object.getOwnPropertyNames(obj)) {
        if (__isPropertyOfType(obj, name, type)) properties.push(name);
    }
    let proto = Object.getPrototypeOf(obj);
    while (proto && proto != Object.prototype) {
        Object.getOwnPropertyNames(proto).forEach(name => {
        });
        proto = Object.getPrototypeOf(proto);
    }
    return properties;
}
function* __getObjects(root = this, level = 0) {
    if (level > 4) return;
    let obj_names = __getProperties(root, 'object');
    for (let obj_name of obj_names) {
        let obj = root[obj_name];
        yield* __getObjects(obj, level + 1);
    }
}
function __getRandomObject() {
    for (let obj of __getObjects()) {
    }
}
var theClass = class {
    constructor() {
        if (242487 != null && typeof __getRandomObject() == "object") try {
        } catch (e) {}
    }
};
var childClass = class Class extends theClass {
    constructor() {
        var arrow = () => {
            try {
                super();
            } catch (e) {}
            this.idValue
        };
        arrow()()();
    }
};
for (var counter = 0; counter < 1000; counter++) {
    try {
        new childClass();
    } catch (e) {}
}
