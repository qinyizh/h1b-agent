// scripts/clean-noise.js
const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

// ✂️ 手术刀：遇到这些词，后面的全部切掉（包含这些词本身）
// 这是针对 USCIS 网页结构的经验总结
const CUT_OFF_MARKERS = [
  "Was this page helpful?",
  "Last Reviewed/Updated:", // 有时候我们需要日期，如果不想要太旧的信息可以保留这行，但在它之后的通常是 footer
  "Connect with Us",
  "U.S. Department of Homeland Security",
  "Citation", // Jina Reader 有时候会把 Citation 放在最后
  "### Footer", // Jina 有时候会识别出 Footer 标题
];

// 🗑️ 过滤词：如果某一行包含这些词，直接删除该行（比如导航栏残留）
const NOISE_LINES = [
  "Skip to main content",
  "An official website of the United States government",
  "Here's how you know",
  "Topics",
  "Newsroom",
  "Forms",
  "Green Card", // 单独出现的导航词
  "Citizenship"
];

async function cleanAll() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.txt'));
  
  console.log(`🧹 准备清洗 ${files.length} 个文件...`);
  let cleanedCount = 0;

  files.forEach(file => {
    const filePath = path.join(KNOWLEDGE_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;

    // 1. 🔪 尾部切除 (Truncate)
    // 找到最早出现的 Marker，从那里切断
    let cutIndex = content.length;
    for (const marker of CUT_OFF_MARKERS) {
      const idx = content.indexOf(marker);
      if (idx !== -1 && idx < cutIndex) {
        cutIndex = idx;
      }
    }
    content = content.substring(0, cutIndex);

    // 2. 🗑️ 行级过滤 (Line Filter)
    // 把内容拆成行，清洗掉无意义的导航行
    content = content
      .split('\n')
      .filter(line => {
        const trimLine = line.trim();
        // 删掉空行
        if (!trimLine) return false; 
        // 删掉包含噪音词的短行 (长度小于 50 才删，防止误删正文)
        if (trimLine.length < 50 && NOISE_LINES.some(noise => trimLine.includes(noise))) {
          return false;
        }
        return true;
      })
      .join('\n');

    // 3. 💾 覆写文件
    // 只有当内容真的变短了，才写入
    if (content.length < originalLength) {
      // 补回一个换行，保持美观
      content += "\n";
      fs.writeFileSync(filePath, content);
      cleanedCount++;
      // console.log(`✨ 已清洗: ${file} (瘦身 ${(originalLength - content.length)} 字符)`);
    }
  });

  console.log(`-----------------------------------`);
  console.log(`🎉 清洗完毕！共优化了 ${cleanedCount} 个文件。`);
  console.log(`🧠 你的 AI 现在读起来会更专注了！`);
}

cleanAll();