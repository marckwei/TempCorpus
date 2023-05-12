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

function getTarget(name) {
    return x => new.target;
}

noInline(getTarget)

for (var i=0; i < 1000; i++) {
    var undefinedTarget = getTarget()();
    testCase(undefinedTarget, undefined, "Error: new.target is not lexically binded inside of the arrow function #1.0");
}

for (var i = 0; i < 1000; i++) {
    var newTarget = new getTarget()();
    testCase(newTarget, getTarget, "Error: new.target is not lexically binded inside of the arrow function #2.0");
}

function getTargetWithBlock(name) {
    return x => {
        if (false)
            return new.target;
        else
            return new.target;
    }
}

noInline(getTargetWithBlock);

for (var i=0; i < 1000; i++) {
    var undefinedTarget = getTargetWithBlock()();
    testCase(undefinedTarget, undefined, "Error: new.target is not lexically binded inside of the arrow function #1.1");
}

for (var i = 0; i < 1000; i++) {
    var newTarget = new getTargetWithBlock()();
    testCase(newTarget, getTargetWithBlock, "Error: new.target is not lexically binded inside of the arrow function #2.1");
}

var passed = false;
var A = class A {
    constructor() {
        this.idValue = 123;
        passed = passed && new.target === B;
    }
};

var B  = class B extends A {
    constructor() {
        var f = () => {
            passed = new.target === B;
            super();
        };
        f();
    }
};

for (var i = 0; i < 1000; i++) {
    passed = false;
    var b = new B();

    testCase(passed, true, "Error: new.target is not lexically binded inside of the arrow function in constructor #3");
}

// newTargetLocal - is hidden variable that emited for arrow function
var C = class C extends A {
    constructor(tryToAccessToVarInArrow) {
        var f = () => {
            super();
            if (tryToAccessToVarInArrow)
                this.id2 = newTargetLocal;
        };

        f();

        if (!tryToAccessToVarInArrow)
            this.id = newTargetLocal;
    }
};

var tryToCreateClass = function (val) {
    var result = false;
    try {
        new C(val);
    }
    catch (e) {
        result = e instanceof ReferenceError;
    }

    return result;
};

for (var i = 0; i < 1000; i++) {
    testCase(tryToCreateClass(true), true, "Error: newTargetLocal should be hided variable");
    testCase(tryToCreateClass(false), true, "Error: newTargetLocal should be hided variable");
}

function getTargetBlockScope() {
    if (true) {
        let someValue = '';
        if (true)
            return x => new.target;
    }
    return ()=>value;
}

for (var i = 0; i < 1000; i++) {
    var undefinedTarget = getTargetBlockScope()()
    testCase(undefinedTarget, undefined, "Error: new.target is not lexically binded inside of the arrow function #4");
}

class D {
    getNewTarget() {
        var arr = () => {
            if (false) {
                return new.target;
            } else {
                return new.target;
            }
        }
        return arr();
    }
};

class E extends D {
    getParentNewTarget() {
        return super.getNewTarget();
    }
}

var e = new E();

for (var i = 0; i < 1000; i++) {
    var parentNewTarget = e.getParentNewTarget();
    testCase(parentNewTarget, undefined, "Error: new.target is not lexically binded inside of the arrow function #5");
}


class F {
  constructor() {
    let c;
    eval('c=(()=>new.target===F)()');
    this.result = c;
  }
  getNewTargetFromEval() {
      return eval('(()=>new.target===F)()');
  }
}

var f = new F();

testCase(f.result, true, "Error: new.target is not lexically binded inside of the arrow function #6");
testCase(f.getNewTargetFromEval(), false, "Error: new.target is not lexically binded inside of the arrow function #7");

class G extends A {
  constructor() {
     var arr;
     super();
     eval('arr = () => new.target');
     this.arrow = arr;
  }
}

let g = new G();

testCase(g.arrow(), G, "Error: new.target is not lexically binded inside of the arrow function #8");

class H extends A {
  constructor() {
     var arr;
     super();
     eval('arr = () => eval("(() => new.target)()")');
     this.arrow = arr;
  }
}

let h = new H();

testCase(h.arrow(), H, "Error: new.target is not lexically binded inside of the arrow function #9");

class J extends A {
    constructor() {
        super();
        this.result = eval('eval("(() => new.target)()")');
    }
}

let j = new J();

testCase(j.result, J, "Error: new.target is not lexically binded inside of the arrow function #10");
