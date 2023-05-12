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

// Test the fix for https://github.com/microsoft/ChakraCore/issues/6372


function checkObject(object)
{
    if (object.prototype.hasOwnProperty('toString'))
    {
        throw new Error(`${object.name}.prototype should not have own property 'toString'`);
    }
    if(object.prototype.toString !== Error.prototype.toString)
    {
        throw new Error(`${object.name}.prototype.toString should === Error.prototype.toString`);
    }
}

checkObject(EvalError);
checkObject(RangeError);
checkObject(ReferenceError);
checkObject(SyntaxError);
checkObject(URIError);

if (typeof WebAssembly !== 'undefined')
{
  checkObject(WebAssembly.CompileError);
  checkObject(WebAssembly.LinkError);
  checkObject(WebAssembly.RuntimeError);
}

print('pass');
