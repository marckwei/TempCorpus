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

function callerMustBeRun() {
    if (!Object.is(callerMustBeRun.caller, runTests))
        throw new Error("Wrong caller, expected run but got ", callerMustBeRun.caller);
}

function callerMustBeStrict() {
    if (!Object.is(callerMustBeStrict.caller, null))
        throw Error("Wrong caller, expected strict caller but got ", callerMustBeStrict.caller);
}

function runTests() {
    // Statement tests
    (function simpleTailCall() {
        "use strict";
        return callerMustBeRun();
    })();

    (function noTailCallInTry() {
        "use strict";
        try {
            return callerMustBeStrict();
        } catch (e) {
            throw e;
        }
    })();

    (function tailCallInCatch() {
        "use strict";
        try { } catch (e) { return callerMustBeRun(); }
    })();

    (function tailCallInFinally() {
        "use strict";
        try { } finally { return callerMustBeRun(); }
    })();

    (function tailCallInFinallyWithCatch() {
        "use strict";
        try { } catch (e) { } finally { return callerMustBeRun(); }
    })();

    (function tailCallInFinallyWithCatchTaken() {
        "use strict";
        try { throw null; } catch (e) { } finally { return callerMustBeRun(); }
    })();

    (function noTailCallInCatchIfFinally() {
        "use strict";
        try { throw null; } catch (e) { return callerMustBeStrict(); } finally { }
    })();

    (function tailCallInFor() {
        "use strict";
        for (var i = 0; i < 10; ++i)
            return callerMustBeRun();
    })();

    (function tailCallInWhile() {
        "use strict";
        while (true)
            return callerMustBeRun();
    })();

    (function tailCallInDoWhile() {
        "use strict";
        do
            return callerMustBeRun();
        while (true);
    })();

    (function noTailCallInForIn() {
        "use strict";
        for (var x in [1, 2])
            return callerMustBeStrict();
    })();

    (function noTailCallInForOf() {
        "use strict";
        for (var x of [1, 2])
            return callerMustBeStrict();
    })();

    (function tailCallInIf() {
        "use strict";
        if (true)
            return callerMustBeRun();
    })();

    (function tailCallInElse() {
        "use strict";
        if (false) throw new Error("WTF");
        else return callerMustBeRun();
    })();

    (function tailCallInSwitchCase() {
        "use strict";
        switch (0) {
        case 0: return callerMustBeRun();
        }
    })();

    (function tailCallInSwitchDefault() {
        "use strict";
        switch (0) {
        default: return callerMustBeRun();
        }
    })();

    (function tailCallWithLabel() {
        "use strict";
        dummy: return callerMustBeRun();
    })();

    (function tailCallInTaggedTemplateString() {
        "use strict";
        return callerMustBeRun`test`;
    })();

    // Expression tests, we don't enumerate all the cases where there
    // *shouldn't* be a tail call

    (function tailCallComma() {
        "use strict";
        return callerMustBeStrict(), callerMustBeRun();
    })();

    (function tailCallTernaryLeft() {
        "use strict";
        return true ? callerMustBeRun() : unreachable();
    })();

    (function tailCallTernaryRight() {
        "use strict";
        return false ? unreachable() : callerMustBeRun();
    })();

    (function tailCallLogicalAnd() {
        "use strict";
        return true && callerMustBeRun();
    })();

    (function tailCallLogicalOr() {
        "use strict";
        return false || callerMustBeRun();
    })();

    (function tailCallCoalesce() {
        "use strict";
        return false ?? callerMustBeRun();
    })();

    (function memberTailCall() {
        "use strict";
        return { f: callerMustBeRun }.f();
    })();

    (function bindTailCall() {
        "use strict";
        return callerMustBeRun.bind()();
    })();

    (function optionalTailCall() {
        "use strict";
        return callerMustBeRun?.();
    })();

    // Function.prototype tests

    (function applyTailCall() {
        "use strict";
        return callerMustBeRun.apply();
    })();

    (function callTailCall() {
        "use strict";
        return callerMustBeRun.call();
    })();

    // No tail call for constructors
    (function noTailConstruct() {
        "use strict";
        return new callerMustBeStrict();
    })();
}

for (var i = 0; i < 10000; ++i)
    runTests();
