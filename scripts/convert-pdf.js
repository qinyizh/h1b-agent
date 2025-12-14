import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

async function convertAll() {
  console.log("\n📄 [Uint8Array 修正版] 启动 PDF 转换...");
  
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`❌ 目录不存在: ${KNOWLEDGE_DIR}`);
    return;
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR);
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log("⚠️  没有找到 PDF 文件。");
    return;
  }

  console.log(`📂 找到 ${pdfFiles.length} 个 PDF 文件`);
  console.log('-----------------------------------');

  for (const file of pdfFiles) {
    const inputPath = path.join(KNOWLEDGE_DIR, file);
    const outputFilename = file.replace(/\.pdf$/i, '.txt');
    const outputPath = path.join(KNOWLEDGE_DIR, outputFilename);

    process.stdout.write(`⏳ 解析: ${file} `);

    try {
      // 1. 读取为 Node.js Buffer
      const nodeBuffer = fs.readFileSync(inputPath);

      if (nodeBuffer.length === 0) {
        console.log(`\n❌ 失败: 空文件`);
        continue;
      }

      // 2. ⚡️ 关键修复：把 Buffer 强制转为 Uint8Array
      // 这一步是为了满足 pdf-parse v2 的严格类型检查
      const uint8Array = new Uint8Array(nodeBuffer);

      // 3. 实例化 Parser (直接传入 Uint8Array)
      const parser = new PDFParse(uint8Array);

      // 4. 获取文本
      const result = await parser.getText();
      
      // 5. 销毁实例
      if (parser.destroy) {
        await parser.destroy();
      }

      // 6. 验证与清洗
      if (!result || !result.text) {
        console.log(`\n⚠️  无文字内容`);
        continue;
      }

      const cleanText = result.text
        .replace(/\n\n+/g, '\n')
        .replace(/Page \d+ of \d+/g, '');

      fs.writeFileSync(outputPath, cleanText);
      console.log(`-> ✅ 成功 (${cleanText.length} 字符)`);

    } catch (err) {
      console.log(`\n❌ 失败: ${err.message}`);
    }
  }
  console.log('-----------------------------------');
}

convertAll();