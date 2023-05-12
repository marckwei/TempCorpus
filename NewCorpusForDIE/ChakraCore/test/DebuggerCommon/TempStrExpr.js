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

var i = 0;
function incrementI() {
    return ++i; /**bp:stack();evaluate('i', 1);resume('step_out');stack()**/
}

// String templates with method invocation
WScript.Echo(`The count is ${incrementI() /**bp:resume('step_into');stack()**/}`);

while (i < 4) {
    WScript.Echo(`The count is ${incrementI() /**bp:resume('step_into');stack();evaluate('i * i', 1)**/}`);
}

// Tagged templates
function tempHandler(callsite, substitutions) {
    WScript.Echo(substitutions); /**bp:stack();evaluate('arguments', 3);resume('step_over');stack()**/
}
tempHandler`The count is
${++i /**bp:stack();evaluate('tempHandler',3)**/}
`;/**bp:resume('step_into');stack()**/

// String.raw
WScript.Echo(String.raw`The count is ${(function() {
    return ++i; /**bp:stack();evaluate('String', 2)**/
})()}`);/**bp:resume('step_into');stack();resume('step_into');stack()**/