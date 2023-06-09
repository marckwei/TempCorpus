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

// Testing inspection at catch block.

var top = {}
function bar() {
    try {
        abc.def = 10;
    } catch (e) {

        var f1 = function (arg1) {
            e;
            var m = arguments[0];
            var f2 = function () {

                var in1 = 0;
                m;
                var f3 = function () {
                    var in2 = 1;
                    in1;       /**bp:locals(1)**/
                }
                f3();
            }
            f2();
        };

        top.f1 = f1;
        top.f1(111);
    }
}

bar();

top.f1();

var startTest = function () {
    try {
        abc.def = 10;
    } catch (e) {
        var j1 = function () {
            e;
        };
        j1();                     /**bp:locals(1)**/
    }
}

startTest();

function bar2() {
    try {
        abc.def = 10;
    } catch (e) {
        var j1 = function () {
            e; //NOTE: bp needs to be on next line, otherwise hybrid debugger considers the bp on previous line.
            /**bp:locals(1)**/
        };
        j1();
    }
}

bar2();

function foo() {
    var k = 10;
    function g() {
        k;
        try {
            abc.def = 10;
        }
        catch (ex) {
            ex;                    /**bp:locals(1)**/
        }
    }
    g();
}

foo();

function foo1() {
    var k = 10;
    function g() {
        var in1 = 10;
        k;
        try {
            abc.def = 10;
        }
        catch (ex) {
            ex;                    /**bp:locals(1)**/
        }
    }
    g();
}

foo1();
foo1([22]);

function foo10() {
    try {
        abc.def = 10;
    }
    catch (ex) {
        ex;                    /**bp:locals(1)**/
    }
}

foo10();

function foo11() {
    function g() {
        try {
            abc.def = 10;
        }
        catch (ex) {
            ex;                    /**bp:locals(1)**/
        }
    }
    g();
}

foo11();

function foo2() {
    var m = 10;
    function g() {
        try {
            abc.def = 10;
        }
        catch (ex) {
            ex;                    /**bp:locals(1)**/
        }
    }
    g();
}

foo2();

function foo3() {
    var m = 10;
    function g() {
        var m1 = 10;
        try {
            abc.def = 10;
        }
        catch (ex) {
            ex;                    /**bp:locals(1)**/
        }
    }
    g();
}

foo3();

try {
    abc.def = 10;
}
catch (ex) {
    ex;                    /**bp:locals(1)**/
}

function foo5() {
    var j = { x: 20, y: [30, 40] }
    j;                               /**bp:evaluate('j.x', 0);evaluate('j', 1)**/
}

foo5();

function foo6() {
    try {
        abc.def = 10;
    }
    catch (ex) {
        ex;                    /**bp:evaluate('ex', 1)**/
    }
}

foo6();

function foo7() {
    try {
        abc.def = 10;
    }
    catch (ex) {
        ex;
        try {
            dd.bb = "";
        }
        catch (ex1) {
            ex1;                /**bp:evaluate('ex', 1);evaluate('ex1');**/
        }
    }
}

foo7();


(function f() { // slot array scope
    var fa = 123;
    try {
        throw -1;
    }
    catch (e1) { // catch scope
        e1;
        (function g() {
            var ga = 40;
            fa; ga;
            e1;
            /**bp:stack();locals(1)**/
        })();
    }
})();

(function f() { // null dummy scope
    try {
        throw -1;
    }
    catch (e1) { // catch scope
        e1;
        (function g() {
            e1;
            /**bp:stack();locals(1)**/
        })();
    }
})();

(function foo() { // slot array scope
    var foo0 = 12;
    function f() { // null dummy scope
        try {
            throw new Error("1 Error");
        }
        catch (e1) { // catch scope
            e1; foo0;
            (function g() {
                e1;
                /**bp:stack();locals(1)**/
            })();
        }
    }
    f();
})();

(function foo() {
    var a = 1;
    try {
        throw -1;
    }
    catch { // catch scope
        let b = 2;
        (function g() {
            var c = 3;
            a; b; c; /**bp:locals(1)**/
        })();
    }
})();

WScript.Echo("Pass");
