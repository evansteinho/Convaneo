export function program(statements) {
    return {kind: "Program", statements}
}

export const intType = "int"
export const floatType = "float"
export const doubleType = "double"
export const boolType = "bool"
export const stringType = "string"
export const voidType = "void"
export const anyType = "any"

export function arrayType(elementType) {
    return {kind: "ArrayType", elementType}
}

export function functionType(paramTypes, returnType) {
    return {kind: "FunctionType", paramTypes, returnType}
}

export function func(name, params, body, type) {
    return { kind: "Function", name, params, body, type}
}

export function noArgsFunction(name, type) {
    return { kind: "Function", name, type, containsArgs: false }
}

export const standardLibrary = Object.freeze({
    int: intType,
    float: floatType,
    double: doubleType,
    bool: boolType,
    string: stringType,
    array: arrayType,
    void: voidType,
    any: anyType,
    print: noArgsFunction("print", functionType(anyType, voidType)),
})