"""
ZERO 守护神殿 — 拉所有 NPC 实时数据 (yfinance) → stocks.json
浏览器侧 fetch 这个 JSON, 不用后端.
建议 cron 每天跑 1 次.
"""
import json
import re
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
import yfinance as yf

ROOT = Path(__file__).resolve().parent.parent
HTML = (ROOT / "index.html").read_text()

# 提取所有 NPC tickers from HTML
TICKERS = sorted(set(re.findall(r'tk:"([A-Z]{1,5})"', HTML)))
print(f"📊 拉 {len(TICKERS)} 只: {TICKERS}")

result = {"updated": None, "stocks": {}}

import datetime
result["updated"] = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

for tk in TICKERS:
    try:
        t = yf.Ticker(tk)
        info = t.info
        hist = t.history(period="3mo")
        if hist.empty:
            print(f"  ❌ {tk} 无数据")
            continue
        last = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last
        change_1d_pct = (last / prev - 1) * 100 if prev else 0
        ytd_close = float(hist["Close"].iloc[0])
        change_3m_pct = (last / ytd_close - 1) * 100 if ytd_close else 0
        h52, l52 = info.get("fiftyTwoWeekHigh"), info.get("fiftyTwoWeekLow")
        from_high_pct = (last / h52 - 1) * 100 if h52 else None
        from_low_pct = (last / l52 - 1) * 100 if l52 else None

        result["stocks"][tk] = {
            "price": round(last, 2),
            "change_1d_pct": round(change_1d_pct, 2),
            "change_3m_pct": round(change_3m_pct, 2),
            "high_52w": h52,
            "low_52w": l52,
            "from_high_pct": round(from_high_pct, 2) if from_high_pct is not None else None,
            "from_low_pct": round(from_low_pct, 2) if from_low_pct is not None else None,
            "market_cap_b": round(info.get("marketCap", 0) / 1e9, 2) if info.get("marketCap") else None,
            "pe_ttm": round(info.get("trailingPE", 0), 1) if info.get("trailingPE") else None,
            "pe_fwd": round(info.get("forwardPE", 0), 1) if info.get("forwardPE") else None,
            "ps": round(info.get("priceToSalesTrailing12Months", 0), 1) if info.get("priceToSalesTrailing12Months") else None,
            "div_yield_pct": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else None,
            "beta": round(info.get("beta", 0), 2) if info.get("beta") else None,
            "target": info.get("targetMeanPrice"),
            "rec": info.get("recommendationKey"),
            "n_analysts": info.get("numberOfAnalystOpinions"),
        }
        arrow = "🔼" if change_1d_pct > 0 else "🔽" if change_1d_pct < 0 else "➡️"
        print(f"  ✅ {tk:6s} ${last:7.2f} {arrow} {change_1d_pct:+.2f}% (从 ATH {from_high_pct:+.1f}%)")
    except Exception as e:
        print(f"  ❌ {tk}: {str(e)[:80]}")

out = ROOT / "stocks.json"
out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
print(f"\n💾 写: {out}")
print(f"📦 {len(result['stocks'])}/{len(TICKERS)} 成功")
