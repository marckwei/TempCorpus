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

var A = class A {
   constructor() {
      this.id = 'A'
   }
};

var B = class B extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this.id === 'A') {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
      val = f();
    }
    this.res = val;
  }
};

var C = class C extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this > 5) {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
      val = f();
    }
    this.res = val;
  }
};

var D = class D extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this < 5) {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
      val = f();
    }
    this.res = val;
  }
};

var E = class E extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this !== 5) {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
       val = f();
    }
    this.res = val;
  }
};

var F = class F extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this <= 5) {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
      val = f();
    }
    this.res = val;
  }
};

var G = class G extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this >= 5) {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
      val = f();
    }
    this.res = val;
  }
};

var G = class G extends A {
  constructor(beforeSuper) {
    var f = () => {
      if (this === 5) {
        return 'ok';
      }
      return 'ok';
    };
    let val;
    if (beforeSuper) {
      val = f();
      super();
    } else {
      super();
      val = f();
    }
    this.res = val;
  }
};

var tryToCreate = function (classForCreate) {
  var result = false;
  try {
       new classForCreate(true);
  } catch (e) {
      result = e instanceof ReferenceError;
  }

  return result;
}

var check = function (classForCheck) {
  testCase(tryToCreate(classForCheck), true, 'Exception wasn\'t thrown or was not a reference error');
  var result = new classForCheck(false);
  testCase(result.res, 'ok', 'Error in setting id ');
}

for (var i = 0; i < 10000; i++) {
  check(B);
  check(C);
  check(D);
  check(E);
  check(F);
  check(G);
}
