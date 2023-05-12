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

// ES6 Subclassable async tests -- verifies subclass async behaviors

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

var tests = [
    {
        name: "Subclass of Promise - basic functionality",
        body: function (testNum, testName) {
            var s = "";
            class P extends Promise {}
            var p1 = new P(function(resolve, reject) { resolve("foo"); });
            var p2 = new P(function(resolve, reject) { reject("quux"); });
            s += "a";
            assert.isTrue(p1 instanceof P);

            function thenFn(result)  { assert.isTrue(result === "foo"); s += 'b'; }
            function catchFn(result) { assert.isTrue(result === "quux"); s += 'c'; }
            function shouldNotRun(result)  { assert.isTrue(false);   }

            p1.then(thenFn, shouldNotRun);
            p2.then(shouldNotRun, catchFn);
            p1.catch(shouldNotRun);
            p2.catch(catchFn);

            p1.then(function() {
                // P.prototype.then() should return a new P
                assert.isTrue(p1.then() instanceof P && p1.then() !== p1);
                s += 'd';
                check();
            });

            function check() {
                print("Result of test #" + testNum + " " + testName);
                print(s);
            }
        }
    },
    {
        name: "Subclass of Promise - all",
        body: function (testNum, testName) {
            var s = "";
            class P extends Promise {}
            var fulfills = P.all([
                new Promise(function(resolve)   { resolve("foo"); }),
                new Promise(function(resolve)   { resolve("foo"); }),
            ]);
            s += "a";
            var rejects = P.all([
                new Promise(function(_, reject) { reject("bar"); }),
                new Promise(function(_, reject) { reject("bar"); }),
            ]);
            assert.isTrue(fulfills instanceof P);
            fulfills.then(function(result) { assert.isTrue(result + "" === "foo,foo"); s += 'b'; });
            rejects.catch(function(result) { assert.isTrue(result === "bar"); s += 'c'; check(); });

            function check() {
                print("Result of test #" + testNum + " " + testName);
                print(s);
            }
        }
    },
    {
        name: "Subclass of Promise - race",
        body: function (testNum, testName) {
            var s = "";
            class P extends Promise {}
            var fulfills = P.race([
              new Promise(function(resolve)   { resolve("foo"); }),
              new Promise(function(_, reject) { reject("bar"); }),
            ]);
            s += "a";
            var rejects = P.race([
              new Promise(function(_, reject) { reject("baz"); }),
              new Promise(function(resolve)   { resolve("qux"); }),
            ]);
            assert.isTrue(fulfills instanceof P);
            fulfills.then(function(result) { assert.isTrue(result === "foo"); s += 'b' });
            rejects.catch(function(result) { assert.isTrue(result === "baz"); s += 'c'; check(); });

            function check() {
                print("Result of test #" + testNum + " " + testName);
                print(s);
            }
        }
    },
];

for(var i=0; i<tests.length; i++ )
{
    var test=tests[i];
    print("Executing test #" + (i+1) + " " + test.name);
    test.body(i+1, test.name);
}
