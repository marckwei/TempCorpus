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

//@ runFTLNoCJIT("--thresholdForFTLOptimizeAfterWarmUp=1000")

// This test should not crash.

let source;
for (__v1 of 'gu') {
    let __v3 = new RegExp(source, __v1);
    let __v0 = 'Over many a quaint and curious volume of forgotten lore,'.replace(__v3, (...__v0) => {
        try {
            try {
                try {
                    for (let __v0 = 27; __v0 < 1000; ++__v0) {}
                } finally {
                    return __v4;
                }
            } finally {
                gc();
            }
        } catch (__v3) {
            try {
            } finally {
                    ({}).__proto__[__v0] = __v3;
                    for (__v1 of 'gu') {
                        let __v3 = new RegExp(source, __v1);
                        let __v0 = 'Over many a quaint and curious volume of forgotten lore,'.replace(__v3, (...__v0) => {
                            try {
                                try {
                                } finally {(((((((((((((((((((((((((((((((((((((('blahblahblahblah' + __v0) + __v0) + __v0) + __v0) + __v0 instanceof __v0) + __v0) + __v0 === __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0 != __v0) + __v1) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0 === __v0) + __v5) + __v0) + __v0) + __v0) + __v0) + __v0) + __v0) + __v2 + __v0;
                                }
                            } catch (__v3) {
                                try {
                                    eval('tag`Hello\n${v}world`');
                                } finally {
                                    try {
                                    } finally {
                                        try {
                                            eval('tag`Hello\n${v}world`');
                                        } finally {
                                            return;
                                        }
                                    }
                                }
                            }
                        });
                    }
            }
        }
    });
}