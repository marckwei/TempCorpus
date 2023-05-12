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
    const { shouldBe } = await import('./import-tests/should.js');
    {
        let a = await import('./import-tests/cocoa.js');
        let b = await import('./import-tests/cocoa.js');
        shouldBe(a, b);
        shouldBe(a.hello(), 42);
    }

    {
        let a = await import('./import-tests/multiple.js');
        let a2 = await a.result();
        shouldBe(a !== a2, true);
        shouldBe(a2.ok(), 42);
        let a3 = await a.result();
        shouldBe(a2, a3);
    }

    {
        let error = null;
        try {
            let a = await import({ toString() { throw new Error('out'); } });
        } catch (e) {
            error = e;
        }
        shouldBe(error !== null, true);
        shouldBe(String(error), `Error: out`);
    }

    {
        async function load(cond) {
            if (cond)
                return import('./import-tests/cocoa.js');
            return undefined;
        }

        let v = await load(false);
        shouldBe(v, undefined);
        let v2 = await load(true);
        let v3 = await import('./import-tests/cocoa.js');
        shouldBe(v2, v2);
    }

    {
        let value = './import-tests/cocoa.js';
        let v = await import(value);
        let v2 = await import('./import-tests/cocoa.js');
        shouldBe(v, v2);
    }
}()).catch((error) => {
    print(String(error));
    abort();
});
