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
 * AST에서 한글 문자열 탐색 및 변환
 */
export function transformAST(ast: t.File) {
  const koreanKeys = new Set<string>();
  const componentsToModify = new Set<NodePath>();
  let hasUseTranslationImport = false;

  // 1️. 한글 문자열 탐색
  traverse(ast, {
    JSXText(path) {
      const value = path.node.value.trim();
      if (value && KOREAN_REGEX.test(value)) {
        koreanKeys.add(value);
        const component = path.findParent(
          (p) =>
            p.isFunctionDeclaration() ||
            p.isArrowFunctionExpression() ||
            p.isFunctionExpression(),
        );
        if (component) componentsToModify.add(component);
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
        koreanKeys.add(value);
        const component = path.findParent(
          (p) =>
            p.isFunctionDeclaration() ||
            p.isArrowFunctionExpression() ||
            p.isFunctionExpression(),
        );
        if (component) componentsToModify.add(component);
      }
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

    if (Array.isArray(bodyPath) || !bodyPath.isBlockStatement()) {
      return;
    }

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

  // 4️. 한글 텍스트를 t('...')로 감싸기
  traverse(ast, {
    JSXText(path) {
      const value = path.node.value.trim();
      if (value && koreanKeys.has(value)) {
        const parent = path.findParent(
          (p) =>
            p.isCallExpression() &&
            t.isIdentifier(p.node.callee) &&
            p.node.callee.name === 't',
        );
        if (parent) return;

        const tCall = t.callExpression(t.identifier('t'), [
          t.stringLiteral(value),
        ]);
        path.replaceWith(t.jsxExpressionContainer(tCall));
      }
    },
    StringLiteral(path) {
      const value = path.node.value.trim();
      if (
        path.parent.type === 'CallExpression' &&
        t.isIdentifier(path.parent.callee) &&
        path.parent.callee.name === 't'
      ) {
        return;
      }

      if (
        koreanKeys.has(value) &&
        path.parent.type !== 'ImportDeclaration' &&
        path.parent.type !== 'ExportNamedDeclaration'
      ) {
        if (path.parent.type === 'JSXAttribute') {
          const tCall = t.callExpression(t.identifier('t'), [
            t.stringLiteral(value),
          ]);
          path.replaceWith(t.jsxExpressionContainer(tCall));
        } else {
          const tCall = t.callExpression(t.identifier('t'), [
            t.stringLiteral(value),
          ]);
          path.replaceWith(tCall);
        }
      }
    },
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
