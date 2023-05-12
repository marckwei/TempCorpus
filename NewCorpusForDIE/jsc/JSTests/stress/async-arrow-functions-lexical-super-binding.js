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

function shouldBe(expected, actual, msg) {
    if (msg === void 0)
        msg = "";
    else
        msg = " for " + msg;
    if (actual !== expected)
        throw new Error("bad value" + msg + ": " + actual + ". Expected " + expected);
}

function shouldBeAsync(expected, run, msg) {
    let actual;
    var hadError = false;
    run().then(function(value) { actual = value; },
               function(error) { hadError = true; actual = error; });
    drainMicrotasks();

    if (hadError)
        throw actual;

    shouldBe(expected, actual, msg);
}

class BaseClass {
    baseClassValue() {
        return "BaseClassValue";
    }
    get property() {
        return "test!";
    }
}

class ChildClass extends BaseClass {
    asyncSuperProp() {
        return async x => super.baseClassValue();
    }
    asyncSuperProp2() {
        return async x => { return super.baseClassValue(); }
    }
}

shouldBeAsync("BaseClassValue", new ChildClass().asyncSuperProp());
shouldBeAsync("BaseClassValue", new ChildClass().asyncSuperProp2());

class ChildClass2 extends BaseClass {
    constructor() {
        return async (self = super()) => self.baseClassValue() + ' ' + super.property;
    }
}

shouldBeAsync("BaseClassValue test!", new ChildClass2());

var error = undefined;
var value = undefined;

class A {
    constructor() {
        this._id = 'class-id';
    }
}

const childA1 = new class extends A {
  constructor() {
    var f = async (a=super()) => { return 'abc'; }
    f().then( val => {value = val; }, err => { error = err;});
  }
}

drainMicrotasks();

shouldBe(childA1._id, 'class-id');
shouldBe(value, 'abc');
shouldBe(error, undefined);

value = undefined;
error = undefined;

const childA2 = new class extends A {
  constructor() {
    var f = async (a) => { super(); return 'abc'; }
    f().then( val => {value = val; }, err => { error = err;});
  }
}

drainMicrotasks();

shouldBe(childA2._id, 'class-id');
shouldBe(value, 'abc');
shouldBe(error, undefined);

value = undefined;
error = undefined;

const childA3 = new class extends A {
    constructor() {
        var f = async (a = super()) => { super(); return 'abc'; }
        f().then( val => {value = val; }, err => { error = err;});
    }
}

drainMicrotasks();

shouldBe(childA3._id, 'class-id');
shouldBe(value, undefined);
shouldBe(error.toString(), 'ReferenceError: \'super()\' can\'t be called more than once in a constructor.');


let childA4;
let catchError;
error = undefined; 
try {
    childA4 = new class extends A {
        constructor() {
            var f = async (a) => { await 'await value'; super(); return 'abc'; }
            f().then(val => { value = val; }, err => { error = err; });
        }
    }
} catch (err) {
    catchError = err;  
}

drainMicrotasks();

shouldBe(childA4, undefined);
shouldBe(value, 'abc');
shouldBe(error, undefined);
shouldBe(catchError.toString(), `ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object.`);

catchError = undefined;
error = undefined; 
value = undefined;

const childA5 = new class extends A {
    constructor() {
        var f = async (a) => { super(); await 'await value'; return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}

drainMicrotasks();

shouldBe(childA5._id, 'class-id');
shouldBe(value, 'abc');
shouldBe(error, undefined);
shouldBe(catchError, undefined);

function checkClass(classSource) {
    let base1 = undefined;
    let error = undefined; 
    let value = undefined;
    let catchError = undefined;
    try {
        base1 = eval(classSource);

        drainMicrotasks();
    } catch (err) {
        catchError = err;  
    }

    shouldBe(base1, undefined);
    shouldBe(value, undefined);
    shouldBe(error, undefined);
    shouldBe(catchError.toString(), 'SyntaxError: super is not valid in this context.');
}

checkClass(`new class {
    constructor() {
        var f = async (a) => { super(); return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}`);

checkClass(`new class {
    constructor() {
        var f = async (a) => { await 'p'; super(); return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}`);

checkClass(`new class {
    constructor() {
        var f = async (a) => { super(); await 'p'; return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}`);


checkClass(`new class extends A {
    method() {
        var f = async (a) => { super(); return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}`);

checkClass(`new class extends A {
    get prop() {
        var f = async (a) => { super(); return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}`);

checkClass(`new class extends A {
    set prop(_value) {
        var f = async (a) => { super(); return 'abc'; }
        f().then(val => { value = val; }, err => { error = err; });
    }
}`);