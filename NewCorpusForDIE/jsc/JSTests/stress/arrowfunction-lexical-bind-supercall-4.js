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

var testCase = function (actual, expected, message) {
    if (actual !== expected) {
        throw message + ". Expected '" + expected + "', but was '" + actual + "'";
    }
};

var testValue  = 'test-value';
var testIdValue  = 'test-id-value';

var A = class A {
    constructor() {
        this.idValue = testValue;
    }
};

var B = class B extends A {
  constructor (beforeSuper) {

      var arrow = () => eval('(() => super())()');

      if (beforeSuper) {
          arrow();
          testCase(this.idValue, testValue, "Error: super() should create this and put value into idValue property");
      } else {
          testCase(this.idValue, testValue, "Error: has to be TDZ error");
          arrow();
      }
  }
};

var C = class C extends A {
    constructor () {
        var arrow = () => eval('(() => super())()');
        arrow();
        return {
          value : 'constructor-value'
        };
    }
};

var D = class D extends A {
    constructor () {
        var arrow = () => eval('(() => super())()');
        arrow();
        eval('this.id="new-value"');
    }
};

var E = class E extends A {
    constructor () {
        var arrow = () => eval("eval('(() => super())()')");
        arrow();
        eval('eval("this.id=\'new-value\'")');
    }
};


for (var i=0; i < 1000; i++) {
    new B(true);
    var c = new C();
    testCase(c.value, 'constructor-value', 'Error during set value in eval #1.0');
    testCase(typeof c.id, 'undefined', 'Error during set value in eval #1.1');
    var d = new D();
    testCase(d.idValue, testValue, 'Error during set value in eval #2.0');
    testCase(d.id, 'new-value', 'Error during set value in eval #2.1');
    var e = new E();
    testCase(e.idValue, testValue, 'Error during set value in eval #3.0');
    testCase(e.id, 'new-value', 'Error during set value in eval #3.0');
}

var testException = function (Klass, value, index) {
    var exception;
    try {
        new Klass(value);
    } catch (e) {
        exception = e;
        if (!(e instanceof ReferenceError))
            throw "Exception thrown was not a reference error";
    }

    if (!exception)
        throw "Exception not thrown for an unitialized this at iteration #" + index;
}

for (var i=0; i < 1000; i++) {
    testException(B, false, i);
}

class F extends A {
    constructor() {
      var arr_after = () => {
        this.idValue  = 'this-value';
      };
      var arr_before = () => {
        return 'not-some-value';
      };
      arr_before();
      super();
      arr_after();
    }
}

let f = new F();
testCase(f.idValue, 'this-value', 'Error: not correct binding of this in constructor');

class G extends A {
    constructor() {
        var arr_simple = () => {
            return 'not-some-value';
        };
        var arr_super = () => {
            super();
        };
        arr_simple();
        arr_super();
    }
}

let g = new G();
testCase(g.idValue, testValue, 'Error: not correct binding super&this in constructor');

class A_this_Prop extends A {
    getValue () {
        return this.idValue;
    }
}

class H extends A_this_Prop {
    constructor() {
        var arr_simple = () => {
            return 'not-some-value';
        };
        var arr_super = () => {
            super();
        };
        var arr_value = () => super.getValue();
        arr_simple();
        arr_super();
        this.someValue = arr_value();
    }
}

let h = new H();
testCase(h.someValue, testValue, 'Error: not correct binding superProperty&this in constructor');

class I extends A {
  constructor (beforeSuper) {
      if (beforeSuper) {
          eval('(() => super())()');
          testCase(this.idValue, testValue, "Error: super() should create this and put value into idValue property");
      } else {
          this.idValue = 'testValue';
          eval('(() => super())()');
      }
  }
};

let ic = new I(true);
testCase(ic.idValue, testValue, 'Error: not correct binding superProperty&this in constructor');

for (var i=0; i < 1000; i++) {
    testException(I, false, i);
}

class J extends A {
    constructor (beforeSuper) {
      if (beforeSuper) {
        const arr = () => { eval('super()');  this._id = testIdValue; };
        arr();
      }
      testCase(this.idValue, testValue, "Error: super() should create this and put value into idValue property");
    }
};

let jc = new J(true);
testCase(jc.idValue, testValue, 'Error: not correct binding superProperty&this in constructor');

for (var i=0; i < 1000; i++) {
    testException(J, false, i);
}

class K extends A {
    constructor (beforeSuper) {
      if (beforeSuper) {
        const arr = () => { (() => () => eval('super()'))()();  (() => { this._id = testIdValue; })(); };
        arr();
      }
        testCase(this.idValue, testValue, "Error: super() should create this and put value into idValue property");
    }
};

let kc = new K(true);
testCase(kc.idValue, testValue, 'Error: not correct binding superProperty&this in constructor');

for (var i=0; i < 1000; i++) {
    testException(K, false, i);
}

