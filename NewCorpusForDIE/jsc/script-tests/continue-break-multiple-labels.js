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

description(
'This test checks break and continue behaviour in the presence of multiple labels.'
);

function test1()
{
    var s = "";
    
    a:
    b:
    for (var i = 1; i < 10; i++) {
       if (i == 4)
            continue a;
       s += i;
    }
    
    return s;
}

shouldBe("test1()", "'12356789'");

function test2()
{
    var s = "";
    
    a:
    b:
    for (var i = 1; i < 10; i++) {
        if (i == 4)
            break a;
        s += i;
    }
    
    return s;
}

shouldBe("test2()", "'123'");

function test3()
{
    var i;
    for (i = 1; i < 10; i++) {
        try {
            continue;
        } finally {
            innerLoop:
            while (1) {
                break innerLoop;
            }
        }
    }
    
    return i;
}

shouldBe("test3()", "10");

function test4()
{
    var i = 0;
    
    a:
    i++;
    while (1) {
        break;
    }
    
    return i;
}

shouldBe("test4()", "1");

function test5()
{
    var i = 0;
    
    switch (1) {
    default:
        while (1) {
            break;
        }
        i++;
    }
    
    return i;
}

shouldBe("test5()", "1");
