import { readFile, writeFile } from "node:fs/promises";
import { Font, woff2 } from "fonteditor-core";

await woff2.init();

const FONT_500 = "public/assets/fonts/lxgw-wenkai-latin-500-normal.woff2";
const FONT_700 = "public/assets/fonts/lxgw-wenkai-latin-700-normal.woff2";

const text = `知其白守其黑为天下式上善若水水利万物而不争德不孤必有邻君子藏器于身待时而动知行合一大道至简衍化至繁不积跬步无以至千里博观而约取厚积而薄发路漫漫其修远兮吾将上下求索行有不得反求诸己世界上只有一种英雄主义就是看清生活的真相之后依然热爱它参差多态乃幸福本源那些杀不死我的终将使我更强大特让他也让的个人博客前安全研究员代替大脑欢迎来到公告关于归档链接首页文章列表暂无文章主题色壁纸横幅模式全屏覆盖隐藏选项标题水波纹动画布局网格桌面图片个人资料作者技能项目时间线友链日记相册设备工具站点统计天数最后活动分类日一二三四五六七八九十运行年版权所有标签目录当前页面没有暗色使用深主题切换到浅语言选择主页搜索阅读更多发布更新加密需密码查看返回顶部随机相关分享复制代码块已启用评论功能关闭加载失败重试上一页下一页提交。，、；：！？""''（）《》【】…—·Stay hungry foolishTalk cheap show me the codeTrtyrBlogLinksAboutFriendsGitHubOthersProjectsSkillsTimelineAI Tools`;

const chars = [...new Set(text.replace(/\s/g, ""))];
console.log(`提取到 ${chars.length} 个唯一字符: ${chars.join("")}`);

async function subset(inputPath) {
  const buffer = await readFile(inputPath);
  const fontData = Font.create(buffer, { type: "woff2" });
  const font = fontData.get();
  
  console.log(`原始字形数: ${font.glyf.length}`);
  
  // 通过设置 subset 选项来子集化
  const subsetted = Font.create(font, { subset: chars }).get();
  console.log(`子集化后字形数: ${subsetted.glyf.length}`);
  
  const output = Buffer.from(woff2.encode(subsetted));
  await writeFile(inputPath, output);
  console.log(`${inputPath}: ${buffer.length} -> ${output.length} bytes (${(output.length/1024).toFixed(1)}KB)`);
}

await subset(FONT_500);
await subset(FONT_700);
