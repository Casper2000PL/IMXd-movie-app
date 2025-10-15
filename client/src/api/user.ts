import { toast } from "sonner";
import { client } from "server/src/client";
import z from "zod";

export const getUserById = async (id: string) => {
  try {
    const response = await client.api.user[":id"].$get({
      param: { id },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const updateUserSchema = z.object({
  name: z.string().min(2).max(20),
});

export const updateUser = async (
  id: string,
  formData: z.infer<typeof updateUserSchema>,
) => {
  try {
    const response = await client.api.user[":id"].$put({
      param: { id },
      form: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response: ", errorData);
      toast.error(
        "Failed to update user: " + (errorData.error || response.statusText),
      );
      throw new Error(errorData.error || "Failed to update user");
    } else {
      const updatedUser = await response.json();
      console.log("Success response: ", updatedUser);
      toast.success("User updated successfully with name: " + formData.name);
      return updatedUser; // Return the updated user data
    }
  } catch (error) {
    console.error("Error updating user:", error);
    toast.error(
      "Failed to update user: " +
        (error instanceof Error ? error.message : String(error)),
    );
    throw error;
  }
};

export const deleteUserImage = async (id: string) => {
  try {
    const responseAWS = await client.api.user["profile-image"][
      ":userId"
    ].$delete({
      param: { userId: id },
    });

    if (!responseAWS.ok) {
      const errorData = await responseAWS.json();
      console.error("Error response from AWS: ", errorData);
      toast.error(
        "Failed to delete user image from AWS: " +
          (errorData || responseAWS.statusText),
      );
      throw new Error("Failed to delete user image from AWS");
    }

    console.log("AWS image deletion successful");

    const response = await client.api.user[":id"].$put({
      param: { id },
      form: { image: "" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response: ", errorData);
      toast.error(
        "Failed to update user record: " +
          (errorData.error || response.statusText),
      );
      throw new Error(errorData.error || "Failed to update user record");
    }

    const updatedUser = await response.json();
    console.log("Success response: ", updatedUser);
    toast.success("User image deleted successfully");
    return updatedUser;
  } catch (error) {
    console.error("Error deleting user image:", error);
    toast.error(
      "Failed to delete user image: " +
        (error instanceof Error ? error.message : String(error)),
    );
    throw error;
  }
};
