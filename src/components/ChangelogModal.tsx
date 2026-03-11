import React from 'react';
import { X, FileText, Server, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function ChangelogModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <FileText size={22} className="text-rose-500" />
            版本更新与部署指南
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 bg-white">
          {/* Changelog Section */}
          <section>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Package size={20} className="text-rose-500" />
              历史更新版本
            </h3>
            
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-rose-200">
                <div className="absolute w-3 h-3 bg-rose-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                <h4 className="text-md font-bold text-stone-800 flex items-center gap-2">
                  v1.2.1 <span className="text-xs font-normal text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">最新版</span>
                </h4>
                <p className="text-xs text-stone-400 mb-2">2026-03-11</p>
                <ul className="list-disc list-inside text-sm text-stone-600 space-y-1.5">
                  <li><strong>兼容性更新</strong>：支持 Node.js v16.20.2+ 环境。</li>
                  <li><strong>部署优化</strong>：引入 esbuild 构建服务端，支持低版本 Node 运行。</li>
                  <li>新增：食谱周期营养报告（日均蛋白质、铁、钙摄入量进度条）</li>
                  <li>新增：偏好设置中 AI 驱动的营养目标建议，支持一键应用</li>
                </ul>
              </div>

              <div className="relative pl-6 border-l-2 border-stone-200">
                <div className="absolute w-3 h-3 bg-stone-300 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                <h4 className="text-md font-bold text-stone-800">v1.1.0</h4>
                <p className="text-xs text-stone-400 mb-2">2026-03-10</p>
                <ul className="list-disc list-inside text-sm text-stone-600 space-y-1.5">
                  <li>新增：“我的收藏”支持添加自定义备注</li>
                  <li>新增：AI 驱动的过敏原替代建议升级为卡片网格展示</li>
                  <li>新增：历史记录和收藏卡片增加“复制参数”按钮，一键复用</li>
                  <li>优化：食材库支持点击食材名称直接查看详情</li>
                </ul>
              </div>

              <div className="relative pl-6 border-l-2 border-stone-200">
                <div className="absolute w-3 h-3 bg-stone-300 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                <h4 className="text-md font-bold text-stone-800">v1.0.0</h4>
                <p className="text-xs text-stone-400 mb-2">2026-03-01</p>
                <ul className="list-disc list-inside text-sm text-stone-600 space-y-1.5">
                  <li>初始版本发布</li>
                  <li>支持基于 AI 的个性化辅食表生成</li>
                  <li>支持生成历史记录和收藏功能</li>
                  <li>支持单份及批量导出 Excel</li>
                  <li>支持自定义 API Key 和 Base URL</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Deployment Section */}
          <section>
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Server size={20} className="text-blue-500" />
              部署详细教程
            </h3>
            
            <div className="space-y-6">
              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
                  方式一：Docker 部署 (推荐)
                </h4>
                <p className="text-sm text-stone-600 mb-3">使用 Docker 可以最快速地在任何服务器上运行本项目。</p>
                <div className="bg-stone-800 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-stone-300 font-mono leading-relaxed">
{`# 1. 克隆项目代码到服务器
git clone https://github.com/dcxa521gi/baby-food-app
cd baby-food-app

# 2. 构建 Docker 镜像
docker build -t baby-food-app .

# 3. 运行容器 (将容器内的 3000 端口映射到宿主机的 13521 端口)
docker run -d -p 13521:3000 --name baby-food-app --restart always baby-food-app

# 4. 访问 http://你的服务器IP:13521 即可使用`}
                  </pre>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-green-500 rounded-full inline-block"></span>
                  方式二：宝塔 Docker 命令行创建 (推荐)
                </h4>
                <p className="text-sm text-stone-600 mb-3">在宝塔 Docker 管理器中，点击“容器”-“添加容器”-“命令行”：</p>
                <div className="bg-stone-800 rounded-lg p-3 overflow-x-auto mb-3">
                  <pre className="text-xs text-stone-300 font-mono leading-relaxed">
{`# 确保已在终端执行 git clone 并进入目录
docker build -t baby-food-app .
docker run -d -p 13521:3000 --name baby-food-app --restart always baby-food-app`}
                  </pre>
                </div>
                <p className="text-xs text-stone-500 italic">注：请在宝塔“安全”页面放行 13521 端口。</p>
              </div>

              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
                <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block"></span>
                  方式三：宝塔 Node 项目管理器部署
                </h4>
                <p className="text-sm text-stone-600 mb-3">如果您不使用 Docker，也可以通过 Node 项目管理器部署。</p>
                <ol className="list-decimal list-inside text-sm text-stone-600 space-y-2">
                  <li>在宝塔面板的<strong>软件商店</strong>中，搜索并安装 <strong>Node.js 版本管理器</strong>。</li>
                  <li>打开 Node.js 版本管理器，安装 <strong>Node.js v16.20.2 或以上版本</strong>。</li>
                  <li>在<strong>文件</strong>中，创建一个新目录（如 <code>/www/wwwroot/baby-food</code>），将项目所有文件上传并解压到该目录。</li>
                  <li>在<strong>网站</strong> -{'>'} <strong>Node项目</strong> 中，点击<strong>添加Node项目</strong>：
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-stone-500">
                      <li>项目目录：选择刚才上传的目录</li>
                      <li>启动选项：自定义启动命令</li>
                      <li>启动命令：<code>npm run start</code></li>
                      <li>项目端口：<code>3000</code>（注：代码默认3000，您可以在宝塔中设置反向代理将外部 13521 端口指向它）</li>
                      <li>运行用户：www</li>
                    </ul>
                  </li>
                  <li><strong>特别注意</strong>：由于您的环境是 Node 16，请确保在上传前在本地执行 <code>npm run build</code>，或者确保服务器上有 <code>esbuild</code> 环境来构建服务端代码。</li>
                  <li>点击提交，宝塔会自动执行 <code>npm install</code> 并启动项目。</li>
                  <li>在宝塔的<strong>安全</strong>页面，放行 <code>13521</code> 端口。</li>
                  <li>访问 <code>http://你的服务器IP:13521</code> 即可使用。</li>
                </ol>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
