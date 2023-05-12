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
        #method() {
            throw new Error("Should never be called");
        }

        access() {
            return this.#method++;
        }
    }

    let c = new C();
    assert.throws(TypeError, function() {
        c.access();
    });
})();

(function() {
    let executedGetter = false;
    class C {
        get #m() {
            executedGetter = true;
        }

        access() {
            return this.#m++;
        }
    }

    let c = new C();
    assert.throws(TypeError, function() {
        c.access();
    });

    assert.sameValue(true, executedGetter);
})();

(function() {
    class C {
        set #m(v) {
            throw new Error("Should never be executed");
        }

        access() {
            return this.#m++;
        }
    }

    let c = new C();
    assert.throws(TypeError, function() {
        c.access();
    });
})();

(function() {
    class C {
        set #m(v) {
            assert.sameValue(5, v);
        }

        get #m() {
            return 4;
        }

        access() {
            return this.#m++;
        }
    }

    let c = new C();
    assert.sameValue(4, c.access());
})();

// Ignored result

(function() {
    class C {
        #method() {
            throw new Error("Should never be called");
        }

        access() {
            this.#method--;
        }
    }

    let c = new C();
    assert.throws(TypeError, function() {
        c.access();
    });
})();

(function() {
    let executedGetter = false;
    class C {
        get #m() {
            executedGetter = true;
        }

        access() {
            this.#m--;
        }
    }

    let c = new C();
    assert.throws(TypeError, function() {
        c.access();
    });

    assert.sameValue(true, executedGetter);
})();

(function() {
    class C {
        set #m(v) {
            throw new Error("Should never be executed");
        }

        access() {
            this.#m--;
        }
    }

    let c = new C();
    assert.throws(TypeError, function() {
        c.access();
    });
})();

(function() {
    class C {
        set #m(v) {
            assert.sameValue(3, v);
        }

        get #m() {
            return 4;
        }

        access() {
            this.#m--;
        }
    }

    let c = new C();
    c.access();
})();

