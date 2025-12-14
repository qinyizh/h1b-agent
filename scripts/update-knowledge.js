// scripts/update-knowledge.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log("\n🤖 启动 AI 知识库自动化更新流水线...");
console.log("========================================");

// 辅助函数：执行命令并打印输出
function runStep(name, command) {
  try {
    console.log(`\n👉 [Step ${name}] 正在执行...`);
    // stdio: 'inherit' 让子脚本的日志直接打印在主控制台，看着很爽
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ [Step ${name}] 完成。`);
  } catch (error) {
    console.error(`❌ [Step ${name}] 失败！流水线已终止。`);
    process.exit(1); // 退出脚本
  }
}

// 1. 抓取网页 (如果有新的 URL)
// 只有当 h1b_urls.txt 存在时才运行
if (fs.existsSync(path.join(__dirname, 'h1b_urls.txt'))) {
  runStep('1: 抓取网页 (Batch Fetch)', 'node scripts/batch-fetch.js');
} else {
  console.log("⏩ [Step 1] 跳过 (未找到 URL 清单)");
}

// 2. 转换 PDF (如果有新 PDF)
// 这一步会扫描所有 PDF 并转为 TXT
runStep('2: 转换 PDF (PDF to TXT)', 'node scripts/convert-pdf.js');

// 3. 清洗数据 (切除页脚和废话)
runStep('3: 清洗数据 (Cleaning Noise)', 'node scripts/clean-noise.js');

console.log("\n========================================");
console.log("🎉 所有知识已更新完毕！");
console.log("⚠️  重要提示：");
console.log("   由于 Next.js 有服务端缓存，");
console.log("   请务必 **重启你的开发服务器** 才能让 AI 读到新数据！");
console.log("   (按 Ctrl+C 停止，然后再次 npm run dev)");
console.log("========================================\n");