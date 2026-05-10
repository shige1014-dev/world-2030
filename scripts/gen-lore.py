"""
ZERO 守护神殿 — 批量生成 54 NPC 人物志
模型: claude-haiku-4-5 (~$0.08 总成本)
输出: lore.json (ticker → 5 段人物志)
"""
import os
import re
import json
from pathlib import Path

# 读 ANTHROPIC_API_KEY from ~/.env or env
home_env = Path.home() / ".env"
if home_env.exists():
    for line in home_env.read_text().splitlines():
        if line.startswith("ANTHROPIC_API_KEY="):
            os.environ["ANTHROPIC_API_KEY"] = line.split("=", 1)[1].strip().strip('"').strip("'")
            break

if not os.environ.get("ANTHROPIC_API_KEY"):
    raise SystemExit("❌ ANTHROPIC_API_KEY 未设置 (查 ~/.env)")

import anthropic

ROOT = Path(__file__).resolve().parent.parent
HTML = (ROOT / "index.html").read_text()

# 提取 NPC: tk + cn + sector
NPC_PATTERN = re.compile(
    r'\{\s*tk:"([A-Z]+)",\s*tier:"[PSABC]",\s*name:"([^"]+)",\s*cn:"([^"]+)",[^}]*?sector:"([^"]+)"',
    re.DOTALL
)
NPCS = NPC_PATTERN.findall(HTML)
print(f"📜 发现 {len(NPCS)} NPC")

client = anthropic.Anthropic()
out = {"updated": None, "lore": {}}

import datetime
out["updated"] = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

PROMPT = """你是个游戏设定文案。给以下美股写一份"人物志"，5 段固定结构，每段 30-50 字 中文，简练像 JRPG 角色卡。

公司: {cn} ({ticker})
板块: {sector}

输出严格 JSON 格式 (不要 markdown ``` 包裹):
{{
  "出身": "公司创立年份 + 创始人 + 主营",
  "征战": "2026 当前行业地位 + 核心护城河",
  "宿敌": "主要竞品 / 替代威胁",
  "宿命": "2030 可能命运 (3 种结局简写: 成神 / 中庸 / 陨落)",
  "关键节点": "未来 1-3 年决定生死的事件 (1 条最关键)"
}}

不写废话 / 不写"作为一家 XX 公司"开头 / 直接事实 + 数据 / 简练有力。
"""

for tk, name, cn, sector in NPCS:
    if tk in out["lore"]:
        continue
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=600,
            messages=[{"role": "user", "content": PROMPT.format(cn=cn, ticker=tk, sector=sector)}],
        )
        text = msg.content[0].text.strip()
        # 去除可能的 markdown wrapper
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE)
        try:
            data = json.loads(text)
            out["lore"][tk] = data
            print(f"  ✅ {tk:6s} {cn} ({len(json.dumps(data, ensure_ascii=False))} 字节)")
        except json.JSONDecodeError as e:
            print(f"  ⚠️  {tk}: JSON 解析失败 — {text[:120]}")
            out["lore"][tk] = {"出身": text[:200], "征战": "", "宿敌": "", "宿命": "", "关键节点": ""}
    except Exception as e:
        print(f"  ❌ {tk}: {str(e)[:100]}")

(ROOT / "lore.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))
print(f"\n💾 写: {ROOT / 'lore.json'}")
print(f"📦 {len(out['lore'])}/{len(NPCS)} 成功")
