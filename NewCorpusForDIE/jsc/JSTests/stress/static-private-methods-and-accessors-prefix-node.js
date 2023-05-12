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

let assert = {
    sameValue: function (lhs, rhs) {
        if (lhs !== rhs)
            throw new Error("Expected: " + lhs + " bug got: " + rhs);
    },

    throws: function (expectedError, op) {
        try {
          op();
        } catch(e) {
            if (!(e instanceof expectedError))
                throw new Error("Expected to throw: " + expectedError + " but threw: " + e);
        }
    }
};

(function() {
    class C {
        static #method() {
            throw new Error("Should never be called");
        }

        static access() {
            return ++this.#method;
        }
    }

    assert.throws(TypeError, function() {
        C.access();
    });
})();

(function() {
    let executedGetter = false;
    class C {
        static get #m() {
            executedGetter = true;
        }

        static access() {
            return ++this.#m;
        }
    }

    assert.throws(TypeError, function() {
        C.access();
    });

    assert.sameValue(true, executedGetter);
})();

(function() {
    class C {
        static set #m(v) {
            throw new Error("Should never be executed");
        }

        static access() {
            return ++this.#m;
        }
    }

    assert.throws(TypeError, function() {
        C.access();
    });
})();

(function() {
    class C {
        static set #m(v) {
            assert.sameValue(5, v);
        }

        static get #m() {
            return 4;
        }

        static access() {
            return ++this.#m;
        }
    }

    assert.sameValue(5, C.access());
})();

// Ignored result

(function() {
    class C {
        static #method() {
            throw new Error("Should never be called");
        }

        static access() {
            --this.#method;
        }
    }

    assert.throws(TypeError, function() {
        C.access();
    });
})();

(function() {
    let executedGetter = false;
    class C {
        static get #m() {
            executedGetter = true;
        }

        static access() {
            --this.#m;
        }
    }

    assert.throws(TypeError, function() {
        C.access();
    });

    assert.sameValue(true, executedGetter);
})();

(function() {
    class C {
        static set #m(v) {
            throw new Error("Should never be executed");
        }

        static access() {
            --this.#m;
        }
    }

    assert.throws(TypeError, function() {
        C.access();
    });
})();

(function() {
    class C {
        static set #m(v) {
            assert.sameValue(3, v);
        }

        static get #m() {
            return 4;
        }

        static access() {
            --this.#m;
        }
    }

    C.access();
})();

