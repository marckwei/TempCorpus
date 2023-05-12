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


function write(x) { WScript.Echo(x); }

// var after let at function scope should be redeclaration error
try {
    eval(
            "(function () {" +
            "   let x = 'let x';" +
            "   var x = 'redeclaration error';" +
            "   write(x);" +
            "})();"
        );
} catch (e) {
    write(e);
}


// var after let in non-function block scope should be valid;
// var declaration should reassing let bound symbol, but should
// also introduce function scoped variable, initialized to undefined
// (Make sure there is no difference whether the let binding is used
// or not before the var declaration)
// (Blue bug 145660)
try {
    eval(
            "(function () {" +
            "   {" +
            "       let x = 'let x';" +
            "       var x = 'var x';" +
            "       write(x);" +
            "   }" +
            "   write(x);" +
            "   {" +
            "       let y = 'let y';" +
            "       write(y);" +
            "       var y = 'var y';" +
            "       write(y);" +
            "   }" +
            "   write(y);" +
            "})();"
        );
} catch (e) {
    write(e);
}

// var before let in non-function block scope should raise a
// Use Berfore Declaration error.
try {
    eval(
            "(function () {" +
            "   {" +
            "       var x = 'var x';" +
            "       let x = 'let x';" +
            "       write(x);" +
            "   }" +
            "   write(x);" +
            "})();"
        );
} catch (e) {
    write(e);
}
