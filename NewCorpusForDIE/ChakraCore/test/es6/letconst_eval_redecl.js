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

function print(x) { WScript.Echo(x+""); }

var inFunctionTests =
[
// eval gets scope for let/const variables => they do not leak out, no redeclaration error with vars
    function () {
        var x = 1;
        eval("let x = 2;");
        print(x);
    },
    function () {
        var x = 1;
        eval("const x = 2;");
        print(x);
    },
    function () {
        eval("let x = 2;");
        var x = 1;
        print(x);
    },
    function () {
        eval("const x = 2;");
        var x = 1;
        print(x);
    },
// var leaks out of eval in non-strict mode => redeclaration error with let/consts
    function () {
        let x = 1;
        eval("var x = 2;");
        print(x);
    },
    function () {
        const x = 1;
        eval("var x = 2;");
        print(x);
    },
    function () {
        eval("var x = 2;");
        let x = 1;
        print(x);
    },
    function () {
        eval("var x = 2;");
        const x = 1;
        print(x);
    },
];

for (let i = 0; i < inFunctionTests.length; i++)
{
    try {
        inFunctionTests[i]();
    } catch (e) {
        print(e);
    }
}


// global tests

// eval gets scope for let/const variables => they do not leak out, no redeclaration error with vars
var a = 1;
eval("let a = 2;");
print(a);

var b = 1;
eval("const b = 2;");
print(b);

eval("let c = 2;");
var c = 1;
print(c);

eval("const d = 2;");
var d = 1;
print(d);

// var leaks out of eval in non-strict mode => redeclaration error with let/consts
let e = 1;
try { eval("var e = 2;"); print(e); } catch (e) { print(e); }

const f = 1;
try { eval("var f = 2;"); print(f); } catch (e) { print(e); }

var hadException = false;
try { eval("var g = 2;"); } catch (e) { print(e); hadException = true; }
let g = 1;
if (!hadException) print(g);

hadException = false;
try { eval("var h = 2;"); } catch (e) { print(e); hadException = true; }
const h = 1;
if (!hadException) print(h);
