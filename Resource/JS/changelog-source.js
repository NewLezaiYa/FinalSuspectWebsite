
/* FinalSuspect 更新日志数据源
 *
 * 直接读取 Resource/ModNews/FS.v<版本>_<日期>.md，解析成更新日志页面需要的数据，
 * 不再依赖手写的 changelog-data.js / versions.js。
 *
 * 新增一个版本时：
 *   1. 把 FS.v<版本>_<YYYYMMDD>.md 放进 Resource/ModNews/
 *   2. 运行 `node tools/sync-modnews.mjs` 重新生成下面 <modnews:files> 之间的清单
 *      （也可以手动往数组里加一行，顺序无关，运行时会按日期倒序排）
 *
 * 对外接口：
 *   ChangelogSource.list()   → 同步返回版本列表（仅依据文件名，无需网络请求）
 *   ChangelogSource.load()   → Promise<{ versions, changelog, missing, dir }>
 *   ChangelogSource.inline() → 把 md 行内语法（**粗体**、~~删除~~、*斜体*、`代码`、[链接](url)）转成安全 HTML
 */
(function () {
  'use strict';

  // <modnews:files>
  var FILES = [
    'FS.v1.5_20261010.md',
    'FS.v1.4_20260825.md',
    'FS.v1.3_20260815.md',
    'FS.v1.3_20260620.md',
    'FS.v1.3_20251005.md',
    'FS.v1.2_20250815.md',
    'FS.v1.1_20250501.md',
    'FS.v1.1_20250412.md',
    'FS.v1.1_20250216.md',
    'FS.v1.0_20250129.md',
    'FS.v1.0_20240814.md'
  ];
  // </modnews:files>

  var FILE_RE = /^FS\.v(\d+(?:\.\d+)*)_(\d{4})(\d{2})(\d{2})\.md$/i;

  // md 二级标题 → 改动类型（与更新日志页的筛选器保持一致）
  var KIND_BY_TITLE = {
    '修正': 'fix',
    '修复': 'fix',
    '优化': 'opt',
    '更改': 'change',
    '调整': 'change',
    '变更': 'change',
    '新增': 'add',
    '增加': 'add',
    '删除': 'remove',
    '移除': 'remove',
    '删除预告': 'remove',
    '重制': 'reset',
    '重置': 'reset'
  };

  // md 二级标题 → 元信息（不进入改动列表）
  var META_BY_TITLE = {
    '对应官方版本': 'official',
    '模组版本信息': 'build',
    '更新内容': 'ignore',
    '贡献者': 'contributors',
    '团队参与者': 'team',
    '参与者': 'team',
    '鸣谢': 'contributors'
  };

  var PENDING_TITLE = '未完内容';
  var BULLET_RE = /^[-*+]\s+(.*)$/;

  /* ------------------------------------------------------------------ */
  /* 路径：以本脚本所在目录为基准解析 ../ModNews/，页面在任意层级都能用   */
  /* ------------------------------------------------------------------ */
  function modNewsDir() {
    var script = document.currentScript;
    if (!script) {
      var all = document.getElementsByTagName('script');
      for (var i = all.length - 1; i >= 0; i--) {
        if (/changelog-source\.js(\?|#|$)/.test(all[i].src || '')) { script = all[i]; break; }
      }
    }
    if (script && script.src) {
      try { return new URL('../ModNews/', script.src).href; } catch (e) { /* 老浏览器兜底 */ }
    }
    return 'Resource/ModNews/';
  }

  var DIR = modNewsDir();

  /* ------------------------------------------------------------------ */
  /* 文件清单                                                           */
  /* ------------------------------------------------------------------ */
  function parseFileMeta(file) {
    var m = FILE_RE.exec(file);
    if (!m) return null;
    return {
      id: 'v' + m[1] + '_' + m[2] + m[3] + m[4],
      version: m[1],
      date: m[2] + '-' + m[3] + '-' + m[4],
      dateText: parseInt(m[2], 10) + '年' + parseInt(m[3], 10) + '月' + parseInt(m[4], 10) + '日',
      dateVersion: m[2] + m[3] + m[4],
      file: file
    };
  }

  function cmpVersion(a, b) {
    var pa = String(a).split('.');
    var pb = String(b).split('.');
    var len = Math.max(pa.length, pb.length);
    for (var i = 0; i < len; i++) {
      var d = (parseInt(pa[i], 10) || 0) - (parseInt(pb[i], 10) || 0);
      if (d) return d;
    }
    return 0;
  }

  var LIST = (function () {
    var out = [];
    for (var i = 0; i < FILES.length; i++) {
      var meta = parseFileMeta(String(FILES[i]).trim());
      if (meta) out.push(meta);
    }
    out.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return cmpVersion(b.version, a.version);
    });
    return out;
  })();

  /* ------------------------------------------------------------------ */
  /* md 解析                                                            */
  /* ------------------------------------------------------------------ */
  function parseMd(text) {
    var doc = { lang: '', summary: [], sections: [] };
    var lines = String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
    var section = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\s+$/, '');
      if (!line.trim()) continue;

      if (line.charAt(0) === '#') {
        var h2 = /^##\s+(.+)$/.exec(line);
        if (h2) {
          section = { title: h2[1].trim(), lines: [] };
          doc.sections.push(section);
          continue;
        }
        var h1 = /^#\s+(.+)$/.exec(line);
        if (h1) {
          if (!doc.lang) doc.lang = h1[1].trim();
          section = null;
          continue;
        }
      }

      if (section) section.lines.push(line.trim());
      else doc.summary.push(line.trim());
    }
    return doc;
  }

  function splitLines(section) {
    var out = [];
    section.lines.forEach(function (line) {
      var m = BULLET_RE.exec(line);
      out.push((m ? m[1] : line).trim());
    });
    return out;
  }

  function splitItems(section) {
    var items = [];
    section.lines.forEach(function (line) {
      var m = BULLET_RE.exec(line);
      if (m) items.push({ text: m[1].trim(), notes: [] });
      else if (items.length) items[items.length - 1].notes.push(line.trim());
      else items.push({ text: line.trim(), notes: [] });
    });
    return items;
  }

  function splitPairs(section) {
    var out = [];
    section.lines.forEach(function (line) {
      var m = BULLET_RE.exec(line);
      var body = (m ? m[1] : line).trim();
      var kv = /^(.+?)[:：]\s*(.+)$/.exec(body);
      if (kv) out.push({ key: kv[1].trim(), value: kv[2].trim() });
      else out.push({ key: '', value: body });
    });
    return out;
  }

  function splitPeople(section) {
    var out = [];
    section.lines.forEach(function (line) {
      var m = BULLET_RE.exec(line);
      if (!m) {
        if (out.length) out[out.length - 1].notes.push(line.trim());
        return;
      }
      var body = m[1].trim();
      var link = /^\[([^\]]+)\]\(\s*"?([^"\s)]+)"?\s*\)\s*(.*)$/.exec(body);
      if (link) {
        out.push({ name: link[1].trim(), url: link[2].trim(), notes: link[3] ? [link[3].trim()] : [] });
      } else {
        out.push({ name: body, url: '', notes: [] });
      }
    });
    return out;
  }

  function interpretSections(doc) {
    var info = {
      official: [],
      bepinex: [],
      release: '',
      build: '',
      programVersion: '',
      team: [],
      contributors: [],
      pending: [],
      groups: [],
      type: '正式版'
    };

    doc.sections.forEach(function (section) {
      var title = section.title;
      var field = META_BY_TITLE[title];

      if (field === 'official') {
        splitLines(section).forEach(function (line) {
          if (!line) return;
          if (/bepinex/i.test(line)) info.bepinex.push(line);
          else info.official.push(line);
        });
        return;
      }

      if (field === 'build') {
        splitPairs(section).forEach(function (pair) {
          if (/程序集|assembly/i.test(pair.key)) info.programVersion = pair.value;
          else if (/版本类型|发布类型/i.test(pair.key)) info.release = pair.value;
          else if (/构建号|build/i.test(pair.key)) info.build = pair.value;
        });
        return;
      }

      if (field === 'contributors' || field === 'team') {
        var people = splitPeople(section);
        if (field === 'team') info.team = info.team.concat(people);
        else info.contributors = info.contributors.concat(people);
        return;
      }

      if (field === 'ignore') return;

      if (title === PENDING_TITLE) {
        info.pending = splitItems(section);
        return;
      }

      var items = splitItems(section);
      if (!items.length) return;
      info.groups.push({
        kind: KIND_BY_TITLE[title] || 'change',
        title: title,
        items: items
      });
    });

    if (info.release && /beta|alpha|preview|预览|测试|内测/i.test(info.release)) info.type = '预览版';
    return info;
  }

  function buildEntry(meta, doc) {
    var info = interpretSections(doc);
    var totals = {};
    info.groups.forEach(function (g) {
      totals[g.kind] = (totals[g.kind] || 0) + g.items.length;
    });

    var buildText = [info.release, info.build ? '构建 ' + info.build : '']
      .filter(function (s) { return !!s; })
      .join(' / ');

    var metaLine = info.official.concat(info.bepinex);
    if (buildText) metaLine = metaLine.concat(['版本类型 & 构建号 ' + buildText]);

    return {
      version: {
        id: meta.id,
        version: meta.version,
        type: info.type,
        date: meta.date,
        dateText: meta.dateText,
        dateVersion: meta.dateVersion,
        official: info.official[0] || '',
        bepinex: info.bepinex[0] || '',
        programVersion: info.programVersion,
        release: info.release,
        build: buildText,
        totals: totals,
        highlights: doc.summary.slice(),
        file: DIR + meta.file
      },
      changelog: {
        id: meta.id,
        version: meta.version,
        type: info.type,
        date: meta.date,
        dateText: meta.dateText,
        dateVersion: meta.dateVersion,
        badge: meta.version + ' ' + info.type + ' | 日期版本：' + meta.dateVersion,
        meta: metaLine,
        official: info.official.slice(),
        bepinex: info.bepinex.slice(),
        programVersion: info.programVersion,
        release: info.release,
        build: buildText,
        summary: doc.summary.slice(),
        team: info.team.slice(),
        contributors: info.contributors.slice(),
        pending: info.pending.slice(),
        totals: totals,
        groups: info.groups,
        file: DIR + meta.file
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /* 行内 markdown                                                      */
  /* ------------------------------------------------------------------ */
  function escapeText(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  var SAFE_URL = /^(?:https?:\/\/|mailto:)/i;
  var LINK_RE = /\[([^\]]*)\]\(\s*"?([^"\s)]+)"?\s*\)/g;

  function inline(text) {
    var s = escapeText(text);
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    s = s.replace(LINK_RE, function (all, label, url) {
      if (!SAFE_URL.test(url)) return label;
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    return s;
  }

  /* ------------------------------------------------------------------ */
  /* 读取                                                               */
  /* ------------------------------------------------------------------ */
  function fetchText(url) {
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('当前浏览器不支持 fetch，无法读取 md 文件'));
    }
    return fetch(url, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' · ' + url);
      return res.text();
    });
  }

  var cache = null;

  function load() {
    if (cache) return cache;

    var missing = [];
    var jobs = LIST.map(function (meta) {
      return fetchText(DIR + meta.file).then(function (text) {
        return { meta: meta, doc: parseMd(text) };
      }).catch(function (err) {
        missing.push({ file: meta.file, message: (err && err.message) || String(err) });
        return null;
      });
    });

    cache = Promise.all(jobs).then(function (rows) {
      var ok = rows.filter(function (r) { return !!r; });
      if (!ok.length) {
        throw new Error('Resource/ModNews 下没有读到任何更新日志文件（' + DIR + '）');
      }
      var result = { versions: [], changelog: [], missing: missing, dir: DIR };
      ok.forEach(function (row) {
        var entry = buildEntry(row.meta, row.doc);
        result.versions.push(entry.version);
        result.changelog.push(entry.changelog);
      });
      return result;
    });

    return cache;
  }

  window.ChangelogSource = {
    list: function () { return LIST.slice(); },
    load: load,
    inline: inline
  };
})();
