type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea" | "json";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type Operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

/**
 * This list of operations is used to generate the manual testing UI.
 */
const operations: Operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Get Users",
    endpoint: "/api/users",
    method: "GET",
    fields: {},
  },
  {
    name: "Get User by Username",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input", role: "input" },
  },
  {
    name: "Update Username",
    endpoint: "/api/users/username",
    method: "PATCH",
    fields: { username: "input" },
  },
  {
    name: "Update Password",
    endpoint: "/api/users/password",
    method: "PATCH",
    fields: { currentPassword: "input", newPassword: "input" },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Get Content Creators",
    endpoint: "/api/contentcreators",
    method: "GET",
    fields: {},
  },
  {
    name: "Get Regular Users",
    endpoint: "/api/regularusers",
    method: "GET",
    fields: {},
  },
  {
    name: "Get Posts (empty for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { content: "input", category: "input", options: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", content: "input", options: "input" },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  {
    name: "Get Friends",
    endpoint: "/api/friends",
    method: "GET",
    fields: {},
  },
  {
    name: "Remove Friend",
    endpoint: "/api/friends/:friend",
    method: "DELETE",
    fields: { friend: "input" },
  },
  {
    name: "Follow Content Creator",
    endpoint: "/api/follow",
    method: "POST",
    fields: { user1: "input", user2: "input" },
  },
  {
    name: "Unfollow Content Creator",
    endpoint: "/api/unfollow",
    method: "POST",
    fields: { user: "input", friend: "input" },
  },
  {
    name: "Get Friend Requests",
    endpoint: "/api/friend/requests",
    method: "GET",
    fields: {},
  },
  {
    name: "Send Friend Request",
    endpoint: "/api/friend/requests/:to",
    method: "POST",
    fields: { to: "input" },
  },
  {
    name: "Remove Friend Request",
    endpoint: "/api/friend/requests/:to",
    method: "DELETE",
    fields: { to: "input" },
  },
  {
    name: "Accept Friend Request",
    endpoint: "/api/friend/accept/:from",
    method: "PUT",
    fields: { from: "input" },
  },
  {
    name: "Reject Friend Request",
    endpoint: "/api/friend/reject/:from",
    method: "PUT",
    fields: { from: "input" },
  },
  {
    name: "Make Default Collections",
    endpoint: "/api/collections",
    method: "POST",
    fields: {},
  },
  {
    name: "Increment Post Rating",
    endpoint: "/api/posts/:id/increment-rating",
    method: "PATCH",
    fields: { id: "input" },
  },
  {
    name: "Decrement Post Rating",
    endpoint: "/api/posts/:id/decrement-rating",
    method: "PATCH",
    fields: { id: "input" },
  },
  {
    name: "Get Author Posts",
    endpoint: "/api/posts/:author",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Get Posts in Category",
    endpoint: "/api/posts/:category",
    method: "PATCH",
    fields: { category: "input" },
  },
  {
    name: "Get Followers",
    endpoint: "/api/followers",
    method: "GET",
    fields: {},
  },
  {
    name: "Get Followings",
    endpoint: "/api/followings",
    method: "GET",
    fields: {},
  },
  {
    name: "Create Tracker",
    endpoint: "/api/trackers/create",
    method: "POST",
    fields: { title: "input" },
  },
  {
    name: "Create Collection",
    endpoint: "/api/collections/create",
    method: "POST",
    fields: { parent: "input", title: "input", deadline: "input" },
  },
  {
    name: "Get All Trackers",
    endpoint: "/api/trackers",
    method: "GET",
    fields: {},
  },
  {
    name: "Get All Collections",
    endpoint: "/api/collections",
    method: "GET",
    fields: {},
  },
  {
    name: "Get Shared Trackers",
    endpoint: "/api/trackers/:title",
    method: "GET",
    fields: { title: "input" },
  },
  {
    name: "Get Shared Collections",
    endpoint: "/api/collections/:title",
    method: "GET",
    fields: { title: "input" },
  },
  {
    name: "Share Tracker",
    endpoint: "/api/trackers/share",
    method: "POST",
    fields: { to: "input", title: "input" },
  },
  {
    name: "Share Collection",
    endpoint: "/api/collections/share",
    method: "POST",
    fields: { to: "input", title: "input" },
  },
  {
    name: "Unshare Tracker",
    endpoint: "/api/trackers/unshare",
    method: "POST",
    fields: { from: "input", title: "input" },
  },
  {
    name: "Unshare Collection",
    endpoint: "/api/collections/unshare",
    method: "POST",
    fields: { from: "input", title: "input" },
  },
  {
    name: "Delete Tracker",
    endpoint: "/api/trackers",
    method: "DELETE",
    fields: { title: "input" },
  },
  {
    name: "Delete Collection",
    endpoint: "/api/collections",
    method: "DELETE",
    fields: { title: "input" },
  },
  {
    name: "Check Tracker",
    endpoint: "/api/trackers/:title/check",
    method: "PATCH",
    fields: { title: "input", day: "input" },
  },
  {
    name: "Uncheck Tracker",
    endpoint: "/api/trackers/:title/uncheck",
    method: "PATCH",
    fields: { title: "input", day: "input" },
  },
  {
    name: "Get Posts in Collection",
    endpoint: "/api/collections/:id",
    method: "GET",
    fields: { id: "input" },
  },
  {
    name: "Add to Collection",
    endpoint: "/api/collections/add",
    method: "PATCH",
    fields: { collectionTitle: "input", post: "input" },
  },
  {
    name: "Remove from Collection",
    endpoint: "/api/collections/remove",
    method: "PATCH",
    fields: { collectionTitle: "input", post: "input" },
  },
  {
    name: "Update Collection Deadline",
    endpoint: "/api/collections",
    method: "PATCH",
    fields: { collectionTitle: "input", deadline: "input" },
  },
  {
    name: "Calculate Exp",
    endpoint: "/api/exp",
    method: "POST",
    fields: {},
  },
  {
    name: "Get User Level",
    endpoint: "/api/level",
    method: "GET",
    fields: { user: "input" },
  },
  {
    name: "Get User Exp",
    endpoint: "/api/exp",
    method: "GET",
    fields: { user: "input" },
  },
  {
    name: "Recommend Content",
    endpoint: "/api/explore",
    method: "POST",
    fields: {},
  },
  {
    name: "Get Summary",
    endpoint: "/api/summary",
    method: "GET",
    fields: { user: "input" },
  },
];

/*
 * You should not need to edit below.
 * Please ask if you have questions about what this test code is doing!
 */

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      const htmlTag = tag === "json" ? "textarea" : tag;
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${htmlTag} name="${prefix}${name}"></${htmlTag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const op = operations.find((op) => op.endpoint === $endpoint && op.method === $method);
  const pairs = Object.entries(reqData);
  for (const [key, val] of pairs) {
    if (val === "") {
      delete reqData[key];
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = key.split(".").reduce((obj, key) => obj[key], op?.fields as any);
    if (type === "json") {
      reqData[key] = JSON.parse(val as string);
    }
  }

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
