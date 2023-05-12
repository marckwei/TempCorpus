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

let assert = (a) => {
    if (!a)
        throw Error("Bad Assertion");
}

let aObj =  {
    get foo() { return this.a; }
};

let obj = {
    jaz() {
        return super.foo;
    }
};
obj.a = "foo";

Object.setPrototypeOf(obj, aObj);

noInline(obj.jaz);

for (let i = 0; i < 10000; i++) {
    if (i == 9999) {
        delete aObj.foo;
        assert(obj.jaz() === undefined);
    } else {
        assert(obj.jaz() == "foo");
    }

}

let bObj =  {
    get foo() { return this.a; }
};

let obj2 = {
    foo() {
        return super.foo;
    }
};
obj2.a = "foo";

Object.setPrototypeOf(obj2, bObj);

noInline(obj.jaz);

for (let i = 0; i < 10000; i++) {
    if (i == 9999) {
        Object.defineProperty(bObj, "foo", {
            get: () => {return "boo"; }
        });
        assert(obj2.foo() == "boo");
    } else {
        assert(obj2.foo() == "foo");
    }
}

