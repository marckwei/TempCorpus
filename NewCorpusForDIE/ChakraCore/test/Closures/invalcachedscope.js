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

// "outer" is called in a loop but can't re-use its scope because "inner" escapes.
// The escape isn't detected with /forcedeferparse, because inner2 isn't visible to the
// byte code gen.
// So executing inner2 must invalidate the cache.
// If the cache is not invalidated, the call to escaped[1] will get the value of "x"
// from the scope cached when we executed escaped[0].
function outer() {
    var x = "yes!";
    function inner() {
        eval('WScript.Echo(x); x = "no!"');
    }
    function inner2() {
        return inner;
    }
    return inner2();
}

var escaped = [2];
for (var i = 0; i < 2; i++) {
    escaped[i] = outer();
}
for (i = 0; i < escaped.length; i++) {
    escaped[i]();
}

// As above, but the escape of "inner" is hidden by eval.
// Cache must be invalidated by the runtime when it does GetPropertyScoped.
function outer2() {
    var x = "yes!";
    function inner() {
        eval('WScript.Echo(x); x = "no!"');
    }
    function inner2() {
        return eval('inner');
    }
    return inner2();
}

for (i = 0; i < 2; i++) {
    escaped[i] = outer2();
}
for (i = 0; i < escaped.length; i++) {
    escaped[i]();
}
