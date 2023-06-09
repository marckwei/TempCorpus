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

description('This test verifies the result returned by the eval function when exceptions are thrown and caught whithin the contents of the evaluated string.');

function throwFunc() {
  throw "";
}

function throwOnReturn(){
  1;
  return throwFunc();
} 

function twoFunc() {
  2;
}

shouldBe('eval("1;")', "1");
shouldBe('eval("1; try { foo = [2,3,throwFunc(), 4]; } catch (e){}")', "undefined");
shouldBe('eval("1; try { 2; throw \\"\\"; } catch (e){}")', "undefined");
shouldBe('eval("1; try { 2; throwFunc(); } catch (e){}")', "undefined");
shouldBe('eval("1; try { 2; throwFunc(); } catch (e){3;} finally {}")', "3");
shouldBe('eval("1; try { 2; throwFunc(); } catch (e){3;} finally {4;}")', "3");
shouldBe('eval("function blah() { 1; }\\n blah();")', "undefined");
shouldBe('eval("var x = 1;")', "undefined");
shouldBe('eval("if (true) { 1; } else { 2; }")', "1");
shouldBe('eval("if (false) { 1; } else { 2; }")', "2");
shouldBe('eval("try{1; if (true) { 2; throw \\"\\"; } else { 2; }} catch(e){}")', "undefined");
shouldBe('eval("1; var i = 0; do { ++i; 2; } while(i!=1);")', "2");
shouldBe('eval("try{1; var i = 0; do { ++i; 2; throw \\"\\"; } while(i!=1);} catch(e){}")', "undefined");
shouldBe('eval("1; try{2; throwOnReturn();} catch(e){}")', "undefined");
shouldBe('eval("1; twoFunc();")', "undefined");
shouldBe('eval("1; with ( { a: 0 } ) { 2; }")', "2");
