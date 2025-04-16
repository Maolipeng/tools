#!/bin/bash

git pull
pnpm build
pm2 restart ecosystem.config.js