/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Outline, OutlineTree} from 'atom-ide-ui';

import {Point} from 'simple-text-buffer';

import {arrayCompact} from 'nuclide-commons/collection';

import type {TokenizedText} from 'nuclide-commons/tokenized-text';
import {
  keyword,
  className,
  method,
  param,
  string,
  whitespace,
  plain,
  type,
} from 'nuclide-commons/tokenized-text';

import invariant from 'assert';

type Extent = {
  startPosition: atom$Point,
  endPosition: atom$Point,
};

export const :[fn~\w+] = (ast: any) =>: Outline {
  return {
    outlineTrees: itemsToTrees(ast.body),
  };
}

const :[fn~\w+] = (items: Array<any>) =>: Array<OutlineTree> {
  return arrayCompact(items.map(itemToTree));
}

const :[fn~\w+] = (item: any) =>: ?OutlineTree {
  if (item == null) {
    return null;
  }
  const extent = getExtent(item);
  switch (item.type) {
    case 'FunctionDeclaration':
    case 'ArrowFunctionExpression':
      return functionOutline(
        item.id != null ? item.id.name : '',
        item.params,
        extent,
      );
    case 'ClassDeclaration':
    case 'ClassExpression':
      const tokenizedText = [keyword('class')];
      let representativeName = undefined;
      if (item.id != null) {
        tokenizedText.push(whitespace(' '), className(item.id.name));
        representativeName = item.id.name;
      }
      return {
        kind: 'class',
        tokenizedText,
        representativeName,
        children: itemsToTrees(item.body.body),
        ...extent,
      };
    case 'ClassProperty':
      let paramTokens = [];
      if (item.value && item.value.type === 'ArrowFunctionExpression') {
        paramTokens = [
          plain('('),
          ...declarationsTokenizedText(item.value.params),
          plain(')'),
        ];
      }
      return {
        kind: 'property',
        tokenizedText: [method(item.key.name), plain('='), ...paramTokens],
        representativeName: item.key.name,
        children: [],
        ...extent,
      };
    case 'MethodDefinition':
      return {
        kind: 'method',
        tokenizedText: [
          method(item.key.name),
          plain('('),
          ...declarationsTokenizedText(item.value.params),
          plain(')'),
        ],
        representativeName: item.key.name,
        children: [],
        ...extent,
      };
    case 'ExportDeclaration':
    case 'ExportNamedDeclaration':
    case 'DeclareExportDeclaration':
      return exportDeclaration(item, extent, Boolean(item.default));
    case 'ExportDefaultDeclaration':
      return exportDeclaration(item, extent, true);
    case 'ExpressionStatement':
      return topLevelExpressionOutline(item);
    case 'TypeAlias':
      return typeAliasOutline(item);
    case 'VariableDeclaration':
      return variableDeclarationOutline(item);
    case 'DeclareClass':
      return declareClassOutline(item, extent);
    case 'DeclareFunction':
      return declareFunctionOutline(item, extent);
    case 'DeclareModule':
      return declareModuleOutline(item, extent);
    case 'DeclareVariable':
      return declareVariableOutline(item, extent);
    case 'InterfaceDeclaration':
      return declareInterfaceOutline(item, extent);
    default:
      return null;
  }
}

const :[fn~\w+] = (
  item: any,
  extent: Extent,
  isDefault: boolean,
) =>: ?OutlineTree {
  const tree = itemToTree(item.declaration);
  if (tree == null) {
    return null;
  }
  const tokenizedText = [keyword('export'), whitespace(' ')];
  if (isDefault) {
    tokenizedText.push(keyword('default'), whitespace(' '));
  }
  // Flow always has tokenizedText
  invariant(tree.tokenizedText != null);
  tokenizedText.push(...tree.tokenizedText);
  return {
    kind: tree.kind,
    tokenizedText,
    representativeName: tree.representativeName,
    children: tree.children,
    ...extent,
  };
}

const :[fn~\w+] = (
  textElements: TokenizedText,
  p: any,
  index: number,
  declarations: Array<any>,
) =>: TokenizedText {
  switch (p.type) {
    case 'Identifier':
      textElements.push(param(p.name));
      break;
    case 'ObjectPattern':
      textElements.push(plain('{'));
      textElements.push(
        ...declarationsTokenizedText(p.properties.map(obj => obj.key)),
      );
      textElements.push(plain('}'));
      break;
    case 'ArrayPattern':
      textElements.push(plain('['));
      textElements.push(...declarationsTokenizedText(p.elements));
      textElements.push(plain(']'));
      break;
    case 'AssignmentPattern':
      return declarationReducer(textElements, p.left, index, declarations);
    case 'RestElement':
      textElements.push(plain('...'));
      return declarationReducer(textElements, p.argument, index, declarations);
    case 'FunctionTypeParam':
      // Very similar to the Identifier case, but with different obj structure
      if (p.name) {
        textElements.push(param(p.name.name));
      }
      break;
    default:
      throw new Error(`encountered unexpected argument type ${p.type}`);
  }
  if (index < declarations.length - 1) {
    textElements.push(plain(','));
    textElements.push(whitespace(' '));
  }
  return textElements;
}

const :[fn~\w+] = (declarations: Array<any>) =>: TokenizedText {
  return declarations.reduce(declarationReducer, []);
}

const :[fn~\w+] = (item: any) =>: Extent {
  return {
    startPosition: new Point(
      // It definitely makes sense that the lines we get are 1-based and the columns are
      // 0-based... convert to 0-based all around.
      item.loc.start.line - 1,
      item.loc.start.column,
    ),
    endPosition: new Point(item.loc.end.line - 1, item.loc.end.column),
  };
}

const :[fn~\w+] = (
  name: string,
  params: Array<any>,
  extent: Extent,
) =>: OutlineTree {
  return {
    kind: 'function',
    tokenizedText: [
      keyword('function'),
      whitespace(' '),
      method(name),
      plain('('),
      ...declarationsTokenizedText(params),
      plain(')'),
    ],
    representativeName: name,
    children: [],
    ...extent,
  };
}

const :[fn~\w+] = (typeAliasExpression: any) =>: OutlineTree {
  invariant(typeAliasExpression.type === 'TypeAlias');
  const name = typeAliasExpression.id.name;
  return {
    kind: 'interface',
    tokenizedText: [keyword('type'), whitespace(' '), type(name)],
    representativeName: name,
    children: [],
    ...getExtent(typeAliasExpression),
  };
}

const :[fn~\w+] = (expressionStatement: any) =>: ?OutlineTree {
  switch (expressionStatement.expression.type) {
    case 'CallExpression':
      return specOutline(expressionStatement, /* describeOnly */ true);
    case 'AssignmentExpression':
      return moduleExportsOutline(expressionStatement.expression);
    default:
      return null;
  }
}

const :[fn~\w+] = (assignmentStatement: any) =>: ?OutlineTree {
  invariant(assignmentStatement.type === 'AssignmentExpression');

  const left = assignmentStatement.left;
  if (!isModuleExports(left)) {
    return null;
  }

  const right = assignmentStatement.right;

  switch (right.type) {
    case 'ClassExpression':
      return itemToTree(right);
    case 'ObjectExpression':
      const properties: Array<Object> = right.properties;
      return {
        kind: 'module',
        tokenizedText: [plain('module.exports')],
        children: arrayCompact(properties.map(moduleExportsPropertyOutline)),
        ...getExtent(assignmentStatement),
      };
    default:
      return null;
  }
}

const :[fn~\w+] = (left: Object) =>: boolean {
  return (
    left.type === 'MemberExpression' &&
    left.object.type === 'Identifier' &&
    left.object.name === 'module' &&
    left.property.type === 'Identifier' &&
    left.property.name === 'exports'
  );
}

const :[fn~\w+] = (property: any) =>: ?OutlineTree {
  invariant(property.type === 'Property');
  if (property.key.type !== 'Identifier') {
    return null;
  }
  const propName = property.key.name;

  if (property.shorthand) {
    // This happens when the shorthand `{ foo }` is used for `{ foo: foo }`
    return {
      kind: 'method',
      tokenizedText: [string(propName)],
      representativeName: propName,
      children: [],
      ...getExtent(property),
    };
  }

  if (
    property.value.type === 'FunctionExpression' ||
    property.value.type === 'ArrowFunctionExpression'
  ) {
    return {
      kind: 'method',
      tokenizedText: [
        method(propName),
        plain('('),
        ...declarationsTokenizedText(property.value.params),
        plain(')'),
      ],
      representativeName: propName,
      children: [],
      ...getExtent(property),
    };
  }

  return {
    kind: 'field',
    tokenizedText: [string(propName), plain(':')],
    representativeName: propName,
    children: [],
    ...getExtent(property),
  };
}

const :[fn~\w+] = (
  expressionStatement: any,
  describeOnly: boolean = false,
) =>: ?OutlineTree {
  const expression = expressionStatement.expression;
  if (expression.type !== 'CallExpression') {
    return null;
  }
  const functionName = getFunctionName(expression.callee);
  if (functionName == null) {
    return null;
  }
  if (!isDescribe(functionName)) {
    if (describeOnly || !isIt(functionName)) {
      return null;
    }
  }
  const description = getStringLiteralValue(expression.arguments[0]);
  const specBody = getFunctionBody(expression.arguments[1]);
  if (description == null || specBody == null) {
    return null;
  }
  let children;
  if (isIt(functionName)) {
    children = [];
  } else {
    children = arrayCompact(
      specBody
        .filter(item => item.type === 'ExpressionStatement')
        .map(item => specOutline(item)),
    );
  }
  return {
    kind: 'function',
    tokenizedText: [method(functionName), whitespace(' '), string(description)],
    representativeName: description,
    children,
    ...getExtent(expressionStatement),
  };
}

// Return the function name as written as a string. Intended to stringify patterns like `describe`
// and `describe.only` even though `describe.only` is a MemberExpression rather than an Identifier.
const :[fn~\w+] = (callee: any) =>: ?string {
  switch (callee.type) {
    case 'Identifier':
      return callee.name;
    case 'MemberExpression':
      if (
        callee.object.type !== 'Identifier' ||
        callee.property.type !== 'Identifier'
      ) {
        return null;
      }
      return `${callee.object.name}.${callee.property.name}`;
    default:
      return null;
  }
}

const :[fn~\w+] = (functionName: string) =>: boolean {
  switch (functionName) {
    case 'describe':
    case 'fdescribe':
    case 'ddescribe':
    case 'xdescribe':
    case 'describe.only':
    case 'describe.skip':
    case 'test.cb':
    case 'test.serial':
    case 'test.todo':
    case 'test.failing':
    case 'test':
    case 'test.concurrent':
    case 'test.only':
    case 'test.skip':
    case 'suite':
    case 'suite.only':
    case 'suite.skip':
    case 'xtest':
    case 'xtest.concurrent':
    case 'xtest.only':
    case 'xtest.skip':
      return true;
    default:
      return false;
  }
}

const :[fn~\w+] = (functionName: string) =>: boolean {
  switch (functionName) {
    case 'it':
    case 'fit':
    case 'iit':
    case 'pit':
    case 'xit':
    case 'it.only':
    case 'it.skip':
      return true;
    default:
      return false;
  }
}

/** If the given AST Node is a string literal, return its literal value. Otherwise return null */
const :[fn~\w+] = (literal: ?any) =>: ?string {
  if (literal == null) {
    return null;
  }
  if (literal.type !== 'Literal') {
    return null;
  }
  const value = literal.value;
  if (typeof value !== 'string') {
    return null;
  }
  return value;
}

const :[fn~\w+] = (fn: ?any) =>: ?Array<any> {
  if (fn == null) {
    return null;
  }
  if (
    fn.type !== 'ArrowFunctionExpression' &&
    fn.type !== 'FunctionExpression'
  ) {
    return null;
  }
  return fn.body.body;
}

const :[fn~\w+] = (declaration: any) =>: ?OutlineTree {
  // If there are multiple var declarations in one line, just take the first.
  return variableDeclaratorOutline(
    declaration.declarations[0],
    declaration.kind,
    getExtent(declaration),
  );
}

const :[fn~\w+] = (
  declarator: any,
  kind: string,
  extent: Extent,
) =>: ?OutlineTree {
  if (
    declarator.init != null &&
    (declarator.init.type === 'FunctionExpression' ||
      declarator.init.type === 'ArrowFunctionExpression')
  ) {
    return functionOutline(declarator.id.name, declarator.init.params, extent);
  }

  const {id} = declarator;

  const tokenizedText = [
    keyword(kind),
    whitespace(' '),
    ...declarationsTokenizedText([id]),
  ];
  const representativeName = id.type === 'Identifier' ? id.name : undefined;
  return {
    kind: kind === 'const' ? 'constant' : 'variable',
    tokenizedText,
    representativeName,
    children: [],
    ...extent,
  };
}
const :[fn~\w+] = (item: any, extent: Extent) =>: ?OutlineTree {
  const tokenizedText = [keyword('class')];
  let representativeName = undefined;
  if (item.id != null) {
    tokenizedText.push(whitespace(' '), className(item.id.name));
    representativeName = item.id.name;
  }
  const properties = item.body.properties;
  return {
    kind: 'class',
    tokenizedText,
    representativeName,
    children: arrayCompact(properties.map(declareClassPropertyOutline)),
    ...extent,
  };
}
const :[fn~\w+] = (item: any) =>: ?OutlineTree {
  if (item.key == null) {
    return null;
  }
  const representativeName = item.key.name;
  const extent = getExtent(item);
  switch (item.value.type) {
    case 'FunctionTypeAnnotation':
      return functionOutline(representativeName, item.value.params, extent);
    case 'StringTypeAnnotation':
    case 'GenericTypeAnnotation':
      return {
        kind: 'property',
        tokenizedText: [method(representativeName)],
        representativeName,
        children: [],
        ...extent,
      };
    default:
      return null;
  }
}

const :[fn~\w+] = (item: any, extent: Extent) =>: ?OutlineTree {
  const params = item.id.typeAnnotation.typeAnnotation.params;
  return functionOutline(item.id.name, params.map(obj => obj.name), extent);
}
const :[fn~\w+] = (item: any, extent: Extent) =>: ?OutlineTree {
  const tokenizedText = [keyword('module')];
  let representativeName = undefined;
  if (item.id != null) {
    tokenizedText.push(whitespace(' '), className(item.id.value));
    representativeName = item.id.value;
  }
  return {
    kind: 'interface',
    tokenizedText,
    representativeName,
    children: itemsToTrees(item.body.body),
    ...extent,
  };
}
const :[fn~\w+] = (item: any, extent: Extent) =>: ?OutlineTree {
  return {
    kind: 'variable',
    tokenizedText: [keyword('var'), whitespace(' '), method(item.id.name)],
    representativeName: item.id.name,
    children: [],
    ...extent,
  };
}

const :[fn~\w+] = (item: any, extent: Extent) =>: ?OutlineTree {
  const tokenizedText = [keyword('interface')];
  let representativeName = undefined;
  if (item.id != null) {
    tokenizedText.push(whitespace(' '), type(item.id.name));
    representativeName = item.id.name;
  }
  return {
    kind: 'interface',
    tokenizedText,
    representativeName,
    children: [],
    ...extent,
  };
}
