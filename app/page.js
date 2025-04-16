import Image from "next/image";
import Link from "next/link";
import { UploadOutlined } from "@ant-design/icons";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">工具导航</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* <Link href="/sync" className="block">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                  <UploadOutlined className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-200">文件同步工具</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">快速同步和上传文件，支持批量操作和进度显示</p>
            </div>
          </Link> */}
          <Link href="/img-generate" className="block">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-200">图片生成工具</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">快速生成和处理图片，支持多种图片生成功能</p>
            </div>
          </Link>
          <Link href="/video-generator" className="block">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-200">测试视频生成器</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">生成各种测试视频，支持多种格式和模式</p>
            </div>
          </Link>
          <Link href="/video-converter" className="block">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                  {/* Reusing video icon for now */}
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="ml-4 text-xl font-semibold text-gray-800 dark:text-gray-200">视频转换工具</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">在线转换视频格式，支持多种常见格式</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
