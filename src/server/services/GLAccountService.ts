import { type PrismaClient } from "../../../generated/prisma";
import { type UserContext } from "~/server/get-user";

export class GLAccountService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  list() {
    return this.db.gLAccount.findMany({
      where: {
        userId: this.ctx.userId,
        ...(this.ctx.hideSeed ? { seed: false } : {}),
      },
      orderBy: [{ type: "asc" }, { code: "asc" }],
    });
  }
}
