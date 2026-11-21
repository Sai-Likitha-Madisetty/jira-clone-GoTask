import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["invite-code"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["invite-code"]["$post"]>;

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api.workspaces[":workspaceId"]["invite-code"]["$post"]({ param });

      if (!response.ok) {
        throw new Error("Failed to reset workspace invite link");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Invite link reset");

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["workspace-info", data.$id] });
    },
    onError: () => {
      toast.error("Failed to reset invite link");
    }
  });

  return mutation;
};
