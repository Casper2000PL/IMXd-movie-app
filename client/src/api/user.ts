import { User } from "../../../server/lib/auth";
import { client } from "../../../server/src/client";

export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await client.api.user[":id"].$get({
      param: { id }, // Pass as param object, not query
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
