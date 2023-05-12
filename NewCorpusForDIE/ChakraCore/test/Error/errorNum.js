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

try
{
    x = random();
}
catch ( e )
{
    write(e.number + " " + e.message);
}

try
{
    throwException();
}
catch ( e )
{
    write(e.number + " " + e.message);
}

try {
    var astr = new AString();
}
catch(e) {
    write(e.number + " " + e.message);
}

try
{
    eval("function u\u3000n01() { return 3; }");
}
catch ( e )
{
    write(e.number + " " + e.message);
}

try
{
    var d = new Date();
    d.setHours();
}
catch ( e )
{
    write(e.number + " " + e.message);
}

try
{
    sTmp = encodeURI(String.fromCharCode(0xD800));
}
catch ( e )
{
    write(e.number + " " + e.message);
}

try
{
    sTmp = decodeURI("%");
}
catch ( e )
{
    write(e.number + " " + e.message);
}

try
{
    var data = "AABBCCDD";
    var exp = new RegExp("(?{ $a = 3+$b })");
    res = data.match(exp);
}
catch (e)
{
    write(e.number + " " + e.message);
}

try
{
    var data = "foo";
    var exp = new RegExp("(in","i");
    res = data.match(exp);
}
catch (e)
{
    write(e.number + " " + e.message);
}

try
{
    var numvar = new Number(10.12345);
    var res = numvar.toPrecision(0);
}
catch (e)
{
    write(e.number + " " + e.message);
}

try
{
    var exp = new RegExp("[z-a]","i");
}
catch (e)
{
    write(e.number + " " + e.message);
}

try
{
    eval("var u\u200Cn01 = 14;");
}
catch (e)
{
    write(e.number + " " + e.message);
}

