#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "images");

const envPath = path.join(process.env.HOME, "zerozero-work/zerozero-reader/.env.local");
const env = fs.readFileSync(envPath, "utf-8");
const KEY = env.split("\n").find(l => l.startsWith("OPENAI_API_KEY="))?.split("=", 2)[1]?.trim();
if (!KEY) { console.error("❌ OPENAI_API_KEY missing"); process.exit(1); }

const STYLE = "Clean anime cel-shaded character portrait in the style of 火山的女儿 (Volcano Princess) JRPG game art. Sharp clean linework, solid opaque color blocks, defined sharp facial features, fully visible character clearly separated from soft cream paper background, vibrant harmonious palette, character occupies center of frame, half-body bust. Refined elegant hand-drawn illustration. Female: graceful elegant posture, soft gentle warm expression, refined feminine features, subtle warm smile. Male: calm composed expression, refined posture, intelligent gentle eyes.";

// 32 个补全 — A 级 17 + B 级 14 + C 级 3 (扣除已存在的 ARM/AMD)
const NPCS = [
  // ───── A 级 (15 — ARM/AMD 已存) ─────
  { tk:"AAOI", desc:"A graceful young woman named YingGuang (应光), pale-violet long hair flowing softly, gentle warm eyes with subtle smile, wearing an elegant cream-and-violet optical-engineer tunic with crystal-fiber threads. Polished brass chest nameplate displaying bold uppercase 'AAOI' in sharp sans-serif." },
  { tk:"LITE", desc:"A poised elegant young woman named LiuMing (鎏明), warm chestnut hair tied with a silver pin, calm warm peaceful smile, refined feminine features, wearing an elegant rose-grey laser-engineer robe holding a small glowing crystal lens. Polished brass chest nameplate displaying bold uppercase 'LITE' in sharp sans-serif." },
  { tk:"USAR", desc:"A spirited elegant young woman named ChiXi (赤稀), short crimson hair with a delicate copper hairpin, warm composed gentle smile, refined features, wearing an elegant copper-trimmed crimson mining-engineer tunic. Polished brass chest nameplate displaying bold uppercase 'USAR' in sharp sans-serif." },
  { tk:"UUUU", desc:"A composed elegant young woman named ShuangGui (双轨), soft olive-green hair in a low ponytail, calm gentle warm eyes, refined features, wearing an elegant earth-tone tunic with a small uranium-yellow crystal pendant. Polished brass chest nameplate displaying bold uppercase 'UUUU' in sharp sans-serif." },
  { tk:"MP", desc:"A graceful young woman named ChiXuan (赤铉), wine-red hair flowing in waves with delicate gold threads, calm warm smile, refined features, wearing an elegant deep-burgundy alchemist robe. Polished brass chest nameplate displaying bold uppercase 'MP' in sharp sans-serif." },
  { tk:"UEC", desc:"A serene young woman named YouXing (铀星), forest-green hair styled in a side braid, calm peaceful gentle eyes, refined features, wearing an elegant moss-green ranger tunic with brass trim. Polished brass chest nameplate displaying bold uppercase 'UEC' in sharp sans-serif." },
  { tk:"SNDK", desc:"A poised young woman named ShanJi (闪迹), violet-grey shoulder hair, attentive gentle warm expression, refined features, wearing an elegant violet-trim engineer tunic with subtle storage-grid embroidery. Polished brass chest nameplate displaying bold uppercase 'SNDK' in sharp sans-serif." },
  { tk:"WDC", desc:"A composed mature young man named YingTan (硬潭), short steel-grey hair, calm reliable expression with gentle eyes, wearing an elegant deep-navy archivist coat with copper trim. Polished brass chest nameplate displaying bold uppercase 'WDC' in sharp sans-serif." },
  { tk:"ONDS", desc:"A sharp focused young man named YiYing (翼影), short charcoal hair, calm composed eyes, wearing a sleek dark tactical drone-operator uniform with blue accent stripes. Polished brass chest nameplate displaying bold uppercase 'ONDS' in sharp sans-serif." },
  { tk:"IONQ", desc:"A serene mystical young woman named LiangJing (量阱), pale-lavender long hair flowing like mist, calm contemplative warm eyes, refined features, wearing an elegant lavender-silver robe with soft shimmer. Polished brass chest nameplate displaying bold uppercase 'IONQ' in sharp sans-serif." },
  { tk:"FLY", desc:"A vibrant young woman named YingHuo (萤火), warm amber hair in a short cut with a small flame-ornament hairpin, gentle determined smile, refined features, wearing an elegant amber-orange flight-engineer jacket. Polished brass chest nameplate displaying bold uppercase 'FLY' in sharp sans-serif." },
  { tk:"ASTS", desc:"A poised young woman named XingQiao (星桥), midnight-blue long hair with subtle starfield highlights, calm gentle warm eyes with subtle smile, refined features, wearing an elegant midnight-blue celestial robe with silver-thread constellations. Polished brass chest nameplate displaying bold uppercase 'ASTS' in sharp sans-serif." },
  { tk:"IREN", desc:"A composed young woman named KuangYi (矿移), soft teal short hair, calm warm gentle smile, refined features, wearing an elegant teal-and-cream data-center engineer uniform with subtle GPU-rack trim. Polished brass chest nameplate displaying bold uppercase 'IREN' in sharp sans-serif." },
  { tk:"CIFR", desc:"A focused young woman named MiKe (密刻), olive-brown hair tied in a low ponytail, calm intelligent gentle eyes, refined features, wearing an elegant olive-grey cipher-engineer tunic with subtle key-pattern embroidery. Polished brass chest nameplate displaying bold uppercase 'CIFR' in sharp sans-serif." },
  { tk:"SYM", desc:"A graceful young woman named CangShu (仓枢), soft jade-green hair with a delicate hairpin, calm warm peaceful smile, refined features, wearing an elegant jade-and-cream warehouse-architect robe. Polished brass chest nameplate displaying bold uppercase 'SYM' in sharp sans-serif." },

  // ───── B 级 (14) ─────
  { tk:"AXTI", desc:"A thoughtful young woman named ShenJing (砷晶), soft purple-grey hair, calm gentle eyes, refined features, wearing an elegant lavender-grey crystal-grower robe with thin silver trim. Polished brass chest nameplate displaying bold uppercase 'AXTI' in sharp sans-serif." },
  { tk:"ALB", desc:"A poised young woman named LiBa (锂霸), pale-blue long hair, calm warm composed smile, refined features, wearing an elegant ice-blue mining-baron tunic with silver pearl accents. Polished brass chest nameplate displaying bold uppercase 'ALB' in sharp sans-serif." },
  { tk:"UAMY", desc:"A spirited young woman named TiLuo (锑络), warm copper short hair, gentle determined smile, refined features, wearing an elegant copper-and-rust military-supply tunic. Polished brass chest nameplate displaying bold uppercase 'UAMY' in sharp sans-serif." },
  { tk:"MRAM", desc:"A focused young woman named FeiSan (非散), soft indigo shoulder hair, calm intelligent gentle eyes, refined features, wearing an elegant indigo memory-engineer robe. Polished brass chest nameplate displaying bold uppercase 'MRAM' in sharp sans-serif." },
  { tk:"OSS", desc:"A composed young man named BianSuan (边算), short slate-grey hair, calm sharp gentle eyes, wearing a sleek slate field-computing operator uniform with cyan accents. Polished brass chest nameplate displaying bold uppercase 'OSS' in sharp sans-serif." },
  { tk:"QBTS", desc:"A serene young woman named TuiHuo (退火), pale-purple long hair flowing softly, calm contemplative warm eyes, refined features, wearing an elegant purple-and-cream optimization-mage robe. Polished brass chest nameplate displaying bold uppercase 'QBTS' in sharp sans-serif." },
  { tk:"RGTI", desc:"A focused young woman named ChaoDao (超导), short electric-purple hair, attentive intelligent gentle eyes, refined features, wearing an elegant deep-purple superconductor-engineer tunic with silver trim. Polished brass chest nameplate displaying bold uppercase 'RGTI' in sharp sans-serif." },
  { tk:"PL", desc:"A serene young woman named TongGuan (瞳观), soft sage-green long hair, calm gentle observing eyes, refined features, wearing an elegant sage-green earth-observation tunic with brass telescope-pin. Polished brass chest nameplate displaying bold uppercase 'PL' in sharp sans-serif." },
  { tk:"AMPX", desc:"A focused young woman named GuiLi (硅锂), warm rose-gold hair tied in a low side ponytail, gentle warm smile, refined features, wearing an elegant rose-gold battery-engineer tunic. Polished brass chest nameplate displaying bold uppercase 'AMPX' in sharp sans-serif." },
  { tk:"TE", desc:"A bright young woman named RiZe (日泽), warm sunlit-yellow short hair, gentle warm smile, refined features, wearing an elegant warm-yellow solar-panel engineer tunic with brass-trim. Polished brass chest nameplate displaying bold uppercase 'TE' in sharp sans-serif." },
  { tk:"BE", desc:"A composed young woman named QingXin (氢芯), pale-cyan shoulder hair, calm gentle warm smile, refined features, wearing an elegant cyan-and-cream fuel-cell engineer tunic. Polished brass chest nameplate displaying bold uppercase 'BE' in sharp sans-serif." },
  { tk:"SERV", desc:"A cheerful young woman named DiPei (地配), warm lime-green short hair with a delicate ribbon, gentle warm smile, refined features, wearing an elegant lime-green courier-robotics tunic. Polished brass chest nameplate displaying bold uppercase 'SERV' in sharp sans-serif." },
  { tk:"NVTS", desc:"A focused young woman named DanJia (氮镓), olive-green shoulder hair, calm intelligent gentle eyes, refined features, wearing an elegant olive-green power-electronics engineer tunic. Polished brass chest nameplate displaying bold uppercase 'NVTS' in sharp sans-serif." },
  { tk:"AMBQ", desc:"A composed young woman named DiHao (低耗), soft mossy-green hair tied in a small bun, gentle warm smile, refined features, wearing an elegant moss-green low-power chip-engineer tunic. Polished brass chest nameplate displaying bold uppercase 'AMBQ' in sharp sans-serif." },

  // ───── C 级 (3) ─────
  { tk:"LWLG", desc:"A serene young woman named JuGuang (聚光), pale-pink long hair with a soft glow, calm gentle dreaming eyes, refined features, wearing an elegant pale-pink polymer-photonics robe. Polished brass chest nameplate displaying bold uppercase 'LWLG' in sharp sans-serif." },
  { tk:"SATL", desc:"A focused young woman named LiaoWei (瞭微), pale-grey shoulder hair, calm gentle observing eyes, refined features, wearing an elegant pale-grey satellite-imagery analyst tunic. Polished brass chest nameplate displaying bold uppercase 'SATL' in sharp sans-serif." },
  { tk:"EOSE", desc:"A serene young woman named XinYan (锌岩), soft slate-green long hair, calm gentle warm smile, refined features, wearing an elegant slate-green long-duration storage engineer tunic. Polished brass chest nameplate displaying bold uppercase 'EOSE' in sharp sans-serif." },
];

console.log(`📷 ${NPCS.length} 张待生`);
let totalCost = 0;

for (const n of NPCS) {
  const file = `npc-${n.tk}.png`;
  const outFile = path.join(OUT, file);
  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 200000) {
    console.log(`⏭  ${file} 已在`);
    continue;
  }
  process.stdout.write(`🎨 ${file}...`);
  const t0 = Date.now();
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `${STYLE} ${n.desc} Half-body bust portrait, simple cream paper background, fully solid character. NO additional name tag at the bottom — only the chest nameplate.`,
        size: "1024x1536",
        n: 1,
        quality: "medium",
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      console.log(` ❌ ${r.status}: ${txt.slice(0, 200)}`);
      continue;
    }
    const data = await r.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) { console.log(" ❌ no b64"); continue; }
    const buf = Buffer.from(b64, "base64");
    fs.writeFileSync(outFile, buf);
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    totalCost += 0.04;
    console.log(` ✅ ${(buf.length/1024).toFixed(0)} KB · ${dt}s`);
  } catch (e) {
    console.log(` ❌ ${e.message.slice(0, 200)}`);
  }
}

console.log("═".repeat(40));
console.log(`成本: ~$${totalCost.toFixed(2)}`);
