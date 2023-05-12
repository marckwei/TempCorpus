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

load("./driver/driver.js");

var afSimple = y => y + 1,
    afBlock = y => { y++; return y + 1;},
    afBlockWithCondition = x => { x > 0 ? x++ : x--; return x;};

checkBasicBlock(afSimple, "y + 1", ShouldNotHaveExecuted);
afSimple(1);
checkBasicBlock(afSimple, "y + 1", ShouldHaveExecuted);


checkBasicBlock(afBlock, "y++", ShouldNotHaveExecuted);
afBlock(2);
checkBasicBlock(afBlock, "y++", ShouldHaveExecuted);
checkBasicBlock(afBlock, "return y + 1", ShouldHaveExecuted);


checkBasicBlock(afBlockWithCondition,'x++', ShouldNotHaveExecuted);
afBlockWithCondition(10);
checkBasicBlock(afBlockWithCondition,'x++', ShouldHaveExecuted);
checkBasicBlock(afBlockWithCondition,'return x', ShouldHaveExecuted);
checkBasicBlock(afBlockWithCondition,'x--', ShouldNotHaveExecuted);


afBlockWithCondition(-10);
checkBasicBlock(afBlockWithCondition,'x--', ShouldHaveExecuted);

function foo1(test) {
   var f1 = () => { "hello"; }
   if (test)
       f1();
}
foo1(false);
checkBasicBlock(foo1, '() =>', ShouldNotHaveExecuted);
checkBasicBlock(foo1, '; }', ShouldNotHaveExecuted);
foo1(true);
checkBasicBlock(foo1, '() =>', ShouldHaveExecuted);
checkBasicBlock(foo1, '; }', ShouldHaveExecuted);

function foo2(test) {
   var f1 = x => { "hello"; }
   if (test)
       f1();
}
foo2(false);
checkBasicBlock(foo2, 'x =>', ShouldNotHaveExecuted);
checkBasicBlock(foo2, '; }', ShouldNotHaveExecuted);
foo2(true);
checkBasicBlock(foo2, 'x =>', ShouldHaveExecuted);
checkBasicBlock(foo2, '; }', ShouldHaveExecuted);


function foo3(test) {
   var f1 = (xyz) => { "hello"; }
   if (test)
       f1();
}
foo3(false);
checkBasicBlock(foo3, '(xyz) =>', ShouldNotHaveExecuted);
checkBasicBlock(foo3, '; }', ShouldNotHaveExecuted);
foo3(true);
checkBasicBlock(foo3, '(xyz) =>', ShouldHaveExecuted);
checkBasicBlock(foo3, '; }', ShouldHaveExecuted);
