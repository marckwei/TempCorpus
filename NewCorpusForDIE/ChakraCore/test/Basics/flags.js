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

function doEval(str)
{
    write(str + " : " + eval(str));
}


var overwrite = "hello";

write("Global object builtin properties");

var globProps = [ "NaN", "Infinity", "undefined"];

for(var i=0;i<globProps.length;i++)
{
   doEval("delete " +  globProps[i]);
   doEval(globProps[i]);
}

for(var i=0;i<globProps.length;i++)
{
   doEval(globProps[i] + "= \"hello\";");
   doEval(globProps[i]);
}

write("Math Object builtin properties");

var mathProps = ["PI", "E", "LN10", "LN2", "LOG2E", "LOG10E", "SQRT1_2", "SQRT2"];


for(var i=0;i<mathProps.length;i++)
{
   doEval("Math." + mathProps[i] + " = overwrite");
   doEval("Math." + mathProps[i]);
}

for(var i=0;i<mathProps.length;i++)
{
   doEval("delete Math." +  mathProps[i]);
   doEval("Math." + mathProps[i]);
}

write("Number Object builtin properties");

var numberProps = ["MAX_VALUE", "MIN_VALUE", "NaN", "NEGATIVE_INFINITY", "POSITIVE_INFINITY"];


for(var i=0;i<numberProps.length;i++)
{
   doEval("Number." + numberProps[i] + " = overwrite");
   doEval("Number." + numberProps[i]);
}

for(var i=0;i<mathProps.length;i++)
{
   doEval("delete Number." +  numberProps[i]);
   doEval("Number." + numberProps[i]);
}
