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

var createCustomTestGetterSetter = $vm.createCustomTestGetterSetter;

function assert(b, m) {
    if (!b)
        throw new Error("Bad:" + m);
}

function makePolyProtoObject() {
    function foo() {
        class C { 
            constructor() { this.field = 20; }
        };
        return new C;
    }
    for (let i = 0; i < 15; ++i) {
        assert(foo().field === 20);
    }
    return foo();
}

let items = [
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
    makePolyProtoObject(),
];

let customGetterSetter = createCustomTestGetterSetter();
items.forEach((x) => {
    x.__proto__ = customGetterSetter;
    assert(x.__proto__ === customGetterSetter);
});

function validate(x, valueResult, accessorResult) {
    assert(x.customValue === valueResult);

    assert(x.customAccessor === accessorResult);

    let o = {};
    x.customValue = o;
    assert(o.result === valueResult);

    o = {};
    x.customAccessor = o;
    assert(o.result === accessorResult);

    assert(x.randomProp === 42 || x.randomProp === undefined);
}
noInline(validate);


let start = Date.now();
for (let i = 0; i < 10000; ++i) {
    for (let i = 0; i < items.length; ++i) {
        validate(items[i], customGetterSetter, items[i]);
    }
}

customGetterSetter.randomProp = 42;

for (let i = 0; i < 10000; ++i) {
    for (let i = 0; i < items.length; ++i) {
        validate(items[i], customGetterSetter, items[i]);
    }
}

items.forEach((x) => {
    Reflect.setPrototypeOf(x, {
        get customValue() { return 42; },
        get customAccessor() { return 22; },
        set customValue(x) { x.result = 42; },
        set customAccessor(x) { x.result = 22; },
    });
});

for (let i = 0; i < 10000; ++i) {
    for (let i = 0; i < items.length; ++i) {
        validate(items[i], 42, 22);
    }
}

if (false)
    print(Date.now() - start);
