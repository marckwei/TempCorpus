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


function print(s) {}
function f(a) {
    for (var vxmvvw = 0; vxmvvw < 1; ++vxmvvw) { if (vxmvvw % 10 == 3) { print(x); } else 
    { ( eval('""  <<= a') ); }  } 
}
function Ctor()
{
}

Ctor.prototype.toString = Number.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = RegExp.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = Function.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = Object.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = Error.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = Boolean.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = Array.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = String.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.toString = Date.prototype.toString;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }

Ctor.prototype = new Object();
Ctor.prototype.valueOf = Boolean.prototype.valueOf;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.valueOf = Date.prototype.valueOf;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.valueOf = Number.prototype.valueOf;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.valueOf = Object.prototype.valueOf;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }
Ctor.prototype.valueOf = String.prototype.valueOf;
try { f(new Ctor()); } catch (e) { WScript.Echo(e); }



