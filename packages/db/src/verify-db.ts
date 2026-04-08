/**
 * 功能描述：验证 Paperclip 数据库配置
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

const DATABASE_URL = 'postgres://paperclip:paperclip@localhost:5432/paperclip';

async function verifyDatabase() {
  console.log('验证数据库配置...\n');

  try {
    // 测试连接到 paperclip 数据库
    const sql = postgres(DATABASE_URL, { max: 1 });

    // 检查连接
    const versionResult = await sql`SELECT version()`;
    console.log('✓ 数据库连接成功');
    console.log('  PostgreSQL 版本:', versionResult[0].version.split(' ')[0]);

    // 检查当前用户权限
    const userResult = await sql`
      SELECT usename, usesuper, usecreatedb 
      FROM pg_user 
      WHERE usename = current_user
    `;
    console.log('\n✓ 当前用户:', userResult[0].usename);
    console.log('  超级用户:', userResult[0].usesuper ? '是' : '否');
    console.log('  可创建数据库:', userResult[0].usecreatedb ? '是' : '否');

    // 检查数据库是否存在
    const dbResult = await sql`
      SELECT datname FROM pg_database WHERE datname = 'paperclip'
    `;
    console.log('\n✓ paperclip 数据库:', dbResult.length > 0 ? '存在' : '不存在');

    await sql.end();
    console.log('\n数据库验证完成！');
    return true;
  } catch (error: any) {
    console.error('✗ 数据库验证失败:', error.message);
    return false;
  }
}

verifyDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
