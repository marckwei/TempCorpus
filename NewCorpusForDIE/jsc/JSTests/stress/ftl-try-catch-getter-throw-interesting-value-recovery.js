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
        throw new Error("bad value")
}
noInline(assert);

function random() { 
    return "blah";
}
noInline(random);

function identity(x) { 
    return x;
}
noInline(identity);

let o1 = {
    g: 20,
    y: 40,
    f: "get f"
};

let o2 = {
    g: "g",
    y: "y",
    get f() { 
        return "get f";
    }
}

let o4 = {};

let o3 = {
    get f() {
        throw new Error("blah"); 
    }
}

function foo(o, a) {
    let x = o.g;
    let y = o.y;
    let oo = identity(o);
    let j = random();
    try {
        j = o.f;
    } catch(e) {
        assert(j === "blah");
        assert(oo === o3);
        return x + y + 1;
    }
    return x + y;
}

noInline(foo);
for (let i = 0; i < 100000; i++) {
    if (i % 3 == 0) {
        assert(foo(o1) === 60);
    } else if (i % 3 === 1) {
        assert(foo(o2) === "gy");
    } else {
        foo(o4);
    }
}

foo(o3);
