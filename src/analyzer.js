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
    must(type?.kind === "ArrayType", "Must be an array type", at)
  }
  function assignableCondition(entity, type, location) {
    checkCondition(assignable(entity.type, type), `Cannot assign a ${entity.type} to a ${type}`, location)
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
      
      const value = expression.rep()
      const variableEntity = core.variableEntity(id.sourceString, value.type)
      context.add(id.sourceString, variableEntity)
      return core.variableDeclaration(variableEntity, value)
    },
    VariableAssignment(id, _equals, expression, _semicolon) {
      const variableEntity = context.search(id.sourceString)
      existsCondition(variableEntity, id.sourceString, id)

      const value = expression.rep()
      sameTypeCondition(variableEntity, value)
      return core.variableAssignment(variableEntity, value)
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
  })
}