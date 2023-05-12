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

var findTypeForExpression = $vm.findTypeForExpression;
var returnTypeFor = $vm.returnTypeFor;

load("./driver/driver.js");

let foo = (x) => x;
let bar = abc => abc;
let baz = abc => { return abc; };
let jaz = abc => { };

function wrapper(b) {
    let baz = (x) => x;
    baz(b);

    let foo = yyy => yyy;
    foo(b);
}

// ====== End test cases ======

foo(20);
var types = returnTypeFor(foo);
assert(types.globalTypeSet.displayTypeName === T.Integer, "Function 'foo' should return 'Integer'");

bar("hello");
types = returnTypeFor(bar);
assert(types.globalTypeSet.displayTypeName === T.String, "Function 'bar' should return 'String'");

baz("hello");
types = returnTypeFor(baz);
assert(types.globalTypeSet.displayTypeName === T.String, "Function 'baz' should return 'String'");

jaz("hello");
types = returnTypeFor(jaz);
assert(types.globalTypeSet.displayTypeName === T.Undefined, "Function 'jaz' should return 'Undefined'");

wrapper("hello");
types = findTypeForExpression(wrapper, "x)"); 
assert(types.instructionTypeSet.displayTypeName === T.String, "Parameter 'x' should be 'String'");

types = findTypeForExpression(wrapper, "yyy =>");
assert(types.instructionTypeSet.displayTypeName === T.String, "Parameter 'yyy' should be 'String'");
