#!/bin/bash
# Cloud-session bootstrap for Kevin's shared agent memory.
# Recreates the local Agent_Main layout (workspace-main/-work/-life + Projects)
# under /home/user/Agent_Main, then tells Claude which kernel files to load.
# Local machines already load the kernel through ~/.claude/CLAUDE.md, so skip there.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

OWNER="linyankuang0725"
ROOT="/home/user/Agent_Main"
export GIT_TERMINAL_PROMPT=0
mkdir -p "$ROOT"

# <dir under Agent_Main>:<GitHub repo>
PAIRS="workspace-main:workspace-main workspace-work:workspace-work workspace-life:workspace-life Projects:workspace-project"
missing=()

for pair in $PAIRS; do
  dir="${pair%%:*}"
  repo="${pair##*:}"
  dest="$ROOT/$dir"

  if [ -d "$dest/.git" ]; then
    timeout 60 git -C "$dest" pull --ff-only -q >/dev/null 2>&1 || true
    continue
  fi
  # Repo selected when the session started, or attached later via add_repo.
  if [ -d "/home/user/$repo/.git" ]; then
    rm -rf "$dest" 2>/dev/null
    ln -sfn "/home/user/$repo" "$dest"
    continue
  fi
  if timeout 300 git clone -q --depth 1 "https://github.com/$OWNER/$repo" "$dest" >/dev/null 2>&1; then
    continue
  fi
  rm -rf "$dest" 2>/dev/null
  missing+=("$repo")
done

KERNEL="$ROOT/workspace-main"
if [ ${#missing[@]} -eq 0 ]; then
  cat <<MSG
[Kevin memory] Four libraries ready at $ROOT (workspace-main, workspace-work, workspace-life, Projects).
Before your first reply, Read these kernel files in one batch — they replace the local loader chain
~/.claude/CLAUDE.md -> Agent_Main/CLAUDE.md -> workspace-main/AGENTS.md:
  $KERNEL/kernel/CORE.md
  $KERNEL/kernel/ROUTER.md
  $KERNEL/kernel/PROFILE_BRIEF.md
  $KERNEL/runtime/EXECUTION_POLICY.md
  $KERNEL/runtime/CLAUDE.md
Paths inside those files are relative to the Agent_Main root = $ROOT. Follow ROUTER.md for anything
beyond the kernel. Windows-only tools (PowerShell, gws, junctions) do not exist in this cloud container.
MSG
else
  cat <<MSG
[Kevin memory] Not loaded yet — this session cannot reach: ${missing[*]}.
Before your first reply: for each missing repo call add_repo(owner="$OWNER", repo=<name>, access="push"),
run the clone command it gives (into /home/user/<name>), then run
  bash "\$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.sh"
again. It links the clones into $ROOT and prints which kernel files to read.
Skip this only if Kevin says the task does not need his memory.
MSG
fi
exit 0
