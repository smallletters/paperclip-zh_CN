/**
 * 功能描述：为 paperclip 用户授予超级用户权限
 * 作者：<smallletters@sina.com>
 * 创建日期：2026-04-06
 */

import postgres from 'postgres';

// 使用 postgres 超级用户连接（请根据实际情况修改密码）
const ADMIN_URLS = [
  'postgres://postgres:postgres@localhost:5432/postgres',
  'postgres://postgres:@localhost:5432/postgres',
  'postgres://postgres@localhost:5432/postgres',
];

async function grantSuperuser() {
  for (const adminUrl of ADMIN_URLS) {
    try {
      console.log('尝试以 postgres 用户连接...');
      const sql = postgres(adminUrl, { max: 1 });

      // 检查 paperclip 用户是否存在
      const userCheck = await sql`
        SELECT 1 FROM pg_user WHERE usename = 'paperclip'
      `;

      if (userCheck.length === 0) {
        console.log('创建 paperclip 用户...');
        await sql`CREATE USER paperclip WITH PASSWORD 'paperclip'`;
      }

      // 授予超级用户权限
      console.log('授予 paperclip 用户超级用户权限...');
      await sql`ALTER USER paperclip WITH SUPERUSER`;

      // 验证权限
      const verifyResult = await sql`
        SELECT usesuper FROM pg_user WHERE usename = 'paperclip'
      `;

      if (verifyResult[0]?.usesuper) {
        console.log('✓ paperclip 用户已成功设置为超级用户');
      } else {
        console.log('✗ 设置超级用户权限失败');
      }

      await sql.end();
      return;
    } catch (error: any) {
      console.log(`连接失败: ${error.message}`);
      continue;
    }
  }

  console.error('无法以 postgres 用户连接，请手动执行以下 SQL 命令：');
  console.error('  ALTER USER paperclip WITH SUPERUSER;');
  process.exit(1);
}

grantSuperuser();
