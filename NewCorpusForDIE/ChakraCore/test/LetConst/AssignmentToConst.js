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

try { eval("WScript.Echo('test 1'); const x = 1; x = 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 2'); const x = 1; x += 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 3'); const x = 1; x -= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 4'); const x = 1; x *= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 5'); const x = 1; x /= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 6'); const x = 1; x &= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 7'); const x = 1; x |= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 8'); const x = 1; x ^= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 9'); const x = 1; x >>= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 10'); const x = 1; x <<= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 11'); const x = 1; x >>>= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 12'); const x = 1; x %= 2;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 13'); const x = 1; x ++;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 14'); const x = 1; x --;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 15'); const x = 1; ++ x;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 16'); const x = 1; -- x;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 17'); const x = 1; {x++;}"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 18'); const x = 1; {let x = 2; x++;}"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 19'); const x = 1; {x++; let x = 2;}"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 20'); const x = 1; {let x = 2;} x = 10"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 21'); const x = 1; {const x = 2; x++;}"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 22'); const x = 1; {const x = 2;} x++;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 23'); x = 1; {let x = 2;} const x = 10;"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 24'); function f() {x = 1; {let x = 2;} const x = 10;} f();"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }
try { eval("WScript.Echo('test 25'); const x = 10; function f() {x = 1; {let x = 2;} } f();"); WScript.Echo("passed"); } catch (e) { WScript.Echo(e); }


