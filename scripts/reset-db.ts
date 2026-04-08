/**
 * 功能描述：重置 Paperclip 数据库
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://paperclip:paperclip@localhost:5432/paperclip';

async function resetDatabase() {
  // 连接到 postgres 数据库（而不是 paperclip 数据库）
  const adminUrl = DATABASE_URL.replace(/\/paperclip$/, '/postgres');
  const sql = postgres(adminUrl);

  try {
    console.log('正在删除 paperclip 数据库...');
    await sql`DROP DATABASE IF EXISTS paperclip`;
    console.log('正在创建 paperclip 数据库...');
    await sql`CREATE DATABASE paperclip`;
    console.log('数据库重置完成！');
  } catch (error) {
    console.error('重置数据库失败:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

resetDatabase();
