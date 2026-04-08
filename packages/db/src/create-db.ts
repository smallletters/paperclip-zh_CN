/**
 * 功能描述：创建 Paperclip 数据库
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

// 连接到 postgres 数据库（而不是 paperclip 数据库）
const ADMIN_URL = 'postgres://paperclip:paperclip@localhost:5432/postgres';

async function createDatabase() {
  console.log('连接到 postgres 数据库...');

  try {
    const sql = postgres(ADMIN_URL, { max: 1 });

    // 检查 paperclip 数据库是否存在
    const checkResult = await sql`
      SELECT 1 FROM pg_database WHERE datname = 'paperclip'
    `;

    if (checkResult.length > 0) {
      console.log('✓ paperclip 数据库已存在');
    } else {
      console.log('正在创建 paperclip 数据库...');
      await sql`CREATE DATABASE paperclip`;
      console.log('✓ paperclip 数据库创建成功');
    }

    await sql.end();
    console.log('数据库准备完成！');
  } catch (error: any) {
    console.error('✗ 创建数据库失败:', error.message);
    console.log('\n可能的解决方案：');
    console.log('1. 确保 PostgreSQL 服务正在运行');
    console.log('2. 确保 paperclip 用户存在且有创建数据库的权限');
    console.log('3. 使用超级用户手动创建数据库：');
    console.log('   CREATE DATABASE paperclip;');
    console.log('   GRANT ALL PRIVILEGES ON DATABASE paperclip TO paperclip;');
    process.exit(1);
  }
}

createDatabase();
