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

for (var var_01 = () => [].var_02[0][0](function (x, y) {}().var_03) in var_04) {
    // \0asm\x01\0\0\0\x01À\x80\x80\x80\0\r`\x02\x7F\x7F\x01\x7F`\x02~~\x01\x7F`\x02}}\x01\x7F`\x02||\x01\x7F`\0\0`\0\x01\x7F`\0\x01~`\0\x01}`\0\x01|`\x02\x7F\x7F\0`\x02~~\0`\x02}}\0`\x02||\0\x03\x84\x81\x80\x80\0\x82\x01\0\0\x01\x01\x02\x02\x03\x03\x04\x04\x05\x05\x05\x05\x05\x05\x06\x06\x06\x05\x05\x07\x07\x07\x05\x05\b\b\b\x05\x05\t\n\x0B\f\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x05\x04\x85\x80\x80\x80\0\x01p\x01\b\b\x05\x83\x80\x80\x80\0\x01\0\x01\x07ª\x88\x80\x80\0_\x07i32_add\0#\x07i32_sub\0$\x07i32_mul\0%\ti32_div_s\0&\ti32_div_u\0\'\ti32_rem_s\0(\ti32_rem_u\0)\x07i32_and\0*\x06i32_or\0+\x07i32_xor\0,\x07i32_shl\0-\ti32_shr_u\0.\ti32_shr_s\0/\x06i32_eq\x000\x06i32_ne\x001\bi32_lt_s\x002\bi32_le_s\x003\bi32_lt_u\x004\bi32_le_u\x005\bi32_gt_s\x006\bi32_ge_s\x007\bi32_gt_u\x008\bi32_ge_u\x009\ti32_store\0:\ni32_store8\0;\x0Bi32_store16\0<\bi32_call\0=\x11i32_call_indirect\0>\ni32_select\0?\x07i64_add\0@\x07i64_sub\0A\x07i64_mul\0B\ti64_div_s\0C\ti64_div_u\0D\ti64_rem_s\0E\ti64_rem_u\0F\x07i64_and\0G\x06i64_or\0H\x07i64_xor\0I\x07i64_shl\0J\ti64_shr_u\0K\ti64_shr_s\0L\x06i64_eq\0M\x06i64_ne\0N\bi64_lt_s\0O\bi64_le_s\0P\bi64_lt_u\0Q\bi64_le_u\0R\bi64_gt_s\0S\bi64_ge_s\0T\bi64_gt_u\0U\bi64_ge_u\0V\ti64_store\0W\ni64_store8\0X\x0Bi64_store16\0Y\x0Bi64_store32\0Z\bi64_call\0[\x11i64_call_indirect\0\\\ni64_select\0]\x07f32_add\0^\x07f32_sub\0_\x07f32_mul\0`\x07f32_div\0a\ff32_copysign\0b\x06f32_eq\0c\x06f32_ne\0d\x06f32_lt\0e\x06f32_le\0f\x06f32_gt\0g\x06f32_ge\0h\x07f32_min\0i\x07f32_max\0j\tf32_store\0k\bf32_call\0l\x11f32_call_indirect\0m\nf32_select\0n\x07f64_add\0o\x07f64_sub\0p\x07f64_mul\0q\x07f64_div\0r\ff64_copysign\0s\x06f64_eq\0t\x06f64_ne\0u\x06f64_lt\0v\x06f64_le\0w\x06f64_gt\0x\x06f64_ge\0y\x07f64_min\0z\x07f64_max\0{\tf64_store\0|\bf64_call\0}\x11f64_call_indirect\0~\nf64_select\0\x7F\x05br_if\0\x80\x01\bbr_table\0\x81\x01\t\x8E\x80\x80\x80\0\x01\0A\0\x0B\b\0\x01\x02\x03\x04\x05\x06\x07\n\xB2\x91\x80\x80\0\x82\x01\x84\x80\x80\x80\0\0A\x7F\x0B\x84\x80\x80\x80\0\0A~\x0B\x84\x80\x80\x80\0\0A\x7F\x0B\x84\x80\x80\x80\0\0A~\x0B\x84\x80\x80\x80\0\0A\x7F\x0B\x84\x80\x80\x80\0\0A~\x0B\x84\x80\x80\x80\0\0A\x7F\x0B\x84\x80\x80\x80\0\0A~\x0B\x89\x80\x80\x80\0\0A\bA\x006\x02\0\x0B\xA7\x80\x80\x80\0\0A\x0BA\n-\0\0:\0\0A\nA\t-\0\0:\0\0A\tA\b-\0\0:\0\0A\bA}:\0\0\x0B\x87\x80\x80\x80\0\0A\b(\x02\0\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x01:\0\0A\0\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x02:\0\0A\x01\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x03:\0\0A\x01\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x04:\0\0A\0\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x05:\0\0A\0\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x01:\0\0B\0\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x02:\0\0B\x01\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x03:\0\0B\x01\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x04:\0\0A\x02\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x05:\0\0A\0\x0B\x90\x80\x80\x80\0\0\x10\tA\bA\x01:\0\0C\0\0\0\0\x0B\x90\x80\x80\x80\0\0\x10\tA\bA\x02:\0\0C\0\0\x80?\x0B\x90\x80\x80\x80\0\0\x10\tA\bA\x03:\0\0C\0\0\x80?\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x04:\0\0A\x04\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x05:\0\0A\0\x0B\x94\x80\x80\x80\0\0\x10\tA\bA\x01:\0\0D\0\0\0\0\0\0\0\0\x0B\x94\x80\x80\x80\0\0\x10\tA\bA\x02:\0\0D\0\0\0\0\0\0ð?\x0B\x94\x80\x80\x80\0\0\x10\tA\bA\x03:\0\0D\0\0\0\0\0\0ð?\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x04:\0\0A\x06\x0B\x8D\x80\x80\x80\0\0\x10\tA\bA\x05:\0\0A\0\x0B\x82\x80\x80\x80\0\0\x0B\x82\x80\x80\x80\0\0\x0B\x82\x80\x80\x80\0\0\x0B\x82\x80\x80\x80\0\0\x0B\x8C\x80\x80\x80\0\0\x10\b\x10\x0B\x10\fj\x1A\x10\n\x0B\x8C\x80\x80\x80\0\0\x10\b\x10\x0B\x10\fk\x1A\x10\n\x0B\x8C\x80\x80\x80\0\0\x10\b\x10\x0B\x10\fl\x1A\x10\n\x0B\x8C\x80\x80\x80\0\0\x10\b\x10\x0B\x10\fm\x1A\x10\n\x01\0\0\0\x01À\x80\x80\x80\0\r`\x2
}
