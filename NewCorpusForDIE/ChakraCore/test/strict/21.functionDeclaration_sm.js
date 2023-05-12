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

"use strict";

function write(v) { WScript.Echo(v + ""); }

function exceptToString(ee) {
    if(ee instanceof TypeError) return "TypeError";
    if(ee instanceof ReferenceError) return "ReferenceError";
    if(ee instanceof EvalError) return "EvalError";
    if(ee instanceof SyntaxError) return "SyntaxError";
    return "Unknown Error";
}

(function () {
    var description = "Program.SourceElement.FunctionDeclaration";

    try {
        eval("function foo() {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "FunctionBody.FunctionDeclaration";

    try {
        eval("(function() { function foo() {} });");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "Block.StatementList.Statement.FunctionDeclaration";

    try {
        eval("{ function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "IfStatement.Statement.FunctionDeclaration";

    try {
        eval("if(false) function foo() {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "IterationStatement(do-while).Statement.FunctionDeclaration";

    try {
        eval("do function foo() {} while(false);");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "IterationStatement(while).Statement.FunctionDeclaration";

    try {
        eval("while(false) function foo() {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "IterationStatement(for).Statement.FunctionDeclaration";

    try {
        eval("for(var i = 0; i < 0; ++i) function foo() {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "IterationStatement(for-in).Statement.FunctionDeclaration";

    try {
        eval("for(var p in {}) function foo() {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "SourceElement.Statement.LabelledStatement.Statement.FunctionDeclaration";

    try {
        eval("Foo: function foo() {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "Block.Statement.LabelledStatement.Statement.FunctionDeclaration";

    try {
        eval("{ Foo: function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "SwitchStatement.CaseBlock.CaseClause.StatementList.Statement.FunctionDeclaration";

    try {
        eval("switch(true) { case false: function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "SwitchStatement.CaseBlock.DefaultClause.StatementList.Statement.FunctionDeclaration";

    try {
        eval("switch(true) { case true: break; default: function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "SwitchStatement.CaseBlock.DefaultClause.StatementList.Statement.FunctionDeclaration";

    try {
        eval("switch(true) { case true: break; default: function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "TryStatement.Block.StatementList.Statement.FunctionDeclaration";

    try {
        eval("try { function foo() {} } finally {}");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "TryStatement.Catch.Block.StatementList.Statement.FunctionDeclaration";

    try {
        eval("try {} catch(ex) { function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();

(function () {
    var description = "TryStatement.Finally.Block.StatementList.Statement.FunctionDeclaration";

    try {
        eval("try {} finally { function foo() {} }");
    } catch(e) {
        write("Exception: " + description + " - " + exceptToString(e));
        return;
    }
    write("Return: " + description);
})();
