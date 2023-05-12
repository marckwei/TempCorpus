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

(function ()
{
    function foo() { writeLine("easy, cancel defer"); }
    foo();
})();

(function ()
{
    function foo() { writeLine("easy"); }
    foo();
}).call();

(function ()
{
    var goo = function (str) { writeLine(str); };
    function foo() { goo("medium"); }
    (function () { foo(); }).call();
}).call();

(function ()
{
    writeLine((function ()
    {
        var goo = function () { return "hard"; };
        function foo() { return goo(); }
        return { callFoo: function () { return foo(); } };
    }).call().callFoo());
}).apply(this);

var x = { data: "OK" };
with (x)
{
  (function outer()
  {
    writeLine("outer function: " + data);
    (function inner()
    {
      writeLine("inner function: " + data);
    })();
  })();
}

var err = 'global';
try {
    var f1 = function() { writeLine(err) };
    throw 'catch';
}
catch(err) {
    var f2 = function() { writeLine(err) };
    try {
        throw 'catch2';
    }
    catch(err) {
        var f3 = function() { writeLine(err) };
    }
}
f1();
f2();
f3();

var str = '' +
    'x = { get func() { return 1; } };' +
    'x = { get "func"() { return 1; } };' +
    'x = { get 57() { return 1;} };' +
    'x = { get 1e5() { return 1;} };' +
    'x = { get func() { return 1;} };';

(function() {
    // The getters will only be declared in IE9 mode, since
    // in compat mode the nested eval will pick up the local (empty) string.
    var str = '';
    (0,eval)('eval(str)');
})();

(function (param) {
    return function() {
        writeLine(param);
    };
})('hi there')();

(function()
{
    // Test named function expression with deferred child where the func name is not visible.
    new function x(x)
    {
        function __tmp__()
        {
        }
        eval("\r\n    writeLine(x)")
    }
})();

var newfunction = new Function('writeLine("puppies!");');
newfunction();

// Test function with duplicate parameters
function dupes(a,b,c,a) {return a}
WScript.Echo(dupes(0));

// Helpers

function writeLine(str)
{
    WScript.Echo("" + str);
}
