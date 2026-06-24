/*!
  niwango-core.js v0.0.2-canary.20231019-3
  (c) 2023 xpadev-net https://xpadev.net
  Released under the MIT License.
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.NiwangoCore = factory());
})(this, (function () { 'use strict';

    let execute$1;
    const setExecute = (val) => {
        execute$1 = val;
    };
    let argumentParser$1;
    const setArgumentParser = (val) => {
        argumentParser$1 = val;
    };
    let getName$1;
    const setGetName = (val) => {
        getName$1 = val;
    };
    let assign$1;
    const setAssign = (val) => {
        assign$1 = val;
    };
    let resolvePrototype$1;
    const setResolvePrototype = (val) => {
        resolvePrototype$1 = val;
    };
    const prototypeScopeKeys = [
        "Array",
        "Bool",
        "Number",
        "Object",
        "String",
        "Value",
    ];
    const clearMutableObject = (object) => {
        for (const key of Object.keys(object)) {
            delete object[key];
        }
    };
    const isPrototypeScopeKey = (key) => {
        return prototypeScopeKeys.includes(key);
    };
    const prototypeScope = {
        Array: {},
        Bool: {},
        Number: {},
        Object: {},
        String: {},
        Value: {},
    };
    const initPrototypeScope = () => {
        const prototypeScopeRecord = prototypeScope;
        for (const key of Object.keys(prototypeScopeRecord)) {
            if (!isPrototypeScopeKey(key)) {
                delete prototypeScopeRecord[key];
            }
        }
        for (const key of prototypeScopeKeys) {
            clearMutableObject(prototypeScope[key]);
        }
    };
    const definedFunctions = {};
    const initDefinedFunctions = () => {
        clearMutableObject(definedFunctions);
    };
    const appendDefinedFunctions = (name, func) => {
        definedFunctions[name] = func;
    };
    let isWide = false;
    const setIsWide = (val) => {
        isWide = val;
    };
    const resultHook = [];
    const appendResultHook = (func) => {
        resultHook.push(func);
    };
    const initResultHook = () => {
        resultHook.length = 0;
    };

    class InvalidTypeError extends Error {
        ASTName;
        ast;
        scopes;
        constructor(message, ast, scopes, options = {}) {
            super("InvalidTypeError", options);
            this.message = message;
            this.ASTName = ast.type;
            this.ast = ast;
            this.scopes = scopes;
        }
    }
    InvalidTypeError.prototype.name = "InvalidTypeError";

    class NotImplementedError extends Error {
        ASTName;
        ast;
        scopes;
        constructor(ast, scopes, options = {}) {
            super("NotImplementedError", options);
            this.ASTName = ast.type;
            this.ast = ast;
            this.scopes = scopes;
        }
    }
    NotImplementedError.prototype.name = "NotImplementedError";

    class ResourceLimitError extends Error {
        ASTName;
        ast;
        scopes;
        limitName;
        limit;
        actual;
        constructor(limitName, limit, actual, ast, scopes, options = {}) {
            super(`${limitName} resource limit exceeded: ${actual} > ${limit}`, options);
            this.limitName = limitName;
            this.limit = limit;
            this.actual = actual;
            if (ast) {
                this.ASTName = ast.type;
                this.ast = ast;
            }
            if (scopes) {
                this.scopes = scopes;
            }
        }
    }
    ResourceLimitError.prototype.name = "ResourceLimitError";

    class TooMuchRecursionError extends ResourceLimitError {
        constructor(ast, scopes, limit, actual, options = {}) {
            super("recursion depth", limit, actual, ast, scopes, options);
        }
    }
    TooMuchRecursionError.prototype.name = "TooMuchRecursionError";

    var Errors = /*#__PURE__*/Object.freeze({
        __proto__: null,
        InvalidTypeError: InvalidTypeError,
        NotImplementedError: NotImplementedError,
        ResourceLimitError: ResourceLimitError,
        TooMuchRecursionError: TooMuchRecursionError
    });

    let config;
    const DEFAULT_RESOURCE_LIMITS = {
        loopIterations: 10000,
        timesIterations: 10000,
        stringRepeatCount: 10000,
        stringRepeatLength: 1000000,
        recursionDepth: 1000,
    };
    const initConfig = () => {
        config = {
            stageWidth: {
                default: 512,
                full: 672,
            },
            stageHeight: 384,
            canvasWidth: 672,
            canvasHeight: 384,
            resourceLimits: { ...DEFAULT_RESOURCE_LIMITS },
        };
    };
    const getResourceLimit = (limitName) => {
        if (limitName === "recursionDepth" && config.recursionLimit !== undefined) {
            return config.recursionLimit || Number.POSITIVE_INFINITY;
        }
        return config.resourceLimits[limitName];
    };
    const assertResourceLimit = (limitName, actual, ast, scopes, displayName = limitName) => {
        const limit = getResourceLimit(limitName);
        if (actual > limit) {
            throw new ResourceLimitError(displayName, limit, actual, ast, scopes);
        }
    };

    const processArrayExpression = (script, scopes, trace) => {
        return script.elements.flatMap((element) => [
            execute$1(element, scopes, trace),
        ]);
    };

    const processArrowFunctionExpression = (script, scopes, trace) => {
        return execute$1(script.body, scopes, trace);
    };

    const getType = (i) => {
        const type = typeof i;
        if (type === "object") {
            if (i === null)
                return "null";
            if (Array.isArray(i))
                return "array";
            return "object";
        }
        return type;
    };

    const funcMap = {
        boolean: "toASBoolean",
        number: "toASNumber",
        string: "toASString",
    };
    const format = (value, to) => {
        const formatFunc = resolvePrototype$1(getType(value), funcMap[to]);
        if (!formatFunc)
            throw new Error();
        return formatFunc({}, [], value, []);
    };

    const Multiplication = (left, right) => {
        if (typeof left === "string") {
            const repeatCount = format(right, "number");
            assertStringRepeatResourceLimit(left, repeatCount);
            return left.repeat(repeatCount);
        }
        return format(left, "number") * format(right, "number");
    };
    const assertStringRepeatResourceLimit = (value, repeat) => {
        const repeatCount = Math.trunc(repeat);
        if (Number.isNaN(repeatCount) || repeatCount <= 0)
            return;
        assertResourceLimit("stringRepeatCount", repeatCount, undefined, undefined, "string repeat count");
        assertResourceLimit("stringRepeatLength", value.length * repeatCount, undefined, undefined, "string repeat length");
    };
    const Subtraction = (left, right) => {
        const rightNum = format(right, "number");
        if (rightNum === 0 && typeof left === "string") {
            if (left.match(/^0x[0-9a-f]+$/i)) {
                return parseInt(left.slice(2), 16);
            }
            if (left.match(/^(0|0x)?[0-9]+(\.[0-9]+)?$/)) {
                return Number(left);
            }
        }
        return format(left, "number") - rightNum;
    };
    const Addition = (left, right) => {
        if (typeof left === "string" || typeof right === "string") {
            return `${format(left, "string")}${format(right, "string")}`;
        }
        return format(left, "number") + format(right, "number");
    };
    const LessThan = (left, right) => {
        if (typeof left === "string" && typeof right === "string") {
            return left < right;
        }
        return format(left, "number") < format(right, "number");
    };
    const GreaterThan = (left, right) => {
        if (typeof left === "string" && typeof right === "string") {
            return left > right;
        }
        return format(left, "number") > format(right, "number");
    };
    const LessThanOrEqual = (left, right) => {
        if (typeof left === "string" && typeof right === "string") {
            return left <= right;
        }
        return format(left, "number") <= format(right, "number");
    };
    const GreaterThanOrEqual = (left, right) => {
        if (typeof left === "string" && typeof right === "string") {
            return left >= right;
        }
        return format(left, "number") >= format(right, "number");
    };
    const Division = (left, right) => {
        return format(left, "number") / format(right, "number");
    };
    const Remainder = (left, right) => {
        return format(left, "number") % format(right, "number");
    };
    const Exponentiation = (left, right) => {
        return format(left, "number") ** format(right, "number");
    };
    const BitwiseAND = (left, right) => {
        return format(left, "number") & format(right, "number");
    };
    const BitwiseOR = (left, right) => {
        return format(left, "number") | format(right, "number");
    };
    const BitwiseXOR = (left, right) => {
        return format(left, "number") ^ format(right, "number");
    };
    const BitwiseNOT = (value) => {
        return ~format(value, "number");
    };
    const LeftShift = (left, right) => {
        return format(left, "number") << format(right, "number");
    };
    const RightShift = (left, right) => {
        return format(left, "number") >> format(right, "number");
    };
    const UnsignedRightShift = (left, right) => {
        return format(left, "number") >>> format(right, "number");
    };
    const UnaryNegation = (value) => {
        return -format(value, "number");
    };
    const UnaryPlus = (value) => {
        return format(value, "number");
    };
    const LogicalNot = (value) => {
        return !value;
    };
    const Compare = (left, right) => {
        if (typeof left === "string" && typeof right === "string") {
            if (left < right)
                return -1;
            if (left > right)
                return 1;
            return 0;
        }
        const leftNumber = format(left, "number");
        const rightNumber = format(right, "number");
        if (leftNumber < rightNumber)
            return -1;
        if (leftNumber > rightNumber)
            return 1;
        return 0;
    };
    const Equality = (left, right) => {
        return left === right;
    };

    const typeGuard = {
        AST: (i) => !!i &&
            typeof i === "object" &&
            typeof i.type === "string",
        Literal: (i) => !!i && typeof i === "object" && i.type === "Literal",
        Identifier: (i) => !!i && typeof i === "object" && i.type === "Identifier",
        ExpressionStatement: (i) => !!i && typeof i === "object" && i.type === "ExpressionStatement",
        AssignmentExpression: (i) => !!i &&
            typeof i === "object" &&
            i.type === "AssignmentExpression",
        ArrayExpression: (i) => !!i && typeof i === "object" && i.type === "ArrayExpression",
        ArrowFunctionExpression: (i) => !!i &&
            typeof i === "object" &&
            i.type === "ArrowFunctionExpression",
        BinaryExpression: (i) => !!i && typeof i === "object" && i.type === "BinaryExpression",
        BlockStatement: (i) => !!i && typeof i === "object" && i.type === "BlockStatement",
        CallExpression: (i) => !!i && typeof i === "object" && i.type === "CallExpression",
        EmptyStatement: (i) => !!i && typeof i === "object" && i.type === "EmptyStatement",
        IfStatement: (i) => !!i && typeof i === "object" && i.type === "IfStatement",
        LogicalExpression: (i) => !!i && typeof i === "object" && i.type === "LogicalExpression",
        LambdaExpression: (i) => !!i && typeof i === "object" && i.type === "LambdaExpression",
        MemberExpression: (i) => !!i && typeof i === "object" && i.type === "MemberExpression",
        ObjectExpression: (i) => !!i && typeof i === "object" && i.type === "ObjectExpression",
        Program: (i) => !!i && typeof i === "object" && i.type === "Program",
        SequenceExpression: (i) => !!i && typeof i === "object" && i.type === "SequenceExpression",
        UnaryExpression: (i) => !!i && typeof i === "object" && i.type === "UnaryExpression",
        UpdateExpression: (i) => !!i && typeof i === "object" && i.type === "UpdateExpression",
        VariableDeclaration: (i) => !!i && typeof i === "object" && i.type === "VariableDeclaration",
        definedFunction: (i) => !!i &&
            typeof i === "object" &&
            i.type === "definedFunction",
        object: (i) => !!i && typeof i === "object",
        array: (i) => Array.isArray(i),
    };

    const dangerousSlotNames = new Set(["__proto__", "constructor", "prototype"]);
    const createSlotStore = () => {
        return Object.create(null);
    };
    const isSlotStore = (value) => {
        return ((typeof value === "object" && value !== null) || typeof value === "function");
    };
    const getReadableSlotStore = (value) => {
        if (isSlotStore(value)) {
            return value;
        }
        if (typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            typeof value === "bigint" ||
            typeof value === "symbol") {
            return Object(value);
        }
        return undefined;
    };
    const normalizeSlotKey = (key) => {
        if (typeof key !== "string" && typeof key !== "number") {
            return undefined;
        }
        if (typeof key === "string" && dangerousSlotNames.has(key)) {
            return undefined;
        }
        return key;
    };
    const getOwnSlot = (target, key) => {
        const slotStore = getReadableSlotStore(target);
        if (key === undefined || !slotStore) {
            return undefined;
        }
        if (!Object.hasOwn(slotStore, key)) {
            return undefined;
        }
        return slotStore[key];
    };
    const hasOwnSlot = (target, key) => {
        const slotStore = getReadableSlotStore(target);
        if (key === undefined || !slotStore) {
            return false;
        }
        return Object.hasOwn(slotStore, key);
    };
    const setOwnSlot = (target, key, value) => {
        if (key === undefined || !isSlotStore(target)) {
            return false;
        }
        if (typeof key === "string" && dangerousSlotNames.has(key)) {
            return false;
        }
        target[key] = value;
        return true;
    };

    const resolveReference = (target, scopes, trace) => {
        if (scopes.length < 1) {
            return undefined;
        }
        if (typeGuard.Identifier(target)) {
            const key = normalizeSlotKey(target.name);
            if (key === undefined) {
                return undefined;
            }
            for (const scope of scopes) {
                if (hasOwnSlot(scope, key)) {
                    return createSlotReference(scope, key, () => execute$1(target, scopes, trace));
                }
            }
            return createSlotReference(scopes[0], key, () => execute$1(target, scopes, trace));
        }
        if (typeGuard.MemberExpression(target)) {
            const left = execute$1(target.object, scopes, trace);
            if (!typeGuard.object(left)) {
                console.error("[reference] left is not object", target, scopes, trace);
                return undefined;
            }
            const key = normalizeSlotKey(target.computed
                ? execute$1(target.property, scopes, trace)
                : getName$1(target.property, scopes, trace));
            return createSlotReference(left, key, () => execute$1({
                type: "MemberExpression",
                object: {
                    type: "Raw",
                    value: left,
                },
                property: {
                    type: "Raw",
                    value: key,
                },
                computed: false,
            }, scopes, trace));
        }
        return undefined;
    };
    const createSlotReference = (target, key, get = () => getOwnSlot(target, key)) => {
        return {
            get,
            set: (value) => {
                setOwnSlot(target, key, value);
            },
        };
    };

    const processors$2 = {
        "=": (_, right) => right,
        "+=": Addition,
        "-=": Subtraction,
        "*=": Multiplication,
        "/=": Division,
        "%=": Remainder,
        "**=": Exponentiation,
        "<<=": LeftShift,
        ">>=": RightShift,
        ">>>=": UnsignedRightShift,
        "&=": BitwiseAND,
        "^=": BitwiseXOR,
        "|=": BitwiseOR,
        "&&=": (left, right) => left && right,
        "||=": (left, right) => left || right,
        "??=": (left, right) => left ?? right,
    };
    const processAssignmentExpression = (script, scopes, trace) => {
        const reference = resolveReference(script.left, scopes, trace);
        const left = script.operator === "=" ? undefined : reference?.get();
        const processor = processors$2[script.operator];
        if (!processor)
            throw new NotImplementedError(script, scopes);
        if (script.operator === "&&=" && !left) {
            return left;
        }
        if (script.operator === "||=" && left) {
            return left;
        }
        if (script.operator === "??=" && left !== null && left !== undefined) {
            return left;
        }
        const right = execute$1(script.right, scopes, trace);
        const result = processor(left, right);
        reference?.set(result);
        return result;
    };

    const processors$1 = {
        ">=": GreaterThanOrEqual,
        "<=": LessThanOrEqual,
        ">": GreaterThan,
        "<": LessThan,
        "!=": (left, right) => left !== right,
        "!==": (left, right) => left !== right,
        "<>": Compare,
        "==": (left, right) => left === right,
        "===": (left, right) => left === right,
        "+": Addition,
        "-": Subtraction,
        "*": Multiplication,
        "/": Division,
        "%": Remainder,
        "**": Exponentiation,
        "&": BitwiseAND,
        "|": BitwiseOR,
        "^": BitwiseXOR,
        "<<": LeftShift,
        ">>": RightShift,
        ">>>": UnsignedRightShift,
    };
    const processBinaryExpression = (script, scopes, trace) => {
        const left = execute$1(script.left, scopes, trace);
        const right = execute$1(script.right, scopes, trace);
        const processor = processors$1[script.operator];
        if (!processor)
            throw new NotImplementedError(script, scopes);
        return processor(left, right);
    };

    const processBlockStatement = (script, scopes, trace) => {
        return script.body.reduce((_, item) => execute$1(item, scopes, trace), undefined);
    };

    const argumentParser = (inputs, scopes, keys, trace, compute = true) => {
        const result = {};
        const nonKeyValues = [];
        for (const item of inputs) {
            if (item.NIWANGO_Identifier) {
                const key = getName$1(item.NIWANGO_Identifier, scopes, trace);
                if (keys.includes(key)) {
                    result[key] = compute ? execute$1(item, scopes, trace) : item;
                    continue;
                }
            }
            nonKeyValues.push(item);
        }
        let i = 0;
        for (const key of keys) {
            const value = nonKeyValues[i];
            if (!Object.hasOwn(result, key) && value) {
                result[key] = compute ? execute$1(value, scopes, trace) : value;
                i++;
            }
        }
        return result;
    };
    const initArgumentParser = () => {
        setArgumentParser(argumentParser);
    };

    const assign = (target, value, scopes, trace) => {
        if (scopes.length < 1) {
            return;
        }
        try {
            resolveReference(target, scopes, trace)?.set(value);
        }
        catch (e) {
            if (e instanceof Error) {
                console.error(`[assign] ${e.name}: ${e.message} for ${target.type}`);
            }
        }
    };
    const initAssign = () => {
        setAssign(assign);
    };

    const getGlobalScope = (scopes) => {
        if (scopes.length < 3) {
            return undefined;
        }
        else {
            return scopes[scopes.length - 3];
        }
    };

    const getName = (target, scopes, trace) => {
        if (typeGuard.Identifier(target)) {
            return target.name;
        }
        else {
            return execute$1(target, scopes, trace);
        }
    };
    const initGetName = () => {
        setGetName(getName);
    };

    const resolve = (script, scopes, _trace) => {
        try {
            if (typeGuard.Identifier(script)) {
                const key = normalizeSlotKey(script.name);
                if (key === undefined || typeof key !== "string") {
                    return undefined;
                }
                for (const scope of scopes) {
                    if (hasOwnSlot(scope, key)) {
                        return processResolveHook(scope, key);
                    }
                }
            }
        }
        catch (e) {
            if (e instanceof Error) {
                console.error(`[resolve] ${e.name}: ${e.message} for ${script.type}`);
            }
        }
        return undefined;
    };
    const processResolveHook = (scope, name) => {
        let value = getOwnSlot(scope, name);
        for (const hook of resultHook) {
            value = hook(value);
        }
        setOwnSlot(scope, name, value);
        return value;
    };

    const processAt = (script, scopes, _, trace) => {
        if (!script.arguments[0]) {
            console.error("[call expression] @: at least 1 argument required");
            return;
        }
        assign$1(script.arguments[0], resolve({ type: "Identifier", name: "@0" }, scopes), scopes, trace);
    };

    const processDistance = (script, scopes, _, trace) => {
        const args = argumentParser$1(script.arguments, scopes, ["x1", "y1", "x2", "y2"], trace);
        return Math.sqrt((format(args.x2, "number") - format(args.x1, "number")) ** 2 +
            (format(args.y2, "number") - format(args.y1, "number")) ** 2);
    };

    const processDump = (script, scopes, _object, trace) => {
        for (const argument of script.arguments) {
            execute$1(argument, scopes, trace);
        }
    };

    const processIf = (script, scopes, _, trace) => {
        const args = argumentParser$1(script.arguments, scopes, ["when", "then", "else"], trace, false);
        const condition = execute$1(args.when, scopes, trace);
        if (condition) {
            return execute$1(args.then, scopes, trace);
        }
        else {
            return execute$1(args.else, scopes, trace);
        }
    };

    const time = Date.now();
    const processPlayStartTime = () => {
        return time;
    };

    const processReturn = (script, scopes, _, trace) => {
        return execute$1(script.arguments[0], scopes, trace);
    };

    const processScreenWidth = () => {
        return config.stageWidth[isWide ? "full" : "default"];
    };
    const processScreenHeight = () => {
        return config.stageHeight;
    };

    const processTimethis = (script, scopes, _, trace) => {
        console.time("timethis");
        const result = execute$1(script.arguments[0], scopes, trace);
        console.timeEnd("timethis");
        return result;
    };

    const processWhileKari$1 = (script, scopes, _, trace) => {
        if (!(script.arguments[0] && script.arguments[1])) {
            return;
        }
        let loopCount = 0;
        while (execute$1(script.arguments[0], scopes, trace)) {
            assertResourceLimit("loopIterations", loopCount + 1, script, scopes, "while_kari iterations");
            execute$1(script.arguments[1], scopes, trace);
            loopCount++;
        }
    };

    const functions = {
        dump: processDump,
        while_kari: processWhileKari$1,
        if: processIf,
        distance: processDistance,
        screenWidth: processScreenWidth,
        screenHeight: processScreenHeight,
        playStartTime: processPlayStartTime,
        timethis: processTimethis,
        "@": processAt,
        return: processReturn,
    };

    const processCallExpression = (script, scopes, trace) => {
        const callee = getCallee(script, scopes, trace);
        if (callee === undefined) {
            return;
        }
        const object = getThis(script, scopes, trace);
        const objectRef = getOwnSlot(object, callee);
        if (typeGuard.definedFunction(objectRef)) {
            return processDefinedFunction(script, scopes, trace, objectRef, object);
        }
        const objectCallRef = getOwnSlot(objectRef, "call");
        if (typeGuard.definedFunction(objectCallRef)) {
            return processDefinedFunction(script, scopes, trace, objectCallRef, object);
        }
        const self = resolve({ type: "Identifier", name: "self" }, scopes);
        const selfRef = getOwnSlot(self, callee);
        if (typeGuard.definedFunction(selfRef)) {
            return processDefinedFunction(script, scopes, trace, selfRef);
        }
        const selfCallRef = getOwnSlot(selfRef, "call");
        if (typeGuard.definedFunction(selfCallRef)) {
            return processDefinedFunction(script, scopes, trace, selfCallRef);
        }
        if (typeof callee === "string") {
            const prototype = resolvePrototype$1(getType(object), callee);
            if (prototype) {
                return prototype(script, scopes, object, trace);
            }
            const func = getOwnSlot(functions, callee);
            if (func) {
                return func(script, scopes, object, trace);
            }
            const definedFunc = getOwnSlot(definedFunctions, callee);
            if (definedFunc) {
                return definedFunc(script, scopes, object, trace);
            }
        }
        throw new NotImplementedError(script, scopes);
    };
    const getCallee = (script, scopes, trace) => {
        if (typeGuard.MemberExpression(script.callee)) {
            const callee = script.callee;
            return normalizeSlotKey(callee.computed
                ? execute$1(callee.property, scopes, trace)
                : getName$1(callee.property, scopes, trace));
        }
        return normalizeSlotKey(getName$1(script.callee, scopes, trace));
    };
    const processDefinedFunction = (script, scopes, trace, func, object) => {
        if (func.isKari) {
            return processDefinedKariFunction(script, scopes, trace, func);
        }
        else {
            return processDefinedNormalFunction(script, scopes, trace, func, object);
        }
    };
    const processDefinedKariFunction = (script, scopes, trace, func) => {
        const args = createSlotStore();
        let count = 1;
        script.arguments.forEach((val) => {
            if (val?.NIWANGO_Identifier) {
                setOwnSlot(args, normalizeSlotKey(getName$1(val.NIWANGO_Identifier, scopes, trace)), execute$1(val, scopes, trace));
            }
            else {
                setOwnSlot(args, `$${count++}`, execute$1(val, scopes, trace));
            }
        });
        return execute$1(func.script.arguments[1], [args, ...scopes], trace);
    };
    const processDefinedNormalFunction = (script, scopes, trace, func, object) => {
        const parameters = func.script.arguments[0].arguments
            .map((arg) => {
            const name = getName$1(arg, scopes, trace);
            if (typeof name !== "string") {
                return undefined;
            }
            return {
                name,
                slotKey: normalizeSlotKey(name),
            };
        })
            .filter((argName) => argName !== undefined);
        const scopeValues = parseDefinedFunctionArguments(script.arguments, scopes, parameters, trace);
        const scope = object
            ? [setScopeSelf(scopeValues, object), object, ...scopes]
            : [scopeValues, ...scopes];
        return execute$1(func.script.arguments[1], scope, trace);
    };
    const parseDefinedFunctionArguments = (inputs, scopes, parameters, trace) => {
        const result = createSlotStore();
        const assignedKeys = new Set();
        const nonKeyValues = [];
        for (const item of inputs) {
            if (item.NIWANGO_Identifier) {
                const key = getName$1(item.NIWANGO_Identifier, scopes, trace);
                if (typeof key === "string") {
                    const parameter = parameters.find((param) => param.name === key);
                    if (parameter) {
                        assignedKeys.add(key);
                        setOwnSlot(result, parameter.slotKey, execute$1(item, scopes, trace));
                        continue;
                    }
                }
            }
            nonKeyValues.push(item);
        }
        let i = 0;
        for (const parameter of parameters) {
            const value = nonKeyValues[i];
            if (!assignedKeys.has(parameter.name) && value) {
                assignedKeys.add(parameter.name);
                setOwnSlot(result, parameter.slotKey, execute$1(value, scopes, trace));
                i++;
            }
        }
        return result;
    };
    const setScopeSelf = (scope, object) => {
        setOwnSlot(scope, "self", object);
        return scope;
    };
    const getThis = (script, scopes, trace) => {
        if (typeGuard.MemberExpression(script.callee))
            return execute$1(script.callee.object, scopes, trace);
        return getGlobalScope(scopes);
    };

    const processConditionalExpression = (script, scopes, trace) => {
        const test = execute$1(script.test, scopes, trace);
        return execute$1(test ? script.consequent : script.alternate, scopes, trace);
    };

    const processExpressionStatement = (script, scopes, trace) => {
        return execute$1(script.expression, scopes, trace);
    };

    const processIdentifier = (script, scopes, trace) => {
        const value = resolve(script, scopes);
        if (typeGuard.definedFunction(value)) {
            return execute$1(value.script.arguments[1], [{}, ...scopes], trace);
        }
        if (value === undefined) {
            try {
                return processCallExpression({
                    type: "CallExpression",
                    callee: script,
                    arguments: [],
                }, scopes, trace);
            }
            catch (_) {
            }
        }
        return value;
    };

    const processLambdaExpression = (script, scopes) => {
        return { ...script, scopes };
    };

    const processLiteral = (script) => {
        return script.value;
    };

    const processLogicalExpression = (script, scopes, trace) => {
        const left = execute$1(script.left, scopes, trace);
        if (script.operator === "&&") {
            return left && execute$1(script.right, scopes, trace);
        }
        else if (script.operator === "||") {
            return left || execute$1(script.right, scopes, trace);
        }
        throw new NotImplementedError(script, scopes);
    };

    const processMemberExpression = (script, scopes, trace) => {
        const left = execute$1(script.object, scopes, trace);
        if (left === undefined) {
            console.error("[member expression] left is undefined", script, scopes, trace);
            return;
        }
        const right = normalizeSlotKey(script.computed
            ? execute$1(script.property, scopes, trace)
            : getName$1(script.property, scopes, trace));
        if (right === undefined) {
            return;
        }
        const leftSlot = getOwnSlot(left, right);
        if (typeGuard.object(left) && typeGuard.definedFunction(leftSlot)) {
            const func = leftSlot;
            return execute$1(func.script.arguments[1], [createSelfScope(left), ...scopes], trace);
        }
        if (typeGuard.LambdaExpression(left)) {
            if (typeGuard.SequenceExpression(script.property)) {
                const args = createSlotStore();
                let index = 0;
                for (const arg of script.property.expressions) {
                    setOwnSlot(args, `@${index++}`, execute$1(arg, scopes, trace));
                }
                return execute$1(left.body, [args, ...left.scopes], trace);
            }
            return execute$1(left.body, [createSlotScope("@0", right), ...left.scopes], trace);
        }
        try {
            return processCallExpression({
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                    object: {
                        type: "Raw",
                        value: left,
                    },
                    property: {
                        type: "Raw",
                        value: right,
                    },
                    computed: false,
                },
                arguments: [],
            }, [createSelfScope(left), ...scopes], trace);
        }
        catch (_e) {
            return getOwnSlot(left, right);
        }
    };
    const createSelfScope = (self) => {
        return createSlotScope("self", self);
    };
    const createSlotScope = (key, value) => {
        const scope = createSlotStore();
        setOwnSlot(scope, key, value);
        return scope;
    };

    const processObjectExpression = (script, scopes, trace) => {
        const object = createSlotStore();
        for (const item of script.properties) {
            const key = normalizeSlotKey(getName$1(item.key, scopes, trace));
            const value = execute$1(item.value, scopes, trace);
            setOwnSlot(object, key, value);
        }
        return object;
    };

    const processProgram = (script, scopes, trace) => {
        return script.body.reduce((_, item) => execute$1(item, scopes, trace), undefined);
    };

    const processRaw$4 = (script) => {
        return script.value;
    };

    const processSequenceExpression = (script, scopes, trace) => {
        return script.expressions.reduce((_, arg) => execute$1(arg, scopes, trace), undefined);
    };

    const processUnaryExpression = (script, scopes, trace) => {
        const value = execute$1(script.argument, scopes, trace);
        if (script.operator === "-") {
            return UnaryNegation(value);
        }
        else if (script.operator === "+") {
            return UnaryPlus(value);
        }
        else if (script.operator === "~") {
            return BitwiseNOT(value);
        }
        else if (script.operator === "!") {
            return LogicalNot(value);
        }
        throw new NotImplementedError(script, scopes);
    };

    const processUpdateExpression = (script, scopes, trace) => {
        const reference = resolveReference(script.argument, scopes, trace);
        const value = reference?.get();
        if (script.operator === "--") {
            const result = Subtraction(value, 1);
            reference?.set(result);
            if (script.prefix) {
                return result;
            }
            else {
                return value;
            }
        }
        else if (script.operator === "++") {
            const result = Addition(value, 1);
            reference?.set(result);
            if (script.prefix) {
                return result;
            }
            else {
                return value;
            }
        }
        throw new NotImplementedError(script, scopes);
    };

    const processVariableDeclaration = (script, scopes, trace) => {
        let lastItem;
        for (const item of script.declarations) {
            if (item.init === null) {
                lastItem = execute$1(item.id, scopes, trace);
            }
            else {
                if (scopes[0]) {
                    lastItem = scopes[0][getName$1(item.id, scopes, trace)] =
                        execute$1(item.init, scopes, trace);
                }
            }
        }
        return lastItem;
    };

    const processors = {
        AssignmentExpression: processAssignmentExpression,
        ArrayExpression: processArrayExpression,
        ArrowFunctionExpression: processArrowFunctionExpression,
        BinaryExpression: processBinaryExpression,
        BlockStatement: processBlockStatement,
        CallExpression: processCallExpression,
        ConditionalExpression: processConditionalExpression,
        EmptyStatement: () => undefined,
        ExpressionStatement: processExpressionStatement,
        Identifier: processIdentifier,
        LambdaExpression: processLambdaExpression,
        Literal: processLiteral,
        LogicalExpression: processLogicalExpression,
        MemberExpression: processMemberExpression,
        ObjectExpression: processObjectExpression,
        Program: processProgram,
        SequenceExpression: processSequenceExpression,
        UnaryExpression: processUnaryExpression,
        UpdateExpression: processUpdateExpression,
        VariableDeclaration: processVariableDeclaration,
        Raw: processRaw$4,
    };

    const formatRuntimeDiagnostic = (error, traceLength) => {
        if (error instanceof Error) {
            return `[execute] ${error.name || "Error"} at trace depth ${traceLength}`;
        }
        return `[execute] Unknown error at trace depth ${traceLength}`;
    };
    const execute = (script, scopes, trace, options = {}) => {
        if (!script || !typeGuard.AST(script))
            return;
        const recursionLimit = getResourceLimit("recursionDepth");
        if (trace.length > recursionLimit) {
            throw new TooMuchRecursionError(script, scopes, recursionLimit, trace.length);
        }
        let result;
        trace = [...trace, script];
        try {
            const processor = processors[script.type];
            if (!processor)
                throw new NotImplementedError(script, scopes);
            result = processor(script, scopes, trace);
        }
        catch (e) {
            if (e instanceof ResourceLimitError)
                throw e;
            if (!options.catch)
                throw e;
            console.log(formatRuntimeDiagnostic(e, trace.length));
        }
        for (const hook of resultHook) {
            result = hook(result);
        }
        return result;
    };
    const initExecute = () => {
        setExecute(execute);
    };

    const processToASString$4 = (_script, _scopes, object) => {
        return ("<[" +
            object
                .map((val) => {
                return format(val, "string");
            })
                .join(",") +
            "]>");
    };

    const processIndex$2 = (script, scopes, object, trace) => {
        const index = execute$1(script.arguments[0], scopes, trace);
        if (typeof index === "number") {
            return object[index];
        }
        return object[format(index, "number")];
    };

    const processJoin = (script, scopes, object, trace) => {
        if (script.arguments.length > 0) {
            const separator = execute$1(script.arguments[0], scopes, trace);
            if (typeof separator !== "undefined") {
                return object.join(format(separator, "string"));
            }
        }
        return object.join(",");
    };

    const processPop = (_script, _scopes, object) => {
        return object.pop();
    };

    const processProduct = (_script, _scopes, object) => {
        return object.reduce((pv, val) => pv * format(val, "number"), 1);
    };

    const processPush = (script, scopes, object, trace) => {
        const values = script.arguments.map((argument) => execute$1(argument, scopes, trace));
        return object.push(...values);
    };

    const processShift = (_script, _scopes, object) => {
        return object.shift();
    };

    const processSize$1 = (_script, _scopes, object) => {
        return object.length;
    };

    const processSort = (_script, _scopes, object) => {
        return object.sort();
    };

    const processSum = (_script, _scopes, object) => {
        return object.reduce((pv, val) => pv + format(val, "number"), 0);
    };

    const processUnshift = (script, scopes, object, trace) => {
        const values = script.arguments.map((argument) => execute$1(argument, scopes, trace));
        return object.unshift(...values);
    };

    const processWalk = (script, scopes, object, trace) => {
        const processor = script.arguments[0];
        let result;
        if (typeGuard.LambdaExpression(processor)) {
            for (const item of object) {
                result = execute$1(processor.body, [{ "@0": item }, ...scopes], trace);
            }
        }
        return result;
    };

    const prototypeArrayFunctions = {
        index: processIndex$2,
        size: processSize$1,
        unshift: processUnshift,
        join: processJoin,
        push: processPush,
        shift: processShift,
        pop: processPop,
        sort: processSort,
        sum: processSum,
        product: processProduct,
        walk: processWalk,
        toASString: processToASString$4,
    };

    const processRaw$3 = (_script, _scopes, object) => {
        return object;
    };

    const processToASNumber$2 = (_script, _scopes, object) => {
        return object ? 1 : 0;
    };

    const processToASString$3 = (_script, _scopes, object) => {
        return object ? "true" : "false";
    };

    const prototypeBoolFunctions = {
        toASNumber: processToASNumber$2,
        toASString: processToASString$3,
        toASBoolean: processRaw$3,
        raw: processRaw$3,
    };

    const processAbs = (_script, _scopes, object) => {
        return Math.abs(object);
    };

    const processCos = (_script, _scopes, object) => {
        return Math.cos(object);
    };

    const processDecrease = (_script, _scopes, object) => {
        return object - 1;
    };

    const processFloor = (_script, _scopes, object) => {
        return Math.floor(object);
    };

    const processIncrease = (_script, _scopes, object) => {
        return object + 1;
    };

    const processPow = (script, scopes, object, trace) => {
        const exponent = execute$1(script.arguments[0], scopes, trace);
        return object ** format(exponent, "number");
    };

    const processRaw$2 = (_script, _scopes, object) => {
        return object;
    };

    const processSin = (_script, _scopes, object) => {
        return Math.sin(object);
    };

    const processTimes = (script, scopes, object, trace) => {
        const body = script.arguments[0];
        const count = format(object, "number");
        const iterations = Number.isNaN(count) || count <= 0 ? 0 : Math.ceil(count);
        assertResourceLimit("timesIterations", iterations, script, scopes, "Number.times iterations");
        let lastResult;
        for (let i = 0; i < count; i++) {
            if (body.type === "LambdaExpression") {
                lastResult = execute$1(body.body, [{ "@0": i }, ...scopes], trace);
                continue;
            }
            lastResult = execute$1(body, [{ "@0": i }, ...scopes], trace);
        }
        return lastResult;
    };

    const processToASString$2 = (_script, _scopes, object) => {
        return `${object}`;
    };

    const prototypeNumberFunctions = {
        floor: processFloor,
        sin: processSin,
        cos: processCos,
        pow: processPow,
        abs: processAbs,
        times: processTimes,
        raw: processRaw$2,
        hashCode: processRaw$2,
        toASNumber: processRaw$2,
        toASString: processToASString$2,
        increase: processIncrease,
        decrease: processDecrease,
    };

    const processDefKari = (script, scopes, object, trace) => {
        if (!script.arguments[0]) {
            return;
        }
        const functionName = execute$1(script.arguments[0], scopes, trace);
        if (typeof functionName !== "string") {
            return;
        }
        setOwnSlot(object, normalizeSlotKey(functionName), {
            type: "definedFunction",
            isKari: true,
            script,
        });
    };

    const processRaw$1 = (_script, _scopes, object) => {
        return object;
    };

    const processClone = (_script, _scope, object) => {
        return structuredClone(object);
    };

    const processDef = (script, scopes, object, trace) => {
        const functionName = (() => {
            if (typeGuard.Identifier(script.arguments[0])) {
                return getName$1(script.arguments[0], scopes, trace);
            }
            if (typeGuard.CallExpression(script.arguments[0])) {
                return getName$1(script.arguments[0].callee, scopes, trace);
            }
            throw new InvalidTypeError("function name must be CallExpression or Identifier", script, scopes);
        })();
        if (typeof functionName !== "string") {
            throw new InvalidTypeError("function name must be string", script, scopes);
        }
        setOwnSlot(object, normalizeSlotKey(functionName), {
            type: "definedFunction",
            isKari: false,
            script,
        });
    };

    const processGetSlot = (script, scopes, object, trace) => {
        const key = execute$1(script.arguments[0], scopes, trace);
        if (typeof key !== "string" && typeof key !== "number") {
            throw new InvalidTypeError("[call expression] Object.getSlot: id must be string or number", script, scopes);
        }
        return getOwnSlot(object, normalizeSlotKey(key));
    };

    const processSetSlot = (script, scopes, object, trace) => {
        const key = execute$1(script.arguments[0], scopes, trace);
        if (typeof key !== "string" && typeof key !== "number") {
            throw new InvalidTypeError("[call expression] Object.setSlot: id must be string or number", script, scopes);
        }
        const value = execute$1(script.arguments[1], scopes, trace);
        if (!setOwnSlot(object, normalizeSlotKey(key), value)) {
            return;
        }
        return value;
    };

    const prototypeObjectFunctions = {
        def: processDef,
        def_kari: processDefKari,
        getSlot: processGetSlot,
        setSlot: processSetSlot,
        clone: processClone,
        raw: processRaw$1,
    };

    const processIndex$1 = (script, scopes, object, trace) => {
        const index = execute$1(script.arguments[0], scopes, trace);
        return object[format(index, "number")];
    };

    function _assertThisInitialized(e) {
      if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return e;
    }
    function _callSuper(t, o, e) {
      return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
    }
    function _classCallCheck(a, n) {
      if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
    }
    function _construct(t, e, r) {
      if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
      var o = [null];
      o.push.apply(o, e);
      var p = new (t.bind.apply(t, o))();
      return r && _setPrototypeOf(p, r.prototype), p;
    }
    function _defineProperties(e, r) {
      for (var t = 0; t < r.length; t++) {
        var o = r[t];
        o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
      }
    }
    function _createClass(e, r, t) {
      return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
        writable: false
      }), e;
    }
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: true,
        configurable: true,
        writable: true
      }) : e[r] = t, e;
    }
    function _getPrototypeOf(t) {
      return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
        return t.__proto__ || Object.getPrototypeOf(t);
      }, _getPrototypeOf(t);
    }
    function _inherits(t, e) {
      if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
      t.prototype = Object.create(e && e.prototype, {
        constructor: {
          value: t,
          writable: true,
          configurable: true
        }
      }), Object.defineProperty(t, "prototype", {
        writable: false
      }), e && _setPrototypeOf(t, e);
    }
    function _isNativeFunction(t) {
      try {
        return -1 !== Function.toString.call(t).indexOf("[native code]");
      } catch (n) {
        return "function" == typeof t;
      }
    }
    function _isNativeReflectConstruct() {
      try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      } catch (t) {}
      return (_isNativeReflectConstruct = function () {
        return !!t;
      })();
    }
    function ownKeys(e, r) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function (r) {
          return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread2(e) {
      for (var r = 1; r < arguments.length; r++) {
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
      }
      return e;
    }
    function _possibleConstructorReturn(t, e) {
      if (e && ("object" == typeof e || "function" == typeof e)) return e;
      if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
      return _assertThisInitialized(t);
    }
    function _setPrototypeOf(t, e) {
      return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
        return t.__proto__ = e, t;
      }, _setPrototypeOf(t, e);
    }
    function _toPrimitive(t, r) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r);
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (String )(t);
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    function _wrapNativeSuper(t) {
      var r = "function" == typeof Map ? new Map() : void 0;
      return _wrapNativeSuper = function (t) {
        if (null === t || !_isNativeFunction(t)) return t;
        if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
        if (void 0 !== r) {
          if (r.has(t)) return r.get(t);
          r.set(t, Wrapper);
        }
        function Wrapper() {
          return _construct(t, arguments, _getPrototypeOf(this).constructor);
        }
        return Wrapper.prototype = Object.create(t.prototype, {
          constructor: {
            value: Wrapper,
            enumerable: false,
            writable: true,
            configurable: true
          }
        }), _setPrototypeOf(Wrapper, t);
      }, _wrapNativeSuper(t);
    }

    var parser$1 = {exports: {}};

    var parser = parser$1.exports;
    var hasRequiredParser;
    function requireParser() {
      if (hasRequiredParser) return parser$1.exports;
      hasRequiredParser = 1;
      (function (module) {
        // @generated by Peggy 5.0.6.
        //
        // https://peggyjs.org/
        (function (root, factory) {
          if (module.exports) {
            module.exports = factory();
          } else {
            root.parser = factory();
          }
        })(parser, function () {

          var peg$SyntaxError = /*#__PURE__*/function (_SyntaxError) {
            function peg$SyntaxError(message, expected, found, location) {
              var _this;
              _classCallCheck(this, peg$SyntaxError);
              _this = _callSuper(this, peg$SyntaxError, [message]);
              _this.expected = expected;
              _this.found = found;
              _this.location = location;
              _this.name = "SyntaxError";
              return _this;
            }
            _inherits(peg$SyntaxError, _SyntaxError);
            return _createClass(peg$SyntaxError, [{
              key: "format",
              value: function format(sources) {
                var _this2 = this;
                var str = "Error: " + this.message;
                if (this.location) {
                  var src = null;
                  var st = sources.find(function (s) {
                    return s.source === _this2.location.source;
                  });
                  if (st) {
                    src = st.text.split(/\r\n|\n|\r/g);
                  }
                  var s = this.location.start;
                  var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
                  var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
                  if (src) {
                    var e = this.location.end;
                    var filler = "".padEnd(offset_s.line.toString().length, " ");
                    var line = src[s.line - 1];
                    var last = s.line === e.line ? e.column : line.length + 1;
                    var hatLen = last - s.column || 1;
                    str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
                  } else {
                    str += "\n at " + loc;
                  }
                }
                return str;
              }
            }], [{
              key: "buildMessage",
              value: function buildMessage(expected, found) {
                function hex(ch) {
                  return ch.codePointAt(0).toString(16).toUpperCase();
                }
                var nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
                function unicodeEscape(s) {
                  if (nonPrintable) {
                    return s.replace(nonPrintable, function (ch) {
                      return "\\u{" + hex(ch) + "}";
                    });
                  }
                  return s;
                }
                function literalEscape(s) {
                  return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function (ch) {
                    return "\\x0" + hex(ch);
                  }).replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
                    return "\\x" + hex(ch);
                  }));
                }
                function classEscape(s) {
                  return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function (ch) {
                    return "\\x0" + hex(ch);
                  }).replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
                    return "\\x" + hex(ch);
                  }));
                }
                var DESCRIBE_EXPECTATION_FNS = {
                  literal: function literal(expectation) {
                    return "\"" + literalEscape(expectation.text) + "\"";
                  },
                  "class": function _class(expectation) {
                    var escapedParts = expectation.parts.map(function (part) {
                      return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
                    });
                    return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
                  },
                  any: function any() {
                    return "any character";
                  },
                  end: function end() {
                    return "end of input";
                  },
                  other: function other(expectation) {
                    return expectation.description;
                  }
                };
                function describeExpectation(expectation) {
                  return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
                }
                function describeExpected(expected) {
                  var descriptions = expected.map(describeExpectation);
                  descriptions.sort();
                  if (descriptions.length > 0) {
                    var j = 1;
                    for (var i = 1; i < descriptions.length; i++) {
                      if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                      }
                    }
                    descriptions.length = j;
                  }
                  switch (descriptions.length) {
                    case 1:
                      return descriptions[0];
                    case 2:
                      return descriptions[0] + " or " + descriptions[1];
                    default:
                      return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
                  }
                }
                function describeFound(found) {
                  return found ? "\"" + literalEscape(found) + "\"" : "end of input";
                }
                return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
              }
            }]);
          }(/*#__PURE__*/_wrapNativeSuper(SyntaxError));
          function peg$parse(input, options) {
            options = options !== undefined ? options : {};
            var peg$FAILED = {};
            var peg$source = options.grammarSource;
            var peg$startRuleFunctions = {
              Start: peg$parseStart
            };
            var peg$startRuleFunction = peg$parseStart;
            var peg$c0 = "\n";
            var peg$c1 = "\r\n";
            var peg$c2 = "#";
            var peg$c3 = "/";
            var peg$c4 = "\\";
            var peg$c5 = ".";
            var peg$c6 = "0";
            var peg$c7 = "e";
            var peg$c8 = "0x";
            var peg$c9 = "\"";
            var peg$c10 = "'";
            var peg$c11 = "b";
            var peg$c12 = "f";
            var peg$c13 = "n";
            var peg$c14 = "r";
            var peg$c15 = "t";
            var peg$c16 = "v";
            var peg$c17 = "x";
            var peg$c18 = "u";
            var peg$c19 = "[";
            var peg$c20 = "]";
            var peg$c21 = "false";
            var peg$c22 = "lambda";
            var peg$c23 = "null";
            var peg$c24 = "nil";
            var peg$c25 = "true";
            var peg$c26 = ";";
            var peg$c27 = "}";
            var peg$c28 = ")";
            var peg$c29 = "(";
            var peg$c30 = ",";
            var peg$c31 = "{";
            var peg$c32 = ":";
            var peg$c33 = "=";
            var peg$c34 = "++";
            var peg$c35 = "--";
            var peg$c36 = "+";
            var peg$c37 = "-";
            var peg$c38 = "*";
            var peg$c39 = "%";
            var peg$c40 = "<<";
            var peg$c41 = ">>>";
            var peg$c42 = ">>";
            var peg$c43 = "<=";
            var peg$c44 = ">=";
            var peg$c45 = "<";
            var peg$c46 = ">";
            var peg$c47 = "===";
            var peg$c48 = "!==";
            var peg$c49 = "==";
            var peg$c50 = "!=";
            var peg$c51 = "<>";
            var peg$c52 = "&";
            var peg$c53 = "^";
            var peg$c54 = "**";
            var peg$c55 = "|";
            var peg$c56 = "&&";
            var peg$c57 = "||";
            var peg$c58 = "?";
            var peg$c59 = ":=";
            var peg$c60 = "*=";
            var peg$c61 = "/=";
            var peg$c62 = "%=";
            var peg$c63 = "+=";
            var peg$c64 = "-=";
            var peg$c65 = "<<=";
            var peg$c66 = ">>=";
            var peg$c67 = ">>>=";
            var peg$c68 = "&=";
            var peg$c69 = "^=";
            var peg$c70 = "|=";
            var peg$c71 = "&&=";
            var peg$c72 = "||=";
            var peg$c73 = "??=";
            var peg$r0 = /^[\t\v-\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]/;
            var peg$r1 = /^[\n\r\u2028\u2029]/;
            var peg$r2 = /^[\r\u2028-\u2029]/;
            var peg$r3 = /^[$@-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376-\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4-\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u09FC\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E46\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEF\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7B9\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD-\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/;
            var peg$r4 = /^[_\u200C-\u200D\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/;
            var peg$r5 = /^[^\n -~\uFF61-\uFF9F]/;
            var peg$r6 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962-\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7\u09E2-\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2-\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47-\u0B48\u0B4B-\u0B4D\u0B56-\u0B57\u0B62-\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5-\u0CD6\u0CE2-\u0CE3\u0D00-\u0D03\u0D3B-\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62-\u0D63\u0D82-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2-\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F3E-\u0F3F\u0F71-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885-\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880-\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C-\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5-\uAAF6\uABE3-\uABEA\uABEC-\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/;
            var peg$r7 = /^[0-9]/;
            var peg$r8 = /^[1-9]/;
            var peg$r9 = /^[+\-]/;
            var peg$r10 = /^[0-9a-f]/i;
            var peg$r11 = /^[0-7]/i;
            var peg$r12 = /^[\n\r"\\\u2028-\u2029]/;
            var peg$r13 = /^[\n\r'\\\u2028-\u2029]/;
            var peg$r14 = /^["'\\]/;
            var peg$r15 = /^[0-9ux]/;
            var peg$r16 = /^[*\\\/[]/;
            var peg$r17 = /^[\\\/[]/;
            var peg$r18 = /^[\]\\]/;
            var peg$r19 = /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/;
            var peg$r20 = /^[!~]/;
            var peg$r21 = /^[+=]/;
            var peg$r22 = /^[\-=]/;
            var peg$r23 = /^[&=]/;
            var peg$r24 = /^[|=]/;
            var peg$e0 = peg$anyExpectation();
            var peg$e1 = peg$otherExpectation("whitespace");
            var peg$e2 = peg$classExpectation(["\t", ["\v", "\f"], " ", "\xA0", "\u1680", ["\u2000", "\u200A"], "\u202F", "\u205F", "\u3000", "\uFEFF"], false, false, false);
            var peg$e3 = peg$classExpectation(["\n", "\r", "\u2028", "\u2029"], false, false, false);
            var peg$e4 = peg$otherExpectation("end of line");
            var peg$e5 = peg$literalExpectation("\n", false);
            var peg$e6 = peg$literalExpectation("\r\n", false);
            var peg$e7 = peg$classExpectation(["\r", ["\u2028", "\u2029"]], false, false, false);
            var peg$e8 = peg$otherExpectation("comment");
            var peg$e9 = peg$literalExpectation("#", false);
            var peg$e10 = peg$otherExpectation("identifier");
            var peg$e11 = peg$literalExpectation("/", false);
            var peg$e12 = peg$classExpectation(["$", ["@", "Z"], "_", ["a", "z"], "\xAA", "\xB5", "\xBA", ["\xC0", "\xD6"], ["\xD8", "\xF6"], ["\xF8", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", ["\u0370", "\u0374"], ["\u0376", "\u0377"], ["\u037A", "\u037D"], "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u03A1"], ["\u03A3", "\u03F5"], ["\u03F7", "\u0481"], ["\u048A", "\u052F"], ["\u0531", "\u0556"], "\u0559", ["\u0560", "\u0588"], ["\u05D0", "\u05EA"], ["\u05EF", "\u05F2"], ["\u0620", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06E5", "\u06E6"], ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u07F4", "\u07F5"], "\u07FA", ["\u0800", "\u0815"], "\u081A", "\u0824", "\u0828", ["\u0840", "\u0858"], ["\u0860", "\u086A"], ["\u08A0", "\u08B4"], ["\u08B6", "\u08BD"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0971", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], "\u09FC", ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], "\u0C80", ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D54", "\u0D56"], ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E46"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], "\u0EC6", ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u10D0", "\u10FA"], ["\u10FC", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u13A0", "\u13F5"], ["\u13F8", "\u13FD"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16EE", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17D7", "\u17DC", ["\u1820", "\u1878"], ["\u1880", "\u1884"], ["\u1887", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], "\u1AA7", ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C7D"], ["\u1C80", "\u1C88"], ["\u1C90", "\u1CBA"], ["\u1CBD", "\u1CBF"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u1D00", "\u1DBF"], ["\u1E00", "\u1F15"], ["\u1F18", "\u1F1D"], ["\u1F20", "\u1F45"], ["\u1F48", "\u1F4D"], ["\u1F50", "\u1F57"], "\u1F59", "\u1F5B", "\u1F5D", ["\u1F5F", "\u1F7D"], ["\u1F80", "\u1FB4"], ["\u1FB6", "\u1FBC"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FCC"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FDB"], ["\u1FE0", "\u1FEC"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FFC"], "\u2071", "\u207F", ["\u2090", "\u209C"], "\u2102", "\u2107", ["\u210A", "\u2113"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u212F", "\u2139"], ["\u213C", "\u213F"], ["\u2145", "\u2149"], "\u214E", ["\u2160", "\u2188"], ["\u2C00", "\u2C2E"], ["\u2C30", "\u2C5E"], ["\u2C60", "\u2CE4"], ["\u2CEB", "\u2CEE"], ["\u2CF2", "\u2CF3"], ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", ["\u2D30", "\u2D67"], "\u2D6F", ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u2E2F", ["\u3005", "\u3007"], ["\u3021", "\u3029"], ["\u3031", "\u3035"], ["\u3038", "\u303C"], ["\u3041", "\u3096"], ["\u309D", "\u309F"], ["\u30A1", "\u30FA"], ["\u30FC", "\u30FF"], ["\u3105", "\u312F"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FEF"], ["\uA000", "\uA48C"], ["\uA4D0", "\uA4FD"], ["\uA500", "\uA60C"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], ["\uA640", "\uA66E"], ["\uA67F", "\uA69D"], ["\uA6A0", "\uA6EF"], ["\uA717", "\uA71F"], ["\uA722", "\uA788"], ["\uA78B", "\uA7B9"], ["\uA7F7", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", ["\uA8FD", "\uA8FE"], ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], "\uA9CF", ["\uA9E0", "\uA9E4"], ["\uA9E6", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADD"], ["\uAAE0", "\uAAEA"], ["\uAAF2", "\uAAF4"], ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uAB30", "\uAB5A"], ["\uAB5C", "\uAB65"], ["\uAB70", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF21", "\uFF3A"], ["\uFF41", "\uFF5A"], ["\uFF66", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false, false);
            var peg$e13 = peg$literalExpectation("\\", false);
            var peg$e14 = peg$classExpectation(["_", ["\u200C", "\u200D"], ["\u203F", "\u2040"], "\u2054", ["\uFE33", "\uFE34"], ["\uFE4D", "\uFE4F"], "\uFF3F"], false, false, false);
            var peg$e15 = peg$classExpectation(["\n", [" ", "~"], ["\uFF61", "\uFF9F"]], true, false, false);
            var peg$e16 = peg$classExpectation([["\u0300", "\u036F"], ["\u0483", "\u0487"], ["\u0591", "\u05BD"], "\u05BF", ["\u05C1", "\u05C2"], ["\u05C4", "\u05C5"], "\u05C7", ["\u0610", "\u061A"], ["\u064B", "\u065F"], "\u0670", ["\u06D6", "\u06DC"], ["\u06DF", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"], "\u0711", ["\u0730", "\u074A"], ["\u07A6", "\u07B0"], ["\u07EB", "\u07F3"], "\u07FD", ["\u0816", "\u0819"], ["\u081B", "\u0823"], ["\u0825", "\u0827"], ["\u0829", "\u082D"], ["\u0859", "\u085B"], ["\u08D3", "\u08E1"], ["\u08E3", "\u0903"], ["\u093A", "\u093C"], ["\u093E", "\u094F"], ["\u0951", "\u0957"], ["\u0962", "\u0963"], ["\u0981", "\u0983"], "\u09BC", ["\u09BE", "\u09C4"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CD"], "\u09D7", ["\u09E2", "\u09E3"], "\u09FE", ["\u0A01", "\u0A03"], "\u0A3C", ["\u0A3E", "\u0A42"], ["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], "\u0A51", ["\u0A70", "\u0A71"], "\u0A75", ["\u0A81", "\u0A83"], "\u0ABC", ["\u0ABE", "\u0AC5"], ["\u0AC7", "\u0AC9"], ["\u0ACB", "\u0ACD"], ["\u0AE2", "\u0AE3"], ["\u0AFA", "\u0AFF"], ["\u0B01", "\u0B03"], "\u0B3C", ["\u0B3E", "\u0B44"], ["\u0B47", "\u0B48"], ["\u0B4B", "\u0B4D"], ["\u0B56", "\u0B57"], ["\u0B62", "\u0B63"], "\u0B82", ["\u0BBE", "\u0BC2"], ["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCD"], "\u0BD7", ["\u0C00", "\u0C04"], ["\u0C3E", "\u0C44"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"], ["\u0C62", "\u0C63"], ["\u0C81", "\u0C83"], "\u0CBC", ["\u0CBE", "\u0CC4"], ["\u0CC6", "\u0CC8"], ["\u0CCA", "\u0CCD"], ["\u0CD5", "\u0CD6"], ["\u0CE2", "\u0CE3"], ["\u0D00", "\u0D03"], ["\u0D3B", "\u0D3C"], ["\u0D3E", "\u0D44"], ["\u0D46", "\u0D48"], ["\u0D4A", "\u0D4D"], "\u0D57", ["\u0D62", "\u0D63"], ["\u0D82", "\u0D83"], "\u0DCA", ["\u0DCF", "\u0DD4"], "\u0DD6", ["\u0DD8", "\u0DDF"], ["\u0DF2", "\u0DF3"], "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"], "\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"], ["\u0F18", "\u0F19"], "\u0F35", "\u0F37", "\u0F39", ["\u0F3E", "\u0F3F"], ["\u0F71", "\u0F84"], ["\u0F86", "\u0F87"], ["\u0F8D", "\u0F97"], ["\u0F99", "\u0FBC"], "\u0FC6", ["\u102B", "\u103E"], ["\u1056", "\u1059"], ["\u105E", "\u1060"], ["\u1062", "\u1064"], ["\u1067", "\u106D"], ["\u1071", "\u1074"], ["\u1082", "\u108D"], "\u108F", ["\u109A", "\u109D"], ["\u135D", "\u135F"], ["\u1712", "\u1714"], ["\u1732", "\u1734"], ["\u1752", "\u1753"], ["\u1772", "\u1773"], ["\u17B4", "\u17D3"], "\u17DD", ["\u180B", "\u180D"], ["\u1885", "\u1886"], "\u18A9", ["\u1920", "\u192B"], ["\u1930", "\u193B"], ["\u1A17", "\u1A1B"], ["\u1A55", "\u1A5E"], ["\u1A60", "\u1A7C"], "\u1A7F", ["\u1AB0", "\u1ABD"], ["\u1B00", "\u1B04"], ["\u1B34", "\u1B44"], ["\u1B6B", "\u1B73"], ["\u1B80", "\u1B82"], ["\u1BA1", "\u1BAD"], ["\u1BE6", "\u1BF3"], ["\u1C24", "\u1C37"], ["\u1CD0", "\u1CD2"], ["\u1CD4", "\u1CE8"], "\u1CED", ["\u1CF2", "\u1CF4"], ["\u1CF7", "\u1CF9"], ["\u1DC0", "\u1DF9"], ["\u1DFB", "\u1DFF"], ["\u20D0", "\u20DC"], "\u20E1", ["\u20E5", "\u20F0"], ["\u2CEF", "\u2CF1"], "\u2D7F", ["\u2DE0", "\u2DFF"], ["\u302A", "\u302F"], ["\u3099", "\u309A"], "\uA66F", ["\uA674", "\uA67D"], ["\uA69E", "\uA69F"], ["\uA6F0", "\uA6F1"], "\uA802", "\uA806", "\uA80B", ["\uA823", "\uA827"], ["\uA880", "\uA881"], ["\uA8B4", "\uA8C5"], ["\uA8E0", "\uA8F1"], "\uA8FF", ["\uA926", "\uA92D"], ["\uA947", "\uA953"], ["\uA980", "\uA983"], ["\uA9B3", "\uA9C0"], "\uA9E5", ["\uAA29", "\uAA36"], "\uAA43", ["\uAA4C", "\uAA4D"], ["\uAA7B", "\uAA7D"], "\uAAB0", ["\uAAB2", "\uAAB4"], ["\uAAB7", "\uAAB8"], ["\uAABE", "\uAABF"], "\uAAC1", ["\uAAEB", "\uAAEF"], ["\uAAF5", "\uAAF6"], ["\uABE3", "\uABEA"], ["\uABEC", "\uABED"], "\uFB1E", ["\uFE00", "\uFE0F"], ["\uFE20", "\uFE2F"]], false, false, false);
            var peg$e17 = peg$otherExpectation("number");
            var peg$e18 = peg$literalExpectation(".", false);
            var peg$e19 = peg$literalExpectation("0", false);
            var peg$e20 = peg$classExpectation([["0", "9"]], false, false, false);
            var peg$e21 = peg$classExpectation([["1", "9"]], false, false, false);
            var peg$e22 = peg$literalExpectation("e", true);
            var peg$e23 = peg$classExpectation(["+", "-"], false, false, false);
            var peg$e24 = peg$literalExpectation("0x", true);
            var peg$e25 = peg$literalExpectation("0", true);
            var peg$e26 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true, false);
            var peg$e27 = peg$classExpectation([["0", "7"]], false, true, false);
            var peg$e28 = peg$otherExpectation("string");
            var peg$e29 = peg$literalExpectation("\"", false);
            var peg$e30 = peg$literalExpectation("'", false);
            var peg$e31 = peg$classExpectation(["\n", "\r", "\"", "\\", ["\u2028", "\u2029"]], false, false, false);
            var peg$e32 = peg$classExpectation(["\n", "\r", "'", "\\", ["\u2028", "\u2029"]], false, false, false);
            var peg$e33 = peg$classExpectation(["\"", "'", "\\"], false, false, false);
            var peg$e34 = peg$literalExpectation("b", false);
            var peg$e35 = peg$literalExpectation("f", false);
            var peg$e36 = peg$literalExpectation("n", false);
            var peg$e37 = peg$literalExpectation("r", false);
            var peg$e38 = peg$literalExpectation("t", false);
            var peg$e39 = peg$literalExpectation("v", false);
            var peg$e40 = peg$classExpectation([["0", "9"], "u", "x"], false, false, false);
            var peg$e41 = peg$literalExpectation("x", false);
            var peg$e42 = peg$literalExpectation("u", false);
            var peg$e43 = peg$otherExpectation("regular expression");
            var peg$e44 = peg$classExpectation(["*", "\\", "/", "["], false, false, false);
            var peg$e45 = peg$classExpectation(["\\", "/", "["], false, false, false);
            var peg$e46 = peg$literalExpectation("[", false);
            var peg$e47 = peg$literalExpectation("]", false);
            var peg$e48 = peg$classExpectation(["]", "\\"], false, false, false);
            var peg$e49 = peg$classExpectation([["0", "9"], ["\u0660", "\u0669"], ["\u06F0", "\u06F9"], ["\u07C0", "\u07C9"], ["\u0966", "\u096F"], ["\u09E6", "\u09EF"], ["\u0A66", "\u0A6F"], ["\u0AE6", "\u0AEF"], ["\u0B66", "\u0B6F"], ["\u0BE6", "\u0BEF"], ["\u0C66", "\u0C6F"], ["\u0CE6", "\u0CEF"], ["\u0D66", "\u0D6F"], ["\u0DE6", "\u0DEF"], ["\u0E50", "\u0E59"], ["\u0ED0", "\u0ED9"], ["\u0F20", "\u0F29"], ["\u1040", "\u1049"], ["\u1090", "\u1099"], ["\u17E0", "\u17E9"], ["\u1810", "\u1819"], ["\u1946", "\u194F"], ["\u19D0", "\u19D9"], ["\u1A80", "\u1A89"], ["\u1A90", "\u1A99"], ["\u1B50", "\u1B59"], ["\u1BB0", "\u1BB9"], ["\u1C40", "\u1C49"], ["\u1C50", "\u1C59"], ["\uA620", "\uA629"], ["\uA8D0", "\uA8D9"], ["\uA900", "\uA909"], ["\uA9D0", "\uA9D9"], ["\uA9F0", "\uA9F9"], ["\uAA50", "\uAA59"], ["\uABF0", "\uABF9"], ["\uFF10", "\uFF19"]], false, false, false);
            var peg$e50 = peg$literalExpectation("false", false);
            var peg$e51 = peg$literalExpectation("lambda", false);
            var peg$e52 = peg$literalExpectation("null", false);
            var peg$e53 = peg$literalExpectation("nil", false);
            var peg$e54 = peg$literalExpectation("true", false);
            var peg$e55 = peg$literalExpectation(";", false);
            var peg$e56 = peg$literalExpectation("}", false);
            var peg$e57 = peg$literalExpectation(")", false);
            var peg$e58 = peg$literalExpectation("(", false);
            var peg$e59 = peg$literalExpectation(",", false);
            var peg$e60 = peg$literalExpectation("{", false);
            var peg$e61 = peg$literalExpectation(":", false);
            var peg$e62 = peg$literalExpectation("=", false);
            var peg$e63 = peg$literalExpectation("++", false);
            var peg$e64 = peg$literalExpectation("--", false);
            var peg$e65 = peg$literalExpectation("+", false);
            var peg$e66 = peg$literalExpectation("-", false);
            var peg$e67 = peg$classExpectation(["!", "~"], false, false, false);
            var peg$e68 = peg$literalExpectation("*", false);
            var peg$e69 = peg$literalExpectation("%", false);
            var peg$e70 = peg$classExpectation(["+", "="], false, false, false);
            var peg$e71 = peg$classExpectation(["-", "="], false, false, false);
            var peg$e72 = peg$literalExpectation("<<", false);
            var peg$e73 = peg$literalExpectation(">>>", false);
            var peg$e74 = peg$literalExpectation(">>", false);
            var peg$e75 = peg$literalExpectation("<=", false);
            var peg$e76 = peg$literalExpectation(">=", false);
            var peg$e77 = peg$literalExpectation("<", false);
            var peg$e78 = peg$literalExpectation(">", false);
            var peg$e79 = peg$literalExpectation("===", false);
            var peg$e80 = peg$literalExpectation("!==", false);
            var peg$e81 = peg$literalExpectation("==", false);
            var peg$e82 = peg$literalExpectation("!=", false);
            var peg$e83 = peg$literalExpectation("<>", false);
            var peg$e84 = peg$literalExpectation("&", false);
            var peg$e85 = peg$classExpectation(["&", "="], false, false, false);
            var peg$e86 = peg$literalExpectation("^", false);
            var peg$e87 = peg$literalExpectation("**", false);
            var peg$e88 = peg$literalExpectation("|", false);
            var peg$e89 = peg$classExpectation(["|", "="], false, false, false);
            var peg$e90 = peg$literalExpectation("&&", false);
            var peg$e91 = peg$literalExpectation("||", false);
            var peg$e92 = peg$literalExpectation("?", false);
            var peg$e93 = peg$literalExpectation(":=", false);
            var peg$e94 = peg$literalExpectation("*=", false);
            var peg$e95 = peg$literalExpectation("/=", false);
            var peg$e96 = peg$literalExpectation("%=", false);
            var peg$e97 = peg$literalExpectation("+=", false);
            var peg$e98 = peg$literalExpectation("-=", false);
            var peg$e99 = peg$literalExpectation("<<=", false);
            var peg$e100 = peg$literalExpectation(">>=", false);
            var peg$e101 = peg$literalExpectation(">>>=", false);
            var peg$e102 = peg$literalExpectation("&=", false);
            var peg$e103 = peg$literalExpectation("^=", false);
            var peg$e104 = peg$literalExpectation("|=", false);
            var peg$e105 = peg$literalExpectation("&&=", false);
            var peg$e106 = peg$literalExpectation("||=", false);
            var peg$e107 = peg$literalExpectation("??=", false);
            function peg$f0(program) {
              return program;
            }
            function peg$f1(name) {
              return name;
            }
            function peg$f2(head, tail) {
              return {
                type: "Identifier",
                name: head + tail.join(""),
                location: location()
              };
            }
            function peg$f3(sequence) {
              return sequence;
            }
            function peg$f4() {
              return {
                type: "Literal",
                value: null,
                location: location()
              };
            }
            function peg$f5() {
              return {
                type: "Literal",
                value: undefined,
                location: location()
              };
            }
            function peg$f6() {
              return {
                type: "Literal",
                value: true,
                location: location()
              };
            }
            function peg$f7() {
              return {
                type: "Literal",
                value: false,
                location: location()
              };
            }
            function peg$f8(literal) {
              return literal;
            }
            function peg$f9(literal) {
              return literal;
            }
            function peg$f10(literal) {
              return literal;
            }
            function peg$f11() {
              return {
                type: "Literal",
                value: parseFloat(text()),
                location: location()
              };
            }
            function peg$f12() {
              return {
                type: "Literal",
                value: parseFloat(text()),
                location: location()
              };
            }
            function peg$f13() {
              return {
                type: "Literal",
                value: parseFloat(text()),
                location: location()
              };
            }
            function peg$f14(digits) {
              return {
                type: "Literal",
                value: parseInt(digits, 16),
                location: location()
              };
            }
            function peg$f15(digits) {
              return {
                type: "Literal",
                value: parseInt(digits, 8),
                location: location()
              };
            }
            function peg$f16(chars) {
              return {
                type: "Literal",
                value: chars.join(""),
                location: location()
              };
            }
            function peg$f17(chars) {
              return {
                type: "Literal",
                value: chars.join(""),
                location: location()
              };
            }
            function peg$f18() {
              return text();
            }
            function peg$f19(sequence) {
              return sequence;
            }
            function peg$f20() {
              return text();
            }
            function peg$f21(sequence) {
              return sequence;
            }
            function peg$f22() {
              return "";
            }
            function peg$f23() {
              return "\0";
            }
            function peg$f24() {
              return "\b";
            }
            function peg$f25() {
              return "\f";
            }
            function peg$f26() {
              return "\n";
            }
            function peg$f27() {
              return "\r";
            }
            function peg$f28() {
              return "\t";
            }
            function peg$f29() {
              return "\v";
            }
            function peg$f30() {
              return text();
            }
            function peg$f31(digits) {
              return String.fromCharCode(parseInt(digits, 16));
            }
            function peg$f32(digits) {
              return String.fromCharCode(parseInt(digits, 16));
            }
            function peg$f33(pattern, flags) {
              var value;
              try {
                value = new RegExp(pattern, flags);
              } catch (e) {
                error(e.message);
              }
              return {
                type: "Literal",
                value: value,
                location: location()
              };
            }
            function peg$f34(expression) {
              return expression;
            }
            function peg$f35(elision) {
              return {
                type: "ArrayExpression",
                elements: optionalList(extractOptional(elision, 0)),
                location: location()
              };
            }
            function peg$f36(elements) {
              return {
                type: "ArrayExpression",
                elements: elements,
                location: location()
              };
            }
            function peg$f37(elements, elision) {
              return {
                type: "ArrayExpression",
                elements: elements.concat(optionalList(extractOptional(elision, 0))),
                location: location()
              };
            }
            function peg$f38(elision, element) {
              return optionalList(extractOptional(elision, 0)).concat(element);
            }
            function peg$f39(head, elision, element) {
              return optionalList(extractOptional(elision, 0)).concat(element);
            }
            function peg$f40(head, tail) {
              return Array.prototype.concat.apply(head, tail);
            }
            function peg$f41(commas) {
              return filledArray(commas.length + 1, null);
            }
            function peg$f42() {
              return {
                type: "ObjectExpression",
                properties: [],
                location: location()
              };
            }
            function peg$f43(properties) {
              return {
                type: "ObjectExpression",
                properties: properties,
                location: location()
              };
            }
            function peg$f44(properties) {
              return {
                type: "ObjectExpression",
                properties: properties,
                location: location()
              };
            }
            function peg$f45(head, tail) {
              return buildList(head, tail, 3);
            }
            function peg$f46(key, value) {
              return {
                type: "Property",
                key: key,
                value: value,
                kind: "init",
                location: location()
              };
            }
            function peg$f47(value) {
              return {
                "type": "Literal",
                "value": Number(value),
                location: location()
              };
            }
            function peg$f48(head, property) {
              return {
                property: property,
                computed: true,
                location: location()
              };
            }
            function peg$f49(head, property) {
              return {
                property: property,
                computed: false,
                location: location()
              };
            }
            function peg$f50(head, tail) {
              return tail.reduce(function (result, element) {
                return {
                  type: "MemberExpression",
                  object: result,
                  property: element.property,
                  computed: element.computed,
                  location: location()
                };
              }, head);
            }
            function peg$f51(callee, args) {
              return {
                type: "CallExpression",
                callee: callee,
                arguments: args,
                location: location()
              };
            }
            function peg$f52(head, args) {
              return {
                type: "CallExpression",
                arguments: args,
                location: location()
              };
            }
            function peg$f53(head, property) {
              return {
                type: "MemberExpression",
                property: property,
                computed: true,
                location: location()
              };
            }
            function peg$f54(head, property) {
              return {
                type: "MemberExpression",
                property: property,
                computed: false,
                location: location()
              };
            }
            function peg$f55(head, tail) {
              return tail.reduce(function (result, element) {
                element[TYPES_TO_PROPERTY_NAMES[element.type]] = result;
                return element;
              }, head);
            }
            function peg$f56(args) {
              return optionalList(extractOptional(args, 0));
            }
            function peg$f57(head, tail) {
              return buildList(head, tail, 3);
            }
            function peg$f58(identifier, argument) {
              return _objectSpread2(_objectSpread2({}, argument), {}, {
                NIWANGO_Identifier: identifier || undefined,
                location: location()
              });
            }
            function peg$f59(head, tail) {
              var list = buildList(head, tail, 3);
              if (list.length > 1) {
                return {
                  type: "BlockStatement",
                  __type: "AssignmentExpressions",
                  body: list,
                  location: location()
                };
              }
              return _objectSpread2({}, list[0]);
            }
            function peg$f60(identifier) {
              return identifier;
            }
            function peg$f61(argument, operator) {
              return {
                type: "UpdateExpression",
                operator: operator,
                argument: argument,
                prefix: false,
                location: location()
              };
            }
            function peg$f62(operator, argument) {
              var type = operator === "++" || operator === "--" ? "UpdateExpression" : "UnaryExpression";
              return {
                type: type,
                operator: operator,
                argument: argument,
                prefix: true,
                location: location()
              };
            }
            function peg$f63(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f64(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f65(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f66(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f67(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f68(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f69(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f70(head, tail) {
              return buildBinaryExpression(head, tail);
            }
            function peg$f71(head, tail) {
              return buildLogicalExpression(head, tail);
            }
            function peg$f72(head, tail) {
              return buildLogicalExpression(head, tail);
            }
            function peg$f73(test, consequent, alternate) {
              return {
                type: "ConditionalExpression",
                test: test,
                consequent: consequent,
                alternate: alternate,
                location: location()
              };
            }
            function peg$f74(left, right) {
              return {
                type: "AssignmentExpression",
                operator: "=",
                left: left,
                right: right,
                location: location()
              };
            }
            function peg$f75(left, right) {
              return {
                type: "VariableDeclaration",
                declarations: [{
                  type: "VariableDeclarator",
                  id: left,
                  init: right
                }],
                kind: "var",
                location: location()
              };
            }
            function peg$f76(left, operator, right) {
              return {
                type: "AssignmentExpression",
                operator: operator,
                left: left,
                right: right,
                location: location()
              };
            }
            function peg$f77(head, tail) {
              return tail.length > 0 ? {
                type: "SequenceExpression",
                expressions: buildList(head, tail, 3)
              } : head;
            }
            function peg$f78(body) {
              return {
                type: "BlockStatement",
                __type: "Block1",
                body: optionalList(extractOptional(body, 0)),
                location: location()
              };
            }
            function peg$f79(body) {
              return {
                type: "BlockStatement",
                __type: "Block2",
                body: optionalList(extractOptional(body, 0)),
                location: location()
              };
            }
            function peg$f80(head, tail) {
              return buildList(head, tail, 1);
            }
            function peg$f81(declarations) {
              return {
                type: "VariableDeclaration",
                declarations: declarations,
                kind: "var",
                location: location()
              };
            }
            function peg$f82(head, tail) {
              return buildList(head, tail, 3);
            }
            function peg$f83(id, init) {
              return {
                type: "VariableDeclarator",
                id: id,
                init: extractOptional(init, 1),
                location: location()
              };
            }
            function peg$f84(expression) {
              return expression;
            }
            function peg$f85() {
              return {
                type: "EmptyStatement",
                location: location()
              };
            }
            function peg$f86(expression) {
              return {
                type: "ExpressionStatement",
                expression: expression,
                location: location()
              };
            }
            function peg$f87(body) {
              return {
                type: "LambdaExpression",
                body: body,
                location: location()
              };
            }
            function peg$f88(body) {
              return {
                type: "LambdaExpression",
                body: body,
                location: location()
              };
            }
            function peg$f89(body) {
              return {
                type: "LambdaExpression",
                body: body,
                location: location()
              };
            }
            function peg$f90(body) {
              return {
                type: "BlockStatement",
                __type: "FunctionBody",
                body: optionalList(body),
                location: location()
              };
            }
            function peg$f91(body) {
              return {
                type: "Program",
                body: optionalList(body),
                location: location()
              };
            }
            function peg$f92(head, tail) {
              return buildList(head, tail, 1);
            }
            var peg$currPos = options.peg$currPos | 0;
            var peg$savedPos = peg$currPos;
            var peg$posDetailsCache = [{
              line: 1,
              column: 1
            }];
            var peg$maxFailPos = peg$currPos;
            var peg$maxFailExpected = options.peg$maxFailExpected || [];
            var peg$silentFails = options.peg$silentFails | 0;
            var peg$resultsCache = {};
            var peg$result;
            if ("startRule" in options) {
              if (!(options.startRule in peg$startRuleFunctions)) {
                throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
              }
              peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
            }
            function text() {
              return input.substring(peg$savedPos, peg$currPos);
            }
            function location() {
              return peg$computeLocation(peg$savedPos, peg$currPos);
            }
            function error(message, location) {
              location = location !== undefined ? location : peg$computeLocation(peg$savedPos, peg$currPos);
              throw peg$buildSimpleError(message, location);
            }
            function peg$getUnicode() {
              var pos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : peg$currPos;
              var cp = input.codePointAt(pos);
              if (cp === undefined) {
                return "";
              }
              return String.fromCodePoint(cp);
            }
            function peg$literalExpectation(text, ignoreCase) {
              return {
                type: "literal",
                text: text,
                ignoreCase: ignoreCase
              };
            }
            function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
              return {
                type: "class",
                parts: parts,
                inverted: inverted,
                ignoreCase: ignoreCase,
                unicode: unicode
              };
            }
            function peg$anyExpectation() {
              return {
                type: "any"
              };
            }
            function peg$endExpectation() {
              return {
                type: "end"
              };
            }
            function peg$otherExpectation(description) {
              return {
                type: "other",
                description: description
              };
            }
            function peg$computePosDetails(pos) {
              var details = peg$posDetailsCache[pos];
              var p;
              if (details) {
                return details;
              } else {
                if (pos >= peg$posDetailsCache.length) {
                  p = peg$posDetailsCache.length - 1;
                } else {
                  p = pos;
                  while (!peg$posDetailsCache[--p]) {}
                }
                details = peg$posDetailsCache[p];
                details = {
                  line: details.line,
                  column: details.column
                };
                while (p < pos) {
                  if (input.charCodeAt(p) === 10) {
                    details.line++;
                    details.column = 1;
                  } else {
                    details.column++;
                  }
                  p++;
                }
                peg$posDetailsCache[pos] = details;
                return details;
              }
            }
            function peg$computeLocation(startPos, endPos, offset) {
              var startPosDetails = peg$computePosDetails(startPos);
              var endPosDetails = peg$computePosDetails(endPos);
              var res = {
                source: peg$source,
                start: {
                  offset: startPos,
                  line: startPosDetails.line,
                  column: startPosDetails.column
                },
                end: {
                  offset: endPos,
                  line: endPosDetails.line,
                  column: endPosDetails.column
                }
              };
              return res;
            }
            function peg$fail(expected) {
              if (peg$currPos < peg$maxFailPos) {
                return;
              }
              if (peg$currPos > peg$maxFailPos) {
                peg$maxFailPos = peg$currPos;
                peg$maxFailExpected = [];
              }
              peg$maxFailExpected.push(expected);
            }
            function peg$buildSimpleError(message, location) {
              return new peg$SyntaxError(message, null, null, location);
            }
            function peg$buildStructuredError(expected, found, location) {
              return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
            }
            function peg$parseStart() {
              var s0, s2;
              var key = peg$currPos * 122 + 0;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              peg$parse__();
              s2 = peg$parseProgram();
              peg$parse__();
              peg$savedPos = s0;
              s0 = peg$f0(s2);
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSourceCharacter() {
              var s0;
              var key = peg$currPos * 122 + 1;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.length > peg$currPos) {
                s0 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e0);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseWhiteSpace() {
              var s0;
              var key = peg$currPos * 122 + 2;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = input.charAt(peg$currPos);
              if (peg$r0.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e2);
                }
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e1);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLineTerminator() {
              var s0;
              var key = peg$currPos * 122 + 3;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r1.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLineTerminatorSequence() {
              var s0;
              var key = peg$currPos * 122 + 4;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 10) {
                s0 = peg$c0;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e5);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c1) {
                  s0 = peg$c1;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e6);
                  }
                }
                if (s0 === peg$FAILED) {
                  s0 = input.charAt(peg$currPos);
                  if (peg$r2.test(s0)) {
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e7);
                    }
                  }
                }
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e4);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseComment() {
              var s0;
              var key = peg$currPos * 122 + 5;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$parseSingleLineComment();
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e8);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSingleLineComment() {
              var s0, s1, s2, s3, s4, s5;
              var key = peg$currPos * 122 + 6;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 35) {
                s1 = peg$c2;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e9);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$parseLineTerminator();
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                  s4 = undefined;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseSourceCharacter();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$currPos;
                  peg$silentFails++;
                  s5 = peg$parseLineTerminator();
                  peg$silentFails--;
                  if (s5 === peg$FAILED) {
                    s4 = undefined;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parseSourceCharacter();
                    if (s5 !== peg$FAILED) {
                      s4 = [s4, s5];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseIdentifier() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 7;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = peg$parseReservedWord();
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseIdentifierName();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f1(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e10);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseIdentifierName() {
              var s0, s4, s5, s6;
              var key = peg$currPos * 122 + 8;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$currPos;
              peg$parse__();
              if (input.charCodeAt(peg$currPos) === 47) {
                peg$currPos++;
              } else {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e11);
                }
              }
              peg$parse__();
              s4 = peg$parseIdentifierStart();
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseIdentifierPart();
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseIdentifierPart();
                }
                peg$savedPos = s0;
                s0 = peg$f2(s4, s5);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e10);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseIdentifierStart() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 9;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r3.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e12);
                }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                  s1 = peg$c4;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e13);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseUnicodeEscapeSequence();
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f3(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseIdentifierPart() {
              var s0;
              var key = peg$currPos * 122 + 10;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseIdentifierStart();
              if (s0 === peg$FAILED) {
                s0 = peg$parseUnicodeCombiningMark();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseUnicodeDigit();
                  if (s0 === peg$FAILED) {
                    s0 = input.charAt(peg$currPos);
                    if (peg$r4.test(s0)) {
                      peg$currPos++;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e14);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      s0 = input.charAt(peg$currPos);
                      if (peg$r5.test(s0)) {
                        peg$currPos++;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e15);
                        }
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseUnicodeCombiningMark() {
              var s0;
              var key = peg$currPos * 122 + 11;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r6.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e16);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseUnicodeDigit() {
              var s0;
              var key = peg$currPos * 122 + 12;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$parseNd();
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e17);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseReservedWord() {
              var s0;
              var key = peg$currPos * 122 + 13;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseNullLiteral();
              if (s0 === peg$FAILED) {
                s0 = peg$parseBooleanLiteral();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLiteral() {
              var s0;
              var key = peg$currPos * 122 + 14;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseNullLiteral();
              if (s0 === peg$FAILED) {
                s0 = peg$parseNilLiteral();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseBooleanLiteral();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseNumericLiteral();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseStringLiteral();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseRegularExpressionLiteral();
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNullLiteral() {
              var s0, s1;
              var key = peg$currPos * 122 + 15;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseNullToken();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f4();
              }
              s0 = s1;
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNilLiteral() {
              var s0, s1;
              var key = peg$currPos * 122 + 16;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseNilToken();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f5();
              }
              s0 = s1;
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBooleanLiteral() {
              var s0, s1;
              var key = peg$currPos * 122 + 17;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseTrueToken();
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f6();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseFalseToken();
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$f7();
                }
                s0 = s1;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNumericLiteral() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 18;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$currPos;
              s1 = peg$parseHexIntegerLiteral();
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierStart();
                if (s3 === peg$FAILED) {
                  s3 = peg$parseDecimalDigit();
                }
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = undefined;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f8(s1);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseOctalIntegerLiteral();
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  peg$silentFails++;
                  s3 = peg$parseIdentifierStart();
                  if (s3 === peg$FAILED) {
                    s3 = peg$parseDecimalDigit();
                  }
                  peg$silentFails--;
                  if (s3 === peg$FAILED) {
                    s2 = undefined;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f9(s1);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseDecimalLiteral();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parseIdentifierStart();
                    if (s3 === peg$FAILED) {
                      s3 = peg$parseDecimalDigit();
                    }
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                      s2 = undefined;
                    } else {
                      peg$currPos = s2;
                      s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f10(s1);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e17);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseDecimalLiteral() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 19;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseDecimalIntegerLiteral();
              if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s2 = peg$c5;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e18);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = [];
                  s4 = peg$parseDecimalDigit();
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseDecimalDigit();
                  }
                  s4 = peg$parseExponentPart();
                  if (s4 === peg$FAILED) {
                    s4 = null;
                  }
                  peg$savedPos = s0;
                  s0 = peg$f11();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 46) {
                  s1 = peg$c5;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e18);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = [];
                  s3 = peg$parseDecimalDigit();
                  if (s3 !== peg$FAILED) {
                    while (s3 !== peg$FAILED) {
                      s2.push(s3);
                      s3 = peg$parseDecimalDigit();
                    }
                  } else {
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parseExponentPart();
                    if (s3 === peg$FAILED) {
                      s3 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f12();
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseDecimalIntegerLiteral();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseExponentPart();
                    if (s2 === peg$FAILED) {
                      s2 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f13();
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseDecimalIntegerLiteral() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 20;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.charCodeAt(peg$currPos) === 48) {
                s0 = peg$c6;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e19);
                }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseNonZeroDigit();
                if (s1 !== peg$FAILED) {
                  s2 = [];
                  s3 = peg$parseDecimalDigit();
                  while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseDecimalDigit();
                  }
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseDecimalDigit() {
              var s0;
              var key = peg$currPos * 122 + 21;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r7.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e20);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNonZeroDigit() {
              var s0;
              var key = peg$currPos * 122 + 22;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r8.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e21);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseExponentPart() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 23;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseExponentIndicator();
              if (s1 !== peg$FAILED) {
                s2 = peg$parseSignedInteger();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseExponentIndicator() {
              var s0;
              var key = peg$currPos * 122 + 24;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (s0.toLowerCase() === peg$c7) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e22);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSignedInteger() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 25;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = input.charAt(peg$currPos);
              if (peg$r9.test(s1)) {
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e23);
                }
              }
              if (s1 === peg$FAILED) {
                s1 = null;
              }
              s2 = [];
              s3 = peg$parseDecimalDigit();
              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parseDecimalDigit();
                }
              } else {
                s2 = peg$FAILED;
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseHexIntegerLiteral() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 26;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = input.substr(peg$currPos, 2);
              if (s1.toLowerCase() === peg$c8) {
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e24);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = [];
                s4 = peg$parseHexDigit();
                if (s4 !== peg$FAILED) {
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseHexDigit();
                  }
                } else {
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = input.substring(s2, peg$currPos);
                } else {
                  s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f14(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseOctalIntegerLiteral() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 27;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = input.charAt(peg$currPos);
              if (s1.toLowerCase() === peg$c6) {
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e25);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = [];
                s4 = peg$parseOctalDigit();
                if (s4 !== peg$FAILED) {
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseOctalDigit();
                  }
                } else {
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = input.substring(s2, peg$currPos);
                } else {
                  s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f15(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseHexDigit() {
              var s0;
              var key = peg$currPos * 122 + 28;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r10.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e26);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseOctalDigit() {
              var s0;
              var key = peg$currPos * 122 + 29;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r11.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e27);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseStringLiteral() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 30;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 34) {
                s1 = peg$c9;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e29);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseDoubleStringCharacter();
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parseDoubleStringCharacter();
                }
                if (input.charCodeAt(peg$currPos) === 34) {
                  s3 = peg$c9;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e29);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f16(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 39) {
                  s1 = peg$c10;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e30);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = [];
                  s3 = peg$parseSingleStringCharacter();
                  while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parseSingleStringCharacter();
                  }
                  if (input.charCodeAt(peg$currPos) === 39) {
                    s3 = peg$c10;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e30);
                    }
                  }
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f17(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e28);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseDoubleStringCharacter() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 31;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = input.charAt(peg$currPos);
              if (peg$r12.test(s2)) {
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e31);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f18();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                  s1 = peg$c4;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e13);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseEscapeSequence();
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f19(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$parseLineContinuation();
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSingleStringCharacter() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 32;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = input.charAt(peg$currPos);
              if (peg$r13.test(s2)) {
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e32);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f20();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 92) {
                  s1 = peg$c4;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e13);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseEscapeSequence();
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f21(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$parseLineContinuation();
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLineContinuation() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 33;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c4;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e13);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseLineTerminatorSequence();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f22();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEscapeSequence() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 34;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseCharacterEscapeSequence();
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 48) {
                  s1 = peg$c6;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e19);
                  }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  peg$silentFails++;
                  s3 = peg$parseDecimalDigit();
                  peg$silentFails--;
                  if (s3 === peg$FAILED) {
                    s2 = undefined;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f23();
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$parseHexEscapeSequence();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseUnicodeEscapeSequence();
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseCharacterEscapeSequence() {
              var s0;
              var key = peg$currPos * 122 + 35;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseSingleEscapeCharacter();
              if (s0 === peg$FAILED) {
                s0 = peg$parseNonEscapeCharacter();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSingleEscapeCharacter() {
              var s0, s1;
              var key = peg$currPos * 122 + 36;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r14.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e33);
                }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 98) {
                  s1 = peg$c11;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e34);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$f24();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 102) {
                    s1 = peg$c12;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e35);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f25();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 110) {
                      s1 = peg$c13;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e36);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f26();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 114) {
                        s1 = peg$c14;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e37);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f27();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 116) {
                          s1 = peg$c15;
                          peg$currPos++;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e38);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$f28();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 118) {
                            s1 = peg$c16;
                            peg$currPos++;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e39);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f29();
                          }
                          s0 = s1;
                        }
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNonEscapeCharacter() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 37;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = peg$parseEscapeCharacter();
              if (s2 === peg$FAILED) {
                s2 = peg$parseLineTerminator();
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f30();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEscapeCharacter() {
              var s0;
              var key = peg$currPos * 122 + 38;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseSingleEscapeCharacter();
              if (s0 === peg$FAILED) {
                s0 = input.charAt(peg$currPos);
                if (peg$r15.test(s0)) {
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e40);
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseHexEscapeSequence() {
              var s0, s1, s2, s3, s4, s5;
              var key = peg$currPos * 122 + 39;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 120) {
                s1 = peg$c17;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e41);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$currPos;
                s4 = peg$parseHexDigit();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseHexDigit();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = input.substring(s2, peg$currPos);
                } else {
                  s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f31(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseUnicodeEscapeSequence() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 40;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 117) {
                s1 = peg$c18;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e42);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$currPos;
                s4 = peg$parseHexDigit();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseHexDigit();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parseHexDigit();
                    if (s6 !== peg$FAILED) {
                      s7 = peg$parseHexDigit();
                      if (s7 !== peg$FAILED) {
                        s4 = [s4, s5, s6, s7];
                        s3 = s4;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = input.substring(s2, peg$currPos);
                } else {
                  s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f32(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionLiteral() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 41;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              peg$silentFails++;
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 47) {
                s1 = peg$c3;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e11);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parseRegularExpressionBody();
                if (s3 !== peg$FAILED) {
                  s2 = input.substring(s2, peg$currPos);
                } else {
                  s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 47) {
                    s3 = peg$c3;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e11);
                    }
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = peg$currPos;
                    peg$parseRegularExpressionFlags();
                    s4 = input.substring(s4, peg$currPos);
                    peg$savedPos = s0;
                    s0 = peg$f33(s2, s4);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$silentFails--;
              if (s0 === peg$FAILED) {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e43);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionBody() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 42;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseRegularExpressionFirstChar();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseRegularExpressionChar();
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parseRegularExpressionChar();
                }
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionFirstChar() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 43;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = input.charAt(peg$currPos);
              if (peg$r16.test(s2)) {
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e44);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionBackslashSequence();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseRegularExpressionClass();
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionChar() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 44;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = input.charAt(peg$currPos);
              if (peg$r17.test(s2)) {
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e45);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionBackslashSequence();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseRegularExpressionClass();
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionBackslashSequence() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 45;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 92) {
                s1 = peg$c4;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e13);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionNonTerminator() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 46;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = peg$parseLineTerminator();
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceCharacter();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionClass() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 47;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c19;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e46);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parseRegularExpressionClassChar();
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parseRegularExpressionClassChar();
                }
                if (input.charCodeAt(peg$currPos) === 93) {
                  s3 = peg$c20;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e47);
                  }
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionClassChar() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 48;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              s2 = input.charAt(peg$currPos);
              if (peg$r18.test(s2)) {
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e48);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseRegularExpressionNonTerminator();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseRegularExpressionBackslashSequence();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRegularExpressionFlags() {
              var s0, s1;
              var key = peg$currPos * 122 + 49;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = [];
              s1 = peg$parseIdentifierPart();
              while (s1 !== peg$FAILED) {
                s0.push(s1);
                s1 = peg$parseIdentifierPart();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNd() {
              var s0;
              var key = peg$currPos * 122 + 50;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = input.charAt(peg$currPos);
              if (peg$r19.test(s0)) {
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e49);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseFalseToken() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 51;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 5) === peg$c21) {
                s1 = peg$c21;
                peg$currPos += 5;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e50);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = undefined;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLambdaToken1() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 52;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 6) === peg$c22) {
                s1 = peg$c22;
                peg$currPos += 6;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e51);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = undefined;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLambdaToken2() {
              var s0;
              var key = peg$currPos * 122 + 53;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.charCodeAt(peg$currPos) === 92) {
                s0 = peg$c4;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e13);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNullToken() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 54;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 4) === peg$c23) {
                s1 = peg$c23;
                peg$currPos += 4;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e52);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = undefined;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseNilToken() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 55;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 3) === peg$c24) {
                s1 = peg$c24;
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e53);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = undefined;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseTrueToken() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 56;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 4) === peg$c25) {
                s1 = peg$c25;
                peg$currPos += 4;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e54);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                peg$silentFails++;
                s3 = peg$parseIdentifierPart();
                peg$silentFails--;
                if (s3 === peg$FAILED) {
                  s2 = undefined;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parse__() {
              var s0, s1;
              var key = peg$currPos * 122 + 57;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = [];
              s1 = peg$parseWhiteSpace();
              if (s1 === peg$FAILED) {
                s1 = peg$parseLineTerminatorSequence();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseComment();
                }
              }
              while (s1 !== peg$FAILED) {
                s0.push(s1);
                s1 = peg$parseWhiteSpace();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseLineTerminatorSequence();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseComment();
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parse_() {
              var s0, s1;
              var key = peg$currPos * 122 + 58;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = [];
              s1 = peg$parseWhiteSpace();
              while (s1 !== peg$FAILED) {
                s0.push(s1);
                s1 = peg$parseWhiteSpace();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEOS() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 59;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parse__();
              if (input.charCodeAt(peg$currPos) === 59) {
                s2 = peg$c26;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e55);
                }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parse_();
                s2 = peg$parseSingleLineComment();
                if (s2 === peg$FAILED) {
                  s2 = null;
                }
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = peg$parseLineTerminatorSequence();
                peg$silentFails--;
                if (s4 !== peg$FAILED) {
                  peg$currPos = s3;
                  s3 = undefined;
                } else {
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parse_();
                  s2 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s3 = peg$c27;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e56);
                    }
                  }
                  peg$silentFails--;
                  if (s3 !== peg$FAILED) {
                    peg$currPos = s2;
                    s2 = undefined;
                  } else {
                    s2 = peg$FAILED;
                  }
                  if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$parse__();
                    s2 = peg$parseEOF();
                    if (s2 !== peg$FAILED) {
                      s1 = [s1, s2];
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      s1 = peg$parse_();
                      s2 = peg$currPos;
                      peg$silentFails++;
                      if (input.charCodeAt(peg$currPos) === 41) {
                        s3 = peg$c28;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e57);
                        }
                      }
                      peg$silentFails--;
                      if (s3 !== peg$FAILED) {
                        peg$currPos = s2;
                        s2 = undefined;
                      } else {
                        s2 = peg$FAILED;
                      }
                      if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEOF() {
              var s0, s1;
              var key = peg$currPos * 122 + 60;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              peg$silentFails++;
              if (input.length > peg$currPos) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e0);
                }
              }
              peg$silentFails--;
              if (s1 === peg$FAILED) {
                s0 = undefined;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parsePrimaryExpression() {
              var s0, s1, s3, s5;
              var key = peg$currPos * 122 + 61;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c29;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e58);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$parseExpression();
                if (s3 !== peg$FAILED) {
                  peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s5 = peg$c28;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e57);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f34(s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseIdentifier();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseLiteral();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseArrayLiteral();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseObjectLiteral();
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseArrayLiteral() {
              var s0, s1, s3, s4, s5, s7, s8, s9;
              var key = peg$currPos * 122 + 62;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c19;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e46);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$currPos;
                s4 = peg$parseElision();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse__();
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 === peg$FAILED) {
                  s3 = null;
                }
                if (input.charCodeAt(peg$currPos) === 93) {
                  s4 = peg$c20;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e47);
                  }
                }
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f35(s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 91) {
                  s1 = peg$c19;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e46);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$parse__();
                  s3 = peg$parseElementList();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s5 = peg$c20;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e47);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f36(s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 91) {
                    s1 = peg$c19;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e46);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$parse__();
                    s3 = peg$parseElementList();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parse__();
                      if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c30;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e59);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        peg$parse__();
                        s7 = peg$currPos;
                        s8 = peg$parseElision();
                        if (s8 !== peg$FAILED) {
                          s9 = peg$parse__();
                          s8 = [s8, s9];
                          s7 = s8;
                        } else {
                          peg$currPos = s7;
                          s7 = peg$FAILED;
                        }
                        if (s7 === peg$FAILED) {
                          s7 = null;
                        }
                        if (input.charCodeAt(peg$currPos) === 93) {
                          s8 = peg$c20;
                          peg$currPos++;
                        } else {
                          s8 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e47);
                          }
                        }
                        if (s8 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f37(s3, s7);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseElementList() {
              var s0, s1, s2, s3, s4, s5, s7, s8, s9;
              var key = peg$currPos * 122 + 63;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              s2 = peg$currPos;
              s3 = peg$parseElision();
              if (s3 !== peg$FAILED) {
                s4 = peg$parse__();
                s3 = [s3, s4];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
              if (s2 === peg$FAILED) {
                s2 = null;
              }
              s3 = peg$parseAssignmentExpression();
              if (s3 !== peg$FAILED) {
                peg$savedPos = s1;
                s1 = peg$f38(s2, s3);
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c30;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                  }
                }
                if (s5 !== peg$FAILED) {
                  peg$parse__();
                  s7 = peg$currPos;
                  s8 = peg$parseElision();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parse__();
                    s8 = [s8, s9];
                    s7 = s8;
                  } else {
                    peg$currPos = s7;
                    s7 = peg$FAILED;
                  }
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  s8 = peg$parseAssignmentExpression();
                  if (s8 !== peg$FAILED) {
                    peg$savedPos = s3;
                    s3 = peg$f39(s1, s7, s8);
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c30;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$parse__();
                    s7 = peg$currPos;
                    s8 = peg$parseElision();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      s8 = [s8, s9];
                      s7 = s8;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$FAILED;
                    }
                    if (s7 === peg$FAILED) {
                      s7 = null;
                    }
                    s8 = peg$parseAssignmentExpression();
                    if (s8 !== peg$FAILED) {
                      peg$savedPos = s3;
                      s3 = peg$f39(s1, s7, s8);
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f40(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseElision() {
              var s0, s1, s2, s3, s4, s5;
              var key = peg$currPos * 122 + 64;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s1 = peg$c30;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e59);
                }
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c30;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c30;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f41(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseObjectLiteral() {
              var s0, s1, s3, s5, s7;
              var key = peg$currPos * 122 + 65;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 123) {
                s1 = peg$c31;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e60);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 125) {
                  s3 = peg$c27;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e56);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f42();
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 123) {
                  s1 = peg$c31;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e60);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$parse__();
                  s3 = peg$parsePropertyNameAndValueList();
                  if (s3 !== peg$FAILED) {
                    peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s5 = peg$c27;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e56);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f43(s3);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 123) {
                    s1 = peg$c31;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e60);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$parse__();
                    s3 = peg$parsePropertyNameAndValueList();
                    if (s3 !== peg$FAILED) {
                      peg$parse__();
                      if (input.charCodeAt(peg$currPos) === 44) {
                        s5 = peg$c30;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e59);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 125) {
                          s7 = peg$c27;
                          peg$currPos++;
                        } else {
                          s7 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e56);
                          }
                        }
                        if (s7 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s0 = peg$f44(s3);
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parsePropertyNameAndValueList() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 66;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parsePropertyAssignment();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c30;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parsePropertyAssignment();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c30;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parsePropertyAssignment();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f45(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parsePropertyAssignment() {
              var s0, s1, s3, s5;
              var key = peg$currPos * 122 + 67;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parsePropertyName();
              if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 58) {
                  s3 = peg$c32;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e61);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$parse__();
                  s5 = peg$parseAssignmentExpression();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f46(s1, s5);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parsePropertyName() {
              var s0;
              var key = peg$currPos * 122 + 68;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseIdentifierName();
              if (s0 === peg$FAILED) {
                s0 = peg$parseStringLiteral();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseNumericLiteral();
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseMemberExpression() {
              var s0, s1, s2, s3, s4, s5, s7, s9;
              var key = peg$currPos * 122 + 69;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parsePrimaryExpression();
              if (s1 === peg$FAILED) {
                s1 = peg$currPos;
                s2 = peg$currPos;
                s3 = [];
                s4 = peg$parseUnicodeDigit();
                if (s4 !== peg$FAILED) {
                  while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parseUnicodeDigit();
                  }
                } else {
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = input.substring(s2, peg$currPos);
                } else {
                  s2 = s3;
                }
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s1;
                  s2 = peg$f47(s2);
                }
                s1 = s2;
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 91) {
                  s5 = peg$c19;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e46);
                  }
                }
                if (s5 !== peg$FAILED) {
                  peg$parse__();
                  s7 = peg$parseExpression();
                  if (s7 !== peg$FAILED) {
                    peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s9 = peg$c20;
                      peg$currPos++;
                    } else {
                      s9 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e47);
                      }
                    }
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s3;
                      s3 = peg$f48(s1, s7);
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s5 = peg$c5;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e18);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$parse__();
                    s7 = peg$parseIdentifierName();
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s3;
                      s3 = peg$f49(s1, s7);
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 91) {
                    s5 = peg$c19;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e46);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$parse__();
                    s7 = peg$parseExpression();
                    if (s7 !== peg$FAILED) {
                      peg$parse__();
                      if (input.charCodeAt(peg$currPos) === 93) {
                        s9 = peg$c20;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e47);
                        }
                      }
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s3;
                        s3 = peg$f48(s1, s7);
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 === peg$FAILED) {
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 46) {
                      s5 = peg$c5;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e18);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$parse__();
                      s7 = peg$parseIdentifierName();
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s3;
                        s3 = peg$f49(s1, s7);
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f50(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseCallExpression() {
              var s0, s1, s2, s3, s4, s5, s7, s9;
              var key = peg$currPos * 122 + 70;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              s2 = peg$parseMemberExpression();
              if (s2 !== peg$FAILED) {
                s3 = peg$parse__();
                s4 = peg$parseArguments();
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s1;
                  s1 = peg$f51(s2, s4);
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseArguments();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s3;
                  s3 = peg$f52(s1, s5);
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 === peg$FAILED) {
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 91) {
                    s5 = peg$c19;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e46);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    peg$parse__();
                    s7 = peg$parseExpression();
                    if (s7 !== peg$FAILED) {
                      peg$parse__();
                      if (input.charCodeAt(peg$currPos) === 93) {
                        s9 = peg$c20;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e47);
                        }
                      }
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s3;
                        s3 = peg$f53(s1, s7);
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 === peg$FAILED) {
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 46) {
                      s5 = peg$c5;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e18);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$parse__();
                      s7 = peg$parseIdentifierName();
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s3;
                        s3 = peg$f54(s1, s7);
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  }
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseArguments();
                  if (s5 !== peg$FAILED) {
                    peg$savedPos = s3;
                    s3 = peg$f52(s1, s5);
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 === peg$FAILED) {
                    s3 = peg$currPos;
                    s4 = peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 91) {
                      s5 = peg$c19;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e46);
                      }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$parse__();
                      s7 = peg$parseExpression();
                      if (s7 !== peg$FAILED) {
                        peg$parse__();
                        if (input.charCodeAt(peg$currPos) === 93) {
                          s9 = peg$c20;
                          peg$currPos++;
                        } else {
                          s9 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e47);
                          }
                        }
                        if (s9 !== peg$FAILED) {
                          peg$savedPos = s3;
                          s3 = peg$f53(s1, s7);
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    if (s3 === peg$FAILED) {
                      s3 = peg$currPos;
                      s4 = peg$parse__();
                      if (input.charCodeAt(peg$currPos) === 46) {
                        s5 = peg$c5;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e18);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        peg$parse__();
                        s7 = peg$parseIdentifierName();
                        if (s7 !== peg$FAILED) {
                          peg$savedPos = s3;
                          s3 = peg$f54(s1, s7);
                        } else {
                          peg$currPos = s3;
                          s3 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                    }
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f55(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseArguments() {
              var s0, s1, s3, s4, s5;
              var key = peg$currPos * 122 + 71;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c29;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e58);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$currPos;
                s4 = peg$parseArgumentList();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse__();
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 === peg$FAILED) {
                  s3 = null;
                }
                if (input.charCodeAt(peg$currPos) === 41) {
                  s4 = peg$c28;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e57);
                  }
                }
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f56(s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseArgumentList() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 72;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseArgumentWithName();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c30;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseArgumentWithName();
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c30;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseArgumentWithName();
                    if (s7 === peg$FAILED) {
                      s7 = null;
                    }
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f57(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseArgumentWithName() {
              var s0, s1, s3;
              var key = peg$currPos * 122 + 73;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseArgumentName();
              if (s1 === peg$FAILED) {
                s1 = null;
              }
              peg$parse__();
              s3 = peg$parseAssignmentExpressions();
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f58(s1, s3);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseAssignmentExpressions() {
              var s0, s3, s4, s5, s6, s7, s8, s9;
              var key = peg$currPos * 122 + 74;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 59) {
                peg$currPos++;
              } else {
                if (peg$silentFails === 0) {
                  peg$fail(peg$e55);
                }
              }
              peg$parse__();
              s3 = peg$parseAssignmentExpression();
              if (s3 !== peg$FAILED) {
                s4 = [];
                s5 = peg$currPos;
                s6 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 59) {
                  s7 = peg$c26;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e55);
                  }
                }
                if (s7 === peg$FAILED) {
                  s7 = null;
                }
                s8 = peg$parse__();
                s9 = peg$parseAssignmentExpression();
                if (s9 !== peg$FAILED) {
                  s6 = [s6, s7, s8, s9];
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
                while (s5 !== peg$FAILED) {
                  s4.push(s5);
                  s5 = peg$currPos;
                  s6 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 59) {
                    s7 = peg$c26;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e55);
                    }
                  }
                  if (s7 === peg$FAILED) {
                    s7 = null;
                  }
                  s8 = peg$parse__();
                  s9 = peg$parseAssignmentExpression();
                  if (s9 !== peg$FAILED) {
                    s6 = [s6, s7, s8, s9];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                }
                if (input.charCodeAt(peg$currPos) === 59) {
                  s5 = peg$c26;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e55);
                  }
                }
                if (s5 === peg$FAILED) {
                  s5 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f59(s3, s4);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseArgumentName() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 75;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseIdentifier();
              if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                  s2 = peg$c32;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e61);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s4 = peg$c33;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e62);
                    }
                  }
                  peg$silentFails--;
                  if (s4 === peg$FAILED) {
                    s3 = undefined;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f60(s1);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLeftHandSideExpression() {
              var s0;
              var key = peg$currPos * 122 + 76;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseLambdaExpression();
              if (s0 === peg$FAILED) {
                s0 = peg$parseCallExpression();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseMemberExpression();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseEmptyStatement();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseVariableStatement();
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parsePostfixExpression() {
              var s0, s1, s3;
              var key = peg$currPos * 122 + 77;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLeftHandSideExpression();
              if (s1 !== peg$FAILED) {
                peg$parse_();
                s3 = peg$parsePostfixOperator();
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f61(s1, s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseLeftHandSideExpression();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parsePostfixOperator() {
              var s0;
              var key = peg$currPos * 122 + 78;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 2) === peg$c34) {
                s0 = peg$c34;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e63);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c35) {
                  s0 = peg$c35;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e64);
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseUnaryExpression() {
              var s0, s1, s3;
              var key = peg$currPos * 122 + 79;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parsePostfixExpression();
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseUnaryOperator();
                if (s1 !== peg$FAILED) {
                  peg$parse__();
                  s3 = peg$parseUnaryExpression();
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f62(s1, s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseUnaryOperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 80;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 2) === peg$c34) {
                s0 = peg$c34;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e63);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c35) {
                  s0 = peg$c35;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e64);
                  }
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 43) {
                    s2 = peg$c36;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e65);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s4 = peg$c33;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e62);
                      }
                    }
                    peg$silentFails--;
                    if (s4 === peg$FAILED) {
                      s3 = undefined;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                      s2 = [s2, s3];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    s0 = input.substring(s0, peg$currPos);
                  } else {
                    s0 = s1;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 45) {
                      s2 = peg$c37;
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e66);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$currPos;
                      peg$silentFails++;
                      if (input.charCodeAt(peg$currPos) === 61) {
                        s4 = peg$c33;
                        peg$currPos++;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e62);
                        }
                      }
                      peg$silentFails--;
                      if (s4 === peg$FAILED) {
                        s3 = undefined;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                      if (s3 !== peg$FAILED) {
                        s2 = [s2, s3];
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                      s0 = input.substring(s0, peg$currPos);
                    } else {
                      s0 = s1;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = input.charAt(peg$currPos);
                      if (peg$r20.test(s0)) {
                        peg$currPos++;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e67);
                        }
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseMultiplicativeExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 81;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseUnaryExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseMultiplicativeOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseUnaryExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseMultiplicativeOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseUnaryExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f63(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseMultiplicativeOperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 82;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 42) {
                s2 = peg$c38;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e68);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 61) {
                  s4 = peg$c33;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = undefined;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
              } else {
                s0 = s1;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 47) {
                  s2 = peg$c3;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e11);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s4 = peg$c33;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e62);
                    }
                  }
                  peg$silentFails--;
                  if (s4 === peg$FAILED) {
                    s3 = undefined;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                  s0 = input.substring(s0, peg$currPos);
                } else {
                  s0 = s1;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 37) {
                    s2 = peg$c39;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e69);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s4 = peg$c33;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e62);
                      }
                    }
                    peg$silentFails--;
                    if (s4 === peg$FAILED) {
                      s3 = undefined;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                      s2 = [s2, s3];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    s0 = input.substring(s0, peg$currPos);
                  } else {
                    s0 = s1;
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseAdditiveExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 83;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseMultiplicativeExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseAdditiveOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseMultiplicativeExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseAdditiveOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseMultiplicativeExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f64(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseAdditiveOperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 84;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 43) {
                s2 = peg$c36;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e65);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = input.charAt(peg$currPos);
                if (peg$r21.test(s4)) {
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e70);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = undefined;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
              } else {
                s0 = s1;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 45) {
                  s2 = peg$c37;
                  peg$currPos++;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e66);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  peg$silentFails++;
                  s4 = input.charAt(peg$currPos);
                  if (peg$r22.test(s4)) {
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e71);
                    }
                  }
                  peg$silentFails--;
                  if (s4 === peg$FAILED) {
                    s3 = undefined;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                  s0 = input.substring(s0, peg$currPos);
                } else {
                  s0 = s1;
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseShiftExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 85;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseAdditiveExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseShiftOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseAdditiveExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseShiftOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseAdditiveExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f65(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseShiftOperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 86;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c40) {
                s2 = peg$c40;
                peg$currPos += 2;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e72);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 61) {
                  s4 = peg$c33;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = undefined;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
              } else {
                s0 = s1;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$currPos;
                if (input.substr(peg$currPos, 3) === peg$c41) {
                  s2 = peg$c41;
                  peg$currPos += 3;
                } else {
                  s2 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e73);
                  }
                }
                if (s2 !== peg$FAILED) {
                  s3 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s4 = peg$c33;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e62);
                    }
                  }
                  peg$silentFails--;
                  if (s4 === peg$FAILED) {
                    s3 = undefined;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 !== peg$FAILED) {
                    s2 = [s2, s3];
                    s1 = s2;
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
                if (s1 !== peg$FAILED) {
                  s0 = input.substring(s0, peg$currPos);
                } else {
                  s0 = s1;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c42) {
                    s2 = peg$c42;
                    peg$currPos += 2;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e74);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s4 = peg$c33;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e62);
                      }
                    }
                    peg$silentFails--;
                    if (s4 === peg$FAILED) {
                      s3 = undefined;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                      s2 = [s2, s3];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    s0 = input.substring(s0, peg$currPos);
                  } else {
                    s0 = s1;
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRelationalExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 87;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseShiftExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseRelationalOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseShiftExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseRelationalOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseShiftExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f66(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseRelationalOperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 88;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 2) === peg$c43) {
                s0 = peg$c43;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e75);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c44) {
                  s0 = peg$c44;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e76);
                  }
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 60) {
                    s2 = peg$c45;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e77);
                    }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 60) {
                      s4 = peg$c45;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e77);
                      }
                    }
                    peg$silentFails--;
                    if (s4 === peg$FAILED) {
                      s3 = undefined;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                    if (s3 !== peg$FAILED) {
                      s2 = [s2, s3];
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                  if (s1 !== peg$FAILED) {
                    s0 = input.substring(s0, peg$currPos);
                  } else {
                    s0 = s1;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 62) {
                      s2 = peg$c46;
                      peg$currPos++;
                    } else {
                      s2 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e78);
                      }
                    }
                    if (s2 !== peg$FAILED) {
                      s3 = peg$currPos;
                      peg$silentFails++;
                      if (input.charCodeAt(peg$currPos) === 62) {
                        s4 = peg$c46;
                        peg$currPos++;
                      } else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e78);
                        }
                      }
                      peg$silentFails--;
                      if (s4 === peg$FAILED) {
                        s3 = undefined;
                      } else {
                        peg$currPos = s3;
                        s3 = peg$FAILED;
                      }
                      if (s3 !== peg$FAILED) {
                        s2 = [s2, s3];
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                      s0 = input.substring(s0, peg$currPos);
                    } else {
                      s0 = s1;
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEqualityExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 89;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseRelationalExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseEqualityOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseRelationalExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseEqualityOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseRelationalExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f67(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEqualityOperator() {
              var s0;
              var key = peg$currPos * 122 + 90;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 3) === peg$c47) {
                s0 = peg$c47;
                peg$currPos += 3;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e79);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c48) {
                  s0 = peg$c48;
                  peg$currPos += 3;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e80);
                  }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c49) {
                    s0 = peg$c49;
                    peg$currPos += 2;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e81);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c50) {
                      s0 = peg$c50;
                      peg$currPos += 2;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e82);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c51) {
                        s0 = peg$c51;
                        peg$currPos += 2;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e83);
                        }
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBitwiseANDExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 91;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseEqualityExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseBitwiseANDOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseEqualityExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseBitwiseANDOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseEqualityExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f68(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBitwiseANDOperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 92;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 38) {
                s2 = peg$c52;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e84);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = input.charAt(peg$currPos);
                if (peg$r23.test(s4)) {
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e85);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = undefined;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
              } else {
                s0 = s1;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBitwiseXORExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 93;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseBitwiseANDExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseBitwiseXOROperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseBitwiseANDExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseBitwiseXOROperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseBitwiseANDExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f69(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBitwiseXOROperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 94;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 94) {
                s2 = peg$c53;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e86);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                if (input.charCodeAt(peg$currPos) === 61) {
                  s4 = peg$c33;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = undefined;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
              } else {
                s0 = s1;
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c54) {
                  s0 = peg$c54;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e87);
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBitwiseORExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 95;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseBitwiseXORExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseBitwiseOROperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseBitwiseXORExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseBitwiseOROperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseBitwiseXORExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f70(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBitwiseOROperator() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 96;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 124) {
                s2 = peg$c55;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e88);
                }
              }
              if (s2 !== peg$FAILED) {
                s3 = peg$currPos;
                peg$silentFails++;
                s4 = input.charAt(peg$currPos);
                if (peg$r24.test(s4)) {
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e89);
                  }
                }
                peg$silentFails--;
                if (s4 === peg$FAILED) {
                  s3 = undefined;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 !== peg$FAILED) {
                  s2 = [s2, s3];
                  s1 = s2;
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s0 = input.substring(s0, peg$currPos);
              } else {
                s0 = s1;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLogicalANDExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 97;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseBitwiseORExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseLogicalANDOperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseBitwiseORExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseLogicalANDOperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseBitwiseORExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f71(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLogicalANDOperator() {
              var s0;
              var key = peg$currPos * 122 + 98;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 2) === peg$c56) {
                s0 = peg$c56;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e90);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLogicalORExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 99;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLogicalANDExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseLogicalOROperator();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseLogicalANDExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseLogicalOROperator();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseLogicalANDExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f72(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLogicalOROperator() {
              var s0;
              var key = peg$currPos * 122 + 100;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 2) === peg$c57) {
                s0 = peg$c57;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e91);
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseConditionalExpression() {
              var s0, s1, s3, s5, s7, s9;
              var key = peg$currPos * 122 + 101;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLogicalORExpression();
              if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 63) {
                  s3 = peg$c58;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e92);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$parse__();
                  s5 = peg$parseAssignmentExpression();
                  if (s5 !== peg$FAILED) {
                    peg$parse__();
                    if (input.charCodeAt(peg$currPos) === 58) {
                      s7 = peg$c32;
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e61);
                      }
                    }
                    if (s7 !== peg$FAILED) {
                      peg$parse__();
                      s9 = peg$parseAssignmentExpression();
                      if (s9 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f73(s1, s5, s9);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseLogicalORExpression();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseAssignmentExpression() {
              var s0, s1, s3, s4, s5, s6;
              var key = peg$currPos * 122 + 102;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLeftHandSideExpression();
              if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 61) {
                  s3 = peg$c33;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                  }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$currPos;
                  peg$silentFails++;
                  if (input.charCodeAt(peg$currPos) === 61) {
                    s5 = peg$c33;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e62);
                    }
                  }
                  peg$silentFails--;
                  if (s5 === peg$FAILED) {
                    s4 = undefined;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    s6 = peg$parseAssignmentExpression();
                    if (s6 === peg$FAILED) {
                      s6 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f74(s1, s6);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseLeftHandSideExpression();
                if (s1 !== peg$FAILED) {
                  peg$parse__();
                  if (input.substr(peg$currPos, 2) === peg$c59) {
                    s3 = peg$c59;
                    peg$currPos += 2;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e93);
                    }
                  }
                  if (s3 !== peg$FAILED) {
                    s4 = peg$currPos;
                    peg$silentFails++;
                    if (input.charCodeAt(peg$currPos) === 61) {
                      s5 = peg$c33;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e62);
                      }
                    }
                    peg$silentFails--;
                    if (s5 === peg$FAILED) {
                      s4 = undefined;
                    } else {
                      peg$currPos = s4;
                      s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                      s5 = peg$parse__();
                      s6 = peg$parseAssignmentExpression();
                      if (s6 === peg$FAILED) {
                        s6 = null;
                      }
                      peg$savedPos = s0;
                      s0 = peg$f75(s1, s6);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseLeftHandSideExpression();
                  if (s1 !== peg$FAILED) {
                    peg$parse__();
                    s3 = peg$parseAssignmentOperator();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parse__();
                      s5 = peg$parseAssignmentExpression();
                      if (s5 === peg$FAILED) {
                        s5 = null;
                      }
                      peg$savedPos = s0;
                      s0 = peg$f76(s1, s3, s5);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseConditionalExpression();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseBlock();
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseAssignmentOperator() {
              var s0;
              var key = peg$currPos * 122 + 103;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              if (input.substr(peg$currPos, 2) === peg$c60) {
                s0 = peg$c60;
                peg$currPos += 2;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e94);
                }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c61) {
                  s0 = peg$c61;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e95);
                  }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 2) === peg$c62) {
                    s0 = peg$c62;
                    peg$currPos += 2;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e96);
                    }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 2) === peg$c63) {
                      s0 = peg$c63;
                      peg$currPos += 2;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e97);
                      }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 2) === peg$c64) {
                        s0 = peg$c64;
                        peg$currPos += 2;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e98);
                        }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c65) {
                          s0 = peg$c65;
                          peg$currPos += 3;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e99);
                          }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 3) === peg$c66) {
                            s0 = peg$c66;
                            peg$currPos += 3;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e100);
                            }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 4) === peg$c67) {
                              s0 = peg$c67;
                              peg$currPos += 4;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e101);
                              }
                            }
                            if (s0 === peg$FAILED) {
                              if (input.substr(peg$currPos, 2) === peg$c68) {
                                s0 = peg$c68;
                                peg$currPos += 2;
                              } else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e102);
                                }
                              }
                              if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2) === peg$c69) {
                                  s0 = peg$c69;
                                  peg$currPos += 2;
                                } else {
                                  s0 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e103);
                                  }
                                }
                                if (s0 === peg$FAILED) {
                                  if (input.substr(peg$currPos, 2) === peg$c70) {
                                    s0 = peg$c70;
                                    peg$currPos += 2;
                                  } else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                      peg$fail(peg$e104);
                                    }
                                  }
                                  if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 3) === peg$c71) {
                                      s0 = peg$c71;
                                      peg$currPos += 3;
                                    } else {
                                      s0 = peg$FAILED;
                                      if (peg$silentFails === 0) {
                                        peg$fail(peg$e105);
                                      }
                                    }
                                    if (s0 === peg$FAILED) {
                                      if (input.substr(peg$currPos, 3) === peg$c72) {
                                        s0 = peg$c72;
                                        peg$currPos += 3;
                                      } else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                          peg$fail(peg$e106);
                                        }
                                      }
                                      if (s0 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 3) === peg$c73) {
                                          s0 = peg$c73;
                                          peg$currPos += 3;
                                        } else {
                                          s0 = peg$FAILED;
                                          if (peg$silentFails === 0) {
                                            peg$fail(peg$e107);
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseExpression() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 104;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseAssignmentExpression();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c30;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseAssignmentExpression();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c30;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseAssignmentExpression();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f77(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseStatement() {
              var s0;
              var key = peg$currPos * 122 + 105;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseVariableStatement();
              if (s0 === peg$FAILED) {
                s0 = peg$parseEmptyStatement();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseExpressionStatement();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseBlock();
                  }
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseBlock() {
              var s0, s1, s3, s4, s5;
              var key = peg$currPos * 122 + 106;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c29;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e58);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$currPos;
                s4 = peg$parseStatementList();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parse__();
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                if (s3 === peg$FAILED) {
                  s3 = null;
                }
                if (input.charCodeAt(peg$currPos) === 41) {
                  s4 = peg$c28;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e57);
                  }
                }
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f78(s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 123) {
                  s1 = peg$c31;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e60);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$parse__();
                  s3 = peg$currPos;
                  s4 = peg$parseStatementList();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parse__();
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                  if (s3 === peg$FAILED) {
                    s3 = null;
                  }
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s4 = peg$c27;
                    peg$currPos++;
                  } else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e56);
                    }
                  }
                  if (s4 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f79(s3);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseStatementList() {
              var s0, s1, s2, s3, s4, s5;
              var key = peg$currPos * 122 + 107;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseStatement();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseStatement();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseStatement();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f80(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseVariableStatement() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 108;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseVariableDeclarationList();
              if (s1 !== peg$FAILED) {
                s2 = peg$parseEOS();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f81(s1);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseVariableDeclarationList() {
              var s0, s1, s2, s3, s4, s5, s6, s7;
              var key = peg$currPos * 122 + 109;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseVariableDeclaration();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                if (input.charCodeAt(peg$currPos) === 44) {
                  s5 = peg$c30;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e59);
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse__();
                  s7 = peg$parseVariableDeclaration();
                  if (s7 !== peg$FAILED) {
                    s4 = [s4, s5, s6, s7];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s5 = peg$c30;
                    peg$currPos++;
                  } else {
                    s5 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e59);
                    }
                  }
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse__();
                    s7 = peg$parseVariableDeclaration();
                    if (s7 !== peg$FAILED) {
                      s4 = [s4, s5, s6, s7];
                      s3 = s4;
                    } else {
                      peg$currPos = s3;
                      s3 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f82(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseVariableDeclaration() {
              var s0, s1, s2, s3, s4;
              var key = peg$currPos * 122 + 110;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseIdentifier();
              if (s1 !== peg$FAILED) {
                s2 = peg$currPos;
                s3 = peg$parse__();
                s4 = peg$parseinitializer();
                if (s4 !== peg$FAILED) {
                  s3 = [s3, s4];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
                if (s2 === peg$FAILED) {
                  s2 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f83(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseinitializer() {
              var s0, s1, s3;
              var key = peg$currPos * 122 + 111;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c59) {
                s1 = peg$c59;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e93);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$parse__();
                s3 = peg$parseAssignmentExpression();
                if (s3 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f84(s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseEmptyStatement() {
              var s0, s1;
              var key = peg$currPos * 122 + 112;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 59) {
                s1 = peg$c26;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e55);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f85();
              }
              s0 = s1;
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseExpressionStatement() {
              var s0, s1, s2, s3;
              var key = peg$currPos * 122 + 113;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 123) {
                s2 = peg$c31;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e60);
                }
              }
              peg$silentFails--;
              if (s2 === peg$FAILED) {
                s1 = undefined;
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseExpression();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseEOS();
                  if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f86(s2);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLambdaExpression() {
              var s0;
              var key = peg$currPos * 122 + 114;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseLambdaExpression1();
              if (s0 === peg$FAILED) {
                s0 = peg$parseLambdaExpression2();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseLambdaExpression3();
                }
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLambdaExpression1() {
              var s0, s1, s3, s5, s7;
              var key = peg$currPos * 122 + 115;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLambdaToken2();
              if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 40) {
                  s3 = peg$c29;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e58);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$parse__();
                  s5 = peg$parseFunctionBody();
                  peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c28;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e57);
                    }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f87(s5);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLambdaExpression2() {
              var s0, s1, s3, s5, s7;
              var key = peg$currPos * 122 + 116;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLambdaToken1();
              if (s1 !== peg$FAILED) {
                peg$parse__();
                if (input.charCodeAt(peg$currPos) === 40) {
                  s3 = peg$c29;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e58);
                  }
                }
                if (s3 !== peg$FAILED) {
                  peg$parse__();
                  s5 = peg$parseFunctionBody();
                  peg$parse__();
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c28;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e57);
                    }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f88(s5);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseLambdaExpression3() {
              var s0, s1, s2;
              var key = peg$currPos * 122 + 117;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseLambdaToken2();
              if (s1 !== peg$FAILED) {
                s2 = peg$parseSourceElement();
                if (s2 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f89(s2);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseFunctionBody() {
              var s0, s1;
              var key = peg$currPos * 122 + 118;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseSourceElements();
              if (s1 === peg$FAILED) {
                s1 = null;
              }
              peg$savedPos = s0;
              s1 = peg$f90(s1);
              s0 = s1;
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseProgram() {
              var s0, s1;
              var key = peg$currPos * 122 + 119;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseSourceElements();
              if (s1 === peg$FAILED) {
                s1 = null;
              }
              peg$savedPos = s0;
              s1 = peg$f91(s1);
              s0 = s1;
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSourceElements() {
              var s0, s1, s2, s3, s4, s5;
              var key = peg$currPos * 122 + 120;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$currPos;
              s1 = peg$parseSourceElement();
              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$currPos;
                s4 = peg$parse__();
                s5 = peg$parseSourceElement();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$currPos;
                  s4 = peg$parse__();
                  s5 = peg$parseSourceElement();
                  if (s5 !== peg$FAILED) {
                    s4 = [s4, s5];
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$FAILED;
                  }
                }
                peg$savedPos = s0;
                s0 = peg$f92(s1, s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            function peg$parseSourceElement() {
              var s0;
              var key = peg$currPos * 122 + 121;
              var cached = peg$resultsCache[key];
              if (cached) {
                peg$currPos = cached.nextPos;
                return cached.result;
              }
              s0 = peg$parseStatement();
              if (s0 === peg$FAILED) {
                s0 = peg$parseLambdaExpression();
              }
              peg$resultsCache[key] = {
                nextPos: peg$currPos,
                result: s0
              };
              return s0;
            }
            var TYPES_TO_PROPERTY_NAMES = {
              CallExpression: "callee",
              MemberExpression: "object"
            };
            function filledArray(count, value) {
              return Array.apply(null, new Array(count)).map(function () {
                return value;
              });
            }
            function extractOptional(optional, index) {
              return optional ? optional[index] : null;
            }
            function extractList(list, index) {
              return list.map(function (element) {
                return element[index];
              });
            }
            function buildList(head, tail, index) {
              return [head].concat(extractList(tail, index));
            }
            function buildBinaryExpression(head, tail) {
              return tail.reduce(function (result, element) {
                return {
                  type: "BinaryExpression",
                  operator: element[1],
                  left: result,
                  right: element[3]
                };
              }, head);
            }
            function buildLogicalExpression(head, tail) {
              return tail.reduce(function (result, element) {
                return {
                  type: "LogicalExpression",
                  operator: element[1],
                  left: result,
                  right: element[3]
                };
              }, head);
            }
            function optionalList(value) {
              return value !== null ? value : [];
            }
            peg$result = peg$startRuleFunction();
            var peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
            function peg$throw() {
              if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                peg$fail(peg$endExpectation());
              }
              throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
            }
            if (options.peg$library) {
              return /** @type {any} */{
                peg$result: peg$result,
                peg$currPos: peg$currPos,
                peg$FAILED: peg$FAILED,
                peg$maxFailExpected: peg$maxFailExpected,
                peg$maxFailPos: peg$maxFailPos,
                peg$success: peg$success,
                peg$throw: peg$success ? undefined : peg$throw
              };
            }
            if (peg$success) {
              return peg$result;
            } else {
              peg$throw();
            }
          }
          return {
            StartRules: ["Start"],
            SyntaxError: peg$SyntaxError,
            parse: peg$parse
          };
        });
      })(parser$1);
      return parser$1.exports;
    }

    var parserExports = requireParser();

    const DEFAULT_PARSE_SCRIPT_MAX_INPUT_LENGTH = 65_536;
    const DEFAULT_PARSE_SCRIPT_MAX_RECOVERY_ATTEMPTS = 16;
    class ParserInputLimitError extends Error {
        inputLength;
        maxInputLength;
        constructor(inputLength, maxInputLength) {
            super(`Parser input length ${inputLength} exceeds the configured maximum of ${maxInputLength}.`);
            this.name = "ParserInputLimitError";
            this.inputLength = inputLength;
            this.maxInputLength = maxInputLength;
        }
    }
    class ParserRecoveryLimitError extends Error {
        maxRecoveryAttempts;
        constructor(maxRecoveryAttempts, cause) {
            super(`Parser syntax recovery stopped after ${maxRecoveryAttempts} attempt${maxRecoveryAttempts === 1 ? "" : "s"}.`, { cause });
            this.name = "ParserRecoveryLimitError";
            this.maxRecoveryAttempts = maxRecoveryAttempts;
        }
    }
    const resolveParserLimit = (value, defaultValue, optionName) => {
        const limit = value ?? defaultValue;
        if (!Number.isSafeInteger(limit) || limit < 0) {
            throw new RangeError(`${optionName} must be a non-negative safe integer.`);
        }
        return limit;
    };
    const assertParserInputLength = (script, maxInputLength) => {
        if (script.length > maxInputLength) {
            throw new ParserInputLimitError(script.length, maxInputLength);
        }
    };
    const formatSyntaxRecoveryDiagnostic = (error, source) => {
        const location = error.location.start;
        return `[parse] ${error.name} in ${source}:${location.line}:${location.column}`;
    };
    const parseScript = (content, name, options = {}) => {
        const maxInputLength = resolveParserLimit(options.maxInputLength, DEFAULT_PARSE_SCRIPT_MAX_INPUT_LENGTH, "maxInputLength");
        const maxRecoveryAttempts = resolveParserLimit(options.maxRecoveryAttempts, DEFAULT_PARSE_SCRIPT_MAX_RECOVERY_ATTEMPTS, "maxRecoveryAttempts");
        let script = content;
        if (script.startsWith("/")) {
            script = script.slice(1);
        }
        assertParserInputLength(script, maxInputLength);
        if (!options.recoverSyntaxErrors || maxRecoveryAttempts === 0) {
            return parserExports.parse(script, { grammarSource: name });
        }
        let firstError;
        let recoveryAttempts = 0;
        for (;;) {
            try {
                return parserExports.parse(script, { grammarSource: name });
            }
            catch (e) {
                firstError ??= e;
                if (!(e instanceof parserExports.SyntaxError)) {
                    throw e;
                }
                if (recoveryAttempts >= maxRecoveryAttempts) {
                    throw new ParserRecoveryLimitError(maxRecoveryAttempts, e);
                }
                console.info(formatSyntaxRecoveryDiagnostic(e, name));
                const removed = script.slice(0, e.location.start.offset) +
                    script.slice(e.location.start.offset + 1);
                if (script === removed)
                    throw firstError;
                recoveryAttempts++;
                script = removed;
            }
        }
    };

    const processEval = (_script, scopes, object, trace) => {
        try {
            const script = parseScript(object, "[eval]");
            return execute$1(script, scopes, trace);
        }
        catch (_e) {
            return undefined;
        }
    };

    const processHashCode$1 = (_script, _scopes, object) => {
        let seed = 0;
        for (let i = 0; i < object.length; i++) {
            seed = seed * 31 + object.charCodeAt(i);
        }
        return seed;
    };

    const processIndexOf = (script, scopes, object, trace) => {
        const searchValue = execute$1(script.arguments[0], scopes, trace);
        const fromIndex = execute$1(script.arguments[1], scopes, trace);
        if (typeof fromIndex !== "undefined") {
            return object.indexOf(`${searchValue}`, format(fromIndex, "number"));
        }
        return object.indexOf(`${searchValue}`);
    };

    const processMultiply$1 = (script, scopes, object, trace) => {
        const repeatCount = execute$1(script.arguments[0], scopes, trace);
        return Multiplication(object, repeatCount);
    };

    const processSize = (_script, _scopes, object) => {
        return object.length;
    };

    const processSlice = (script, scopes, object, trace) => {
        const startIndex = execute$1(script.arguments[0], scopes, trace);
        const length = execute$1(script.arguments[1], scopes, trace);
        if (typeof length !== "undefined") {
            return object.slice(format(startIndex, "number"), format(startIndex, "number") + format(length, "number"));
        }
        return object.slice(format(startIndex, "number"));
    };

    const processToASNumber$1 = () => {
        return 0;
    };

    const processToASString$1 = (_script, _scopes, object) => {
        return object;
    };

    const processToFloat = (_script, _scopes, object) => {
        return parseFloat(object);
    };

    const processToInteger = (_script, _scopes, object) => {
        if (object.match(/^0[1-7]+/)) {
            return parseInt(object, 8);
        }
        return parseInt(object, 10);
    };

    const prototypeStringFunctions = {
        index: processIndex$1,
        size: processSize,
        indexOf: processIndexOf,
        slice: processSlice,
        toInteger: processToInteger,
        toFloat: processToFloat,
        eval: processEval,
        toASNumber: processToASNumber$1,
        toASString: processToASString$1,
        raw: processToASString$1,
        multiply: processMultiply$1,
        hashCode: processHashCode$1,
    };

    const processIndex = () => {
        return null;
    };

    const processAdd = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return Addition(object, value);
    };

    const processAlternative = (script, scopes, object, trace) => {
        const args = argumentParser$1(script.arguments, scopes, ["then", "else"], trace, false);
        if (object && args.then) {
            return execute$1(args.then, scopes, trace);
        }
        else if (!object && args.else) {
            return execute$1(args.else, scopes, trace);
        }
        return;
    };

    const processAnd = (script, scopes, object, trace) => {
        if (!format(object, "boolean")) {
            return object;
        }
        return execute$1(script.arguments[0], scopes, trace);
    };

    const processCall = (script, scopes, _, trace) => {
        const functionNameAst = script.arguments[0];
        if (!functionNameAst)
            throw new InvalidTypeError("function name must be exist", script, scopes);
        const functionName = execute$1(script.arguments[0], scopes, trace);
        if (typeof functionName !== "string")
            throw new InvalidTypeError("typeof function name must be string", script, scopes);
        const newScript = {
            type: "CallExpression",
            callee: {
                type: "Raw",
                value: functionName,
            },
            arguments: script.arguments.slice(1),
        };
        return execute$1(newScript, scopes, trace);
    };

    const processComma = (script, scopes, _, trace) => {
        return execute$1(script.arguments[0], scopes, trace);
    };

    const processCompare = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (object === value)
            return 0;
        if (LessThan(object, value))
            return -1;
        return 1;
    };

    const processDivide = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return Division(object, value);
    };

    const processEquals = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        return Equality(object, value);
    };

    const processForEachSlot = (script, scopes, object, trace) => {
        const processor = script.arguments[0];
        if (!typeGuard.LambdaExpression(processor) ||
            typeof object !== "object" ||
            object === null) {
            return;
        }
        let result;
        const slots = object;
        for (const key of Object.keys(object)) {
            const slotKey = normalizeSlotKey(Array.isArray(object) && isArrayIndex(key) ? Number(key) : key);
            if (slotKey === undefined) {
                continue;
            }
            const slotScope = createSlotStore();
            setOwnSlot(slotScope, "@0", slotKey);
            setOwnSlot(slotScope, "@1", slots[key]);
            result = execute$1(processor.body, [slotScope, ...scopes], trace);
        }
        return result;
    };
    const isArrayIndex = (key) => {
        const index = Number(key);
        return Number.isInteger(index) && index >= 0 && String(index) === key;
    };

    const processGreaterThan = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return GreaterThan(object, value);
    };

    const processHashCode = () => {
        return 0;
    };

    const processHasSlot = () => {
        return false;
    };

    const processLessThan = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return LessThan(object, value);
    };

    const processMax = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        return object === value || GreaterThan(object, value) ? object : value;
    };

    const processMin = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        return object === value || LessThan(object, value) ? object : value;
    };

    const processMinus = (_script, _scopes, object) => {
        return UnaryNegation(format(object, "number"));
    };

    const processModulo = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return Remainder(object, value);
    };

    const processMultiply = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return Multiplication(object, value);
    };

    const processNot = (_script, _scopes, object) => {
        return !format(object, "boolean");
    };

    const processNotGreaterThan = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return !GreaterThan(object, value);
    };

    const processNotLessThan = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return !LessThan(object, value);
    };

    const processOr = (script, scopes, object, trace) => {
        if (format(object, "boolean")) {
            return object;
        }
        return execute$1(script.arguments[0], scopes, trace);
    };

    const processPlus = (_script, _scopes, object) => {
        return UnaryPlus(format(object, "number"));
    };

    const processRaw = () => {
        return undefined;
    };

    const processSubtract = (script, scopes, object, trace) => {
        const value = execute$1(script.arguments[0], scopes, trace);
        if (value === undefined)
            throw new InvalidTypeError("undefined", script, scopes);
        return Subtraction(object, value);
    };

    const processToASBoolean = () => {
        return true;
    };

    const processToASNumber = () => {
        return 0;
    };

    const processToASString = () => {
        return "<value>";
    };

    const processWhileKari = (script, scopes, _, trace) => {
        let result;
        let loopCount = 0;
        while (execute$1(script.arguments[0], scopes, trace)) {
            assertResourceLimit("loopIterations", loopCount + 1, script, scopes, "while_kari iterations");
            result = execute$1(script.arguments[1], scopes, trace);
            loopCount++;
        }
        return result;
    };

    const prototypeValueFunctions = {
        hasSlot: processHasSlot,
        equals: processEquals,
        compare: processCompare,
        hashCode: processHashCode,
        hashCore: processHashCode,
        forEachSlot: processForEachSlot,
        call: processCall,
        sendMessage: processCall,
        raw: processRaw,
        increase: processRaw,
        decrease: processRaw,
        toASNumber: processToASNumber,
        toASString: processToASString,
        toASBoolean: processToASBoolean,
        index: processIndex,
        plus: processPlus,
        minus: processMinus,
        multiply: processMultiply,
        divide: processDivide,
        modulo: processModulo,
        add: processAdd,
        subtract: processSubtract,
        alt: processAlternative,
        alternative: processAlternative,
        lessThan: processLessThan,
        notLessThan: processNotLessThan,
        greaterThan: processGreaterThan,
        notGreaterThan: processNotGreaterThan,
        not: processNot,
        and: processAnd,
        or: processOr,
        comma: processComma,
        min: processMin,
        max: processMax,
        while_kari: processWhileKari,
    };

    const resolvePrototype = (type, name) => {
        const key = normalizeSlotKey(name);
        if (key === undefined || typeof key !== "string") {
            return undefined;
        }
        if (type === "object" || type === "array") {
            const objectPrototype = getOwnSlot(prototypeObjectFunctions, key);
            if (objectPrototype) {
                return objectPrototype;
            }
        }
        if (type === "array") {
            const arrayPrototype = getOwnSlot(prototypeArrayFunctions, key);
            if (arrayPrototype) {
                return arrayPrototype;
            }
        }
        else if (type === "string") {
            const stringPrototype = getOwnSlot(prototypeStringFunctions, key);
            if (stringPrototype) {
                return stringPrototype;
            }
        }
        else if (type === "boolean") {
            const boolPrototype = getOwnSlot(prototypeBoolFunctions, key);
            if (boolPrototype) {
                return boolPrototype;
            }
        }
        else if (type === "number") {
            const numberPrototype = getOwnSlot(prototypeNumberFunctions, key);
            if (numberPrototype) {
                return numberPrototype;
            }
        }
        const valuePrototype = getOwnSlot(prototypeValueFunctions, key);
        if (valuePrototype) {
            return valuePrototype;
        }
        if (type === "array") {
            return getOwnSlot(prototypeScope.Array, key);
        }
        else if (type === "string") {
            return getOwnSlot(prototypeScope.String, key);
        }
        else if (type === "boolean") {
            return getOwnSlot(prototypeScope.Bool, key);
        }
        else if (type === "number") {
            return getOwnSlot(prototypeScope.Number, key);
        }
        else if (type === "object") {
            return getOwnSlot(prototypeScope.Object, key);
        }
        return undefined;
    };
    const initResolvePrototype = () => {
        setResolvePrototype(resolvePrototype);
    };

    const initCore = () => {
        initResolvePrototype();
        initGetName();
        initArgumentParser();
        initAssign();
        initConfig();
        initExecute();
    };
    const resetCore = () => {
        initDefinedFunctions();
        initPrototypeScope();
        initResultHook();
    };

    initCore();
    const utils = {
        argumentParser: argumentParser$1,
        getName: getName$1,
        assign: assign$1,
        resolvePrototype: resolvePrototype$1,
    };
    const executePublic = (script, scopes, trace, options = { catch: true }) => execute$1(script, scopes, trace, options);
    class NiwangoCore {
        static execute = executePublic;
        static utils = utils;
        static resetCore = resetCore;
        static parseScript = parseScript;
        static parse = parserExports.parse;
        static PeggySyntaxError = parserExports.SyntaxError;
        static ParserInputLimitError = ParserInputLimitError;
        static ParserRecoveryLimitError = ParserRecoveryLimitError;
        static appendDefinedFunctions = appendDefinedFunctions;
        static appendResultHook = appendResultHook;
        static setIsWide = setIsWide;
        static format = format;
        static errors = Errors;
        static prototypeScope = prototypeScope;
        static default = NiwangoCore;
    }

    return NiwangoCore;

}));
