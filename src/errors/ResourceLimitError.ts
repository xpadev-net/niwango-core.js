import type { A_ANY, T_scope } from "@/@types/ast";

class ResourceLimitError extends Error {
  ASTName?: string;
  ast?: A_ANY;
  scopes?: T_scope[];
  limitName: string;
  limit: number;
  actual: number;

  constructor(
    limitName: string,
    limit: number,
    actual: number,
    ast?: A_ANY,
    scopes?: T_scope[],
    options: { [key: string]: unknown } = {},
  ) {
    super(
      `${limitName} resource limit exceeded: ${actual} > ${limit}`,
      options,
    );
    this.limitName = limitName;
    this.limit = limit;
    this.actual = actual;
    if (ast) {
      this.ASTName = ast.type;
      this.ast = ast;
    }
    if (scopes) {
      this.scopes = scopes;
    }
  }
}

ResourceLimitError.prototype.name = "ResourceLimitError";
export { ResourceLimitError };
