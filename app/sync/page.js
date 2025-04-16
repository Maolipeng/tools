'use client';

import React, { useState, useEffect } from 'react';
import { Button, message, Progress, Radio, Modal, Input, Space } from 'antd';
import axios from 'axios';
import { UploadOutlined, SettingOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';

const SyncPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localFiles, setLocalFiles] = useState([]);
  const [targetPath, setTargetPath] = useState('');
const [pathOptions, setPathOptions] = useState([]);
const [isModalVisible, setIsModalVisible] = useState(false);
const [newPath, setNewPath] = useState({ label: '', value: '' });

  // 处理用户选择的本地目录
  const handleDirectoryChange = async (event) => {
    const files = event.target.files;
    const fileList = await Promise.all(
      Array.from(files).map(async file => {
        const content = await file.arrayBuffer();
        const md5 = CryptoJS.MD5(CryptoJS.lib.WordArray.create(content)).toString();
        return {
          path: file.webkitRelativePath,
          mtime: file.lastModified,
          md5,
          content: file,
        };
      })
    );
    setLocalFiles(fileList);
  };

  // 文件同步逻辑
  const syncFiles = async () => {
    if (localFiles.length === 0) {
      message.warning('请先选择目录');
      return;
    }

    setSyncing(true);
    try {
      // 1. 获取服务器文件列表
      const serverResponse = await axios.get(`/api/files?targetDir=${encodeURIComponent(targetPath)}`);
      const serverFiles = serverResponse.data;

      // 2. 确定需要上传的文件
      const filesToUpload = localFiles.filter(localFile => {
        const serverFile = serverFiles.find(sf => sf.path === localFile.path);
        return !serverFile || serverFile.mtime < localFile.mtime || serverFile.md5 !== localFile.md5;
      });

      // 3. 确定需要删除的文件
      const filesToDelete = serverFiles.filter(sf => !localFiles.some(lf => lf.path === sf.path));

      // 4. 删除服务器上多余的文件
      if (filesToDelete.length > 0) {
        await axios.delete(`/api/files?targetDir=${encodeURIComponent(targetPath)}`, { data: { files: filesToDelete.map(f => f.path) } });
      }

      // 5. 上传需要上传的文件
      const totalFiles = filesToUpload.length;
      let uploaded = 0;

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file.content);
        formData.append('path', file.path);
        formData.append('targetDir', targetPath);

        await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(Math.round((uploaded + percent / 100) / totalFiles * 100));
          },
        });
        uploaded++;
      }

      message.success('文件同步完成');
    } catch (error) {
      message.error('同步失败: ' + error.message);
    } finally {
      setSyncing(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    // 获取路径配置
    const fetchPaths = async () => {
      try {
        const response = await axios.get('/api/paths');
        setPathOptions(response.data);
        if (response.data.length > 0) {
          setTargetPath(response.data[0].value);
        }
      } catch (error) {
        message.error('获取路径配置失败');
      }
    };
    fetchPaths();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">文件同步上传系统</h1>
        <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择源文件夹
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="mr-2 h-5 w-5 text-gray-400" />
              <span className="text-gray-600"> {localFiles.length === 0 ? '未选择文件夹' : `已选择 ${localFiles.length} 个文件`}</span>
            </div>
          </div>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
          <input
            type="file"
            webkitdirectory="true"
            onChange={handleDirectoryChange}
            style={{ display: 'none' }}
            id="folderInput"
          />
            选择文件夹
          </label>
        </div>
        
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>设置目标路径 <SettingOutlined onClick={() => setIsModalVisible(true)}/> </div>
        <Space style={{ width: '100%', marginBottom: 16 }}>
          <Radio.Group
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            options={pathOptions}
          />
      
        </Space>

        <Modal
          title="添加上传路径"
          open={isModalVisible}
          onOk={async () => {
            try {
              const response = await axios.post('/api/paths', newPath);
              setPathOptions(response.data);
              setIsModalVisible(false);
              setNewPath({ label: '', value: '' });
              message.success('添加成功');
            } catch (error) {
              message.error(error.response?.data?.error || '添加失败');
            }
          }}
          onCancel={() => {
            setIsModalVisible(false);
            setNewPath({ label: '', value: '' });
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="路径名称"
              value={newPath.label}
              onChange={(e) => setNewPath(prev => ({ ...prev, label: e.target.value }))}
            />
            <Input
              placeholder="路径地址"
              value={newPath.value}
              onChange={(e) => setNewPath(prev => ({ ...prev, value: e.target.value }))}
            />
          </Space>
        </Modal>
        <Button
          type="primary"
          onClick={syncFiles}
          disabled={syncing || localFiles.length === 0}
          loading={syncing}
          icon={<UploadOutlined />}
          style={{ 
            width: '100%',
            height: 40,
            backgroundColor: '#00B96B',
            borderColor: '#00B96B'
          }}
        >
          {syncing ? '同步中...' : '开始上传'}
        </Button>
      </div>
      {syncing && <Progress percent={progress} status="active" />}
    </div>
  );
};

export default SyncPage;