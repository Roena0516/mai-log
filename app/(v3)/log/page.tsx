import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function RedirectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/api/auth/signin");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });
  if (!user?.username) redirect("/setup");
  redirect(`/${user.username}/log`);
}
