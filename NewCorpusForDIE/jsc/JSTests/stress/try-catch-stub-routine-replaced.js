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

// The main purpose of this test is to ensure that
// we will re-use no longer in use CallSiteIndices for
// inline cache stubs. See relevant code in destructor
// which calls:
// DFG::CommonData::removeCallSiteIndex(.)
// CodeBlock::removeExceptionHandlerForCallSite(.)
// Which add old call site indices to a free list.

function assert(b) {
    if (!b)
        throw new Error("bad value");
}
noInline(assert);

var arr = []
function allocate() {
    for (var i = 0; i < 10000; i++)
        arr.push({});
}

function hello() { return 20; }
noInline(hello);

let __jaz = {};
function jazzy() {
    return __jaz;
}
noInline(jazzy);

function foo(o) {
    let baz = hello();
    let jaz = jazzy();
    let v;
    try {
        v = o.f;
        v = o.f;
        v = o.f;
    } catch(e) {
        assert(baz === 20);
        assert(jaz === __jaz);
        assert(v === 2); // Really flagCount.
    }
    return v;
}
noInline(foo);

var objChain = {f: 40};
var fakeOut = {x: 30, f: 100};
for (let i = 0; i < 1000; i++)
    foo(i % 2 ? objChain : fakeOut);

var i;
var flag = "flag";
var flagCount = 0;
objChain = { 
    get f() {
        if (flagCount === 2)
            throw new Error("I'm testing you.");
        if (i === flag)
            flagCount++;
        return flagCount;
    }
};
for (i = 0; i < 100; i++) {
    allocate();
    if (i === 99)
        i = flag;
    foo(objChain);
}

fakeOut = {x: 30, get f() { return 100}};
for (i = 0; i < 100; i++) {
    allocate();
    if (i === 99)
        i = flag;
    foo(fakeOut);
}

var o = { 
    get f() {
        return flagCount;
    },
    x: 100
};

for (i = 0; i < 100; i++)
    foo(o);
