/**
 * 功能描述：检查外部 PostgreSQL 数据库连接
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://paperclip:paperclip@localhost:5432/paperclip';

async function checkDatabase() {
  console.log('检查数据库连接...');
  console.log('连接字符串:', DATABASE_URL.replace(/:\/\/[^:]+:/, '://***:***@'));

  try {
    const sql = postgres(DATABASE_URL, { max: 1 });

    // 测试连接
    const result = await sql`SELECT version()`;
    console.log('✓ 数据库连接成功');
    console.log('PostgreSQL 版本:', result[0].version.split(' ')[0]);

    // 检查数据库是否存在
    const dbResult = await sql`
      SELECT datname FROM pg_database WHERE datname = 'paperclip'
    `;

    if (dbResult.length > 0) {
      console.log('✓ paperclip 数据库已存在');
    } else {
      console.log('✗ paperclip 数据库不存在');
      console.log('  请先创建数据库: CREATE DATABASE paperclip;');
    }

    await sql.end();
  } catch (error: any) {
    console.error('✗ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

checkDatabase();
