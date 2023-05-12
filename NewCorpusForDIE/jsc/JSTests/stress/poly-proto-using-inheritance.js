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

function assert(b) {
    if (!b)
        throw new Error("Bad");
}

function foo() {
    class C {
        constructor()
        {
            this.y = 22;
        }
        get baz() { return this.x; }
    }
    C.prototype.field = 42;
    new C;
    return C;
}

for (let i = 0; i < 5; ++i)
    foo();

function bar(p) {
    class C extends p {
        constructor() {
            super();
            this.x = 22;
        }
    };
    let result = new C;
    return result;
}

for (let i = 0; i < 5; ++i)
    bar(foo());

let instances = [];
for (let i = 0; i < 40; ++i)
    instances.push(bar(foo()));

function validate(item) {
    assert(item.x === 22);
    assert(item.baz === 22);
    assert(item.field === 42);
}

let start = Date.now();
for (let i = 0; i < 100000; ++i) {
    instances.forEach((x) => validate(x));
}
if (false)
    print(Date.now() - start);
