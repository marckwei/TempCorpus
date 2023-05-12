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

WScript.Echo("Scenario: Multiple closures, with variables that are modified in the parent function");

function write(x) { WScript.Echo(x + ""); }

function f()
{
        var y = "before modification";

        var ret1 = function()
        {
                WScript.Echo("1st function");
                WScript.Echo(y);
        }

        y = "after modification";

        var ret2 = function()
        {
                WScript.Echo("2nd function");
                WScript.Echo(y);
        }

        return [ret1,ret2];
}

(function() {
    function f() {
        write('In f');
    }
    function g() {
        write('In g');
    }

    var savef = f;
    f(f = g);
    f = savef;
    
    function foo() {
        write(typeof f);
        write(typeof g);
    }
})();

function g(funcs)
{
        funcs[1]();
        funcs[0]();
}

var clo = f();
g(clo);
g(clo);

// Side-effect through a closure without eval.
(function(){
    var f = function() { a = 2; return 1; }
    var a = 1;
    WScript.Echo(a + (f() + a));
})();

// Side-effect through a closure with eval.
(function(){
    var f = function() { a = 2; return 1; }
    var a = 1;
    WScript.Echo(a + (f() + a));
    eval("");
})();

// Side-effect through a closure inside eval.
(function(){
    var f = function() { a = 2; return 1; }
    var a = 1;
    eval('WScript.Echo(a + (f() + a));');
})();

// No side-effect in nested function.
(function(){
    var f = function() { return 1; }
    var a = 1;
    WScript.Echo(a + (f() + a));
})();
