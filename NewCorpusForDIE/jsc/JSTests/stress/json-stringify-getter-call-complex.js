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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

{
    let a = {
        get cocoa() {
            return "Cocoa";
        },

        get cappuccino() {
            return "Cappuccino";
        }
    }

    shouldBe(JSON.stringify(a), `{"cocoa":"Cocoa","cappuccino":"Cappuccino"}`);
    shouldBe(JSON.stringify(a, ["cocoa", "cappuccino"]), `{"cocoa":"Cocoa","cappuccino":"Cappuccino"}`);
}
{
    let a = {
        get cocoa() {
            Reflect.defineProperty(a, "cappuccino", { value: 42 });
            return "Cocoa";
        },

        get cappuccino() {
            throw new Error("out");
        }
    }

    shouldBe(JSON.stringify(a), `{"cocoa":"Cocoa","cappuccino":42}`);
}
{
    let a = {
        get cocoa() {
            Reflect.defineProperty(a, "next", { value: 42 });
            return "Cocoa";
        },

        get cappuccino() {
            return "Cappuccino";
        }
    }

    shouldBe(JSON.stringify(a), `{"cocoa":"Cocoa","cappuccino":"Cappuccino"}`);
}
{
    let a = {
        get cocoa() {
            Reflect.deleteProperty(a, "cappuccino");
            return "Cocoa";
        },

        get cappuccino() {
            return "Cappuccino";
        }
    }

    shouldBe(JSON.stringify(a), `{"cocoa":"Cocoa"}`);
}
{
    let a = {
        get cocoa() {
            return "Cocoa";
        },

        set cappuccino(value) {
            throw new Error("out");
        }
    }

    shouldBe(JSON.stringify(a), `{"cocoa":"Cocoa"}`);
}
