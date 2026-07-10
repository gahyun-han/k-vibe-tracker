#!/usr/bin/env sh
# Pre-commit hook to enforce code quality before commits
# Install: cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit checks..."

# 1. Check for staged changes
if git diff --cached --quiet; then
  echo "✅ No staged changes"
  exit 0
fi

# 2. Get staged files
STAGED_FILES=$(git diff --cached --name-only | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No TypeScript files staged"
  exit 0
fi

echo "📋 Staged TypeScript files:"
echo "$STAGED_FILES" | sed 's/^/  - /'

# 3. Type check
echo ""
echo "🔎 Type checking..."
npm run type-check -- || {
  echo "❌ Type check failed. Fix the errors and try again."
  exit 1
}

# 4. Lint
echo ""
echo "🎨 Linting..."
npx eslint $STAGED_FILES --fix || {
  echo "❌ ESLint failed on some files."
  echo "Try running: npm run lint -- --fix"
  exit 1
}

# 5. Stage auto-fixed files
echo ""
echo "📝 Staging ESLint fixes..."
git add $STAGED_FILES

echo ""
echo "✅ All pre-commit checks passed!"
