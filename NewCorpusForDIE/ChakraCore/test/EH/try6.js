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

function foo(i)
{
    try
    {
        WScript.Echo("\t\tInner foo " + i);
        throw "thrown";
    }
    finally
    {
        WScript.Echo("\t\tFinally foo " + i);
        if (i == 0)
            return;
        else if (i == 1)
            throw 7;
    }
}

function bar(i)
{
    try
    {
        WScript.Echo("\tInner bar " + i);
        foo(i);
    }
    finally
    {
        WScript.Echo("\tFinally bar " + i);
    }
}

function foobaz(i)
{
    try
    {
        WScript.Echo("Inner foobaz " + i);
        bar(i);
    }
    catch(e)
    {
        WScript.Echo("Except foobaz " + i + " " + e);
    }
}

foobaz(0);
foobaz(1);
foobaz(2);

function testThrowInlining() {
    var y = function () {};
    Object.prototype["qfxhma"] = function qfxhma() {
        throw false;
    };
    function shapeyConstructor(waquaz) {
        qfxhma('');
        Object.defineProperty(this, "x", ({
                set :
                (function () {
                    var jqanki = y;
                })()
        }));
    }
    for (var a in[]) {
        try {
            shapeyConstructor(a);
        } catch (e) {
        }
    }
    qfxhma = y;
};
testThrowInlining();
testThrowInlining();

//Blue Bug 216103
function bar216103(a)
{
    var b=this.foo216103(a);
    return b;
}

function foo216103(a)
{
    switch(a)
    {
        case "en":
            return "english (passed)";
            break;

        case "de":
            return "german (passed)";
            break;

        default:
            throw "blah (passed)";
            break;
    }
}

try
{
    WScript.Echo(bar216103("en"));
}
catch(err)
{
    WScript.Echo(err);
}

function test() {
    var print = function () {
    };
    print(function a_indexing(fsznpi, kfoevo) {
        if (fsznpi.length == kfoevo) {
            return [eval("''++")];
        }
        var iewhao = a_indexing(fsznpi, kfoevo + 1);
        return 4;
    }([1], 0));
}
try{
  test();
}
catch(err){
  WScript.Echo(err)
};
