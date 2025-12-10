#!/usr/bin/env bash

git ls-files -m | while read file; do
  echo "// ----------------------------------------"
  echo "// FILE: $file"
  echo "// ----------------------------------------"
  cat "$file"
  echo
done
