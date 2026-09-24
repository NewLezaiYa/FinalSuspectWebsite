/* ============================================================================
 * FinalSuspect Website — versions.js
 * 版本索引（供主页版本条 / 更新日志页共用）
 * 新增版本时：在数组最前面加一条即可，顺序即页面顺序（新 → 旧）
 * ========================================================================== */
window.SITE_VERSION = '1.3';

window.VERSIONS = [
  {
    id: 'v1.3_20260815',
    version: '1.3',
    type: '正式版',
    date: '2026-08-15',
    dateText: '2026年8月15日',
    official: 'Among Us v2025.11.18',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20260815',
    totals: { fix: 3, add: 1, remove: 2 },
    highlights: [
      '修复大厅倒计时与自定义房间设置冲突的问题',
      '新增主机端玩家异常行为提示',
      '移除已废弃的旧版兼容代码'
    ]
  },
  {
    id: 'v1.3_20260620',
    version: '1.3',
    type: '正式版',
    date: '2026-06-20',
    dateText: '2026年6月20日',
    official: 'Among Us v2025.11.18',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20260620',
    totals: { fix: 2, add: 1 },
    highlights: [
      '修复部分平台好友代码显示为空',
      '优化模组加载顺序，降低启动失败率',
      '新增离线模式下的本地大厅支持'
    ]
  },
  {
    id: 'v1.3_20251005',
    version: '1.3',
    type: '正式版',
    date: '2025-10-05',
    dateText: '2025年10月5日',
    official: 'Among Us v2025.6.13',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20251005',
    totals: { fix: 5, opt: 1, change: 3, add: 9, remove: 1 },
    highlights: [
      '重构启动流程，显著缩短进入主菜单时间',
      '新增 6 套可切换主页背景',
      '新增我的音乐、资源管理、名称标识管理',
      '修复多项与官方版本更新相关的兼容问题'
    ]
  },
  {
    id: 'v1.2_20250815',
    version: '1.2.0',
    type: '正式版',
    date: '2025-08-15',
    dateText: '2025年8月15日',
    official: 'Among Us v2025.3.25',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20250815',
    totals: { fix: 23, opt: 10, change: 17, add: 37, reset: 1, remove: 1 },
    highlights: [
      '89 项改动的一次大版本更新',
      '新增展示玩家平台与客户端信息',
      '新增刷屏词过滤与违禁昵称踢出',
      '解锁帧率、快速启动等性能选项上线'
    ]
  },
  {
    id: 'v1.1_20250501',
    version: '1.1',
    type: '正式版',
    date: '2025-05-01',
    dateText: '2025年5月1日',
    official: 'Among Us v2025.3.25',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20250501',
    totals: { fix: 3, opt: 1, change: 1, add: 1 },
    highlights: ['修复上一版本遗留的连接异常', '优化日志输出格式']
  },
  {
    id: 'v1.1_20250412',
    version: '1.1',
    type: '正式版',
    date: '2025-04-12',
    dateText: '2025年4月12日',
    official: 'Among Us v2025.3.25',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20250412',
    totals: { fix: 6, opt: 3, add: 6 },
    highlights: ['15 项改动', '好友代码异常玩家踢出功能上线']
  },
  {
    id: 'v1.1_20250216',
    version: '1.1',
    type: '正式版',
    date: '2025-02-16',
    dateText: '2025年2月16日',
    official: 'Among Us v2024.11.5',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20250216',
    totals: { fix: 8, opt: 4, add: 10 },
    highlights: ['22 项改动', '人满自动开始与结束时自动返回大厅选项完善']
  },
  {
    id: 'v1.0_20250129',
    version: '1.0',
    type: '正式版',
    date: '2025-01-29',
    dateText: '2025年1月29日',
    official: 'Among Us v2024.11.5',
    bepinex: 'BepInEx 5.4.21',
    build: 'Release / 20250129',
    totals: { fix: 20, opt: 15, add: 60, change: 5 },
    highlights: ['100 项改动的首个正式版', 'FinalSuspect 1.0 正式发布']
  },
  {
    id: 'v1.0_20240814',
    version: '1.0',
    type: '预览版',
    date: '2024-08-14',
    dateText: '2024年8月14日',
    official: 'Among Us v2023.11.28',
    bepinex: 'BepInEx 5.4.21',
    build: 'OpenBeta / 20240814',
    totals: { add: 40, fix: 12 },
    highlights: ['首个公开预览版本', '建立基础框架与选项系统']
  }
];
