import * as core from "./core.js"

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, functionEntity = null }) {
    Object.assign(this, { parent, locals, inLoop, functionEntity })
  }
  add(name, entity) {
    this.locals.set(name, entity)
  }
  search(name) {
    return this.locals.get(name) || this.parent?.search(name)
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
      const prefix = location.source.getLineAndColumnMessage()
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
      type1 === type2 ||
      type1 === core.stringType ||
      type2 === core.stringType
    )
  }
  function assignable(fromType, toType) {
    return (
      toType == core.anyType ||
      equivalent(fromType, toType)
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
  function sameTypeCondition(entity1, entity2, location) {
    checkCondition(equivalent(entity1.type, entity2.type), "Operands do not have the same type", location)
  }
  function similarTypeCondition(entity1, entity2, location) {
    checkCondition(assignable(entity1.type, entity2.type), "Operands do not have similar types", location)
  }
  function assignableIntoArrayCondition(arrayEntity, otherEntity, location) {
    checkCondition(assignable(arrayEntity.type.elementType, otherEntity.type), `Array containing ${arrayEntity.type.elementType} type cannot contain ${otherEntity.type} type`, location)
  }
  function isArrayCondition(type, location) {
    checkCondition(type?.kind === "ArrayType", "Must be an array type", location)
  }
  function sameArrayTypeCondition(type1, type2, location) {
    checkCondition(equivalent(type1, type2), `Array types do not match`, location)
  }
  function typeCastableCondition(type1, type2, location) {
    checkCondition(typeCastable(type1, type2), `Cannot cast type ${type1} to ${type2}`, location)
  }
  function inLoopCondition(location) {
    checkCondition(context.inLoop, "Break can only appear in a loop", location)
  }
  function inFunctionCondition(location) {
    checkCondition(context.funcEntity !== null, "Return can only appear in  function", location)
  }
  function voidReturnCondition(functionEntity, location) {
    checkCondition(functionEntity.type.returnType === core.voidType, `Non-void function attempted to return void type`, location)
  }
  function anyReturnCondition(functionEntity, location) {
    checkCondition(functionEntity.type.returnType !== core.voidType, `Void function attempted to return a non-void type`, location)
  }
  function returnableCondition(entity, functionEntity, location) {
    checkCondition(equivalent(entity.type, functionEntity.type.returnType), `A function with a return type of ${functionEntity.type.returnType} cannot return a ${entity.type}`, location)
  }
  function indexMustBeIntCondition(index, location) {
    checkCondition(index.type === core.intType, `Index for array must be have an int value`, location)
  }
  function sameArgumentTypesCondition(args1, args2, location) {
    if (args1.length !== args2.length) {
      checkCondition(false, `Mismatched function arguments count`, location)
      return;
    }
    let sameTypes = true;
    for (let i = 0; i < args1.length; i++) {
      sameTypes = sameTypes && args1[i] === args2[i]
    }
    checkCondition(sameTypes, `Mismatched function arguments`, location)
  }

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return core.program(statements.children.map(s => s.rep()))
    },
    FunctionDeclaration(type, id, _open, parameters, _close, block) {
      notRedeclaredCondition(id.sourceString, type)

      const functionVariables = []
      const params = parameters.rep()
      params.parameters.forEach(parameterTerm => {
        const paramType = parameterTerm.type.rep()
        notRedeclaredCondition(parameterTerm.id, parameterTerm, paramType)
        const variableEntity = core.variableEntity(parameterTerm.id, paramType)
        functionVariables.push([parameterTerm.id, variableEntity])
      })
      const paramTypes = params.parameters.map(parameterTerm => parameterTerm.type.rep())
      const functionType = core.functionType(paramTypes, type.rep())
      const funcEntity = core.functionEntity(id.sourceString, params, null, functionType)
      context.add(id.sourceString, funcEntity)
      context = context.createLocalContext({ functionEntity: funcEntity })
      functionVariables.forEach(pair => {
        context.add(pair[0], pair[1])
      });
      const body = block.rep()
      context = context.parent
      funcEntity.body = body
      context.add(id.sourceString, funcEntity)
      return core.functionDeclaration(funcEntity)
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
    VariableAssignment_assign(id, _equals, expression, _semicolon) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      const value = expression.rep()
      sameTypeCondition(variableEntity, value)
      return core.variableAssignment(variableEntity, value)
    },
    VariableAssignment_operator(id, incrementOperator, numericExpression, _semicolon) {
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, id)
      const increment = incrementOperator.sourceString
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
      let elseifEntities = null
      if (elseIfStatements.children.length != 0) {
        elseifEntities = elseIfStatements.children.map(elseIfStatement => elseIfStatement.rep())
      }
      if (elseStatement.children.length == 0) {
        return core.ifBlock(ifEntity, elseifEntities, null)
      } else {
        const elseEntity = elseStatement.rep()
        return core.ifBlock(ifEntity, elseifEntities, elseEntity)
      }
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
    ForLoop(_for, _open, variableDeclaration, booleanExpression, _semicolon, iteration, _close, block) {
      const variableDec = variableDeclaration.rep()
      const condition = booleanExpression.rep()
      boolTypeCondition(condition)
      const iter = iteration.rep()
      
      context = context.createLocalContext({inLoop: true})
      const body = block.rep()
      return core.forLoop(variableDec, condition, iter, body)
    },
    ForEach(_for, _open, type, id, _in, container, _close, block) {
      const typee = type.rep()
      notRedeclaredCondition(id)
      const contianerEntity = context.search(container.sourceString)
      existsCondition(contianerEntity, container.sourceString, _for)
      
      context = context.createLocalContext({inLoop: true})
      context.add(id.sourceString, core.variableEntity(id.sourceString, typee))
      const body = block.rep()
      context = context.parent
      return core.forEach(typee, id.sourceString, contianerEntity, body)
    },
    Iteration_pre(iterationOperator, id, _semicolon) {
      const iterOp = iterationOperator.sourceString
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, iterationOperator)
      return core.iteration(variable, iterOp, true)
    },
    Iteration_post(id, iterationOperator, _semicolon) {
      const iterOp = iterationOperator.sourceString
      const variable = context.search(id.sourceString)
      existsCondition(variable, id.sourceString, id)
      return core.iteration(variable, iterOp, false)
    },
    Statement_returnID(returnKeyword, id, _semicolon) {
      inFunctionCondition(returnKeyword)
      anyReturnCondition(context.functionEntity, returnKeyword)
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      returnableCondition(variableEntity, context.functionEntity, returnKeyword)
      return core.returnStatement(variableEntity)
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
    Statement_function(functionCallExpression, _semicolon) {
      return functionCallExpression.rep() 
    },
    FunctionCallExpression(id, _open, argumentsExpression, _close) {
      const args = argumentsExpression.rep()
      const argTypes = args.argumentValues.map(argValExpression => argValExpression.expression.type)
      const functionEntity = context.search(id.sourceString)
      existsCondition(functionEntity, id.sourceString, id)
      sameArgumentTypesCondition(argTypes, functionEntity.type.paramTypes, id)
      const functionReturnType = functionEntity.type.returnType
      return core.functionCallExpression(functionEntity, args, functionReturnType)
    },
    Parameters(parameterTerms) {
      const parameters = parameterTerms.children.map(parameterTerm => parameterTerm.rep())
      return core.parameters(parameters)
    },
    ParameterTerm(type, id, _comma) {
      notRedeclaredCondition(id.sourceString, type)
      return core.parameterTerm(type, id.sourceString)
    },
    ArgumentsExpression(argumentValues) {
      const argumentsVals = argumentValues.children.map(argumentValue => argumentValue.rep())
      return core.argumentsExpression(argumentsVals)
    },
    ArgumentValue_expression(expression, _comma) {
      const exp = expression.rep()
      return core.argumentValueExpression(exp)
    },
    Typecast_functionCall(_open, type, _close, functionCallExpression) {
      const functionCall = functionCallExpression.rep()
      const typeToCastTo = type.rep()
      typeCastableCondition(typeToCastTo, functionCall.type, _open)
      return core.typecastFunctionCall(typeToCastTo, core.functionCallValue(functionCall.functionEntity.type.returnType, functionCall))
    },
    Typecast_expression(_open, type, _close, expression) {
      const exp = expression.rep()
      const typeToCastTo = type.rep()
      typeCastableCondition(typeToCastTo, exp.type, _open)
      return core.typecastExpression(typeToCastTo, exp)
    },
    ArrayAccess(id, _open, numericExpression, _close){
      const exp = numericExpression.rep()
      numericTypeCondition(exp, id)
      const array = context.search(id.sourceString)
      existsCondition(array, id.sourceString, id)
      return core.arrayIndexValue(array.type.elementType, array, exp)
    },
    NumericExpression_add(numericExpression, _plus, numericTerm) {
      const numExpression = numericExpression.rep()
      const numTerm = numericTerm.rep()
      similarTypeCondition(numExpression, numTerm, numericExpression)
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
      const numTerm = numericTerm.rep()
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
      return core.numericValue(cast.type, cast)
    },
    NumericPrimary_iterPost(id, iterationOperator) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      numericTypeCondition(variableEntity)
      const iterOp = iterationOperator.sourceString
      return core.numericValue(variableEntity.type, core.iterPostVariable(variableEntity.type, variableEntity, iterOp))
    },
    NumericPrimary_iterPre(iterationOperator, id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      numericTypeCondition(variableEntity)
      const iterOp = iterationOperator.sourceString
      return core.numericValue(variableEntity.type, core.iterPreVariable(variableEntity.type, variableEntity, iterOp))
    },
    NumericPrimary_parens(_open, numericExpression, _close) {
      return numericExpression.rep()
    },
    NumericPrimary_funcs(functionCallExpression) {
      const functionCallExp =  functionCallExpression.rep()
      return core.functionCallValue(functionCallExp.functionEntity.type.returnType, functionCallExp)
    },
    NumericPrimary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      return core.idValue(variableEntity.type, variableEntity)
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
    StringPrimary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      return core.idValue(variableEntity.type, variableEntity)
    },
    BooleanExpression_compare(booleanSecondary1, comparisonOperator, booleanSecondary2) {
      const boolSecondary1 = booleanSecondary1.rep()
      const boolSecondary2 = booleanSecondary2.rep()
      sameTypeCondition(boolSecondary1, boolSecondary2, booleanSecondary1)
      const compareOp = comparisonOperator.sourceString
      return core.booleanComparison(core.boolType, booleanSecondary1, compareOp, booleanSecondary2)
    },
    BooleanExpression_paren(_open, boolExp, _close) {
      return boolExp.rep()
    },
    BooleanExpression_mult(boolExp, optionalLogicOp, optionalBoolExp) {
      const mainExp = boolExp.rep();
      const logicOps = optionalLogicOp.children.map(child => child.rep()) 
      const boolExps = optionalBoolExp.children.map(child => child.rep()) 
      let mainBoolExp = core.booleanExpression(core.boolType, mainExp, logicOps[0], boolExps[0])
      return mainBoolExp
    },
    BooleanPrimary_id(id) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)
      return core.idValue(variableEntity.type, variableEntity)

    },
    BooleanSecondary_parens(_open, booleanSecondary, _close) {
      return booleanSecondary.rep()
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
      isArrayCondition(arExpression.type, arrayExpression)
      isArrayCondition(arPrimary.type, arrayExpression)
      sameArrayTypeCondition(arExpression.type, arPrimary.type, arrayExpression)
      return core.arrayExpression(arExpression.type, arExpression, _plus.sourceString, arPrimary)
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
      return core.booleanValue(core.boolType, true)
    }, 
    booleanValue_false(_val) {
      return core.booleanValue(core.boolType, false)
    },
    intValue(_digits) {
      return core.numericValue(core.intType, BigInt(this.sourceString))
    },
    floatValue(_digits, _point, _fraction, _f) {
      return core.numericValue(core.floatType, Number(this.sourceString))
    },
    doubleValue(_digits, _point, _fraction) {
      return core.numericValue(core.doubleType, Number(this.sourceString))
    },
    stringValue(_openQuotes, chars, _closeQuotes) {
      return core.stringValue(core.stringType, this.sourceString)
    },
    _iter(...children) {
      return children.map(child => child.rep());
    },
    _terminal() {
      return this.sourceString
    }
  })

  return builder(match).rep()
}