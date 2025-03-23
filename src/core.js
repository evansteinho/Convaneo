// Program Definition
export function program(statements) {
    return {kind: "Program", statements}
}

// Types
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

// Entities
export function functionEntity(name, params, body, type) {
    return { kind: "FunctionEntity", name, params, body, type}
}
export function noArgsFunctionEntity(name, type) {
    return { kind: "NoArgsFunctionEntity", name, type}
}
export function variableEntity(name, type) {
    return { kind: "VariableEntity", name, type }
}

// Statements
export function functionDeclaration(functionEntity) {
    return { kind: "FunctionDeclaration", functionEntity }
}
export function variableDeclaration(variable, value) {
    return { kind: "VariableDeclaration", variable, value }
}
export function variableAssignment(variable, value) {
    return { kind: "VariableAssignment", variable, value }
}
export function arrayAssignment(variable, index, value) {
    return { kind: "ArrayAssignment", variable, index, value }
}
export function printFunction(value) {
    return { kind: "PrintFunction", value }
}
export function whileLoop(condition, body) {
    return { kind: "WhileLoop", condition, body }
}
export function ifBlock(ifStatement, elseIfStatements = null, elseStatement = null) {
    return { kind: "IfBlock", ifStatement, elseIfStatements, elseStatement }
}
export function elseStatement(body) {
    return { kind: "ElseStatement", body }
}
export function elseIfStatement(condition, body) {
    return { kind: "ElseIfStatement", condition, body }
}
export function ifStatement(condition, body) {
    return { kind: "IfStatement", condition, body }
}
export function forLoop(iteratorDeclaration, condition, iteratorChange, body) {
    return { kind: "ForLoop", iteratorDeclaration, condition, iteratorChange, body }
}
export function forEach(iterator, collection, body) {
    return { kind: "ForEach", iterator, collection, body }
}
export function iteration(variable, iterationOperator) {
    return { kind: "Iteration", variable, iterationOperator}
}
export function returnStatement(value) {
    return { kind: "ReturnStatement", value }
}
export function shortReturnStatement() {
    return { kind: "ShortReturnStatement" }
}
export function breakStatement() {
    return { kind: "BreakStatement" }
}

// STDLIB
export const standardLibrary = Object.freeze({
    //blank for now
})