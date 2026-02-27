import type {
  ArrayExpression,
  Expression,
  Identifier,
  Literal,
  MemberExpression,
  ObjectExpression,
  Property,
  SpreadElement,
  Statement,
  TemplateLiteral,
  UnaryExpression,
} from 'estree';
import type jsonata from 'jsonata';

// 解析 jsonp
export const parseJsonp = async <T = any>(jsonp: string): Promise<T> => {
  const { parse } = await import('acorn');
  // 移除可能的空白字符
  let cleanedJsonp = jsonp.trim();

  // 尝试移除 JSONP 的回调包装，例如 callback({...}) -> {...}
  const match = cleanedJsonp.match(
    /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\((.*)\)\s*;?\s*$/,
  );
  if (match) {
    cleanedJsonp = match[1];
  }

  // 使用 acorn 解析表达式，需要转换为 ESTree 兼容格式
  const ast = parse(`(${cleanedJsonp})`, {
    ecmaVersion: 'latest',
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    allowAwaitOutsideFunction: true,
  }) as unknown as { body: Statement[] };

  // 获取表达式节点（Body 中的第一个元素）
  const expressionNode = (ast.body[0] as { expression: Expression }).expression;

  // 将 AST 转换为实际值
  const evaluateAst = (node: Expression): any => {
    switch (node.type) {
      case 'ObjectExpression': {
        const obj: Record<string, any> = {};
        for (const prop of (node as ObjectExpression).properties) {
          if (prop.type === 'Property') {
            const propertyNode = prop as unknown as Property;
            const key = (propertyNode.key as Identifier).name;
            obj[key] = evaluateAst(propertyNode.value as Expression);
          }
        }
        return obj;
      }

      case 'ArrayExpression':
        return (node as ArrayExpression).elements.map(
          (element: Expression | SpreadElement | null) => {
            if (element && element.type !== 'SpreadElement') {
              return evaluateAst(element as Expression);
            }
            return undefined;
          },
        );

      case 'Literal':
        return (node as Literal).value;

      case 'UnaryExpression': {
        const unaryNode = node as UnaryExpression;
        const argValue = evaluateAst(unaryNode.argument);
        switch (unaryNode.operator) {
          case '+':
            return +argValue;
          case '-':
            return -argValue;
          case '!':
            return !argValue;
          case '~':
            return ~argValue;
          case 'typeof':
            return typeof argValue;
          case 'void':
            return void argValue;
          default:
            return argValue;
        }
      }

      case 'Identifier':
        // 对于标识符，我们返回 undefined，因为在 JSONP 上下文中它们通常没有定义
        return undefined;

      case 'MemberExpression': {
        const memberNode = node as MemberExpression;
        const object = evaluateAst(memberNode.object as Expression);
        const property = evaluateAst(memberNode.property as Expression);
        return object?.[property];
      }

      case 'CallExpression':
        // 不支持函数调用，防止任意代码执行
        throw new Error('Function calls are not allowed in JSONP data');

      case 'TemplateLiteral': {
        const templateNode = node as TemplateLiteral;
        let result = '';
        const expressions = templateNode.expressions.map(exp =>
          evaluateAst(exp as Expression),
        );
        for (let i = 0; i < templateNode.quasis.length; i++) {
          result += templateNode.quasis[i].value.cooked;
          if (i < expressions.length) {
            result += expressions[i];
          }
        }
        return result;
      }

      default:
        // 其他节点类型不支持，返回 undefined
        return undefined;
    }
  };

  return evaluateAst(expressionNode);
};

export const createJsonAta = async (expr: string) => {
  const { default: jsonata } = await import('jsonata');
  return jsonata(expr);
};

export const extractData = <T = any>(
  j: ReturnType<typeof jsonata>,
  data: any,
): Promise<T> => j.evaluate(data);
