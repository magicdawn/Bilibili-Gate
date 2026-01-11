#!/bin/sh

exec 1>&2
FORBIDDEN_RE="[Ff][Ii][Xx][Mm][Ee]"

if [ $(git diff --cached -G "$FORBIDDEN_RE"|wc -l) != 0 ]; then
  git --no-pager diff --cached -G "$FORBIDDEN_RE"
  echo
  echo "ERROR: You're trying to commit a line containing the $FORBIDDEN_RE re"
  exit 1
fi
