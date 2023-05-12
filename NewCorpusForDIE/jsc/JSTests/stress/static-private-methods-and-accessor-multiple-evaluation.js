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

(function () {
    function classFactory() {
        return class {
            static #method() {
                return 'test';
            }
    
            static access(o) {
                return o.#method();
            }
        }
    };
    
    let C1 = classFactory();
    let C2 = classFactory();
    
    assert.sameValue(C1.access(C1), 'test');
    assert.sameValue(C2.access(C2), 'test');
    
    assert.throws(TypeError, function () {
        C1.access(C2);
    });
    
    assert.throws(TypeError, function () {
        C2.access(C1);
    });
})();

(function () {
    function classFactory() {
        return class {
            static get #m() {
                return 'test';
            }
    
            static access(o) {
                return o.#m;
            }
        }
    };
    
    let C1 = classFactory();
    let C2 = classFactory();
    
    assert.sameValue(C1.access(C1), 'test');
    assert.sameValue(C2.access(C2), 'test');
    
    assert.throws(TypeError, function () {
        C1.access(C2);
    });
    
    assert.throws(TypeError, function () {
        C2.access(C1);
    });
})();

(function () {
    function classFactory() {
        return class {
            static set #m(v) {
                this._v = v;
            }
    
            static access(o) {
                o.#m = 'test';
            }
        }
    };
    
    let C1 = classFactory();
    let C2 = classFactory();
    
    C1.access(C1);
    assert.sameValue(C1._v, 'test');

    C2.access(C2);
    assert.sameValue(C2._v, 'test');
    
    assert.throws(TypeError, function () {
        C1.access(C2);
    });
    
    assert.throws(TypeError, function () {
        C2.access(C1);
    });
})();

