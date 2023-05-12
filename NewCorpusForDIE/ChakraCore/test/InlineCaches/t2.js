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

SplayTreeNode = function () {
};

function insertA(node) {
    node.left = root;
    node.right = root.right;
    root.right = null;
    root = node;
};

function insertB(node) {
    node.right = root;
    node.left = root.left;
    root.left = null;
    root = node;
};

function remove() {
    var right = root.right;
    root = root.left;
    root.right = right;
};

SplayTreeNode.prototype.left = null;
SplayTreeNode.prototype.right = null;

var a = new SplayTreeNode();
var b = new SplayTreeNode();
var c = new SplayTreeNode();
var d = new SplayTreeNode();

var root = new SplayTreeNode();

insertA(a);
insertB(b);
insertA(c);
remove();
insertA(d);
remove();

// expected: [object Object] [object Object] [object Object]
WScript.Echo(root, root.left, root.right); 
