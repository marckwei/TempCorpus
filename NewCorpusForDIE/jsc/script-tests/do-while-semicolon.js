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
"This test checks that toString() round-trip on a function that has do..while in JavaScript does not insert extra semicolon."
);

function f1() {
    do {} while(0);
}

function f2() {
    do {} while(0)
}

function f3() {
    do {} while(0)   ;
}

function f4() {
    do {} while(0)  /*empty*/ ;
}



if (typeof uneval == "undefined")
    uneval = function(x) { return '(' + x.toString()+ ')'; }


uf1 = uneval(f1);
ueuf1 = uneval(eval(uneval(f1)));

uf2 = uneval(f2);
ueuf2 = uneval(eval(uneval(f2)));

uf3 = uneval(f3);
ueuf3 = uneval(eval(uneval(f3)));

uf4 = uneval(f4);
ueuf4 = uneval(eval(uneval(f4)));



shouldBe("ueuf1", "uf1");
shouldBe("ueuf2", "uf2");
shouldBe("ueuf3", "uf3");
shouldBe("ueuf4", "uf4");
