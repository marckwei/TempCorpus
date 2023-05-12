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

description('Tests for ES6 arrow function test tdz');

var A = class A {
  constructor() {
    this.id = 'a';
  }
};

var B = class B extends A {
  constructor(accessThisBeforeSuper) {
    var f = () => this;
    if (accessThisBeforeSuper) {
      f();
      super();
    } else {
      super();
      f();
    }
  }
};

var isReferenceError = false;
try {
     new B(true);
} catch (e) {
    isReferenceError = e instanceof ReferenceError;
}

shouldBe('isReferenceError', 'true');

var a = new B(false);

var D = class D extends A {
  constructor(accessThisBeforeSuper, returnThis) {
    var f = () => returnThis ? this : {};
    if (accessThisBeforeSuper) {
      let val = f();
      super();
    } else {
      super();
      let val = f();
    }
  }
};

isReferenceError = false;
try {
      new D(true, true);
} catch (e) {
      isReferenceError = e instanceof ReferenceError;
}

shouldBe('isReferenceError', 'true');

var d = new D(false, true);
shouldBe('d.id', "'a'");
var e = new D(false, false);
shouldBe('e.id', "'a'");
var f = new D(true, false);
shouldBe('f.id', "'a'");

var G = class G extends A {
  constructor(accessThisBeforeSuper, returnThis) {
    var f = () => returnThis ? (() => this ) : (()=>{});
    let af = f();
    if (accessThisBeforeSuper) {
      let result = af();
      super();
    } else {
      super();
      let result = af();
    }
  }
};

try {
      new G(true, true);
} catch (e) {
    exception = e;
    isReferenceError = e instanceof ReferenceError;
}

shouldBe('isReferenceError', 'true');

var g = new G(false, true);
shouldBe('g.id', "'a'");
var h = new G(false, false);
shouldBe('h.id', "'a'");
var i = new G(true, false);
shouldBe('i.id', "'a'");

var successfullyParsed = true;
