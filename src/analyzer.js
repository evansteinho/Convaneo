import * as core from "./core.js"

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, functionEntity = null }) {
    Object.assign(this, { parent, locals, inLoop, functionEntity })
  }
  add(name, entity) {
    this.locals.set(name, entity)
  }
  search(name) {
    return this.locals.get(name) || this.parent?.searchFromContext(name)
  }

  static root() {
    return new Context({locals: new Map(Object.entries(core.standardLibrary))})
  }
  createLocalContext(props) {
    return new Context({...this, ...props, parent: this, locals: new Map()})
  }
}

export default function analyze(match) {
  let context = Context.root()

  // error checking
  function checkCondition(condition, message, location) {
    if (!condition) {
      const prefix = location.at.source.getLineAndColumnMessage()
      throw new Error(`${prefix}${message}`)
    }
  }

  //helpers
  function equivalent(type1, type2) {
    return (
      type1 === type2 ||
      (type1?.kind === "ArrayType" &&
        type2?.kind === "ArrayType" &&
        equivalent(type1.elementType, type2.elementType))
    )
  }
  function typeCastable(type1, type2) {
    const numericTypes = [core.intType, core.floatType, core.doubleType]

    return (numericTypes.includes(type1) && numericTypes.includes(type2) ||
      type1 === type2
    )
  }
  function assignable(fromType, toType) {
    return (
      toType == core.anyType ||
      equivalent(fromType, toType) ||
      (fromType?.kind === "FunctionType" &&
        toType?.kind === "FunctionType" &&

        assignable(fromType.returnType, toType.returnType) &&
        fromType.paramTypes.length === toType.paramTypes.length &&
        
        toType.paramTypes.every((t, i) => assignable(t, fromType.paramTypes[i]))) ||
      typeCastable(fromType, toType)
    )
  }

  // conditions
  function notRedeclaredCondition(name, location) {
    checkCondition(!context.search(name), `Identifier ${name} already declared`, location)
  }
  function existsCondition(entity, name, location) {
    checkCondition(entity, `Identifier ${name} does not exist`, location)
  }
  function numericTypeCondition(entity, location){
    const numericTypes = [core.intType, core.floatType, core.doubleType]
    checkCondition(numericTypes.includes(entity.type), "Expected a numeric type", location)
  }
  function stringTypeCondition(entity, location) {
    checkCondition(entity.type === core.stringType, "Expected a string type", location)
  }
  function boolTypeCondition(entity, location) {
    checkCondition(entity.type === core.boolType, "Expected a bool type", location)
  }
  function numericArrayTypeCondition(entity, location) {
    const numericTypes = [core.intType, core.floatType, core.doubleType]
    checkCondition(numericTypes.includes(entity.type), "Expected a numeric array type", location)
  }
  function stringArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.stringType), "Expected a string array type", location)
  }
  function boolArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.boolType), "Expected a bool array type", location)
  }
  function sameTypeCondition(entity1, entity2, location) {
    checkCondition(equivalent(entity1.type, entity2.type), "Operands do not have the same type", location)
  }
  function similarTypeCondition(entity1, entity2, location) {
    checkCondition(assignable(entity1.type, entity2.type), "Operands do not have similar types", location)
  }
  function allSameTypeCondition(entities, location) {
    checkCondition(entities.slice(1).every(entity => entity.type === entities[0].type), "Not all elements have the same type", location)
  }
  function assignableIntoArrayCondition(arrayEntity, otherEntity, location) {
    checkCondition(assignable(arrayEntity.type, otherEntity.type), `Array containing ${arrayEntity.type.elementType} type cannot contain ${otherEntity.type} type`, location)
  }
  function existingTypeCondition(entity, location) {
    const isBasicType = /int|float|double|string|bool|void|any/.test(entity)
    const isCompositeType = /ArrayType/.test(e?.kind)
    checkCondition(isBasicType || isCompositeType, "Type expected", location)
  }
  function isArrayCondition(type, location) {
    checkCondition(type?.kind === "ArrayType", "Must be an array type", location)
  }
  function sameArrayTypeCondition(type1, type2, location) {
    checkCondition(equivalent(type1, type2), `Array types do not match`, location)
  }
  function assignableCondition(entity, type, location) {
    checkCondition(assignable(entity.type, type), `Cannot assign a ${entity.type} to a ${type}`, location)
  }
  function typeCastableCondition(type1, type2, location) {
    checkCondition(typeCastable(type1, type2), `Cannot cast type ${type1} to ${type2}`, location)
  }
  function inLoopCondition(location) {
    checkCondition(context.inLoop, "Break can only appear in a loop", location)
  }
  function inFunctionCondition(location) {
    checkCondition(context.inFunction, "Return can only appear in  function", location)
  }
  function callableCondition(entity, location) {
    checkCondition(entity.type?.kind == "FunctionType", "Call of non-function", location)
  }
  function voidReturnCondition(functionEntity, location) {
    checkCondition(functionEntity.type.returnType === core.voidType, `Non-void function attempted to return void type`, location)
  }
  function anyReturnCondition(functionEntity, location) {
    checkCondition(functionEntity.type.returnType !== core.voidType, `Void function attempted to return a non-void type`, location)
  }
  function returnableCondition(entity, functionEntity, location) {
    checkCondition(assignableCondition(entity, functionEntity.type.returnType), location)
  }
  function correctArgumentCountCondition(argCount, paramCount, location) {
    checkCondition(argCount === paramCount, `${paramCount} argument(s) required but ${argCount} passed`, location)
  }
  function indexMustBeIntCondition(index, location) {
    checkCondition(index.type === core.intType, `Index for array must be have an int value`, location)
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return core.program(statements.children.map(s => s.rep()))
    },
    FunctionDeclaration(type, id, _open, parameters, _close, block) {
      notRedeclaredCondition(id.sourceString, type)

      const params = parameters.rep()
      const functionType = core.functionType(params.map(param => param.type), type.rep())

      const functionEntity = core.functionEntity(id.sourceString, params, block.rep(), functionType)
      context.add(id.sourceString, functionEntity)
      return core.functionDeclaration(functionEntity)
    },
    VariableDeclaration(type, id, _assignmentKey, expression, _semicolon) {
      notRedeclaredCondition(id.sourceString, type)
      const t = type.rep()
      const value = expression.rep()
      if (t?.kind === "ArrayType") {
        sameTypeCondition(t.elementType, value.type, type)
        const arrayEntity = core.arrayEntity(id.sourceString, t, expression.size)
        context.add(id.sourceString, arrayEntity)
        return core.variableDeclaration(arrayEntity, value)
      } else {
        const variableEntity = core.variableEntity(id.sourceString, value.type)
        context.add(id.sourceString, variableEntity)
        return core.variableDeclaration(variableEntity, value)
      }
    },
    VariableAssignment(id, _equals, expression, _semicolon) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)

      const value = expression.rep()
      sameTypeCondition(variableEntity, value)
      return core.variableAssignment(variableEntity, value)
    },
    VariableAssignment_operator(id, incrementOperator, numericExpression) {
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, id)
      const increment = incrementOperator.rep()
      const value = numericExpression.rep()
      sameTypeCondition(variable, value)
      return core.variableOperatorAssignment(variable, increment, value)
    },
    PrintFunction(_print, _open, stringExpression, _close, _semicolon) {
      const value = stringExpression.rep()
      stringTypeCondition(value, _print)
      return core.printFunction(value)
    },
    WhileLoop(_while, _open, booleanExpression, _close, block) {
      const condition = booleanExpression.rep()
      boolTypeCondition(condition, _while)

      context = context.createLocalContext({ inLoop: true })
      const body = block.rep()
      context = context.parent
      return core.whileLoop(condition, body)
    },
    IfBlock(ifStatement, elseIfStatements, elseStatement) {
      const ifEntity = ifStatement.rep()
      const elseifEntities = elseIfStatements?.children.map(elseIfStatement => elseIfStatement.rep()) ?? null
      const elseEntity = elseStatement?.rep()  ?? null
      return core.ifBlock(ifEntity, elseifEntities, elseEntity)
    },
    IfStatement(_if, _open, booleanExpression, _close, block) {
      const condition = booleanExpression.rep()
      boolTypeCondition(condition, _if)

      context = context.createLocalContext()
      const body = block.rep()
      context = context.parent
      return core.ifStatement(condition, body)
    },
    ElseIfStatement(_elseIf, _open, booleanExpression, _close, block) {
      const condition = booleanExpression.rep()
      boolTypeCondition(condition, _elseIf)

      context = context.createLocalContext()
      const body = block.rep()
      context = context.parent
      return core.elseIfStatement(condition, body)
    },
    ElseStatement(_else, block) {
      context = context.createLocalContext()
      const body = block.rep()
      context = context.parent
      return core.elseStatement(body)
    },
    ForLoop(_for, _open, variableDeclaration, _semicolon, booleanExpression, iteration, _close, block) {
      const variableDec = variableDeclaration.rep()
      const condition = booleanExpression.rep()
      boolTypeCondition(condition)
      const iterOp = iteration.rep()
      
      context = context.createLocalContext({inLoop: true})
      const body = block.rep()
      return core.forLoop(variableDec, condition, iterOp, body)
    },
    ForEach(_for, _open, type, id, _in, container, _close, block) {
      const typee = type.rep()
      notRedeclaredCondition(id)
      const contianerEntity = context.search(container.sourceString)
      existsCondition(contianerEntity, container.sourceString, _for)
      
      context = context.createLocalContext({inLoop: true})
      const body = block.rep()
      context = context.parent
      return core.forEach(typee, id.sourceString, container, body)
    },
    Iteration_pre(iterationOperator, id, _semicolon) {
      const iterOp = iterationOperator.rep()
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, iterationOperator)
      return core.iteration(variable, iterOp)
    },
    Iteration_post(id, iterationOperator, _semicolon) {
      const iterOp = iterationOperator.rep()
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, id)
      return core.iteration(variable, iterOp)
    },
    Statement_return(returnKeyword, exp, _semicolon) {
      inFunctionCondition(returnKeyword)
      anyReturnCondition(context.functionEntity, returnKeyword)
      const entity = exp.rep()
      returnableCondition(entity, context.functionEntity, returnKeyword)
      return core.returnStatement(entity)
    },
    Statement_shortReturn(returnKeyword, _semicolon) {
      inFunctionCondition(returnKeyword)
      voidReturnCondition(context.functionEntity, returnKeyword)
      return core.shortReturnStatement()
    },
    Statement_break(breakKeyword, _semicolon) {
      inLoopCondition(breakKeyword)
      return core.breakStatement()
    },
    FunctionCallExpression(id, _open, argumentsExpression, _close) {
      const args = argumentsExpression.rep()
      const functionEntity = context.search(id.sourceString)
      existsCondition(functionEntity, id.sourceString, id)
      return core.FunctionCallExpression(functionEntity, args)
    },
    Parameters(parameterTerms) {
      const parameters = parameterTerms.forEach(parameterTerm => parameterTerm.rep())
      return core.parameters(parameters)
    },
    ParameterTerm(type, id, _comma = null) {
      notRedeclaredCondition(id.sourceString, type)
      return core.parameterTerm(type, id.sourceString)
    },
    ArgumentsExpression(argumentValues) {
      const argumentsVals = argumentValues.forEach(argumentValue => argumentValue.rep())
      return core.ArgumentsExpression(argumentsVals)
    },
    ArgumentValue_expression(expression, _comma = null) {
      const exp = expression.rep()
      return core.argumentValueExpression(exp)
    },
    ArgumentValue_id(id, _comma = null) {
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, id)
      return core.argumentValueVariable(variable)
    },
    Typecast_functionCall(_open, type, _close, functionCallExpression) {
      const functionCall = functionCallExpression.rep()
      const typeToCastTo = type.rep()
      typeCastableCondition(typeToCastTo, functionCall.functionEntity.type, _open)
      return core.typecastFunctionCall(typeToCastTo, functionCall)
    },
    Typecast_expression(_open, type, _close, expression) {
      const exp = expression.rep()
      const typeToCastTo = type.rep()
      typeCastableCondition(typeToCastTo, exp.type, _open)
      return core.typecastExpression(typeToCastTo, exp)
    },
    Typecast_id(_open, type, _close, id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString)
      const typeToCastTo = type.rep()
      typeCastableCondition(typeToCastTo, variableEntity.type, _open)
      return core.typecastVariable(typeToCastTo, variableEntity)
    },
    NumericExpression_add(numericExpression, _plus, numericTerm) {
      const numExpression = numericExpression.rep()
      const numTerm = numericTerm.rep()
      similarTypeCondition(numExpression, numTerm, numericExpression)
      numericTypeCondition(numTerm, numericExpression)
      return core.numericExpression(numTerm.type, numExpression, _plus.sourceString, numTerm)
    },
    NumericExpression_sub(numericExpression, _minus, numericTerm) {
      const numExpression = numericExpression.rep()
      const numTerm = numericTerm.rep()
      similarTypeCondition(numExpression, numTerm, numericExpression)
      numericTypeCondition(numTerm, numericExpression)
      return core.numericExpression(numTerm.type, numExpression, _minus.sourceString, numTerm)
    },
    NumericTerm_mul(numericTerm, _mul, numericFactor) {
      const numTerm = numTerm.rep()
      const numFactor = numericFactor.rep()
      similarTypeCondition(numTerm, numFactor, numericTerm)
      numericTypeCondition(numFactor, numericTerm)
      return core.numericExpression(numFactor.type, numTerm, _mul.sourceString, numFactor)
    },
    NumericTerm_div(numericTerm, _div, numericFactor) {
      const numTerm = numericTerm.rep()
      const numFactor = numericFactor.rep()
      similarTypeCondition(numTerm, numFactor, numericTerm)
      numericTypeCondition(numFactor, numericTerm)
      return core.numericExpression(numFactor.type, numTerm, _div.sourceString, numFactor)
    },
    NumericTerm_mod(numericTerm, _mod, numericFactor) {
      const numTerm = numericTerm.rep()
      const numFactor = numericFactor.rep()
      similarTypeCondition(numTerm, numFactor, numericTerm)
      numericTypeCondition(numFactor, numericTerm)
      return core.numericExpression(numFactor.type, numTerm, _mod.sourceString, numFactor)
    },
    NumericFactor_exp(numericPrimary, _exp, numericFactor) {
      const numPrimary = numericPrimary.rep()
      const numFactor = numericFactor.rep()
      similarTypeCondition(numPrimary, numFactor, numericPrimary)
      numericTypeCondition(numPrimary, numericPrimary)
      return core.numericExpression(numPrimary.type, numPrimary, _exp.sourceString, numFactor)
    },
    NumericFactor_neg(_minus, numericPrimary) {
      const numPrimary = numericPrimary.rep()
      numericTypeCondition(numPrimary, _minus)
      return core.numericValue(numPrimary.type, numPrimary.value, true)
    },
    NumericPrimary_typecast(typeCast) {
      const cast = typeCast.rep()
      numericTypeCondition(cast, typeCast)
      return core.numericValue(cast.type, cast)
    },
    NumericPrimary_iterPost(id, iterationOperator) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      numericTypeCondition(variableEntity)
      const iterOp = iterationOperator.rep()
      return core.numericValue(variableEntity.type, core.iterPostVariable(variableEntity.type, variableEntity, iterOp))
    },
    NumericPrimary_iterPre(id, iterationOperator) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      numericTypeCondition(variableEntity)
      const iterOp = iterationOperator.rep()
      return core.numericValue(variableEntity.type, core.iterPreVariable(variableEntity.type, variableEntity, iterOp))
    },
    NumericPrimary_parens(_open, numericExpression, _close) {
      return numericExpression.rep()
    },
    NumericPrimary_funcs(functionCallExpression) {
      return functionCallExpression.rep()
    },
    NumericPrimary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      numericTypeCondition(variableEntity, id)
      return core.numericValue(variableEntity.type, variableEntity)
    },
    StringExpression_add(stringExpression, _add, stringPrimary) {
      const strExpression = stringExpression.rep()
      const strPrimary = stringPrimary.rep()
      stringTypeCondition(strExpression, stringExpression)
      stringTypeCondition(strPrimary, stringExpression)
      return core.stringExpression(strPrimary.type, strExpression, _add.sourceString, strPrimary)
    },
    StringPrimary_typecast(typecast) {
      const cast = typecast.rep()
      stringTypeCondition(cast, typecast)
      return core.stringValue(cast.type, cast)
    },
    StringPrimary_parens(_open, stringExpression, _close) {
      return stringExpression.rep()
    },
    StringPrimary_funcs(functionCallExpression) {
      return functionCallExpression.rep()
    },
    StringPrimary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      stringTypeCondition(variableEntity, id)
      return core.stringValue(variableEntity.type, variableEntity)
    },
    BooleanExpression_logic(booleanExpression1, logicOperator, booleanExpression2) {
      const boolExpression1 = booleanExpression1.rep()
      const boolExpression2 = booleanExpression2.rep()
      boolTypeCondition(boolExpression1, booleanExpression1)
      boolTypeCondition(boolExpression2, booleanExpression1)
      const logicOp = logicOperator.rep()
      return core.booleanExpression(boolExpression1.type, boolExpression1, logicOp, boolExpression2)
    },
    BooleanExpression_compare(booleanSecondary1, comparisonOperator, booleanSecondary2) {
      const boolSecondary1 = booleanSecondary1.rep()
      const boolSecondary2 = booleanSecondary2.rep()
      sameTypeCondition(boolSecondary1, boolSecondary2, booleanSecondary1)
      const compareOp = comparisonOperator.rep()
      return core.booleanComparison(booleanSecondary1.type, booleanSecondary1, compareOp, booleanSecondary2)
    },
    BooleanExpression_paren(_open, booleanExpression, _close) {
      return booleanExpression.rep()
    },
    BooleanPrimary_typecast(typecast) {
      const cast = typecast.rep()
      boolTypeCondition(cast, typecast)
      return core.booleanValue(cast.type, cast)
    },
    BooleanPrimary_paren(_open, booleanPrimary, _close) {
      return booleanPrimary.rep()
    },
    BooleanPrimary_funcs(functionCallExpression) {
      return functionCallExpression.rep()
    },
    BooleanPrimary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      boolTypeCondition(variableEntity, id)
      return core.booleanValue(variableEntity.type, variableEntity)
    },
    BooleanSecondary_parens(_open, booleanSecondary, _close) {
      return booleanSecondary.rep()
    },
    BooleanSecondary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      return variableEntity
    },
    ArrayAssignment(id, _bracketOpen, numericExpression, _bracketClose, _equals, expression, _semicolon) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      const index = numericExpression.rep()
      indexMustBeIntCondition(index, id)
      const value = expression.rep()
      assignableIntoArrayCondition(variableEntity, value, id)
      return core.arrayAssignment(variableEntity, index, value)
    },
    ArrayExpression_union(arrayExpression, _plus, arrayPrimary) {
      const arExpression = arrayExpression.rep()
      const arPrimary = arrayPrimary.rep()
      isArrayCondition(arExpression, arrayExpression)
      isArrayCondition(arPrimary, arrayExpression)
      sameArrayTypeCondition(arExpression.type, arPrimary.type, arrayExpression)
      return core.arrayExpression(arExpression.type, arExpression, _plus.sourceString, arPrimary)
    },
    ArrayExpression_difference(arrayExpression, _minus, arrayPrimary) {
      const arExpression = arrayExpression.rep()
      const arPrimary = arrayPrimary.rep()
      isArrayCondition(arExpression, arrayExpression)
      isArrayCondition(arPrimary, arrayExpression)
      sameArrayTypeCondition(arExpression.type, arPrimary.type, arrayExpression)
      return core.arrayExpression(arExpression.type, arExpression, _minus.sourceString, arPrimary)
    },
    ArrayPrimary_array(type, _openBrace, numeral, _closeBrace, _openCloseParen) {
      const elementType = type.rep()
      const arrayType = core.arrayType(elementType)
      const size = numeral.rep()
      indexMustBeIntCondition(size, type)
      return core.arrayValue(arrayType, size)
    },
    ArrayPrimary_parens(_open, arrayExpression, _close) {
      return arrayExpression.rep()
    },
    ArrayPrimary_funcs(functionCallExpression) {
      return functionCallExpression.rep()
    },
    ArrayPrimary_id(id) {
      const arrayEntity = context.search(id.sourceString)
      isArrayCondition(arrayEntity, id)
      return core.arrayValue(arrayEntity.type, arrayEntity.size)
    },
    Block(_openBracket, statements, _closeBrackets) {
      return statements.children.map(s => s.rep())
    },
    ArrayType(type, _openCloseBracket) {
      return core.arrayType(type.rep())
    },
    numericType_int(_type) {
      return core.intType
    },
    numericType_float(_type) {
      return core.floatType
    },
    numericType_double(_type) {
      return core.doubleType
    },
    stringType(_type) {
      return core.stringType
    },
    booleanType(_type) {
      return core.boolType
    },
    booleanValue_true(_val) {
      return true
    }, 
    booleanValue_false(_val) {
      return false
    },
    intValue(_digits) {
      return BigInt(this.sourceString)
    },
    floatValue(_digits, _point, _fraction, _f) {
      return Number(this.sourceString)
    },
    doubleValue(_digits, _point, _fraction) {
      return Number(this.sourceString)
    },
    stringValue(_openQuotes, chars, _closeQuotes) {
      return this.sourceString
    },
  })
}