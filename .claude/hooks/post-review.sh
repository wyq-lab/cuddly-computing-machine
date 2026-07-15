#!/bin/bash
# CI/CD 审查后处理
set -e

echo "Post-review hook triggered."

# 如果审查发现高危问题，阻止继续
if [ "${REVIEW_STATUS}" = "critical" ]; then
  echo "Critical issues found. Merge blocked."
  exit 1
fi

echo "Post-review checks passed."
