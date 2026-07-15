#!/bin/bash
# 提交前检查：lint + 格式化
set -e

echo "Running pre-commit checks..."

echo "[1/2] Running ESLint..."
pnpm run lint

echo "[2/2] Running TypeScript check..."
npx tsc --noEmit

echo "Pre-commit checks passed!"
