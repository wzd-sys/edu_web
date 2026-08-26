import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const teacher = await prisma.user.upsert({
    where: { username: 'teacher01' },
    update: {},
    create: {
      username: 'teacher01',
      email: 'teacher01@example.com',
      passwordHash,
      role: 'teacher',
    },
  });

  const subjects = ['语文', '数学', '英语', '科学', '美术'];
  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
  const types = ['课件', '教案', '习题', '素材', '3D模型'];

  const sampleMaterials = [
    { title: '三年级数学上册-认识分数', subject: '数学', grade: '三年级', type: '课件', description: '认识分数的基本概念和运算' },
    { title: '四年级科学-太阳系模型', subject: '科学', grade: '四年级', type: '3D模型', description: '太阳系八大行星3D模型' },
    { title: '二年级语文-古诗三首', subject: '语文', grade: '二年级', type: '教案', description: '《春晓》《静夜思》《悯农》教学设计' },
    { title: '五年级英语-Unit 5 练习题', subject: '英语', grade: '五年级', type: '习题', description: 'Unit 5 听说读写综合练习' },
    { title: '一年级美术-色彩基础', subject: '美术', grade: '一年级', type: '素材', description: '三原色和三间色教学素材' },
    { title: '六年级数学-立体几何', subject: '数学', grade: '六年级', type: '3D模型', description: '正方体、长方体、圆柱体3D模型' },
  ];

  for (const m of sampleMaterials) {
    await prisma.material.upsert({
      where: { id: 0 },
      update: {},
      create: {
        ...m,
        fileUrl: `/uploads/sample-${Date.now()}.pdf`,
        likeCount: Math.floor(Math.random() * 50),
        uploaderId: teacher.id,
      },
    }).catch(() => {});
  }

  console.log('Seed completed successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
