import { useQuery } from "@tanstack/react-query";
import { client } from "server/src/client";
import { toast } from "sonner";

export interface CreatePersonForm {
  name: string;
  biography: string;
  birthDate: string;
  profileImageUrl: string;
}

export const createPerson = async (formData: CreatePersonForm) => {
  try {
    console.log("API call - Form data being sent:", formData);
    const response = await client.api.people.$post({
      form: {
        name: formData.name,
        biography: formData.biography,
        birthDate: formData.birthDate,
        profileImageUrl: formData.profileImageUrl,
      },
    });

    if (response.ok) {
      const createdPerson = await response.json();
      console.log("Person created successfully:", createdPerson);
      toast.success("Person created successfully!");
      return createdPerson;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to create person.");
      //throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

export const getPeople = async () => {
  try {
    const response = await client.api.people.$get();
    if (response.ok) {
      const people = await response.json();
      return people;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to fetch people.");
    }
  } catch (error) {
    console.error("Error fetching people:", error);
    throw error;
  }
};

export const getPersonById = async (personId: string) => {
  try {
    const response = await client.api.people[":id"].$get({
      param: { id: personId },
    });
    if (response.ok) {
      const person = await response.json();
      return person;
    } else {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      toast.error("Failed to fetch person.");
    }
  } catch (error) {
    console.error("Error fetching person:", error);
    throw error;
  }
};

export const useGetPersonById = (personId: string) => {
  return useQuery({
    queryKey: ["people", personId],
    queryFn: () => getPersonById(personId),
  });
};

export const useGetAllPeople = () => {
  return useQuery({
    queryKey: ["people"],
    queryFn: getPeople,
  });
};
