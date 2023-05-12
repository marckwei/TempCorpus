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

function write(v) { WScript.Echo(v + ""); }

function exceptToString(ee) {
    if (ee instanceof TypeError) return "TypeError";
    if (ee instanceof ReferenceError) return "ReferenceError";
    if (ee instanceof EvalError) return "EvalError";
    if (ee instanceof SyntaxError) return "SyntaxError";
    return "Unknown Error";
}

var gVarTest1 = 1;

(function Test1() {
    var str = "delete global variable";
    try {
        eval("var r = delete gVarTest1;");
        write("r : " + r);
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
}) ();

function gHelperFunction2() {}
(function Test2() {
    var str = "delete global function";
    try {
        eval("var r = delete gHelperFunction2;");
        write("r : " + r);
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
}) ();

(function Test3() {
    var str = "delete local variable";
    var local = 3;
    try {
        eval("var r = delete local;");
        write("r : " + r);
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
}) ();

(function Test4() {
    var str = "delete local function";
    
    var nestedTest4 = function nestedTest4() {} ;

    try {
        eval("var r = delete nestedTest4;");
        write("r : " + r);
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
}) ();

(function Test5(x) {
    var str = "delete parameter";

    try {
        eval("var r = delete x;");
    } catch (e) {
        write("Exception: " + str + " " + exceptToString(e));
        return;
    }
    write("Return: " + str);
}) ();