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

var count = 0; 
var total = 0;

var x = null;

try { write(x.y);  } catch (e) { write(count++ + " " + e.message); } total++;
try { x.y = 5;     } catch (e) { write(count++ + " " + e.message); } total++;
try { delete x.y;  } catch (e) { write(count++ + " " + e.message); } total++;

try { write(x[6]); } catch (e) { write(count++ + " " + e.message); } total++;
try { x[6] = 7;    } catch (e) { write(count++ + " " + e.message); } total++;
try { delete x[6]  } catch (e) { write(count++ + " " + e.message); } total++;

x = undefined;

try { write(x.y);  } catch (e) { write(count++ + " " + e.message); } total++;
try { x.y = 5;     } catch (e) { write(count++ + " " + e.message); } total++;
try { delete x.y;  } catch (e) { write(count++ + " " + e.message); } total++;

try { write(x[6]); } catch (e) { write(count++ + " " + e.message); } total++;
try { x[6] = 7;    } catch (e) { write(count++ + " " + e.message); } total++;
try { delete x[6]  } catch (e) { write(count++ + " " + e.message); } total++;

var a = [ null ];

try { write(a[0].y);  } catch (e) { write(count++ + " " + e.message); } total++;
try { a[0].y = 5;     } catch (e) { write(count++ + " " + e.message); } total++;
try { delete a[0].y;  } catch (e) { write(count++ + " " + e.message); } total++;

try { write(a[0][6]); } catch (e) { write(count++ + " " + e.message); } total++;
try { a[0][6] = 7;    } catch (e) { write(count++ + " " + e.message); } total++;
try { delete a[0][6]  } catch (e) { write(count++ + " " + e.message); } total++;

a = [ undefined ];

try { write(a[0].y);  } catch (e) { write(count++ + " " + e.message); } total++;
try { a[0].y = 5;     } catch (e) { write(count++ + " " + e.message); } total++;
try { delete a[0].y;  } catch (e) { write(count++ + " " + e.message); } total++;

try { write(a[0][6]); } catch (e) { write(count++ + " " + e.message); } total++;
try { a[0][6] = 7;    } catch (e) { write(count++ + " " + e.message); } total++;
try { delete a[0][6]  } catch (e) { write(count++ + " " + e.message); } total++;

var o = { z : null }

try { write(o.z.y);   } catch (e) { write(count++ + " " + e.message); } total++;
try { o.z.y = 5;      } catch (e) { write(count++ + " " + e.message); } total++;
try { delete o.z.y;   } catch (e) { write(count++ + " " + e.message); } total++;

try { write(o.z[6]);  } catch (e) { write(count++ + " " + e.message); } total++;
try { o.z[6] = 7;     } catch (e) { write(count++ + " " + e.message); } total++;
try { delete o.z[6]   } catch (e) { write(count++ + " " + e.message); } total++;

o = { z : undefined }

try { write(o.z.y);   } catch (e) { write(count++ + " " + e.message); } total++;
try { o.z.y = 5;      } catch (e) { write(count++ + " " + e.message); } total++;
try { delete o.z.y;   } catch (e) { write(count++ + " " + e.message); } total++;

try { write(o.z[6]);  } catch (e) { write(count++ + " " + e.message); } total++;
try { o.z[6] = 7;     } catch (e) { write(count++ + " " + e.message); } total++;
try { delete o.z[6]   } catch (e) { write(count++ + " " + e.message); } total++;

write("count: " + count + " total: " + total);