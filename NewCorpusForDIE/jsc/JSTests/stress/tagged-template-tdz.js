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

function shouldThrowTDZ(func) {
    let hasThrown = false;
    try {
        func();
    } catch(e) {
        if (e.name.indexOf("ReferenceError") !== -1)
            hasThrown = true;
    }
    if (!hasThrown)
        throw new Error("Did not throw TDZ error");
}
noInline(shouldThrowTDZ);

function test(f) {
    for (let i = 0; i < 1000; i++)
        f();
}

test(function() {
    shouldThrowTDZ(function() {
        (a)``;
        let a;
    });
});

test(function() {
    shouldThrowTDZ(function() {
        (a)``;
        let a;
        function capture() { return a; }
    });
});

test(function() {
    shouldThrowTDZ(()=> { (a)``; });
    let a;
});

test(function() {
    shouldThrowTDZ(()=> { eval("(a)``"); });
    let a;
});


test(function() {
    shouldThrowTDZ(()=> { (globalLet)``; });
});
test(function() {
    shouldThrowTDZ(()=> { eval("(globalLet)``;")});
});
let globalLet;
