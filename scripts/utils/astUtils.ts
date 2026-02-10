import * as parser from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import _traverse from '@babel/traverse';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default;
import _generate from '@babel/generator';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generate = (_generate as any).default;
import * as t from '@babel/types';

const KOREAN_REGEX = /[가-힣]/;

/**
 * 코드 문자열을 파싱하여 AST로 변환
 */
export function parseCode(code: string) {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

/**
 * 리액트 컴포넌트 함수인지 판별
 */
function isReactComponentFunction(path: NodePath): boolean {
  // 함수 선언문
  if (path.isFunctionDeclaration()) {
    return path.node.id?.name?.[0] === path.node.id?.name?.[0]?.toUpperCase();
  }

  // 화살표 함수 표현식 또는 함수 표현식
  if (path.isArrowFunctionExpression() || path.isFunctionExpression()) {
    const parent = path.parentPath;

    // 변수 선언문
    if (parent?.isVariableDeclarator()) {
      const varName = (parent.node.id as t.Identifier)?.name;
      return /^[A-Z]/.test(varName);
    }

    // 합성 컴포넌트
    if (parent?.isAssignmentExpression()) {
      const left = parent.get('left');
      if (left.isMemberExpression()) {
        const property = left.get('property');
        if (property.isIdentifier()) {
          return /^[A-Z]/.test(property.node.name);
        }
      }
    }
  }

  return false;
}

/**
 * AST에서 한글 문자열 탐색 및 변환
 */
export function transformAST(ast: t.File) {
  const koreanKeys = new Set<string>();
  const componentsToModify = new Set<NodePath>();
  let hasUseTranslationImport = false;
  const simpleStringsToTransform: NodePath<t.StringLiteral | t.JSXText>[] = [];
  const templateLiteralsToTransform: {
    path: NodePath<t.TemplateLiteral>;
    i18nKey: string;
    objectProperties: t.ObjectProperty[];
  }[] = [];

  // 1️. 한글 문자열 탐색 및 변환 대상 수집
  traverse(ast, {
    JSXText(path) {
      const value = path.node.value.trim();
      if (value && KOREAN_REGEX.test(value)) {
        const component = path.findParent((p) => isReactComponentFunction(p));
        if (component) {
          const parentT = path.findParent(
            (p) =>
              p.isCallExpression() &&
              p.get('callee').isIdentifier({ name: 't' }),
          );
          if (parentT) return;

          simpleStringsToTransform.push(path);
          koreanKeys.add(value);
          componentsToModify.add(component);
        }
      }
    },
    StringLiteral(path) {
      const value = path.node.value.trim();
      if (
        value &&
        KOREAN_REGEX.test(value) &&
        path.parent.type !== 'ImportDeclaration' &&
        path.parent.type !== 'ExportNamedDeclaration' &&
        !(
          path.parent.type === 'ObjectProperty' && path.parent.key === path.node
        )
      ) {
        const component = path.findParent((p) => isReactComponentFunction(p));
        if (component) {
          const parentT = path.findParent(
            (p) =>
              p.isCallExpression() &&
              p.get('callee').isIdentifier({ name: 't' }),
          );
          if (parentT) return;

          simpleStringsToTransform.push(path);
          koreanKeys.add(value);
          componentsToModify.add(component);
        }
      }
    },
    TemplateLiteral(path) {
      const { quasis, expressions } = path.node;
      const hasKorean = quasis.some((q) => KOREAN_REGEX.test(q.value.cooked));
      if (!hasKorean) return;

      if (
        path.parent.type === 'CallExpression' &&
        t.isIdentifier(path.parent.callee) &&
        path.parent.callee.name === 't'
      ) {
        return;
      }

      const component = path.findParent((p) => isReactComponentFunction(p));
      if (!component) return;

      let i18nKey = '';
      const objectProperties: t.ObjectProperty[] = [];

      for (let i = 0; i < quasis.length; i++) {
        i18nKey += quasis[i].value.cooked;
        if (i < expressions.length) {
          const expr = expressions[i];
          let placeholderName: string;

          if (t.isIdentifier(expr)) {
            placeholderName = expr.name;
          } else if (
            t.isMemberExpression(expr) &&
            t.isIdentifier(expr.property)
          ) {
            placeholderName = expr.property.name;
          } else {
            placeholderName = `val${i}`;
          }

          let finalName = placeholderName;
          let count = 1;
          while (
            objectProperties.some(
              (p) => t.isIdentifier(p.key) && p.key.name === finalName,
            )
          ) {
            finalName = `${placeholderName}${count++}`;
          }

          i18nKey += `{{${finalName}}}`;
          objectProperties.push(
            t.objectProperty(
              t.identifier(finalName),
              expr,
              false,
              t.isIdentifier(expr) && finalName === expr.name,
            ),
          );
        }
      }

      koreanKeys.add(i18nKey);
      componentsToModify.add(component);
      templateLiteralsToTransform.push({ path, i18nKey, objectProperties });
    },
    ImportDeclaration(path) {
      if (path.node.source.value === 'react-i18next') {
        hasUseTranslationImport = true;
      }
    },
  });

  // 2️. useTranslation import 추가
  if (koreanKeys.size > 0 && !hasUseTranslationImport) {
    const importDecl = t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier('useTranslation'),
          t.identifier('useTranslation'),
        ),
      ],
      t.stringLiteral('react-i18next'),
    );
    ast.program.body.unshift(importDecl);
  }

  // 3️. 각 컴포넌트에 const { t } = useTranslation() 추가
  componentsToModify.forEach((componentPath) => {
    const bodyPath = componentPath.get('body');
    if (Array.isArray(bodyPath) || !bodyPath.isBlockStatement()) return;

    let hasHook = false;
    bodyPath.get('body').forEach((stmt) => {
      if (stmt.isVariableDeclaration()) {
        const declaration = stmt.node.declarations[0];
        if (
          declaration?.init?.type === 'CallExpression' &&
          t.isIdentifier(declaration.init.callee) &&
          declaration.init.callee.name === 'useTranslation'
        ) {
          hasHook = true;
        }
      }
    });

    if (!hasHook) {
      const hookDecl = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.objectPattern([
            t.objectProperty(t.identifier('t'), t.identifier('t'), false, true),
          ]),
          t.callExpression(t.identifier('useTranslation'), []),
        ),
      ]);
      bodyPath.unshiftContainer('body', hookDecl);
    }
  });

  // 4️. 템플릿 리터럴 변환
  templateLiteralsToTransform.forEach(({ path, i18nKey, objectProperties }) => {
    const keyLiteral = t.stringLiteral(i18nKey);
    if (objectProperties.length > 0) {
      const interpolationObject = t.objectExpression(objectProperties);
      const tCall = t.callExpression(t.identifier('t'), [
        keyLiteral,
        interpolationObject,
      ]);
      path.replaceWith(tCall);
    } else {
      const tCall = t.callExpression(t.identifier('t'), [keyLiteral]);
      path.replaceWith(tCall);
    }
  });

  // 5️. 컴포넌트 내부 한글 텍스트 t()로 감싸기
  simpleStringsToTransform.forEach((path) => {
    const value =
      path.node.type === 'JSXText'
        ? path.node.value.trim()
        : (path.node as t.StringLiteral).value;

    const tCall = t.callExpression(t.identifier('t'), [t.stringLiteral(value)]);

    if (path.isJSXText()) {
      path.replaceWith(t.jsxExpressionContainer(tCall));
    } else if (path.isStringLiteral()) {
      if (path.parent.type === 'JSXAttribute') {
        path.replaceWith(t.jsxExpressionContainer(tCall));
      } else {
        path.replaceWith(tCall);
      }
    }
  });

  return koreanKeys;
}

/**
 * AST를 코드 문자열로 다시 변환
 */
export function generateCode(ast: t.File) {
  const { code } = generate(ast, {
    retainLines: true,
    jsescOption: { minimal: true },
  });
  return code;
}
