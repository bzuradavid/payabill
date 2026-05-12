import { type PrismaClient } from "../../../generated/prisma";
import { type UserContext } from "~/server/get-user";

export class GLAccountService {
  constructor(
    private db: PrismaClient,
    private ctx: UserContext,
  ) {}

  list() {
    return this.db.gLAccount.findMany({
      where: { organizationId: this.ctx.organizationId },
      orderBy: [{ type: "asc" }, { code: "asc" }],
    });
  }
}
