export default function generate(program) {
  const output = []

  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  function gen(node) {
    if (!generators[node.kind]) {
      console.log(`Function for ${node.kind} not found`)
      return
    }
    return generators[node.kind](node)
  }

  const generators = {
    Program(node) {
      node.statements.forEach(gen)
    },

    //Expressions
    NumericExpression(node) {
      return `${gen(node.left)} ${node.op} ${gen(node.right)}`
    },
    NumericValue(node) {
      return node.value
    },
    StringExpression(node) {
      return `${gen(node.left)} ${node.op} ${gen(node.right)}`
    },
    StringValue(node){
      return node.value
    },
    IDValue(node){
      return node.variableEntity.name
    },
    FunctionCallValue(node) {
      return `${node.functionCallExpression.functionEntity.name}(${node.functionCallExpression.argumentsExpression.argumentValues.map((e) => gen(e.expression)).join(", ")})`
    },
    
    //Psuedo Statements
    FunctionCallExpression(node) {
      output.push(`${node.functionEntity.name}(${node.argumentsExpression.argumentValues.map((e) => gen(e.expression)).join(", ")})`)
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
    PrintFunction(node) {
      output.push(`console.log(${gen(node.value)})`)
    },
  }

  gen(program)
  return output.join("\n")
}