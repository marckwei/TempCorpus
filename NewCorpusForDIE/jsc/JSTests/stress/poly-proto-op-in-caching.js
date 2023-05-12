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

function assert(b, m) {
    if (!b)
        throw new Error("Bad:" + m);
}

function makePolyProtoObject() {
    function foo() {
        class C {
            constructor() {
                this.field = 42;
            }
        };
        return new C;
    }
    for (let i = 0; i < 15; ++i) {
        assert(foo().field === 42);
    }
    return foo();
}

function validate(o, b) {
    assert("x" in o === b);
}
noInline(validate);

let start = Date.now();

let objs = [];
for (let i = 0; i < 10; ++i)
    objs.push(makePolyProtoObject());

objs.forEach(obj => Reflect.setPrototypeOf(obj, {x:20}));

for (let i = 0; i < 10000; ++i) {
    for (let obj of objs)
        validate(obj, true);
}

objs.forEach(obj => Reflect.setPrototypeOf(obj, {}));
for (let i = 0; i < 10000; ++i) {
    for (let obj of objs)
        validate(obj, false);
}


function validate2(o, b) {
    assert("x" in o === b);
}
noInline(validate2);

objs.forEach(obj => Reflect.setPrototypeOf(obj, null));
for (let i = 0; i < 10000; ++i) {
    for (let obj of objs)
        validate2(obj, false);
}

objs.forEach(obj => Reflect.setPrototypeOf(obj, {x:25}));
for (let i = 0; i < 10000; ++i) {
    for (let obj of objs)
        validate2(obj, true);
}

if (false)
    print(Date.now() - start);
