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
        throw new Error("Bad!");
}
noInline(assert);

function f1() { return "f1"; }
noInline(f1);
function f2() { return "f2"; }
noInline(f2);
function f3() { return "f3"; }
noInline(f3);

let oException = {
    valueOf() { throw new Error(""); }
};

function foo(arg1, arg2) {
    let a = f1();
    let b = f2();
    let c = f3();
    try {
        arg1 + arg2;
    } catch(e) {
        assert(arg1 === oException);
        assert(arg2 === oException);
    }
    assert(a === "f1");
    assert(b === "f2");
    assert(c === "f3");
}
noInline(foo);

for (let i = 0; i < 1000; i++) {
    foo(i, {});
    foo({}, i);
}
foo(oException, oException);
for (let i = 0; i < 10000; i++) {
    foo(i, {});
    foo({}, i);
}
foo(oException, oException);


function ident(x) { return x; }
noInline(ident);

function bar(arg1, arg2) {
    let a = f1();
    let b = f2();
    let c = f3();
    let x = ident(arg1);
    let y = ident(arg2);

    try {
        arg1 + arg2;
    } catch(e) {
        assert(arg1 === oException);
        assert(arg2 === oException);
        assert(x === oException);
        assert(y === oException);
    }
    assert(a === "f1");
    assert(b === "f2");
    assert(c === "f3");
}
noInline(bar);

for (let i = 0; i < 1000; i++) {
    bar(i, {});
    bar({}, i);
}
bar(oException, oException);
for (let i = 0; i < 10000; i++) {
    bar(i, {});
    bar({}, i);
}
bar(oException, oException);
