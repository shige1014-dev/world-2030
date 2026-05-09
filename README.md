# 未来守护神殿 · World 2030

44 位未来产业 NPC 化身的可视化图鉴, 单文件 SPA.

## 内容

- **神殿首页**: 封面 + 抽卡 (随机翻牌动画) + 我的队伍 (≤6) + 我的收藏
- **守护神图鉴**: S / A / B / C 4 级分类 tab + 卡片网格
- **44 NPC**: 每位绑定真实股票代码 + 行业 + 估值数据
- **卡片 modal**: 立绘 + 自我介绍 + 论点 + 风险 + 仓位建议 + ↗ stockanalysis.com

## 数据源

- 学习台 `lib/stock-learning/data.ts` (zerozero-reader)
- stockanalysis.com (12 月分析师目标 + 上行 %)

## 风格

- 火山的女儿 (Volcano Princess) JRPG cel-shaded
- 暖米色调: paper #f5ead2 / 朱红 #c8553d / 古铜 #8b6f47 / 金箔 #b89a50
- 单文件 HTML SPA, localStorage 持久化

## 本地启动

```
python3 -m http.server 8080
open http://localhost:8080
```

## 图片生成

```
node scripts/gen-images.mjs   # 主图: 12 NPC + 8 场景
node scripts/gen-extra.mjs    # 32 张补全 (A/B/C 级 NPC)
```

需 `OPENAI_API_KEY` 在 `~/zerozero-work/zerozero-reader/.env.local`.
