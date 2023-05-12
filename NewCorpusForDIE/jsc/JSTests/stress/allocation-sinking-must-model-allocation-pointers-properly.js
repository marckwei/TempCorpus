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

function alwaysFalse() { return false; }
noInline(alwaysFalse);

let count = 0;
function sometimesZero() { 
    count++;
    if (count % 3 === 0) {
        return 0;
    }
    return 1;
}
noInline(sometimesZero);

function assert(b) {
    if (!b)
        throw new Error;
}

function v9() {
    const v14 = {};
    const v15 = {a: 1337};
    v14.phantom = v15;

    if (alwaysFalse())
        return 42;

    for (const v18 of "asdf") {
        v14.b = 43;
    }

    const v15Shadow = v14.phantom;

    let r;
    for (let i = 0; i < sometimesZero(); i++) {
        r = v15Shadow;
    }

    return r;
}
noInline(v9);

let previousResult = v9();
for (let v27 = 0; v27 < 100000; v27++) {
    let r = v9();
    if (typeof previousResult === "undefined") {
        assert(typeof r === "object");
        assert(r.a === 1337);
    } else
        assert(typeof r === "undefined");
    previousResult = r;
}
