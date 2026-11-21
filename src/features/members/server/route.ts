import { z } from "zod";
import { Hono } from "hono";
import { AppwriteException, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";

import { getMember } from "../utils";
import { Member, MemberRole } from "../types";

const logMemberDebug = (message: string, details: Record<string, unknown>) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(message, details);
  }
};

const logMemberFailure = (
  operation: "update" | "delete",
  error: unknown,
  details: Record<string, unknown>,
) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[members.${operation}] Appwrite operation failed`, {
      ...details,
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof AppwriteException ? error.code : undefined,
      type: error instanceof AppwriteException ? error.type : undefined,
      error,
    });
  }
};

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          }
        })
      );

      return c.json({
        data: {
          ...members,
          documents: populatedMembers,
        },
      });
    }
  )
  .delete(
    "/:memberId",
    sessionMiddleware,
    async (c) => {
      const { memberId } = c.req.param();
      const user = c.get("user");
      const databases = c.get("databases");

      logMemberDebug("[members.delete] Request received", {
        workspaceId: null,
        memberId,
        requesterUserId: user.$id,
      });

      const memberToDelete = await databases
        .getDocument(DATABASE_ID, MEMBERS_ID, memberId)
        .catch((error: unknown) => {
          logMemberFailure("delete", error, {
            stage: "target document lookup",
            workspaceId: null,
            memberId,
          });
          throw error;
        });
      const workspaceId = memberToDelete.workspaceId as string;

      logMemberDebug("[members.delete] Target document lookup succeeded", {
        requestedMemberId: memberId,
        documentId: memberToDelete.$id,
        workspaceId,
        idMatchesDocument: memberId === memberToDelete.$id,
      });

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      logMemberDebug("[members.delete] Authorization check result", {
        workspaceId,
        requesterUserId: user.$id,
        requesterMemberDocumentId: member?.$id ?? null,
        requesterRole: member?.role ?? null,
        targetMemberDocumentId: memberToDelete.$id,
        authorized: Boolean(member && (member.$id === memberToDelete.$id || member.role === MemberRole.ADMIN)),
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot delete the only member" }, 400);
      }

      try {
        const { databases: adminDatabases } = await createAdminClient();
        await adminDatabases.deleteDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
        );
      } catch (error) {
        logMemberFailure("delete", error, {
          workspaceId,
          memberId,
          targetDocumentId: memberToDelete.$id,
          idMatchesDocument: memberId === memberToDelete.$id,
        });
        throw error;
      }

      return c.json({ data: { $id: memberToDelete.$id } });
    }
  )
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

      logMemberDebug("[members.patch] Request received", {
        workspaceId: null,
        memberId,
        role,
        requesterUserId: user.$id,
      });

      const memberToUpdate = await databases
        .getDocument(DATABASE_ID, MEMBERS_ID, memberId)
        .catch((error: unknown) => {
          logMemberFailure("update", error, {
            stage: "target document lookup",
            workspaceId: null,
            memberId,
            requestedRole: role,
          });
          throw error;
        });
      const workspaceId = memberToUpdate.workspaceId as string;

      logMemberDebug("[members.patch] Target document lookup succeeded", {
        requestedMemberId: memberId,
        documentId: memberToUpdate.$id,
        workspaceId,
        idMatchesDocument: memberId === memberToUpdate.$id,
        requestedRole: role,
      });

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      );

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      logMemberDebug("[members.patch] Authorization check result", {
        workspaceId,
        requesterUserId: user.$id,
        requesterMemberDocumentId: member?.$id ?? null,
        requesterRole: member?.role ?? null,
        targetMemberDocumentId: memberToUpdate.$id,
        authorized: Boolean(member?.role === MemberRole.ADMIN),
        requestedRole: role,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade the only member" }, 400);
      }

      try {
        const { databases: adminDatabases } = await createAdminClient();
        await adminDatabases.updateDocument(
          DATABASE_ID,
          MEMBERS_ID,
          memberId,
          {
            role,
          }
        );
      } catch (error) {
        logMemberFailure("update", error, {
          workspaceId,
          memberId,
          targetDocumentId: memberToUpdate.$id,
          idMatchesDocument: memberId === memberToUpdate.$id,
          requestedRole: role,
        });
        throw error;
      }

      return c.json({ data: { $id: memberToUpdate.$id } });
    }
  )

export default app;
