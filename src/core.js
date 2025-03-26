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
    return { kind: "ArrayType", elementType }
}
export function functionType(paramTypes, returnType) {
    return { kind: "FunctionType", paramTypes, returnType }
}

// Entities
export function functionEntity(name, params, body, type) {
    return { kind: "FunctionEntity", name, params, body, type }
}
export function noArgsFunctionEntity(name, type) {
    return { kind: "NoArgsFunctionEntity", name, type }
}
export function variableEntity(name, type) {
    return { kind: "VariableEntity", name, type }
}
export function arrayEntity(name, type, size) {
    return { kind: "ArrayEntity", name, type, size }
}

// Expressions
export function parameters(parameters) {
    return { kind: "ParametersEntity", parameters }
}
export function parameterTerm(type, id) {
    return { kind: "ParameterTerm", type, id }
}
export function argumentsExpression(argumentValues) {
    return { kind: "ArgumentsExpression", argumentValues }
}
export function argumentValueVariable(variable) {
    return { kind: "ArgumentValueVariable", variable }
}
export function argumentValueExpression(expression) {
    return { kind: "ArgumentValueExpression", expression }
}
export function numericExpression(type, left, op, right) {
    return { kind: "NumericExpression", type, left, op, right }
}
export function numericValue(type, value, negative = false) {
    return { kind: "NumericValue", type, value, negative }
}
export function stringExpression(type, left, op, right) {
    return { kind: "StringExpression", type, left, op, right }
}
export function stringValue(type, value) {
    return { kind: "StringValue", type, value }
}
export function booleanExpression(type, left, logicOperator, right) {
    return { kind: "BooleanExpression", type, left, logicOperator, right }
}
export function booleanComparison(type, left, comparisonOperator, right) {
    return { kind: "BooleanComparison", type, left, comparisonOperator, right }
}
export function booleanValue(type, value) {
    return { kind: "BooleanValue", type, value }
}
export function arrayExpression(type, left, op, right) {
    return { kind: "ArrayExpression", type, left, op, right }
}
export function arrayValue(type, size) {
    return { kind: "ArrayValue", type, size }
}

// Psuedo Statements
export function functionCallExpression(functionEntity, argumentsExpression) {
    return { kind: "FunctionCallExpression", functionEntity, argumentsExpression }
}
export function typecastFunctionCall(type, functionCallExpression) {
    return { kind: "TypecastFunctionCall", type, functionCallExpression }
}
export function typecastExpression(type, expression) {
    return { kind: "TypecastExpression", type, expression }
}
export function typecastVariable(type, variableEntity) {
    return { kind: "TypecastVariable", type, variableEntity }
}
export function iterPostVariable(type, variableEntity, iterOp) {
    return { kind: "IterPostVariable", type, variableEntity, iterOp }
}
export function iterPreVariable(type, variableEntity, iterOp) {
    return { kind: "IterPreVariable", type, variableEntity, iterOp }
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
export function variableOperatorAssignment(variable, incrementOperator, value) {
    return { kind: "VariableOperatorAssignment", variable, incrementOperator, value }
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
export function forLoop(variableDeclaration, condition, iterator, body) {
    return { kind: "ForLoop", variableDeclaration, condition, iterator, body }
}
export function forEach(type, id, collection, body) {
    return { kind: "ForEach", type, id, collection, body }
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