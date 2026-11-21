import { randomInt } from "node:crypto";
import { z } from "zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Databases, ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { MemberRole } from "@/features/members/types";
import { TaskStatus } from "@/features/tasks/types";
import { getMember } from "@/features/members/utils";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";

import { Workspace } from "../types";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";

const generateWorkspaceInviteCode = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => characters[randomInt(characters.length)]).join("");
};

const maskInviteCode = (inviteCode: string | undefined) => {
  if (!inviteCode) return "(missing)";
  if (inviteCode.length <= 4) return "*".repeat(inviteCode.length);
  return `${inviteCode.slice(0, 2)}${"*".repeat(inviteCode.length - 4)}${inviteCode.slice(-2)}`;
};

const generateUniqueWorkspaceInviteCode = async (databases: Databases) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateWorkspaceInviteCode(12);
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.equal("inviteCode", inviteCode), Query.limit(1)],
    );

    if (existing.total === 0) {
      return inviteCode;
    }
  }

  throw new HTTPException(503, { message: "Could not generate a unique workspace invite code" });
};

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );

    if (members.total === 0) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);
    const adminWorkspaceIds = new Set(
      members.documents
        .filter((member) => member.role === MemberRole.ADMIN)
        .map((member) => member.workspaceId),
    );

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds)
      ],
    );

    return c.json({
      data: {
        ...workspaces,
        documents: workspaces.documents.map((workspace) =>
          adminWorkspaceIds.has(workspace.$id)
            ? workspace
            : { ...workspace, inviteCode: "" },
        ),
      },
    });
  })
  .get(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({
        data: member.role === MemberRole.ADMIN
          ? workspace
          : { ...workspace, inviteCode: "" },
      });
    }
  )
  .get(
    "/:workspaceId/info",
    sessionMiddleware,
    zValidator("query", z.object({ inviteCode: z.string().trim().min(1).optional() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { inviteCode } = c.req.valid("query");

      if (process.env.NODE_ENV !== "production") {
        console.log("[workspaces.info] Invite lookup received", {
          workspaceId,
          inviteCode: maskInviteCode(inviteCode),
          inviteCodeLength: inviteCode?.length ?? 0,
        });
      }

      const { databases } = await createAdminClient();
      let workspace: Workspace | undefined;
      let inviteQueryResult: {
        total: number;
        documents: Workspace[];
      } | undefined;

      if (process.env.NODE_ENV !== "production") {
        console.log("[workspaces.info] Querying workspaces by inviteCode", {
          attribute: "inviteCode",
          inviteCode: maskInviteCode(inviteCode),
          query: {
            attribute: "inviteCode",
            operator: "equal",
            value: maskInviteCode(inviteCode),
          },
        });
      }

      try {
        if (inviteCode) {
          inviteQueryResult = await databases.listDocuments<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            [Query.equal("inviteCode", inviteCode), Query.limit(1)],
          );
          workspace = inviteQueryResult.documents[0];
        }

        if (process.env.NODE_ENV !== "production") {
          console.log("[workspaces.info] Appwrite inviteCode query result", {
            total: inviteQueryResult?.total ?? 0,
            documentIds: inviteQueryResult?.documents.map((document) => document.$id) ?? [],
            inviteCodeAttributePresent: inviteQueryResult?.documents.map(
              (document) => typeof document.inviteCode === "string" && document.inviteCode.length > 0,
            ) ?? [],
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[workspaces.info] Appwrite inviteCode query failed", {
            workspaceId,
            inviteCode: maskInviteCode(inviteCode),
            attribute: "inviteCode",
            message: error instanceof Error ? error.message : String(error),
            code: typeof error === "object" && error !== null && "code" in error
              ? error.code
              : undefined,
          });
        }
      }

      if (!workspace && workspaceId) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[workspaces.info] Falling back to workspace document ID lookup", {
            workspaceId,
            inviteCode: maskInviteCode(inviteCode),
          });
        }

        try {
          const workspaceById = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
          );

          if (process.env.NODE_ENV !== "production") {
            console.log("[workspaces.info] Workspace ID fallback result", {
              requestedWorkspaceId: workspaceId,
              documentId: workspaceById.$id,
              documentFound: true,
              inviteCodeAttributePresent:
                typeof workspaceById.inviteCode === "string" && workspaceById.inviteCode.length > 0,
              storedInviteCode: maskInviteCode(workspaceById.inviteCode),
            });
          }

          if (workspaceById.inviteCode === inviteCode) {
            workspace = workspaceById;
          }
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[workspaces.info] Workspace ID fallback lookup failed", {
              workspaceId,
              inviteCode: maskInviteCode(inviteCode),
              message: error instanceof Error ? error.message : String(error),
              code: typeof error === "object" && error !== null && "code" in error
                ? error.code
                : undefined,
            });
          }
        }
      }

      if (!workspace || workspace.inviteCode !== inviteCode) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[workspaces.info] Invite lookup did not find a matching workspace", {
            workspaceId,
            inviteCode: maskInviteCode(inviteCode),
            listDocumentsTotal: inviteQueryResult?.total ?? 0,
            workspaceDocumentFound: Boolean(workspace),
            inviteCodeAttributePresent:
              typeof workspace?.inviteCode === "string" && workspace.inviteCode.length > 0,
          });
        }
        return c.json({ error: "Invalid invite code" }, 401);
      }

      const storedInviteCode = workspace.inviteCode;
      const inviteCodeMatches = Boolean(inviteCode && storedInviteCode === inviteCode);

      if (process.env.NODE_ENV !== "production") {
        console.log("[workspaces.info] Appwrite workspace document lookup result", {
          workspaceId,
          documentId: workspace.$id,
          documentFound: true,
          inviteCodeAttributePresent: typeof storedInviteCode === "string" && storedInviteCode.length > 0,
          storedInviteCodeLength: typeof storedInviteCode === "string" ? storedInviteCode.length : 0,
          storedInviteCode: maskInviteCode(storedInviteCode),
          receivedInviteCode: maskInviteCode(inviteCode),
          inviteCodeMatches,
        });
      }

      if (!inviteCodeMatches) {
        return c.json({ error: "Invalid invite code" }, 401);
      }

      return c.json({ 
        data: { 
          $id: workspace.$id, 
          name: workspace.name, 
          imageUrl: workspace.imageUrl
        } 
      });
    }
  )
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");
      const { databases: adminDatabases } = await createAdminClient();
      const inviteCode = await generateUniqueWorkspaceInviteCode(adminDatabases);

      let uploadedImageUrl = typeof image === "string" ? image : "";

      if (image instanceof File) {
        const arrayBuffer = await image.arrayBuffer();
        try {
          await storage.createFile(
            IMAGES_BUCKET_ID,
            ID.unique(),
            image,
          );
        } catch (error) {
          console.error("Failed to upload workspace image to Appwrite Storage", error);
          throw new HTTPException(502, { message: "Failed to upload workspace image" });
        }

        uploadedImageUrl = `data:${image.type || "application/octet-stream"};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode,
        },
      );

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.ADMIN,
        },
      );

      return c.json({ data: workspace });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id,
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      } else {
        uploadedImageUrl = image;
      } 

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl
        }
      );

      return c.json({ data: workspace });
    }
  )
  .delete(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // TODO: Delete members, projects, and tasks

      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: { $id: workspaceId } });
    }
  )
  .post(
    "/:workspaceId/reset-invite-code",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { databases: adminDatabases } = await createAdminClient();
      const inviteCode = await generateUniqueWorkspaceInviteCode(adminDatabases);
      const workspace = await adminDatabases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          inviteCode,
        },
      );

      return c.json({ data: workspace });
    }
  )
  .post(
    "/:workspaceId/invite-code",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { databases: adminDatabases } = await createAdminClient();
      const inviteCode = await generateUniqueWorkspaceInviteCode(adminDatabases);
      const workspace = await adminDatabases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        { inviteCode },
      );

      return c.json({ data: workspace });
    }
  )
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string().trim().min(1) })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("databases");
      const user = c.get("user");
      const { databases: adminDatabases } = await createAdminClient();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await adminDatabases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      await adminDatabases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role: MemberRole.MEMBER,
        },
      );

      return c.json({ data: { $id: workspace.$id } });
    }
  )
  .get(
    "/:workspaceId/analytics",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const thisMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const taskCount = thisMonthTasks.total;
      const taskDifference = taskCount - lastMonthTasks.total;

      const thisMonthAssignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assigneeId", member.$id),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthAssignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assigneeId", member.$id),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const assignedTaskCount = thisMonthAssignedTasks.total;
      const assignedTaskDifference =
        assignedTaskCount - lastMonthAssignedTasks.total;

      const thisMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const incompleteTaskCount = thisMonthIncompleteTasks.total;
      const incompleteTaskDifference =
        incompleteTaskCount - lastMonthIncompleteTasks.total;

      const thisMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const completedTaskCount = thisMonthCompletedTasks.total;
      const completedTaskDifference =
        completedTaskCount - lastMonthCompletedTasks.total;

      const thisMonthOverdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
        ]
      );

      const lastMonthOverdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
        ]
      );

      const overdueTaskCount = thisMonthOverdueTasks.total;
      const overdueTaskDifference =
        overdueTaskCount - lastMonthOverdueTasks.total;

      return c.json({
        data: {
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          completedTaskCount,
          completedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          overdueTaskCount,
          overdueTaskDifference,
        },
      });
    }
  )

export default app;
