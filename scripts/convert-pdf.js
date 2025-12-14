// scripts/convert-pdf.js
const fs = require('fs');
const path = require('path');
const PDFParser = require("pdf2json");

const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

async function convertAll() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`❌ 目录不存在: ${KNOWLEDGE_DIR}`);
    return;
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR);
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log("⚠️ 没找到 PDF 文件。");
    return;
  }

  console.log(`📂 找到 ${pdfFiles.length} 个 PDF，开始处理...`);

  // 由于 pdf2json 是基于事件的，我们需要把它封装成 Promise 以便在循环中使用
  const parsePDF = (filePath) => {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(this, 1); // 1 = 仅文本模式

      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      
      pdfParser.on("pdfParser_dataReady", pdfData => {
        // pdf2json 返回的是 URI 编码的文本，需要解码
        const rawText = pdfParser.getRawTextContent(); 
        resolve(rawText);
      });

      pdfParser.loadPDF(filePath);
    });
  };

  for (const file of pdfFiles) {
    const inputPath = path.join(KNOWLEDGE_DIR, file);
    const outputFilename = file.replace(/\.pdf$/i, '.txt');
    const outputPath = path.join(KNOWLEDGE_DIR, outputFilename);

    process.stdout.write(`⏳ 正在转换: ${file} ... `);

    try {
      const textContent = await parsePDF(inputPath);
      
      // 清洗数据：pdf2json 有时候会留很多横线和空行
      const cleanText = textContent
        .replace(/----------------/g, '')
        .replace(/\n\s*\n/g, '\n'); // 去除多余空行

      fs.writeFileSync(outputPath, cleanText);
      console.log(`✅ 成功!`);
      
    } catch (err) {
      console.log(`❌ 失败!`);
      console.error(`   原因: ${err}`);
    }
  }
  
  console.log('🎉 全部搞定！');
}

convertAll();