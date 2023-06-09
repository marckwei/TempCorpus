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

// The app code can let-declare a variable that shadows a variable previously declared in the console. The variable in app code shadows the variable defined in the console.
// When a scope containing let/const-declared variables is exited, any variables created in the scope become undefined, and any variables shadowed in the scope go back to 
// their values from before that scope was entered.
var a = 1; /**bp:evaluate("let x = 1;")**/
function someFuncThatsCalled() {
    a = 2; /**bp:evaluate("let y = 1;let z = 1;")**/
    let x = 2;
    let y = 2;
    a = 2; /**bp:evaluate("WScript.Echo(x == 2);WScript.Echo(y === 2);")**/
}
someFuncThatsCalled();
a = 2; /**bp:evaluate("WScript.Echo(x == 1);")**/
a = 2; /**bp:evaluate("WScript.Echo(y == 1);")**/
a = 2; /**bp:evaluate("WScript.Echo(z == 1);")**/

// If you define a closure in the console that closes over a let-bound variable in app code, this closure still "works" even when the scope of the let-bound variable ends.
function someFuncThatsRunning() {
    let x1 = 1;
    a = 2; /**bp:evaluate("var myClosure=function(){x1+=1;return x1;};WScript.Echo(myClosure() == 2);WScript.Echo(myClosure() == 3);")**/
}
someFuncThatsRunning();
a = 2; /**bp:evaluate("WScript.Echo(myClosure() == 4);")**/