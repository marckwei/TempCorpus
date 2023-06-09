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
// Copyright (c) 2021 ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

function printObj(obj)
{
    WScript.Echo(obj.toString());
    for (var i in obj)
    {
        WScript.Echo(i + " == " + obj[i]);
    };
    WScript.Echo("byteLength = " + obj.byteLength);
}

function verifyThrow(func, obj)
{
    var hasThrown = false;
    var result;
    try {
        result = func(obj);
    }
    catch(e)
    {
        print("SUCCEEDED: get expected exception " + e.message);
        hasThrown = true;
    }
    if (!hasThrown)
    {
        print("FAILED: didn't get exception");
    }
}


function print(obj)
{
    WScript? WScript.Echo(obj) : document.write(obj);
}


function verifyNoThrow(func, obj)
{
    var hasThrown = false;
    var result;
    try {
        result = func(obj);
    }
    catch(e)
    {
        print("FAILED: get exception " + e.message);
        hasThrown = true;
    }
    return result;
}

function setIntValue(typedArray, valueToSet) {
}

function setFloat32Value(typedArray, valueToSet){
}

function setFloat64Value(typedArray){
}

function testSetWithObj(startIndex, endIndex, typedArray, typedArrayForFloatIndex, typedArrayForStringIndex)
{
    var count = 0;
    valueToSet = { valueOf: function() { WScript.Echo(count); return count++; } }

    for (var i = startIndex; i < endIndex; i++)
    {
        typedArray[-0] = valueToSet;
        typedArray[i] = valueToSet;
        typedArrayForFloatIndex[i + 0.892834] = valueToSet;
        typedArrayForStringIndex[i + "s"] = valueToSet;
    }
    for (var i = startIndex; i < endIndex; i++)
    {
        WScript.Echo(typedArray[i]);
        WScript.Echo(typedArrayForFloatIndex[i + 0.892834]);
        WScript.Echo(typedArrayForStringIndex[i + "s"]);
    }
    WScript.Echo(typedArray[-0]);
}

function testSetWithFloat(startIndex, endIndex, typedArray, typedArrayForFloatIndex, typedArrayForStringIndex)
{
    var count = 0;

    for (var i = startIndex; i < endIndex; i++)
    {
        typedArray[-0] = Math.sqrt(i);
        typedArray[i] = Math.sqrt(i);
        typedArrayForFloatIndex[i + 0.892834] = Math.sqrt(i);
        typedArrayForStringIndex[i + "s"] = Math.sqrt(i);
    }
    for (var i = startIndex; i < endIndex; i++)
    {
        WScript.Echo(typedArray[i]);
        WScript.Echo(typedArrayForFloatIndex[i + 0.892834]);
        WScript.Echo(typedArrayForStringIndex[i + "s"]);
    }
    WScript.Echo(typedArray[-0]);
}

function testSetWithInt(startIndex, endIndex, typedArray, typedArrayForFloatIndex, typedArrayForStringIndex)
{
    var count = 0;

    for (var i = startIndex; i < endIndex; i++)
    {
        typedArray[-0] = 5;
        typedArray[i] = 5;
        typedArrayForFloatIndex[i + 0.892834] = 5;
        typedArrayForStringIndex[i + "s"] = 5;
    }
    for (var i = startIndex; i < endIndex; i++)
    {
        WScript.Echo(typedArray[i]);
        WScript.Echo(typedArrayForFloatIndex[i + 0.892834]);
        WScript.Echo(typedArrayForStringIndex[i + "s"]);
    }
    WScript.Echo(typedArray[-0]);
}

function testIndexValueForSet(typedArray) {
    var count = 5;
    var obj = { valueOf: function() { WScript.Echo(count++); return count; } }
    var testIndices  = [
        0,
        "0",
        -0,    // sets index 0
        "-0",
        -2,
        "-2",
        1073741823,
        "1073741823",
        1,
        "1",
        2147483648 /*2 ^ 31*/,
        "2147483648" /*"2 ^ 31"*/,
        2147483647 /*(2 ^ 31) - 1*/,
        "2147483647" /* "(2 ^ 31) - 1"*/ ,
        4294967296 /*2 ^ 32*/,
        "4294967296" /*"2 ^ 32"*/,
        4294967295 /*(2 ^ 32) - 1*/,
        "4294967295" /*(2 ^ 32) - 1*/,
        1.5,
        "1.5",
        "a", /* doesn't call ToNumber(obj) */
        1.0000000000000000000000000e+9,
        "1.0000000000000000000000000e-9",
        1/"a", /* NaN */
        1/0,
        -1/0,
        (1/0).toString(),
        (-1/0).toString()
            ];

    for(var i = 0; i < testIndices.length; i++)
    {
        var testIndex = testIndices[i];
        if(typeof testIndex === "string")
        {
            WScript.Echo('***testing index ' + i + ' : "' + testIndex + '"');
        }
        else
        {
            WScript.Echo('***testing index ' + i + ' : ' + testIndex );
        }
        typedArray[testIndex] = obj;
        WScript.Echo(typedArray[testIndex]);
    }
}
