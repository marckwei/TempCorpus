function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
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

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

// Object Rest JIT unit tests

if (this.WScript && this.WScript.LoadScriptFile) { // Check for running in ch
    this.WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");
}

var tests = [
    {
        name: "Test JIT basic behavior",
        body: function() {
            function f() {
                let {a, ...rest} = {a: 1, b: 2};
                return rest;
            }
            
            f();
            let rest = f();

            assert.areEqual(2, rest.b);
        }
    },
    {
        name: "Test JIT basic behavior on binding pattern",
        body: function() {
            function f({a, ...rest}) {
                return rest;
            }
            
            f({a: 1, b: 2});
            let rest = f({a: 1, b: 2});

            assert.areEqual(2, rest.b);
        }
    },
    // TODO: Fix bug regarding nested destrucuring in array rest. 
    // Disabling this test for now
    // {
    //     name: "Test JIT basic behavior with object rest nested in array rest",
    //     body: function() {
    //         function f(a, ...{...rest}) {
    //             return rest;
    //         }
            
    //         f(1, 2);
    //         let rest = f(1, 2);

    //         assert.areEqual(2, rest[0]);
    //     }
    // },
    {
        name: "Test JIT bailout",
        body: function() {
            const obj = {a: 2};
            function f(x) {
                const a = obj.a;
                const {...unused} = x;
                return a + obj.a;
            }

            // Train it that ...x is not reentrant, so it emits code that assumes the second obj.a matches the first
            const result = f({});
            assert.areEqual(4, result);

            // Now call with a getter and verify that it bails out when the previous assumption is invalidated
            const reentrantResult = f({ get b() { obj.a = 3; } });
            assert.areEqual(5, reentrantResult);
        }
    },
];

testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
