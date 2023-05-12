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

// Tests that let/const variables show properly in locals at
// inside nested functions.
function blockScopeNestedFunctionTestFunc() {
    var x = -1; /**bp:locals()**/
    let a = 0;
    const aConst = 1;
    a; /**bp:locals()**/
    function innerFunc() {
        /**bp:locals(1)**/
        const bConst = 2;
        let b = 3;
        b; /**bp:locals(1)**/
        function innerInnerFunc() {
            /**bp:locals(1)**/
            let c = 4;
            const cConst = 5;
            a;
            aConst;
            b;
            bConst;
            c; /**bp:locals(1)**/
        }
        innerInnerFunc();
        return 0; /**bp:locals(1)**/
    }
    innerFunc(); 
    return 0; /**bp:locals()**/
}
blockScopeNestedFunctionTestFunc();
WScript.Echo("PASSED");