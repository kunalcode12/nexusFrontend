const API_URL = "https://nexusbackend-ff1v.onrender.com/api/v1";

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    console.log(error);
    throw new Error(error.message || "Something went wrong");
  }
  return response.json();
};

export const mediaService = {
  // Get user's media with pagination and filters
  getUserMedia: async (
    userId,
    page = 1,
    limit = 12,
    type,
    sortBy = "createdAt",
    order = "desc"
  ) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(type && { type }),
      sortBy,
      order,
    });

    const response = await fetch(`${API_URL}/media/user/${userId}?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Get media feed
  getFeed: async (page = 1, limit = 20, lastId = null, type = null) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...(lastId && { lastId }),
      ...(type && { type }),
    });

    const response = await fetch(`${API_URL}/media/feed?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Search media
  searchMedia: async (
    query,
    type,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "desc"
  ) => {
    const params = new URLSearchParams({
      query,
      page,
      limit,
      sortBy,
      order,
      ...(type && { type }),
    });

    const response = await fetch(`${API_URL}/media/search?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Initialize upload
  initializeUpload: async (mediaData) => {
    const response = await fetch(`${API_URL}/media/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mediaData),
    });

    const d = await response.json();
    console.log(d);
    // return handleResponse(response);
    return d;
  },

  // Upload chunk
  uploadChunk: async (chunk, chunkIndex, uploadId, totalChunks, typeFile) => {
    const formData = new FormData();

    // Ensure chunk is added correctly
    formData.append("chunk", chunk, `chunk-${chunkIndex}`);
    formData.append("uploadId", uploadId);
    formData.append("totalChunks", totalChunks);
    formData.append("chunkIndex", chunkIndex);
    formData.append("typeFile", typeFile);

    const response = await fetch(`${API_URL}/media/chunk`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        // Do NOT set Content-Type, let browser set it for FormData
      },
      body: formData,
    });

    return handleResponse(response);
  },

  // Get upload status
  getUploadStatus: async (uploadId) => {
    const response = await fetch(`${API_URL}/media/status/${uploadId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return handleResponse(response);
  },

  // Update media
  updateMedia: async (
    mediaId,
    file,
    typeFile,
    contentId,
    isProfile = false
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("typeFile", typeFile);

      // Only append contentId if it's not a profile picture update
      if (!isProfile && contentId) {
        formData.append("contentId", contentId);
      }

      // Choose the appropriate endpoint
      const endpoint = isProfile
        ? `${API_URL}/users/profilePicture`
        : `${API_URL}/media/${mediaId}`;

      const method = isProfile ? "PATCH" : "PUT";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Media update failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Media update error:", error);
      throw error;
    }
  },

  // Create profile picture
  createProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(`${API_URL}/users/profilePicture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Profile picture creation failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Profile picture creation error:", error);
      throw error;
    }
  },

  // Delete media (works for both regular media and profile pictures)
  deleteMedia: async (mediaId, isProfile = false) => {
    try {
      const endpoint = isProfile
        ? `${API_URL}/users/profilePicture`
        : `${API_URL}/media/${mediaId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Delete media error:", error);
      throw error;
    }
  },
};

export default mediaService;
