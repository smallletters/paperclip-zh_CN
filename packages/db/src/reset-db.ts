/**
 * 功能描述：重置 Paperclip 数据库
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

// 尝试使用不同的连接方式
const CONNECTION_STRINGS = [
  // 尝试使用 postgres 用户（常见默认密码）
  'postgres://postgres:postgres@localhost:5432/postgres',
  'postgres://postgres:@localhost:5432/postgres',
  // 尝试使用 trust 认证（无密码）
  'postgres://postgres@localhost:5432/postgres',
];

async function resetDatabase() {
  for (const connString of CONNECTION_STRINGS) {
    try {
      console.log(`尝试连接: ${connString.replace(/:\/\/[^:]+:/, '://***:***@')}`);
      const sql = postgres(connString, { max: 1 });

      console.log('正在创建 paperclip 数据库...');
      await sql`CREATE DATABASE paperclip`;

      console.log('正在授予权限...');
      await sql`GRANT ALL PRIVILEGES ON DATABASE paperclip TO paperclip`;

      console.log('数据库重置完成！');
      await sql.end();
      return;
    } catch (error: any) {
      console.log(`连接失败: ${error.message}`);
      continue;
    }
  }

  console.error('所有连接方式都失败了');
  process.exit(1);
}

resetDatabase();
