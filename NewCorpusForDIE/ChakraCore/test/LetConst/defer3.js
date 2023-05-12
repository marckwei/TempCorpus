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

try { var f = Function("const x = 10; return x;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{const x = 10; return x;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{const x = 10; x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; {x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{x = 20;} const x = 10;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{x = 20;} let x = 10;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; function f() {x = 10;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; function f() {let x; x = 10;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; {let x = 1; x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("let x = 10; {const x = 1; x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{const x;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){const x;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; const x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; let x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("let x = 10; const x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("let x = 10; let x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{const x = 10; const x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{const x = 10; let x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{let x = 10; const x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{let x = 10; let x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){const x = 10; const x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){const x = 10; let x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){let x = 10; const x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){let x = 10; let x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("var x = 10; const x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("var x = 10; let x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("const x = 10; var x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("let x = 10; var x = 20;"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{var x = 10; const x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{var x = 10; let x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{const x = 10; var x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("{let x = 10; var x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){var x = 10; const x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){var x = 10; let x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){const x = 10; var x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }
try { var f = Function("function g(){let x = 10; var x = 20;}"); WScript.Echo("Syntax check succeeded"); } catch (e) { WScript.Echo(e); }

