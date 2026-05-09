#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "images");
fs.mkdirSync(OUT, { recursive: true });

const envPath = path.join(process.env.HOME, "zerozero-work/zerozero-reader/.env.local");
const env = fs.readFileSync(envPath, "utf-8");
const KEY = env.split("\n").find(l => l.startsWith("OPENAI_API_KEY="))?.split("=", 2)[1]?.trim();
if (!KEY) { console.error("❌ OPENAI_API_KEY missing"); process.exit(1); }

// v4 风格: 火山女儿 cel-shaded, 清晰描边, 柔和表情, 女性优雅
const STYLE_PORTRAIT = "Clean anime cel-shaded character portrait in the style of 火山的女儿 (Volcano Princess) JRPG game art. Sharp clean linework, solid opaque color blocks, defined sharp facial features, fully visible character clearly separated from soft cream paper background, vibrant harmonious palette, character occupies center of frame, half-body bust, NO haze, NO blur, character must be fully solid. Refined elegant hand-drawn illustration. Female characters: graceful elegant posture, soft gentle warm expression, refined feminine features, delicate touches, subtle warm smile or peaceful eyes, never stern or aggressive. Male characters: calm composed expression, refined posture, intelligent gentle eyes.";

const STYLE_SCENE = "Hand-painted JRPG fantasy game illustration in the style of 火山的女儿 (Volcano Princess) and Genshin Impact background art. Warm cream/sepia palette with crimson, jade, gold-leaf accents. Blended East-Asian 古风 elegance with subtle near-future tech (holographic glows, soft circuit-pattern fabric, brass-trim instruments). Crisp edges, clear forms, NO photo-realism, painterly but defined. Atmospheric warm lighting, soft fog where appropriate, no text, no logos.";

// NPC tickers + 设定
const NPCS = [
  { tk:"OKLO", file:"npc-OKLO.png",
    desc:`A graceful elegant young woman named Huojin (火堇), long flame-orange hair flowing softly with delicate strands framing her face, gentle warm calm eyes with a subtle hint of smile, refined feminine features, wearing an elegant copper-trimmed crimson high-collar fantasy robe with delicate gold-thread embroidery and a soft cream inner-collar layer. A clearly visible polished brass rectangular nameplate pinned on her chest displaying bold uppercase letters "OKLO" in clean sans-serif font, sharp readable. A small crimson reactor-core gem pendant softly glowing beneath the nameplate.` },
  { tk:"RKLB", file:"npc-RKLB.png",
    desc:`A confident elegant young woman named Artemis (阿尔忒弥斯), long silver hair tied loose with a small braid, calm warm gentle smile, refined feminine features, wearing an elegant cream-and-silver flight robe with subtle copper trim and small rocket-engraved brooch. A clearly visible polished brass nameplate on her chest displaying bold uppercase "RKLB" in sharp sans-serif font.` },
  { tk:"COHR", file:"npc-COHR.png",
    desc:`A graceful young woman named Guangling (光绫), soft long violet hair flowing gently over one shoulder, delicate transparent crystal-rim glasses with subtle rainbow refraction, warm gentle peaceful eyes with tender hint of smile, refined features, wearing an elegant flowing pale-violet robe with silver-thread floral embroidery, holding a small crystal prism delicately. A clearly visible polished brass nameplate on her chest displaying bold uppercase "COHR" in sharp sans-serif font.` },
  { tk:"MU", file:"npc-MU.png",
    desc:`A graceful young woman named YunCun (韵存), short emerald hair styled with a delicate side-pin, soft warm peaceful smile, refined feminine features, wearing an elegant fitted jade-trim utility tunic over cream blouse with soft lace collar. A clearly visible polished brass nameplate pinned on her chest displaying bold uppercase "MU" in sharp sans-serif font.` },
  { tk:"NBIS", file:"npc-NBIS.png",
    desc:`A serene elegant young woman named Niebis (涅彼斯), soft silver hair flowing in waves, pale icy-blue eyes with a calm gentle expression and a faint warm smile, refined European-styled features, wearing an elegant pearl-grey high-collar academic robe with platinum trim. A clearly visible polished brass nameplate on her chest displaying bold uppercase "NBIS" in sharp sans-serif font.` },
  { tk:"PLTR", file:"npc-PLTR.png",
    desc:`A composed thoughtful young man named HeiYao (黑曜), short black hair, thin-rimmed glasses, calm intelligent gentle eyes, refined posture, wearing a long charcoal coat with subtle silver data-pattern embroidery. A clearly visible polished brass nameplate on his chest displaying bold uppercase "PLTR" in sharp sans-serif font.` },
  { tk:"ALAB", file:"npc-ALAB.png",
    desc:`A graceful young woman named ZhiSuo (织梭), soft sky-blue short hair, gentle warm smile, refined feminine features, holding a softly glowing PCIe-interconnect filament thread between her hands as if weaving, wearing an elegant cream-and-blue tunic. A clearly visible polished brass nameplate on her chest displaying bold uppercase "ALAB" in sharp sans-serif font.` },
  { tk:"MRVL", file:"npc-MRVL.png",
    desc:`A poised elegant young woman named ZongYan (综衍), long warm-orange hair tied with a small ribbon, attentive gentle expression with subtle warm smile, holding folded ASIC blueprint paper, wearing an elegant amber-trim designer tunic. A clearly visible polished brass nameplate on her chest displaying bold uppercase "MRVL" in sharp sans-serif font.` },
  { tk:"BWXT", file:"npc-BWXT.png",
    desc:`A seasoned mature naval officer man named JianHai (缄海), short grey-streaked hair, calm reliable expression with gentle eyes, wearing a deep navy uniform with subtle gold trim and shoulder epaulets. A clearly visible polished brass nameplate on his chest displaying bold uppercase "BWXT" in sharp sans-serif font.` },
  { tk:"AMZN", file:"npc-AMZN.png",
    desc:`A graceful regal young woman named DaCai (大裁), long warm-gold hair styled in an elegant updo, calm gentle commanding smile, refined feminine features, wearing an elegant gold-accented robe with subtle warm cream layers, behind her a faint soft-focus outline of small logistics drones. A clearly visible polished brass nameplate on her chest displaying bold uppercase "AMZN" in sharp sans-serif font.` },
  { tk:"ARM", file:"npc-ARM.png",
    desc:`A serene young half-elf-inspired man named RenYan (韧岩), pointed-ear hint, long sage-green hair, calm thoughtful warm expression, wearing an elegant sage-green tunic with intricate circuit-pattern silver embroidery, holding a small etched stone tablet delicately. A clearly visible polished brass nameplate on his chest displaying bold uppercase "ARM" in sharp sans-serif font.` },
  { tk:"AMD", file:"npc-AMD.png",
    desc:`A graceful elegant young woman named RuiYin (锐银), iron-grey shoulder-length hair, calm composed gentle smile, refined feminine features, twin slim sabers crossed on her back (one CPU-blade, one GPU-blade subtly engraved), wearing an elegant iron-silver-trim warrior tunic with cream undershirt. A clearly visible polished brass nameplate on her chest displaying bold uppercase "AMD" in sharp sans-serif font.` },
];

// 主角 + 引导
const PROTAGS = [
  { file: "shige.png", size: "1024x1536",
    prompt: `${STYLE_PORTRAIT} A 32-year-old composed young man named Shige (诗歌), short blue-grey hair, calm sharp intelligent eyes with a subtle peaceful expression, half-rimmed glasses with thin frames, refined posture, wearing a layered slate-blue high-collar coat with copper trim and subtle data-circuit-pattern embroidery on the cuffs. A clearly visible polished brass nameplate pinned on his chest displaying bold uppercase "SENSOR" in sharp sans-serif font. Half-body bust portrait, simple cream paper background.` },
  { file: "musclecat.png", size: "1024x1536",
    prompt: `${STYLE_PORTRAIT} A bronze-haired young woman named MuscleCat (肌肉猫), copper-bronze hair in twin loose braids, slightly tilted military cap with copper trim, knowing playful skeptical smirk with warm intelligent eyes, refined elegant feminine features, wearing a casual cream high-collar robe over a copper-trim utility vest. A clearly visible polished brass nameplate on her chest displaying bold uppercase "GUIDE" in sharp sans-serif font. Half-body bust portrait, simple cream paper background.` },
];

// 8 场景 + 主页背景
const SCENES = [
  { file: "home-bg.png", size: "1536x1024",
    prompt: `${STYLE_SCENE} First-person view through a tall apartment window at dawn, looking out over a near-future Shanghai-inspired city named Hu-chuan, thin morning fog gently parting one finger's width, golden warm sunrise glow on holographic city outlines, calm domestic interior corner visible (ceramic teacup on wooden ledge), 16:9 cinematic, magazine cover composition.` },
  { file: "scene-clothing.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} A future smart wardrobe with 8 illuminated cubby slots holding folded high-tech garments (smart cashmere coats, graphene jackets, color-shifting shirts), warm wooden frosted door slowly opened, gentle amber glow from each slot, dawn light from side, no text.` },
  { file: "scene-food.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} A future kitchen at 7:32 AM, three-tier smart fridge with translucent shelves glowing in different soft colors (blue produce, gold protein, amber grains), miniature ingredients visible, warm morning sunlight, no text.` },
  { file: "scene-home.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} Future living room interior, tall floor-to-ceiling window showing Shanghai-inspired skyline with morning fog parting, warm wooden floor with embedded heating glow, ambient amber lights, ceramic teacup and folded book on side table, peaceful domestic future.` },
  { file: "scene-transport.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} Inside the cabin of a SkyDrive A2 personal flying vehicle, amber-lit interior, holographic floating screen showing 3 abstract route options (no readable text), wooden dashboard with brass details, city dawn through windshield.` },
  { file: "scene-invest.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} Interior of a grand mythical hall called Twelve Heroes Hall, 12 framed half-body portraits hung on warm cream walls in two rows, central bronze-topped wooden table, holographic golden light cascading from ceiling, atmosphere blends ancient East Asian temple beams with subtle holographic glow, no readable text on portraits.` },
  { file: "scene-health.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} A bathroom with an illuminated smart mirror, four glowing translucent bubbles (brainwave, heart, blood-oxygen, temperature) gently floating in the air, thin gold lines connecting bubbles to invisible body parts, soft warm tile backsplash, dawn light from side window, calm meditative.` },
  { file: "scene-work.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} A holographic workstation, 5 floating translucent screens arranged in a gentle arc around a wooden desk (no readable text on screens, only abstract glyphs and waveforms), brass desk lamp, amber ambient light, peaceful productivity at dawn.` },
  { file: "scene-voices.png", size: "1024x1536",
    prompt: `${STYLE_SCENE} An abstract dreamlike consciousness-edge scene, two translucent silhouettes hovering at the left and right edges of vision (one cool blue-grey ember, one warm copper firelight), a quiet inner-mind landscape between them, soft mist, gentle gold leaf accents, evocative ethereal yet defined.` },
];

// 拼成完整 IMAGES 列表
const IMAGES = [
  ...PROTAGS,
  ...NPCS.map(n => ({
    file: n.file,
    size: "1024x1536",
    prompt: `${STYLE_PORTRAIT} ${n.desc} Half-body bust portrait, simple cream paper background, fully solid character.`,
  })),
  ...SCENES,
];

console.log(`📷 ${IMAGES.length} 张图待生 (gpt-image-2 medium quality)`);
let totalCost = 0;

for (const img of IMAGES) {
  const outFile = path.join(OUT, img.file);
  if (fs.existsSync(outFile) && fs.statSync(outFile).size > 200000) {
    console.log(`⏭  ${img.file} 已存在 (${(fs.statSync(outFile).size/1024).toFixed(0)} KB)`);
    continue;
  }
  process.stdout.write(`🎨 ${img.file}...`);
  const t0 = Date.now();
  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: img.prompt,
        size: img.size || "1024x1024",
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
console.log(`成本估: ~$${totalCost.toFixed(2)}`);
console.log(`输出: ${OUT}`);
