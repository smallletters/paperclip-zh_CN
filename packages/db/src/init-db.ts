/**
 * 功能描述：初始化 Paperclip 数据库
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

// 使用 paperclip 用户连接到 postgres 数据库
const ADMIN_URL = 'postgres://paperclip:paperclip@localhost:5432/postgres';

async function initDatabase() {
  const sql = postgres(ADMIN_URL);

  try {
    // 检查 paperclip 数据库是否存在
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = 'paperclip'
    `;

    if (result.length === 0) {
      console.log('paperclip 数据库不存在，需要手动创建');
      console.log('请使用 PostgreSQL 超级用户执行以下命令：');
      console.log('  CREATE DATABASE paperclip;');
      console.log('  GRANT ALL PRIVILEGES ON DATABASE paperclip TO paperclip;');
      process.exit(1);
    }

    console.log('paperclip 数据库已存在');

    // 检查是否有权限创建表
    const testResult = await sql`
      SELECT has_database_privilege('paperclip', 'paperclip', 'CREATE')
    `;

    if (testResult[0]?.has_database_privilege) {
      console.log('paperclip 用户具有 CREATE 权限');
    } else {
      console.log('警告: paperclip 用户可能没有足够的权限');
    }

    console.log('数据库检查完成！');
  } catch (error: any) {
    console.error('检查数据库失败:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

initDatabase();
