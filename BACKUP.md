# 数据库备份

## 手动备份

```bash
# 导出整个数据库
mysqldump -u root -p mylog > backup_$(date +%Y%m%d).sql

# 仅导出结构
mysqldump -u root -p --no-data mylog > schema_backup.sql

# 仅导出数据
mysqldump -u root -p --no-create-info mylog > data_backup.sql
```

## 定时备份 (crontab)

```bash
# 每天凌晨 2 点备份
0 2 * * * mysqldump -u root -p'your_password' mylog > /backups/mylog_$(date +\%Y\%m\%d).sql

# 保留最近 7 天
0 3 * * * find /backups -name "mylog_*.sql" -mtime +7 -delete
```

## 图片备份

`public/uploads/` 目录内容建议通过 Docker volume 持久化或同步到对象存储（S3/R2/OSS）。
