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

description('Test that when the stack overflows, the exception goes to the last frame before the overflow');

var level = 0;
var stackLevel = 0;
var gotWrongCatch = false;

function test1()
{
    var myLevel = level;
    var dummy;

    try {
        level = level + 1;
        // Dummy code to make this funciton different from test2()
        dummy = level * level + 1;
        if (dummy == 0)
            debug('Should never get here!!!!');
    } catch(err) {
        gotWrongCatch = true;
    }

    try {
        test2();
    } catch(err) {
        stackLevel = myLevel;
    }
}

function test2()
{
    var myLevel = level;

    // Dummy code to make this funciton different from test1()
    if (gotWrongCatch)
        debug('Should never get here!!!!');

    try {
        level = level + 1;
    } catch(err) {
        gotWrongCatch = true;
    }

    try {
        test1();
    } catch(err) {
        stackLevel = myLevel;
    }
}

test1();

shouldBeFalse("gotWrongCatch");
shouldBe("(stackLevel)", "(level - 1)");
