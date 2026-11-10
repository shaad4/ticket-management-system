function csrfToken() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("csrftoken="));

  return cookie ? decodeURIComponent(cookie.slice("csrftoken=".length)) : "";
}

function errorMessage(data) {
  if (typeof data.detail === "string") {
    return data.detail;
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const label =
        field === "non_field_errors" ? "" : `${field.replaceAll("_", " ")}: `;
      return (
        label +
        (Array.isArray(messages) ? messages.join(" ") : String(messages))
      );
    })
    .join("\n");
}

async function request(path, { method = "GET", body, signal } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (method !== "GET") {
    // Login rotates the token, so read the current cookie for every mutation.
    if (!csrfToken()) {
      await request("/auth/csrf/");
    }

    headers["X-CSRFToken"] = csrfToken();
  }

  let response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: "same-origin",
      mode: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Unable to reach the server. Check your connection and try again.",
    );
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data
      ? errorMessage(data)
      : "The server could not complete this request. Please try again.";
    const error = new Error(
      message || "Something went wrong. Please try again.",
    );

    error.status = response.status;
    error.sessionExpired =
      response.status === 401 ||
      data?.detail === "Authentication credentials were not provided.";

    throw error;
  }

  if (data === null) {
    throw new Error("The server returned an unexpected response.");
  }

  return data;
}

export const api = {
  currentUser: (signal) => request("/auth/me/", { signal }),
  login: (body) => request("/auth/login/", { method: "POST", body }),
  register: (body) => request("/auth/register/", { method: "POST", body }),
  logout: () => request("/auth/logout/", { method: "POST" }),
  users: (signal) => request("/auth/users/", { signal }),
  tickets: (signal) => request("/tickets/", { signal }),
  ticket: (id) => request(`/tickets/${id}/`),
  createTicket: (body) => request("/tickets/", { method: "POST", body }),
  updateTicket: (id, body) =>
    request(`/tickets/${id}/`, { method: "PATCH", body }),
  deleteTicket: (id) => request(`/tickets/${id}/`, { method: "DELETE" }),
};
