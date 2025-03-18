import * as core from "./core.js"

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
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

  // conditions
  function notRedeclaredCondition(name, location) {
    checkCondition(!context.search(name), `Identifier ${name} already declared`, location)
  }
  function existsCondition(entity, name, location) {
    checkCondition(entity, `Identifier ${name} does not exist`, location)
  }
  function numericTypeCondition(entity, location){
    const expectedTypes = [core.intType, core.floatType, core.doubleType]
    checkCondition(expectedTypes.includes(entity.type), "Expected a numeric type", location)
  }
  function stringTypeCondition(entity, location) {
    checkCondition(entity.type === core.stringType, "Expected a string type", location)
  }
  function boolTypeCondition(entity, location) {
    checkCondition(entity.type === core.boolType, "Expected a bool type", location)
  }
  function intArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.intType), "Expected an int array type", location)
  }
  function floatArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.floatType), "Expected a float array type", location)
  }
  function doubleArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.doubleType), "Expected a double array type", location)
  }
  function stringArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.stringType), "Expected a string array type", location)
  }
  function boolArrayTypeCondition(entity, location) {
    checkCondition(entity.type === core.arrayType(core.boolType), "Expected a bool array type", location)
  }
  function sameTypeCondition(entity1, entity2, location) {
    checkCondition(entity1.type === entity2.type, "Operands do not have the same type", location)
  }
  function sameTypeAsArrayCondition(arrayEntity, otherEntity, location) {
    checkCondition(arrayEntity.type.elementType === otherEntity.type, `Array containing ${arrayEntity.type.elementType} type cannot contain ${otherEntity.type} type`, location)
  }
  function allSameTypeCondition(entities, location) {
    checkCondition(entities.slice(1).every(entity => entity.type === entities[0].type), "Not all elements have the same type", location)
  }
  function existingTypeCondition(entity, location) {
    const isBasicType = /int|float|double|string|bool|void|any/.test(entity)
    const isCompositeType = /ArrayType/.test(e?.kind)
    checkCondition(isBasicType || isCompositeType, "Type expected", location)
  }
  function isArrayCondition(type, location) {
    must(type?.kind === "ArrayType", "Must be an array type", at)
  }
  function equivalent(type1, type2) {
    return (
      type1 === type2 ||
      (type1?.kind === "ArrayType" &&
        type2?.kind === "ArrayType" &&
        equivalent(type1.elementType, type2.elementType))
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
        
        toType.paramTypes.every((t, i) => assignable(t, fromType.paramTypes[i])))
    )
  }
}