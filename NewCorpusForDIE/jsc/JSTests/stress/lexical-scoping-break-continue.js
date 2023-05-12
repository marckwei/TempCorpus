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

function assert(b) {
    if (!b)
        throw new Error("bad assertion");
}
noInline(assert);

;(function() {
    function test1() {
        let x = 20;
        function foo() {
            label: {
                let y = 21;
                let capY = function () { return y; }
                assert(x === 20);
                break label;
            }
            assert(x === 20);
        }
        foo();
    }

    function test2() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            label1: {
                label2: {
                    let y = 21;
                    let capY = function () { return y; }
                    break label2;
                }
                assert(x === 20);
            }
            assert(x === 20);

            label1: {
                label2: {
                    let y = 21;
                    let capY = function () { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    break label1;
                }
            }
            assert(x === 20);

            label1: {
                let y = 21;
                let capY = function () { return y; }
                label2: {
                    let y = 21;
                    let capY = function () { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    break label1;
                }
            }
            assert(x === 20);
        }
        foo()
    }

    function test3() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            loop1: for (var i = 0; i++ < 1000; ) {
                //assert(x === 20);
                loop2: for (var j = 0; j++ < 1000; ) {
                    let y = 21;
                    let capY = function() { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    continue loop1;
                    //break loop1;
                }
            }
            assert(x === 20);
        }
        foo()
    }

    function test4() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            loop1: for (var i = 0; i++ < 1000; ) {
                loop2: for (var j = 0; j++ < 1000; ) {
                    let y = 21;
                    let capY = function() { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    break loop1;
                }
            }
            assert(x === 20);
        }
        foo()
    }

    function test5() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            loop1: for (var i = 0; i++ < 1000; ) {
                let y = 21;
                let capY = function() { return y; }
                loop2: for (var j = 0; j++ < 1000; ) {
                    let y = 21;
                    let capY = function() { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    break loop1;
                }
            }
            assert(x === 20);
        }
        foo()
    }

    function test6() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            loop1: for (var i = 0; i++ < 1000; ) {
                assert(x === 20);
                let y = 21;
                let capY = function() { return y; }
                loop2: for (var j = 0; j++ < 1000; ) {
                    let y = 21;
                    let capY = function() { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    try {
                        throw new Error();            
                    } catch(e) {
                    } finally {
                        assert(x === 20);
                        continue loop1;    
                    }
                }
            }
            assert(x === 20);
        }
        foo()
    }

    function test7() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            loop1: for (var i = 0; i++ < 1000; ) {
                assert(x === 20);
                let y = 21;
                let capY = function() { return y; }
                loop2: for (var j = 0; j++ < 1000; ) {
                    let y = 21;
                    let capY = function() { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    try {
                        throw new Error();            
                    } catch(e) {
                        continue loop1;
                    } finally {
                        let x = 40;
                        let capX = function() { return x; }
                        assert(x === 40);
                    }
                }
            }
            assert(x === 20);
        }
        foo()
    }

    function test8() {
        let x = 20;
        function capX() { return x; }
        function foo() {
            loop1: for (var i = 0; i++ < 1000; ) {
                assert(x === 20);
                let y = 21;
                let capY = function() { return y; }
                loop2: for (var j = 0; j++ < 1000; ) {
                    let y = 21;
                    let capY = function() { return y; }
                    assert(x === 20);
                    assert(y === 21);
                    try {
                        throw new Error();            
                    } catch(e) {
                        break loop1;
                    } finally {
                        let x = 40;
                        let capX = function() { return x; }
                        assert(x === 40);
                    }
                }
            }
            assert(x === 20);
        }
        foo()
    }

    for (var i = 0; i < 10; i++) {
        test1();
        test2();
        test3();
        test4();
        test5();
        test6();
        test7();
        test8();
    }
})();
