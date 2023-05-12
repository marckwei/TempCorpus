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

description("Verify that invalid continue and break statements are handled correctly");

shouldBeTrue("L:{true;break L;false}");
shouldThrow("if (0) { L:{ break; } }");
shouldThrow("if (0) { L:{ continue L; } }");
shouldThrow("if (0) { L:{ continue; } }");
shouldThrow("if (0) { switch (1) { case 1: continue; } }");
shouldBeTrue("A:L:{true;break L;false}");
shouldThrow("if (0) { A:L:{ break; } }");
shouldThrow("if (0) { A:L:{ continue L; } }");
shouldThrow("if (0) { A:L:{ continue; } }");

shouldBeTrue("L:A:{true;break L;false}");
shouldThrow("if (0) { L:A:{ break; } }");
shouldThrow("if (0) { L:A:{ continue L; } }");
shouldThrow("if (0) { L:A:{ continue; } }");

shouldBeUndefined("if(0){ L:for(;;) continue L; }")
shouldBeUndefined("if(0){ L:A:for(;;) continue L; }")
shouldBeUndefined("if(0){ A:L:for(;;) continue L; }")
shouldThrow("if(0){ A:for(;;) L:continue L; }")
shouldBeUndefined("if(0){ L:for(;;) A:continue L; }")

shouldBeUndefined("if(0){ L:do continue L; while(0); }")
shouldBeUndefined("if(0){ L:A:do continue L; while(0); }")
shouldBeUndefined("if(0){ A:L:do continue L; while(0);}")
shouldThrow("if(0){ A:do L:continue L; while(0); }")
shouldBeUndefined("if(0){ L:do A:continue L; while(0); }")


shouldBeUndefined("if(0){ L:while(0) continue L; }")
shouldBeUndefined("if(0){ L:A:while(0) continue L; }")
shouldBeUndefined("if(0){ A:L:while(0) continue L; }")
shouldThrow("if(0){ A:while(0) L:continue L; }")
shouldBeUndefined("if(0){ L:while(0) A:continue L; }")
