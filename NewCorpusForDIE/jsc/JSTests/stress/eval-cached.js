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

(function () {
    "use strict";

    function verify() {
        for (var i = 0; i < counter; ++i) {
            if (results[i] != i)
                throw "strict mode verify() failed for item " + i + "."
        }
    }

    let results = [ ];
    let counter = 0;

    let x = counter++;
    results.push(eval("x"));

    {
        let x = counter++;
        results.push(eval("x"));
    }

    try {
        throw counter++;
    } catch (x) {
        results.push(eval("x"));
    }

    (() => {
        var x = counter++;
        results.push(eval("x"));
    })();

    (function (x) {
        results.push(eval("x"));
    })(counter++);

    verify();
})();

(function () {
    function verify() {
        for (var i = 0; i < counter; ++i) {
            if (results[i] != i)
                throw "non-strict mode verify() failed for item " + i + "."
        }
    }

    let results = [ ];
    let counter = 0;

    let x = counter++;
    results.push(eval("x"));

    {
        let x = counter++;
        results.push(eval("x"));
    }

    try {
        throw counter++;
    } catch (x) {
        results.push(eval("x"));
    }

    (() => {
        var x = counter++;
        results.push(eval("x"));
    })();

    (function (x) {
        results.push(eval("x"));
    })(counter++);

    with ({ x : counter++ }) {
        results.push(eval("x"));
    }

    verify();
})();
