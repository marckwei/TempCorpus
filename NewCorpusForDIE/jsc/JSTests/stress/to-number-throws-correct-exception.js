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

function test(op) {
    let test = `
        function runTest(iters) {
            let shouldThrow = false;
            let a = {
                valueOf() { 
                    if (shouldThrow)
                        throw "a";
                    return 0;
                }
            };
            let {proxy: b, revoke} = Proxy.revocable({}, {
                get: function(target, prop) {
                    if (prop === "valueOf") {
                        if (shouldThrow)
                            throw new Error("Should not be here!");
                        return function() {
                            return 0;
                        }
                    }
                }
            });
            function f(a, b) {
                return a ${op} b;
            }
            noInline(f);
            for (let i = 0; i < iters; i++) {
                f(a, b);
            }

            shouldThrow = true;
            let validException = false;
            let exception = null;
            revoke();
            try {
                f(a, b);
            } catch(e) {
                validException = e === "a";
                exception = e;
            }
            if (!validException)
                throw new Error("Bad operation: " + exception.toString() + " with iters: " + iters);
        }
        runTest(2);
        runTest(10);
        runTest(50);
        runTest(1000);
        runTest(10000);
    `;
    eval(test);
}
let ops = [
    "+"
    , "-"
    , "*"
    , "**"
    , "/"
    , "%"
    , "&"
    , "|"
    , "^"
    , ">>"
    , ">>>"
    , "<<"
];
for (let op of ops)
    test(op);

function test2(op) {
    function runTest(iters) {
        let test = `
            let shouldThrow = false;
            let a = {
                valueOf() { 
                    if (shouldThrow)
                        throw "a";
                    return 0;
                }
            };
            let {proxy: b, revoke} = Proxy.revocable({}, {
                get: function(target, prop) {
                    if (prop === "valueOf") {
                        if (shouldThrow)
                            throw new Error("Should not be here!");
                        return function() {
                            return 0;
                        }
                    }
                }
            });
            function f(a, b) {
                return a ${op} b;
            }
            noInline(f);
            for (let i = 0; i < ${iters}; i++) {
                f(a, b);
            }

            shouldThrow = true;
            let validException = false;
            let exception = null;
            revoke();
            try {
                f(a, b);
            } catch(e) {
                validException = e === "a";
                exception = e;
            }
            if (!validException)
                throw new Error("Bad operation: " + exception.toString() + " with iters: " + ${iters});
        `;
        eval(Math.random() + ";" + test);
    }
    runTest(2);
    runTest(10);
    runTest(50);
    runTest(1000);
    runTest(10000);
}
for (let op of ops)
    test2(op);
