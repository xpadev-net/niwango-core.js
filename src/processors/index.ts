import { T_scope } from "@/@types/ast";
import { processArrayExpression } from "@/processors/ArrayExpression";
import { processArrowFunctionExpression } from "@/processors/ArrowFunctionExpression";
import { processAssignmentExpression } from "@/processors/AssignmentExpression";
import { processBinaryExpression } from "@/processors/BinaryExpression";
import { processBlockStatement } from "@/processors/BlockStatement";
import { processCallExpression } from "@/processors/CallExpression";
import { processExpressionStatement } from "@/processors/ExpressionStatement";
import { processIdentifier } from "@/processors/Identifier";
import { processLambdaExpression } from "@/processors/LambdaExpression";
import { processLiteral } from "@/processors/Literal";
import { processLogicalExpression } from "@/processors/LogicalExpression";
import { processMemberExpression } from "@/processors/MemberExpression";
import { processObjectExpression } from "@/processors/ObjectExpression";
import { processProgram } from "@/processors/Program";
import { processReturnStatement } from "@/processors/ReturnStatement";
import { processSequenceExpression } from "@/processors/SequenceExpression";
import { processUnaryExpression } from "@/processors/UnaryExpression";
import { processUpdateExpression } from "@/processors/UpdateExpression";
import { processVariableDeclaration } from "@/processors/VariableDeclaration";

export const processors: {
  /* eslint @typescript-eslint/no-explicit-any: 0 */
  [key: string]: (script: any, scopes: T_scope[]) => unknown;
} = {
  AssignmentExpression: processAssignmentExpression,
  ArrayExpression: processArrayExpression,
  ArrowFunctionExpression: processArrowFunctionExpression,
  BinaryExpression: processBinaryExpression,
  BlockStatement: processBlockStatement,
  CallExpression: processCallExpression,
  EmptyStatement: () => undefined,
  ExpressionStatement: processExpressionStatement,
  Identifier: processIdentifier,
  LambdaExpression: processLambdaExpression,
  Literal: processLiteral,
  LogicalExpression: processLogicalExpression,
  MemberExpression: processMemberExpression,
  ObjectExpression: processObjectExpression,
  Program: processProgram,
  ReturnStatement: processReturnStatement,
  SequenceExpression: processSequenceExpression,
  UnaryExpression: processUnaryExpression,
  UpdateExpression: processUpdateExpression,
  VariableDeclaration: processVariableDeclaration,
};
