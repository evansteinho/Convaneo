import * as core from "./core.js"

export default function optimize(node) {
  return optimizers?.[node.kind]?.(node) ?? node
}

function preProcessExp(e) {
  if (e.left.kind) {
    e.left = optimize(e.left)
  }
  if (e.right.kind) {
    e.right = optimize(e.right)
  }
  return e
}

// Optimization Checklist
// - assignments to self (x = x) turn into no-ops ✅
// - constant folding ✅
// - some strength reductions (+0, -0, *0, *1, etc.) ❌
// - turn references to built-ins true and false to be literals ❌
// - remove all disjuncts in || list after literal true ❌
// - remove all conjuncts in && list after literal false ❌
// - while-false becomes a no-op ❌
// - repeat-0 is a no-op ❌
// - for-loop over empty array is a no-op ❌
// - for-loop with low > high is a no-op ❌
// - if-true and if-false reduce to only the taken arm ❌

const optimizers = {
  Program(e) {
    e.statements = e.statements.flatMap(optimize)
  },

  // Entites

  // Expressions
  NumericExpression(e) {
    e = preProcessExp(e)
    if (e.left.kind === "NumericValue" && e.right.kind === "NumericValue") {
      if (e.op == "/" && e.right.value == "0") {
        return e
      }
      return core.numericValue(e.left.type, eval(`${e.left.value} ${e.op} ${e.right.value}`))
    }
    return e
  },
  StringExpression(e) {
    e = preProcessExp(e)
    if (e.left.kind === "StringValue" && e.right.kind === "StringValue") {
      return core.stringValue(core.stringType, `"${eval(`${e.left.value} ${e.op} ${e.right.value}`)}"`)
    }
    return e
  },
  StringValue(e) {
    if (e.value.kind) {
      return optimize(e.value)
    }
    return e
  },
  BooleanExpression(e) {
    e = preProcessExp(e)
    if (e.left.kind === "BooleanValue" && e.right.kind === "BooleanValue") {
      return core.booleanValue(core.boolType, eval(`${e.left.value} ${e.logicOperator} ${e.right.value}`))
    }
    return e
  },
  BooleanComparison(e) {
    e = preProcessExp(e)

    let compOp = e.comparisonOperator
    if (compOp === "==") {
      compOp = "==="
    }

    if (e.left.sourceString && e.right.sourceString) {
      return core.booleanValue(core.boolType, eval(`${e.left.sourceString} ${compOp} ${e.right.sourceString}`))
    }

    if (e.left.kind === "NumericValue" && e.right.kind === "NumericValue") {
      return core.booleanValue(core.boolType, eval(`${e.left.value} ${compOp} ${e.right.value}`))
    }

    if (e.left.kind === "StringValue" && e.right.kind === "StringValue") {
      return core.booleanValue(core.boolType, eval(`${e.left.value} ${compOp} ${e.right.value}`))
    }
    return e
  },

  // Statements
  FunctionCallExpression(e) {
    e.functionEntity = optimize(e.functionEntity)
    e.argumentsExpression = optimize(e.argumentsExpression)
    e.type = optimize(e.type)
    return e 
  },

  TypecastExpression(e) {
    e.type = optimize(e.type)
    e.expression = optimize(e.expression)
    return e
  },

  VariableDeclaration(e) {
    e.variable = optimize(e.variable)
    e.value = optimize(e.value)
    return e
  },
  VariableAssignment(e) {
    e.variable = optimize(e.variable)
    e.value = optimize(e.value)
    if (e.value.variableEntity) {
      if (e.value.variableEntity === e.variable && !e.value.negative) {
        return []
        }
    }
    return e
  },
  PrintFunction(e) {
    e.value = optimize(e.value)
    return e
  }
}