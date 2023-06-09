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

// Tests that expression evaluation works
// for variables in a dead zone.

function test() {    
    /**bp:evaluate('a + 1')**/
    let a = 0;
    /**bp:evaluate('a + 1')**/
    a;
    /**bp:evaluate('c + \'1\'')**/
    const c = 1;
    /**bp:evaluate('c + \'1\'')**/
    var b = 1;
    var d = "abc";
    /**bp: logJson('Outside block');locals()**/
    if (b == 1) {
        a;/**bp: logJson('Block with let');locals()**/
        a;/**bp: evaluate('b')**/
        a;/**bp: evaluate('b//')**/
        let b = 22;
        b;/**bp: evaluate('b')**/
        b;/**bp: evaluate('b//')**/
    }
    if (b == 1) {
        a;/**bp: logJson('Block with const');locals()**/
        a;/**bp: evaluate('d')**/
        a;/**bp: evaluate('d//')**/
        a;/**bp: evaluate('const d = 5; d;')**/
        a;/**bp: evaluate('d')**/
        a;/**bp: evaluate('d = 5; d;')**/
        const d = 33;
        d;/**bp: evaluate('d')**/
        d;/**bp: evaluate('d//')**/
    }
};

test();
WScript.Echo("Pass");