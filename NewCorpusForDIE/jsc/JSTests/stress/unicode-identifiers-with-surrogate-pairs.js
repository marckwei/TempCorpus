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


let chars = ["鴬", "𐊧", "Ϊ"];
let continueChars =  [unescape("\u0311"), String.fromCharCode(...[0xDB40, 0xDD96])];

let o = { };
for (let c of chars) {
    eval(`var ${c};`);
    eval(`function foo() { var ${c} }`);
    eval(`o.${c}`);
}

function throwsSyntaxError(string) {
    try {
        eval(string);
    } catch (e) {
        if (!(e instanceof SyntaxError))
            throw new Error(string);
        return;
    }
    throw new Error(string);
}

for (let c of continueChars) {
    throwsSyntaxError(`var ${c}`);
    throwsSyntaxError(`function foo() { var ${c} }`);
    throwsSyntaxError(`o.${c}`);
    eval(`var ${("a" + c)}`);
    eval(`o.${"a" + c}`);

}
