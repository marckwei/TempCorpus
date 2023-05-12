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

function MyReplace($0, $1, $2, $3, $4, offset, input)
{
    WScript.Echo("$0=" + $0);
    WScript.Echo("$1=" + $1);
    WScript.Echo("$2=" + $2);
    WScript.Echo("$3=" + $3);
    WScript.Echo("$4=" + $4);
    WScript.Echo("offset=" + offset);
    WScript.Echo("input=" + input);
    return $0;
}

var p = /(a)(b)(c)(d)/g;
var s = "xxabcdxxabcdxx";

WScript.Echo(s.replace(p, MyReplace));


var replacefn = function (arg1,arg2,arg3)
{
 this.x = 10; 
 return "xyz";
}

var a = new String("abcdef");
WScript.Echo(a.replace("def",replacefn));
WScript.Echo(x);


replacefn = function(arg) {
    // access re.lastIndex inside replace function.
    // As per ES6 21.2.5.8, lastIndex should be updated to 0 if global is true
    // This should be visible in replace function
    WScript.Echo(re.lastIndex);
    return "_" + arg;
}
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, replacefn));

let proxy = new Proxy(replacefn, {});
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, proxy));


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

function MyReplace($0, $1, $2, $3, $4, offset, input)
{
    WScript.Echo("$0=" + $0);
    WScript.Echo("$1=" + $1);
    WScript.Echo("$2=" + $2);
    WScript.Echo("$3=" + $3);
    WScript.Echo("$4=" + $4);
    WScript.Echo("offset=" + offset);
    WScript.Echo("input=" + input);
    return $0;
}

var p = /(a)(b)(c)(d)/g;
var s = "xxabcdxxabcdxx";

WScript.Echo(s.replace(p, MyReplace));


var replacefn = function (arg1,arg2,arg3)
{
 this.x = 10; 
 return "xyz";
}

var a = new String("abcdef");
WScript.Echo(a.replace("def",replacefn));
WScript.Echo(x);


replacefn = function(arg) {
    // access re.lastIndex inside replace function.
    // As per ES6 21.2.5.8, lastIndex should be updated to 0 if global is true
    // This should be visible in replace function
    WScript.Echo(re.lastIndex);
    return "_" + arg;
}
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, replacefn));

let proxy = new Proxy(replacefn, {});
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, proxy));


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

function MyReplace($0, $1, $2, $3, $4, offset, input)
{
    WScript.Echo("$0=" + $0);
    WScript.Echo("$1=" + $1);
    WScript.Echo("$2=" + $2);
    WScript.Echo("$3=" + $3);
    WScript.Echo("$4=" + $4);
    WScript.Echo("offset=" + offset);
    WScript.Echo("input=" + input);
    return $0;
}

var p = /(a)(b)(c)(d)/g;
var s = "xxabcdxxabcdxx";

WScript.Echo(s.replace(p, MyReplace));


var replacefn = function (arg1,arg2,arg3)
{
 this.x = 10; 
 return "xyz";
}

var a = new String("abcdef");
WScript.Echo(a.replace("def",replacefn));
WScript.Echo(x);


replacefn = function(arg) {
    // access re.lastIndex inside replace function.
    // As per ES6 21.2.5.8, lastIndex should be updated to 0 if global is true
    // This should be visible in replace function
    WScript.Echo(re.lastIndex);
    return "_" + arg;
}
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, replacefn));

let proxy = new Proxy(replacefn, {});
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, proxy));


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

function MyReplace($0, $1, $2, $3, $4, offset, input)
{
    WScript.Echo("$0=" + $0);
    WScript.Echo("$1=" + $1);
    WScript.Echo("$2=" + $2);
    WScript.Echo("$3=" + $3);
    WScript.Echo("$4=" + $4);
    WScript.Echo("offset=" + offset);
    WScript.Echo("input=" + input);
    return $0;
}

var p = /(a)(b)(c)(d)/g;
var s = "xxabcdxxabcdxx";

WScript.Echo(s.replace(p, MyReplace));


var replacefn = function (arg1,arg2,arg3)
{
 this.x = 10; 
 return "xyz";
}

var a = new String("abcdef");
WScript.Echo(a.replace("def",replacefn));
WScript.Echo(x);


replacefn = function(arg) {
    // access re.lastIndex inside replace function.
    // As per ES6 21.2.5.8, lastIndex should be updated to 0 if global is true
    // This should be visible in replace function
    WScript.Echo(re.lastIndex);
    return "_" + arg;
}
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, replacefn));

let proxy = new Proxy(replacefn, {});
var re = /abc/g;
var str = "abcabc";
re.lastIndex = 3;
WScript.Echo(str.replace(re, proxy));

