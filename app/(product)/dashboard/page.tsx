import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";

const DashboardPage = async () => {
  const dbUser = await ensureDbUser();
  const items = await prisma.userShow.findMany({
    where: { userId: dbUser.id },
    include: { show: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>User {dbUser.id}&apos;s Dashboard</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.show?.name ?? item.showId}</li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardPage;
