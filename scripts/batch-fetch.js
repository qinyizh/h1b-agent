// scripts/batch-fetch.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// 读取你的 URL 清单
const URL_LIST_PATH = path.join(__dirname, 'h1b_urls.txt');
const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

// 辅助函数：让程序睡一会儿 (防止请求太快被 USCIS 或 Jina 封 IP)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchOneUrl(url) {
  return new Promise((resolve, reject) => {
    // 自动从 URL 里生成一个合法的文件名
    // 比如 .../h-1b-cap-season -> h-1b-cap-season.txt
    const slug = url.split('/').filter(Boolean).pop() || 'uscis_page';
    const filename = `${slug}.txt`;
    const savePath = path.join(KNOWLEDGE_DIR, filename);

    const jinaUrl = `https://r.jina.ai/${url}`;

    https.get(jinaUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status Code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // 加个头信息
        const finalContent = `Source: ${url}\nSaved At: ${new Date().toISOString()}\n\n${data}`;
        fs.writeFileSync(savePath, finalContent);
        resolve(filename);
      });
    }).on('error', err => reject(err));
  });
}

async function runBatch() {
  if (!fs.existsSync(URL_LIST_PATH)) {
    console.error("❌ 没找到 URL 清单，请先创建 scripts/h1b_urls.txt");
    return;
  }

  // 读取所有非空行
  const urls = fs.readFileSync(URL_LIST_PATH, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.startsWith('http'));

  console.log(`🚀 准备抓取 ${urls.length} 个页面...`);
  console.log('-----------------------------------');

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] 正在抓取: ${url} ... `);

    try {
      const filename = await fetchOneUrl(url);
      console.log(`✅ 成功 (${filename})`);
      
      // 关键：每抓一个休息 2 秒，做个有礼貌的爬虫
      await sleep(2000); 

    } catch (error) {
      console.log(`❌ 失败`);
      console.error(`   原因: ${error.message}`);
    }
  }

  console.log('-----------------------------------');
  console.log('🎉 全部任务完成！记得重启 Next.js！');
}

runBatch();