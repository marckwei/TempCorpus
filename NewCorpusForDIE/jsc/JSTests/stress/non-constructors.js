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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

class ClassTest {
    constructor() {
    }

    method() {
    }

    get getter() {
        return 20;
    }

    set setter(name) {
    }

    static method() {
    }

    static get getter() {
        return 20;
    }

    static set setter(name) {
        return 20;
    }
};

// Should not throw ('constructor' is a function).
var test = new ClassTest();
var test2 = new test.constructor();

shouldThrow(() => {
    new test.method();
}, `TypeError: function is not a constructor (evaluating 'new test.method()')`);

shouldThrow(() => {
    var descriptor = Object.getOwnPropertyDescriptor(test.__proto__, 'getter');
    new descriptor.get();
}, `TypeError: function is not a constructor (evaluating 'new descriptor.get()')`);

shouldThrow(() => {
    var descriptor = Object.getOwnPropertyDescriptor(test.__proto__, 'setter');
    new descriptor.set();
}, `TypeError: function is not a constructor (evaluating 'new descriptor.set()')`);

shouldThrow(() => {
    new ClassTest.method();
}, `TypeError: function is not a constructor (evaluating 'new ClassTest.method()')`);

shouldThrow(() => {
    var descriptor = Object.getOwnPropertyDescriptor(ClassTest, 'getter');
    new descriptor.get();
}, `TypeError: function is not a constructor (evaluating 'new descriptor.get()')`);

shouldThrow(() => {
    var descriptor = Object.getOwnPropertyDescriptor(ClassTest, 'setter');
    new descriptor.set();
}, `TypeError: function is not a constructor (evaluating 'new descriptor.set()')`);


var test = {
    method() {
    },

    get getter() {
        return 20;
    },

    set setter(name) {
    },

    normal: function () {
    },

    constructor() {
    }
};

shouldThrow(() => {
    new test.method();
}, `TypeError: function is not a constructor (evaluating 'new test.method()')`);

shouldThrow(() => {
    new test.constructor();
}, `TypeError: function is not a constructor (evaluating 'new test.constructor()')`);

shouldThrow(() => {
    var descriptor = Object.getOwnPropertyDescriptor(test, 'getter');
    new descriptor.get();
}, `TypeError: function is not a constructor (evaluating 'new descriptor.get()')`);

shouldThrow(() => {
    var descriptor = Object.getOwnPropertyDescriptor(test, 'setter');
    new descriptor.set();
}, `TypeError: function is not a constructor (evaluating 'new descriptor.set()')`);

new test.normal();

shouldThrow(() => {
    var arrow = () => { };
    new arrow();
}, `TypeError: function is not a constructor (evaluating 'new arrow()')`);
