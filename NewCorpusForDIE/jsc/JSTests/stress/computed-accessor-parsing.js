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

function testShouldNotThrow(str) {
    eval("function foo(){ var obj = {"+str+", x : 5 };}");
}

function testShouldThrow(str) {
    var didThrow = false;

    try {
        eval("var obj = {"+str+"};");
    } catch(e) {
        didThrow = true;
    }

    if (!didThrow) throw new Error("Should Throw");;
}

testShouldNotThrow("get [x] () { return 1 }");

testShouldNotThrow("get [x] () { return 1 }");
testShouldNotThrow("set [x] (value) { valueSet = value }");

testShouldNotThrow("get[x] () { return 1 }");
testShouldNotThrow("set[x] (value) { valueSet = value }");

testShouldNotThrow("get [x]() { return 1 }");
testShouldNotThrow("set [x](value) { valueSet = value }");

testShouldNotThrow("get[x]() { return 1 }");
testShouldNotThrow("set[x](value) { valueSet = value }");

testShouldNotThrow("get [1] () { return 1 }");
testShouldNotThrow("set [1] (value) { valueSet = value }");

testShouldNotThrow("get[1] () { return 1 }");
testShouldNotThrow("set[1] (value) { valueSet = value }");

testShouldNotThrow("get [1]() { return 1 }");
testShouldNotThrow("set [1](value) { valueSet = value }");

testShouldNotThrow("get[1]() { return 1 }");
testShouldNotThrow("set[1](value) { valueSet = value }");

testShouldNotThrow("get [{ a : 'hi'}] () { return 1 }");
testShouldNotThrow("set [{ b : 'ho'}] (value) { valueSet = value }");

testShouldNotThrow("get[{ a : 'hi'}] () { return 1 }");
testShouldNotThrow("set[{ b : 'hi'}] (value) { valueSet = value }");

testShouldNotThrow("get [{ a : 'hi'}]() { return 1 }");
testShouldNotThrow("set [{ b : 'hi'}](value) { valueSet = value }");

testShouldNotThrow("get[{ a : 'hi'}]() { return 1 }");
testShouldNotThrow("set[{ b : 'hi'}](value) { valueSet = value }");

testShouldNotThrow("get [ { a : 'hi'} ] () { return 1 }");
testShouldNotThrow("set [ { b : 'hi'} ] (value) { valueSet = value }");

testShouldNotThrow("get [{ a : 'hi'} ] () { return 1 }");
testShouldNotThrow("set [{ b : 'hi'} ] (value) { valueSet = value }");

testShouldNotThrow("get [ { a : 'hi'}] () { return 1 }");
testShouldNotThrow("set [ { b : 'hi'}] (value) { valueSet = value }");

testShouldNotThrow("get[ { a : 'hi'}] () { return 1 }");
testShouldNotThrow("set[ { b : 'hi'}] (value) { valueSet = value }");

testShouldNotThrow("get[ { a : 'hi'}]() { return 1 }");
testShouldNotThrow("set[ { b : 'hi'}](value) { valueSet = value }");

testShouldNotThrow("get [{ a : 'hi'} ]() { return 1 }");
testShouldNotThrow("set [{ b : 'hi'} ](value) { valueSet = value }");

testShouldNotThrow("get[{ [\"goats\"] : 'hi'} ]() { return 1 }");
testShouldNotThrow("set[{ [1] : 'hi'}] (value) { valueSet = value }");

testShouldNotThrow("get[{ [\"goats\"] : 'hi'} ]() { return 1 }");
testShouldNotThrow("set[{ get [1]() { return 'hi' } }] (value) { valueSet = value }");


testShouldThrow("get [] () { return 1 }");
testShouldThrow("set [] (value) { valueSet = value }");

testShouldThrow("get [ () { return 1 }");
testShouldThrow("set [ (value) { valueSet = value }");


testShouldThrow("get [ () { return 1 }]");
testShouldThrow("set [ (value) { valueSet = value }]");

testShouldThrow("geting [1] () { return 1 }");
testShouldThrow("seting [2] (value) { valueSet = value }");

testShouldThrow("geting [1] () { return 1 }");
testShouldThrow("seting [2] (value) { valueSet = value }");

testShouldThrow("g [1] () { return 1 }");
testShouldThrow("s [2] (value) { valueSet = value }");


testShouldThrow("get [1] (), a : 5");
testShouldThrow("set [2] (value), a : 5");

testShouldThrow("get [1]{ return 5}, a : 5");
testShouldThrow("set [2]{ return 4; }, a : 5");

// getters and setters work in classes.
testShouldNotThrow("x : class Val { get x() { return 4; } }");
testShouldNotThrow("x : class Val { get [2] () { return 4; } }");

class Val{
    get ['hi']() { return 4; }
};
