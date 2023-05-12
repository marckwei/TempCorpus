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
try { write(eval('1+//\0\n1')); } catch (e) { write(e); }                             // 2      
try { write(eval('"a\0b"').length); } catch (e) { write(e); }                         // 3       
try { write(eval('\'a\0b\'').length); } catch (e) { write(e); }                       // 3         
try { write(eval('\0 = 1')); } catch (e) { write(e); }                                // !          
try { write(eval('/*\0*/1')); } catch (e) { write(e); }                               // 1              
try { write(eval('1//\0')); } catch (e) { write(e); }                                 // 1               
try { write(eval('1\0')); } catch (e) { write(e); }                                 // !               
