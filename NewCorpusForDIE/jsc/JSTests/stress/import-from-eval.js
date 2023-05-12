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

var abort = $vm.abort;

(async function () {
    const { shouldBe, shouldThrow } = await import("./import-tests/should.js");

    {
        let cocoa = await eval(`import("./import-tests/cocoa.js")`);
        shouldBe(cocoa.hello(), 42);
    }

    {
        let cocoa = await (0, eval)(`import("./import-tests/cocoa.js")`);
        shouldBe(cocoa.hello(), 42);
    }

    {
        let cocoa = await eval(`eval('import("./import-tests/cocoa.js")')`);
        shouldBe(cocoa.hello(), 42);
    }

    {
        let cocoa = await ((new Function(`return eval('import("./import-tests/cocoa.js")')`))());
        shouldBe(cocoa.hello(), 42);
    }

    {
        let cocoa = await eval(`(new Function('return import("./import-tests/cocoa.js")'))()`);
        shouldBe(cocoa.hello(), 42);
    }

    {
        let cocoa = await [`import("./import-tests/cocoa.js")`].map(eval)[0];
        shouldBe(cocoa.hello(), 42);
    }
}()).catch((error) => {
    print(String(error));
    abort();
});
