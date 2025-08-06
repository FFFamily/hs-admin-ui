#!/bin/bash

# Vue Admin Template 部署脚本
# 使用方法: ./deploy.sh [production|staging]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="vue-admin-template"
BUILD_DIR="dist"
DEPLOY_DIR="/var/www/vue-admin"
BACKUP_DIR="/var/www/backup"
NGINX_CONF="/etc/nginx/sites-available/vue-admin"
NGINX_SITE="/etc/nginx/sites-enabled/vue-admin"

# 检查参数
ENV=${1:-production}
echo -e "${GREEN}开始部署到 ${ENV} 环境...${NC}"

# 1. 安装依赖
echo -e "${YELLOW}1. 安装依赖...${NC}"
npm install

# 2. 构建项目
echo -e "${YELLOW}2. 构建项目...${NC}"
if [ "$ENV" = "production" ]; then
    npm run build:prod
else
    npm run build:stage
fi

# 3. 检查构建结果
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}构建失败，dist目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}构建成功！${NC}"

# 4. 创建备份
echo -e "${YELLOW}3. 创建备份...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME"
    echo -e "${GREEN}备份已创建: $BACKUP_DIR/$BACKUP_NAME${NC}"
fi

# 5. 部署到服务器
echo -e "${YELLOW}4. 部署到服务器...${NC}"
sudo mkdir -p "$DEPLOY_DIR"
sudo rm -rf "$DEPLOY_DIR"/*
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR/"
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

echo -e "${GREEN}文件部署完成！${NC}"

# 6. 配置Nginx
echo -e "${YELLOW}5. 配置Nginx...${NC}"

# 创建Nginx配置文件
sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;  # 替换为你的域名
    
    root $DEPLOY_DIR;
    index index.html;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API代理配置
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Vue Router支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
    }
    
    # 错误页面
    error_page 404 /index.html;
}
EOF

# 启用站点
sudo ln -sf "$NGINX_CONF" "$NGINX_SITE"

# 测试Nginx配置
echo -e "${YELLOW}6. 测试Nginx配置...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}Nginx配置测试通过！${NC}"
    
    # 重启Nginx
    echo -e "${YELLOW}7. 重启Nginx...${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}Nginx重启成功！${NC}"
else
    echo -e "${RED}Nginx配置测试失败！${NC}"
    exit 1
fi

# 8. 清理构建文件
echo -e "${YELLOW}8. 清理构建文件...${NC}"
rm -rf "$BUILD_DIR"

echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}访问地址: http://localhost${NC}"
echo -e "${YELLOW}注意: 请确保后端API服务运行在 127.0.0.1:8080${NC}" 