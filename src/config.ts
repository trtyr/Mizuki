import type {
  AnnouncementConfig,
  CommentConfig,
  ExpressiveCodeConfig,
  FooterConfig,
  FullscreenWallpaperConfig,
  LicenseConfig,
  MusicPlayerConfig,
  NavBarConfig,
  ProfileConfig,
  SakuraConfig,
  SidebarLayoutConfig,
  SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import { getTranslateLanguageFromConfig } from "./utils/language-utils";

// 移除i18n导入以避免循环依赖

// 定义站点语言
const SITE_LANG = "zh_CN"; // 语言代码，例如：'en', 'zh_CN', 'ja' 等。

export const siteConfig: SiteConfig = {
  title: "喵喵喵✨",
  subtitle: "欢迎来到我的小窝🏠",
  keywords: [
    "Fuwari",
    "Mizuki",
    "Astro",
    "ACGN",
    "博客",
    "技术博客",
    "静态博客",
    "Rust",
    "网络安全",
  ],

  lang: SITE_LANG,

  themeColor: {
    hue: 210, // 主题色的默认色相，范围从 0 到 360。例如：红色：0，青色：200，蓝绿色：250，粉色：345
    fixed: false, // 对访问者隐藏主题色选择器
  },

  translate: {
    enable: true, // 启用翻译功能
    service: "client.edge", // 使用 Edge 浏览器翻译服务
    defaultLanguage: getTranslateLanguageFromConfig(SITE_LANG), // 根据站点语言自动设置默认翻译语言
    showSelectTag: false, // 不显示默认语言选择下拉菜单，使用自定义按钮
    autoDiscriminate: true, // 自动检测用户语言
    ignoreClasses: ["ignore", "banner-title", "banner-subtitle"], // 翻译时忽略的 CSS 类名
    ignoreTags: ["script", "style", "code", "pre"], // 翻译时忽略的 HTML 标签
  },

  banner: {
    enable: false, // 是否启动Banner壁纸模式

    // 支持单张图片或图片数组，当数组长度 > 1 时自动启用轮播
    src: {
      desktop: [
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/1.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/2.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/7.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/8.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/13.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/15.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/17.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/pc/20.webp",
      ], // 桌面横幅图片
      mobile: [
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m1.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m2.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m3.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m4.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m5.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m6.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m7.webp",
        "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m8.webp",
      ], // 移动横幅图片
    }, // 使用本地横幅图片

    position: "center", // 等同于 object-position，仅支持 'top', 'center', 'bottom'。默认为 'center'

    carousel: {
      enable: true, // 为 true 时：为多张图片启用轮播。为 false 时：从数组中随机显示一张图片

      interval: 5, // 轮播间隔时间（秒）
    },

    homeText: {
      enable: true, // 在主页显示自定义文本
      title: "Trtyr's Blog", // 主页横幅主标题

      subtitle: [
        "不想上班，呜呜呜~",
        "鱼入大海，鸟上青霄，不受笼网之羁绊也！",
        "知其白，守其黑，为天下式",
      ],
      typewriter: {
        enable: true, // 启用副标题打字机效果

        speed: 100, // 打字速度（毫秒）
        deleteSpeed: 50, // 删除速度（毫秒）
        pauseTime: 2000, // 完全显示后的暂停时间（毫秒）
      },
    },

    navbar: {
      transparentMode: "semifull", // 导航栏透明模式："semi" 半透明加圆角，"full" 完全透明，"semifull" 动态透明
    },
  },
	toc: {
		enable: true, // 启用目录功能
		depth: 3, // 目录深度，1-6，1 表示只显示 h1 标题，2 表示显示 h1 和 h2 标题，依此类推
	},
	favicon: [
    // 留空以使用默认 favicon
    // {
    //   src: '/favicon/icon.png',    // 图标文件路径
    //   theme: 'light',              // 可选，指定主题 'light' | 'dark'
    //   sizes: '32x32',              // 可选，图标大小
    // }
  ],

  // 字体配置
  font: {
    zenMaruGothic: {
      enable: true, // 启用全局圆体适合日语和英语，对中文适配一般
    },
    hanalei: {
      enable: false, // 启用 Hanalei 字体作为全局字体，适合中文去使用
    },
  },
  showLastModified: true, // 控制“上次编辑”卡片显示的开关
};
export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
  enable: true, // 启用全屏壁纸功能,非Banner模式下生效
  src: {
    desktop: [
      "/assets/desktop-banner/d1.webp",
      "/assets/desktop-banner/d2.webp",
      "/assets/desktop-banner/d3.webp",
      "/assets/desktop-banner/d4.webp",
      "/assets/desktop-banner/d5.webp",
      "/assets/desktop-banner/d6.webp",
      "/assets/desktop-banner/d7.webp",
      "/assets/desktop-banner/d8.webp",
    ], // 桌面横幅图片
    mobile: [
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m1.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m2.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m3.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m4.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m5.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m6.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m7.webp",
      "https://image-hosting-1314508256.cos.ap-shanghai.myqcloud.com/mobile/m8.webp",
    ], // 移动横幅图片
  }, // 使用本地横幅图片
  position: "center", // 壁纸位置，等同于 object-position
  carousel: {
    enable: true, // 启用轮播
    interval: 1, // 轮播间隔时间（秒）
  },
  zIndex: -1, // 层级，确保壁纸在背景层
  opacity: 0.8, // 壁纸透明度
  blur: 1, // 背景模糊程度
};

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    // 支持自定义导航栏链接,并且支持多级菜单,3.1版本新加
    {
      name: "Links",
      url: "/links/",
      icon: "material-symbols:link",
      children: [
        {
          name: "GitHub",
          url: "https://github.com/matsuzaka-yuki/Mizuki",
          external: true,
          icon: "fa6-brands:github",
        },
        {
          name: "Bilibili",
          url: "https://space.bilibili.com/701864046",
          external: true,
          icon: "fa6-brands:bilibili",
        },
        {
          name: "Gitee",
          url: "https://gitee.com/matsuzakayuki/Mizuki",
          external: true,
          icon: "mdi:git",
        },
      ],
    },
    {
      name: "My",
      url: "/content/",
      icon: "material-symbols:person",
      children: [
        LinkPreset.Diary,
        {
          name: "Gallery",
          url: "/albums/",
          icon: "material-symbols:photo-library",
        },
      ],
    },
    {
      name: "About",
      url: "/content/",
      icon: "material-symbols:info",
      children: [LinkPreset.About, LinkPreset.Friends],
    },
    {
      name: "Others",
      url: "#",
      icon: "material-symbols:more-horiz",
      children: [
        {
          name: "Projects",
          url: "/projects/",
          icon: "material-symbols:work",
        },
        {
          name: "Skills",
          url: "/skills/",
          icon: "material-symbols:psychology",
        },
        {
          name: "Timeline",
          url: "/timeline/",
          icon: "material-symbols:timeline",
        },
      ],
    },
  ],
};

export const profileConfig: ProfileConfig = {
  avatar: "assets/images/avatar.png", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
  name: "Mizuki",
  bio: "The world is big, you have to go and see",
  links: [
    {
      name: "Bilibli",
      icon: "fa6-brands:bilibili",
      url: "https://space.bilibili.com/701864046",
    },
    {
      name: "Gitee",
      icon: "mdi:git",
      url: "https://gitee.com/matsuzakayuki",
    },
    {
      name: "GitHub",
      icon: "fa6-brands:github",
      url: "https://github.com/matsuzaka-yuki",
    },
    {
      name: "Discord",
      icon: "fa6-brands:discord",
      url: "https://discord.gg/MqW6TcQtVM",
    },
  ],
};

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: "CC BY-NC-SA 4.0",
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
  // 注意：某些样式（如背景颜色）已被覆盖，请参阅 astro.config.mjs 文件。
  // 请选择深色主题，因为此博客主题目前仅支持深色背景
  theme: "github-dark",
};

export const commentConfig: CommentConfig = {
  enable: false, // 启用评论功能。当设置为 false 时，评论组件将不会显示在文章区域。
  twikoo: {
    envId: "https://twikoo.vercel.app",
    lang: "en", // 设置 Twikoo 评论系统语言为英文
  },
};

export const announcementConfig: AnnouncementConfig = {
  title: "Announcement", // 公告标题
  content: "Welcome to my blog! This is a sample announcement.", // 公告内容
  closable: true, // 允许用户关闭公告
  link: {
    enable: true, // 启用链接
    text: "Learn More", // 链接文本
    url: "/about/", // 链接 URL
    external: false, // 内部链接
  },
};

export const musicPlayerConfig: MusicPlayerConfig = {
  enable: true, // 启用音乐播放器功能
};

export const footerConfig: FooterConfig = {
  enable: false, // 是否启用Footer HTML注入功能
};

// 直接编辑 FooterConfig.html 文件来添加备案号等自定义内容

/**
 * 侧边栏布局配置
 * 用于控制侧边栏组件的显示、排序、动画和响应式行为
 */
export const sidebarLayoutConfig: SidebarLayoutConfig = {
  // 是否启用侧边栏功能
  enable: true,

  // 侧边栏位置：左侧或右侧
  position: "left",

  // 侧边栏组件配置列表
  components: [
    {
      // 组件类型：用户资料组件
      type: "profile",
      // 是否启用该组件
      enable: true,
      // 组件显示顺序（数字越小越靠前）
      order: 1,
      // 组件位置："top" 表示固定在顶部
      position: "top",
      // CSS 类名，用于应用样式和动画
      class: "onload-animation",
      // 动画延迟时间（毫秒），用于错开动画效果
      animationDelay: 0,
    },
    {
      // 组件类型：公告组件
      type: "announcement",
      // 是否启用该组件（现在通过统一配置控制）
      enable: true,
      // 组件显示顺序
      order: 2,
      // 组件位置："top" 表示固定在顶部
      position: "top",
      // CSS 类名
      class: "onload-animation",
      // 动画延迟时间
      animationDelay: 50,
    },
    {
      // 组件类型：分类组件
      type: "categories",
      // 是否启用该组件
      enable: true,
      // 组件显示顺序
      order: 3,
      // 组件位置："sticky" 表示粘性定位，可滚动
      position: "sticky",
      // CSS 类名
      class: "onload-animation",
      // 动画延迟时间
      animationDelay: 150,
      // 响应式配置
      responsive: {
        // 折叠阈值：当分类数量超过5个时自动折叠
        collapseThreshold: 5,
      },
    },
    {
      // 组件类型：标签组件
      type: "tags",
      // 是否启用该组件
      enable: true,
      // 组件显示顺序
      order: 4,
      // 组件位置："sticky" 表示粘性定位
      position: "sticky",
      // CSS 类名
      class: "onload-animation",
      // 动画延迟时间
      animationDelay: 200,
      // 响应式配置
      responsive: {
        // 折叠阈值：当标签数量超过20个时自动折叠
        collapseThreshold: 20,
      },
    },
  ],

  // 默认动画配置
  defaultAnimation: {
    // 是否启用默认动画
    enable: true,
    // 基础延迟时间（毫秒）
    baseDelay: 0,
    // 递增延迟时间（毫秒），每个组件依次增加的延迟
    increment: 50,
  },

  // 响应式布局配置
  responsive: {
    // 断点配置（像素值）
    breakpoints: {
      // 移动端断点：屏幕宽度小于768px
      mobile: 768,
      // 平板端断点：屏幕宽度小于1024px
      tablet: 1024,
      // 桌面端断点：屏幕宽度小于1280px
      desktop: 1280,
    },
    // 不同设备的布局模式
    //hidden:不显示侧边栏(桌面端)   drawer:抽屉模式(移动端不显示)   sidebar:显示侧边栏
    layout: {
      // 移动端：抽屉模式
      mobile: "sidebar",
      // 平板端：显示侧边栏
      tablet: "sidebar",
      // 桌面端：显示侧边栏
      desktop: "sidebar",
    },
  },
};

export const sakuraConfig: SakuraConfig = {
  enable: false, // 默认关闭樱花特效
  sakuraNum: 21, // 樱花数量
  limitTimes: -1, // 樱花越界限制次数，-1为无限循环
  size: {
    min: 0.5, // 樱花最小尺寸倍数
    max: 1.1, // 樱花最大尺寸倍数
  },
  speed: {
    horizontal: {
      min: -1.7, // 水平移动速度最小值
      max: -1.2, // 水平移动速度最大值
    },
    vertical: {
      min: 1.5, // 垂直移动速度最小值
      max: 2.2, // 垂直移动速度最大值
    },
    rotation: 0.03, // 旋转速度
  },
  zIndex: 100, // 层级，确保樱花在合适的层级显示
};

// Pio 看板娘配置
export const pioConfig: import("./types/config").PioConfig = {
  enable: false, // 启用看板娘
  models: ["/pio/models/pio/model.json"], // 默认模型路径
  position: "left", // 默认位置在右侧
  width: 280, // 默认宽度
  height: 250, // 默认高度
  mode: "draggable", // 默认为可拖拽模式
  hiddenOnMobile: true, // 默认在移动设备上隐藏
  dialog: {
    welcome: "Welcome to Mizuki Website!", // 欢迎词
    touch: [
      "What are you doing?",
      "Stop touching me!",
      "HENTAI!",
      "Don't bully me like that!",
    ], // 触摸提示
    home: "Click here to go back to homepage!", // 首页提示
    skin: ["Want to see my new outfit?", "The new outfit looks great~"], // 换装提示
    close: "QWQ See you next time~", // 关闭提示
    link: "https://github.com/matsuzaka-yuki/Mizuki", // 关于链接
  },
};

// 导出所有配置的统一接口
export const widgetConfigs = {
  profile: profileConfig,
  announcement: announcementConfig,
  music: musicPlayerConfig,
  layout: sidebarLayoutConfig,
  sakura: sakuraConfig,
  fullscreenWallpaper: fullscreenWallpaperConfig,
  pio: pioConfig, // 添加 pio 配置
} as const;

export const umamiConfig = {
  enabled: true, // 是否显示Umami统计
  shareURL: "http://43.163.80.102:8100/share/o0xKoBWzZrIb1uaX/www.trtyr.top", //你的分享API,支持自建服务
  scripts: `
<script defer src="http://43.163.80.102:8100/script.js" data-website-id="cc8468e9-30a9-4f4c-bf6d-5083f988cb87"></script>  `.trim(), //上面填你要插入的Script,不用再去Layout中插入
} as const;
