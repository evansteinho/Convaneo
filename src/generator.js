import * as core from "./core.js"

export default function generate(program) {
  const output = []

  function gen(node) {
    if (!generators[node.kind]) {
      console.log(`Function for ${node.kind} not found at node ${node}`)
      return
    }
    return String(generators[node.kind](node)).trim()
  }

  function unwrap(node){
    if (node?.value?.kind) {
      return unwrap(node.value)
    }
    if (node?.kind) {
      return gen(node)
    }
    return node
  }

  const generators = {
    Program(node) {
      node.statements.forEach(gen)
    },

    //Entites
    VariableEntity(node){
      return `${node.name}`
    },

    //Expressions
    NumericExpression(node) {
      return `${gen(node.left)} ${node.op} ${gen(node.right)}`
    },
    NumericValue(node) {
      let negativeStr = node.negative ? "-" : ""
      if (node.value.kind) {
        return `${negativeStr} ${unwrap(node.value)}`
      }
      return `${negativeStr} ${node.value}`
    },
    StringExpression(node) {
      return `${gen(node.left)} ${node.op} ${gen(node.right)}`
    },
    StringValue(node) {
      if (node.value.kind) {
        return `${unwrap(node.value)}`
      }
      return `${node.value}`
    },
    BooleanExpression(node) {
      return `${gen(node.left)} ${node.logicOperator} ${gen(node.right)}`
    },
    BooleanComparison(node) {
      let compareOp = node.comparisonOperator != "==" ? node.comparisonOperator : "==="
      return `${node.left.sourceString} ${compareOp} ${node.right.sourceString}`
    },
    BooleanValue(node) {
      if (node.value.kind) {
        return `${unwrap(node.value)}`
      }
      return `${node.value}`
    },
    ArrayExpression(node) {
      return `${gen(node.left)} ${node.op} ${gen(node.right)}`
    },
    ArrayValue(node) {
      return `new Array(${gen(node.size)})`
    },
    IDValue(node) {
      return node.variableEntity.name
    },
    FunctionCallValue(node) {
      return `${node.functionCallExpression.functionEntity.name}(${node.functionCallExpression.argumentsExpression.argumentValues.map((e) => gen(e.expression)).join(", ")})`
    },
    ArrayIndexValue(node){
      return `${node.array.name}[${gen(node.index)}]`
    },
    
    //Psuedo Statements
    FunctionCallExpression(node) {
      output.push(`${node.functionEntity.name}(${node.argumentsExpression.argumentValues.map((e) => gen(e.expression)).join(", ")})`)
    },
    TypecastFunctionCall(node) {
      let functionCallStr = gen(node.functionCallExpression) 
      switch (node.type) {
        case core.intType:
          return `parseInt(${functionCallStr})`
        case core.floatType:
          return `parseFloat(${functionCallStr})`
        case core.doubleType:
          return `Number(${functionCallStr})`
        case core.boolType:
          return `Boolean(${functionCallStr})`
        case core.stringType:
          return `String(${functionCallStr})`
        default:
          return `${functionCallStr}`
      }
    },
    TypecastExpression(node) {
      let expresion = gen(node.expression) 
      switch (node.type) {
        case core.intType:
          return `parseInt(${expresion})`
        case core.floatType:
          return `parseFloat(${expresion})`
        case core.doubleType:
          return `Number(${expresion})`
        case core.boolType:
          return `Boolean(${expresion})`
        case core.stringType:
          return `String(${expresion})`
        default:
          return `${expresion}`
      }
    },
    IterPostVariable(node) {
      return `${node.variableEntity.name}${node.iterOp}`
    },
    IterPreVariable(node) {
      return `${node.iterOp}${node.variableEntity.name}`
    },

    //Statements
    FunctionDeclaration(node) {
      let functionEntity = node.functionEntity
      output.push(`function ${functionEntity.name}(${functionEntity.params.parameters.map((e) => e.id).join(", ")}) {`)
      functionEntity.body.forEach(gen)
      output.push("}")
    },
    VariableDeclaration(node) {
      output.push(`let ${node.variable.name} = ${gen(node.value)}`)
    },
    VariableAssignment(node) {
      output.push(`${node.variable.name} = ${gen(node.value)}`)
    },
    VariableOperatorAssignment(node) {
      output.push(`${node.variable.name} ${node.incrementOperator} ${gen(node.value)}`)
    },
    ArrayAssignment(node) {
      output.push(`${node.variable.name}[${gen(node.index)}] = ${gen(node.value)}`)
    },
    PrintFunction(node) {
      output.push(`console.log(${gen(node.value)})`)
    },
    WhileLoop(node) {
      let conditionStr = gen(node.condition)
      output.push(`while (${conditionStr}) {`)
      node.body.forEach(gen)
      output.push("}")
    },
    IfBlock(node) {
      gen(node.ifStatement)
      if (node.elseIfStatements) {
        node.elseIfStatements.forEach(gen)
      }
      if (node.elseStatement) {
        node.elseStatement.forEach(gen)
      }
    },
    ElseStatement(node) {
      output.push(`else {`)
      node.body.forEach(gen)
      output.push(`}`)
    },
    ElseIfStatement(node) {
      let conditionStr = gen(node.condition)
      output.push(`else if (${conditionStr}) {`)
      node.body.forEach(gen)
      output.push(`}`)
    },
    IfStatement(node) {
      let conditionStr = gen(node.condition)
      output.push(`if (${conditionStr}) {`)
      node.body.forEach(gen)
      output.push(`}`)
    },
    Iteration(node){
      if (node.pre) {
        output.push(`${node.iterationOperator}${node.variable.name}`)
      } else {
        output.push(`${node.variable.name}${node.iterationOperator}`)
      }
    },
    ForLoop(node){
      let variableDecStr = `let ${node.variableDeclaration.variable.name} = ${gen(node.variableDeclaration.value)}`
      let conditionStr = gen(node.condition)
      let iteratorStr = node.iterator.pre ? `${node.iterator.iterationOperator}${node.iterator.variable.name}` : `${node.iterator.variable.name}${node.iterator.iterationOperator}`
      output.push(`for(${variableDecStr}; ${conditionStr}; ${iteratorStr}) {`)
      node.body.forEach(gen)
      output.push(`}`)
    },
    ForEach(node){
      output.push(`${node.collection.name}.forEach(function(${node.id}) {`)
      node.body.forEach(gen)
      output.push(`})`)
    },
    ReturnStatement(node){
      output.push(`return ${unwrap(node)}`)
    },
    ShortReturnStatement(_node) {
      output.push(`return`)
    },
    BreakStatement(_node) {
      output.push(`break`)
    }
  }

  gen(program)
  return output.join("\n")
}