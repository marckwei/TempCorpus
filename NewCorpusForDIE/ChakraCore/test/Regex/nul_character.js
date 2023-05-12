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

var output = "";

function write(str) {
    if (typeof (WScript) == "undefined") {
        output += str + "\n";
        document.getElementById("writer").innerText = output; // .replace("\0", '\\0');
    } else {
        WScript.Echo(str);
    }
}

write("--- 1 ---");
try { write(eval('/a\0b/').toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/\n/")); } catch (e) { write(e); }                                  // !               !
try { write(eval("/\r/")); } catch (e) { write(e); }                                  // !               !
write("--- 2 ---");
try { write(eval("/\\\0/").toString().length); } catch (e) { write(e); }              // 4               4
try { write(eval("/\\\n/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\r/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\u2028/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\\u2029/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\"));        } catch (e) { write(e); }                            // !               !
try { write(eval("/\\\0/").toString().length);     } catch (e) { write(e); }          // 4               4
try { write(eval("/\\\0a/").toString().length); } catch (e) { write(e); }             // 5               5
write("--- 3 ---");
try { write(eval("/[\n]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\r]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\u2028]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\u2029]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\0]/").toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/[").toString().length); } catch (e) { write(e); }                  // !               !
try { write(eval("/a)/")); } catch (e) { write(e); }                                  // !               !
write("--- 4 ---");
try { write(new RegExp('\u2028*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\u2029*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\r*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\n*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0a*').toString().length) } catch (e) { write(e); }           // 5               5
write("--- 5 ---");
try { write(new RegExp('\\\0*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\r*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\n*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('[\r]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\n]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\0]').toString().length) } catch (e) { write(e); }           // 5               5

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

var output = "";

function write(str) {
    if (typeof (WScript) == "undefined") {
        output += str + "\n";
        document.getElementById("writer").innerText = output; // .replace("\0", '\\0');
    } else {
        WScript.Echo(str);
    }
}

write("--- 1 ---");
try { write(eval('/a\0b/').toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/\n/")); } catch (e) { write(e); }                                  // !               !
try { write(eval("/\r/")); } catch (e) { write(e); }                                  // !               !
write("--- 2 ---");
try { write(eval("/\\\0/").toString().length); } catch (e) { write(e); }              // 4               4
try { write(eval("/\\\n/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\r/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\u2028/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\\u2029/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\"));        } catch (e) { write(e); }                            // !               !
try { write(eval("/\\\0/").toString().length);     } catch (e) { write(e); }          // 4               4
try { write(eval("/\\\0a/").toString().length); } catch (e) { write(e); }             // 5               5
write("--- 3 ---");
try { write(eval("/[\n]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\r]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\u2028]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\u2029]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\0]/").toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/[").toString().length); } catch (e) { write(e); }                  // !               !
try { write(eval("/a)/")); } catch (e) { write(e); }                                  // !               !
write("--- 4 ---");
try { write(new RegExp('\u2028*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\u2029*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\r*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\n*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0a*').toString().length) } catch (e) { write(e); }           // 5               5
write("--- 5 ---");
try { write(new RegExp('\\\0*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\r*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\n*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('[\r]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\n]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\0]').toString().length) } catch (e) { write(e); }           // 5               5

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

var output = "";

function write(str) {
    if (typeof (WScript) == "undefined") {
        output += str + "\n";
        document.getElementById("writer").innerText = output; // .replace("\0", '\\0');
    } else {
        WScript.Echo(str);
    }
}

write("--- 1 ---");
try { write(eval('/a\0b/').toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/\n/")); } catch (e) { write(e); }                                  // !               !
try { write(eval("/\r/")); } catch (e) { write(e); }                                  // !               !
write("--- 2 ---");
try { write(eval("/\\\0/").toString().length); } catch (e) { write(e); }              // 4               4
try { write(eval("/\\\n/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\r/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\u2028/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\\u2029/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\"));        } catch (e) { write(e); }                            // !               !
try { write(eval("/\\\0/").toString().length);     } catch (e) { write(e); }          // 4               4
try { write(eval("/\\\0a/").toString().length); } catch (e) { write(e); }             // 5               5
write("--- 3 ---");
try { write(eval("/[\n]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\r]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\u2028]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\u2029]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\0]/").toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/[").toString().length); } catch (e) { write(e); }                  // !               !
try { write(eval("/a)/")); } catch (e) { write(e); }                                  // !               !
write("--- 4 ---");
try { write(new RegExp('\u2028*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\u2029*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\r*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\n*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0a*').toString().length) } catch (e) { write(e); }           // 5               5
write("--- 5 ---");
try { write(new RegExp('\\\0*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\r*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\n*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('[\r]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\n]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\0]').toString().length) } catch (e) { write(e); }           // 5               5

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

var output = "";

function write(str) {
    if (typeof (WScript) == "undefined") {
        output += str + "\n";
        document.getElementById("writer").innerText = output; // .replace("\0", '\\0');
    } else {
        WScript.Echo(str);
    }
}

write("--- 1 ---");
try { write(eval('/a\0b/').toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/\n/")); } catch (e) { write(e); }                                  // !               !
try { write(eval("/\r/")); } catch (e) { write(e); }                                  // !               !
write("--- 2 ---");
try { write(eval("/\\\0/").toString().length); } catch (e) { write(e); }              // 4               4
try { write(eval("/\\\n/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\r/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/\\\u2028/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\\u2029/")); } catch (e) { write(e); }                            // !               /\ /
try { write(eval("/\\"));        } catch (e) { write(e); }                            // !               !
try { write(eval("/\\\0/").toString().length);     } catch (e) { write(e); }          // 4               4
try { write(eval("/\\\0a/").toString().length); } catch (e) { write(e); }             // 5               5
write("--- 3 ---");
try { write(eval("/[\n]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\r]/")); } catch (e) { write(e); }                                // !               !
try { write(eval("/[\u2028]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\u2029]/")); } catch (e) { write(e); }                            // !               /[ ]/
try { write(eval("/[\0]/").toString().length); } catch (e) { write(e); }              // 5               !
try { write(eval("/[").toString().length); } catch (e) { write(e); }                  // !               !
try { write(eval("/a)/")); } catch (e) { write(e); }                                  // !               !
write("--- 4 ---");
try { write(new RegExp('\u2028*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\u2029*').toString().length) } catch (e) { write(e); }        // 4               4
try { write(new RegExp('\r*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\n*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0*').toString().length) } catch (e) { write(e); }            // 4               4
try { write(new RegExp('\0a*').toString().length) } catch (e) { write(e); }           // 5               5
write("--- 5 ---");
try { write(new RegExp('\\\0*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\r*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('\\\n*').toString().length) } catch (e) { write(e); }          // 5               5
try { write(new RegExp('[\r]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\n]').toString().length) } catch (e) { write(e); }           // 5               5
try { write(new RegExp('[\0]').toString().length) } catch (e) { write(e); }           // 5               5
