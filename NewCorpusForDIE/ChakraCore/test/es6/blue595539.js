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

function testES6Whitespace(whitespaceChar, whitespaceCode) {
    try {
        var str = "var " + whitespaceChar + "a = 5;";
        eval(str);
        if (a !== 5) {
            throw new Error("Eval value didn't equal to 5.");
        }
    } catch (ex) {
        WScript.Echo("Whitespace error with: " + whitespaceCode + "\r\nMessage: " + ex.message);
    }
}

var whitespaceChars = [
    { code: 0x9, strValue: "0x9" },
    { code: 0xB, strValue: "0xB" },
    { code: 0xC, strValue: "0xC" },
    { code: 0x20, strValue: "0x20" },
    { code: 0xA0, strValue: "0xA0" },
    { code: 0xFEFF, strValue: "0xFEFF" }];

whitespaceChars.forEach(function (item) { testES6Whitespace(String.fromCharCode(item.code), item.strValue); });

WScript.Echo("Pass");