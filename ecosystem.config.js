module.exports = {
  apps: [{
    name: "fe-tools",
    script: "node_modules/next/dist/bin/next",
    args: "start -H 0.0.0.0 -p 5000",  // 直接在 args 中指定
    instances: "max",
    exec_mode: "cluster",
    env: {
      PORT: 5000,
      NODE_ENV: "production",
      HOST: "0.0.0.0"  // 同时也在环境变量中设置
    }
  }]
}