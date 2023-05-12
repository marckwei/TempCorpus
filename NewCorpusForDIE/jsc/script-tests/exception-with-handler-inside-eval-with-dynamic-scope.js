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

description('This test makes sure stack unwinding works correctly when it occurs inside an eval contained in a dynamic scope.');
var result;
function runTest() {
    var test = "outer scope";
    with({test:"inner scope"}) {
        eval("try { throw ''; } catch (e) { result = test; shouldBe('result', '\"inner scope\"'); }");
        result = null;
        eval("try { with({test:'innermost scope'}) throw ''; } catch (e) { result = test; shouldBe('result', '\"inner scope\"'); }");
        result = null;
        eval("with ({test:'innermost scope'}) try { throw ''; } catch (e) { result = test; shouldBe('result', '\"innermost scope\"'); }");
        result = null;
        with ({test:'innermost scope'}) eval("try { throw ''; } catch (e) { result = test; shouldBe('result', '\"innermost scope\"'); }");
        result = null;
        try {
            eval("try { throw ''; } finally { result = test; shouldBe('result', '\"inner scope\"'); result = null; undeclared; }");
        } catch(e) {
            result = test;
            shouldBe('result', '"inner scope"');
            result = null;
            eval("try { with({test:'innermost scope'}) throw ''; } catch (e) { result = test; shouldBe('result', '\"inner scope\"'); }");
            result = null;
            eval("with ({test:'innermost scope'}) try { throw ''; } catch (e) { result = test; shouldBe('result', '\"innermost scope\"'); }");
            result = null;
            with ({test:'innermost scope'}) eval("try { throw ''; } catch (e) { result = test; shouldBe('result', '\"innermost scope\"'); }");
        }
    }
    result = test;
    eval("try { throw ''; } catch (e) { result = test; shouldBe('result', '\"outer scope\"'); }");
    eval("result = test");
    eval("try { throw ''; } catch (e) { result = test; shouldBe('result', '\"outer scope\"'); }");
}
runTest();
