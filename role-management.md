Of course. You are right, the code is the skeleton, but the real power comes from seeing how it all works together.

Let me walk you through a complete, practical example from start to finish.

**Our Goal:** We want to create a system where a user with the role **"Content Editor"** can **view** and **edit** blog posts, but **cannot delete** them.

**Prerequisites:**
*   Your backend application is running.
*   You have an access token for a user with the `admin` role (for setting up permissions). You can get this from Keycloak after logging in as an admin.

Let's use a tool like `curl` or Postman to make these API calls. I'll use `curl` for the examples.

---

### Step 1: Define the Actions (Scopes)

First, we need to tell our system what actions are possible. We'll create scopes for `view`, `edit`, and `delete`.

```bash
# Set your admin auth token
export ADMIN_TOKEN="your-admin-jwt-here"

# Create 'view' action
curl -X POST http://polarix.localhost:8080/api/v1/scopes \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "view",
  "displayName": "View Content"
}'

# Create 'edit' action
curl -X POST http://polarix.localhost:8080/api/v1/scopes \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "edit",
  "displayName": "Edit Content"
}'

# Create 'delete' action
curl -X POST http://polarix.localhost:8080/api/v1/scopes \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "delete",
  "displayName": "Delete Content"
}'
```
**Result:** You now have three reusable actions defined in Keycloak.

---

### Step 2: Create the Module (Resource)

Now, let's create our "Blog" module and specify that it *can* use the actions we just created.

```bash
curl -X POST http://polarix.localhost:8080/api/v1/modules \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "blog-posts",
  "displayName": "Blog Posts",
  "actions": ["view", "edit", "delete"]
}'
```
**Result:** You have a "Blog Posts" resource in Keycloak that is associated with our three actions.

---

### Step 3: Create the Role

Let's create the "Content Editor" role that we want to assign permissions to.

```bash
curl -X POST http://polarix.localhost:8080/api/v1/roles \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Content-Editor",
  "description": "Can view and edit blog posts."
}'
```
**Result:** A new realm role named "Content-Editor" now exists in Keycloak.

---

### Step 4: Assign Permissions to the Role (The Magic)

This is the most important step. We will now grant the **"Content-Editor"** role the specific permissions to **`view`** and **`edit`** the **`blog-posts`** module. Notice we are intentionally leaving out `delete`.

```bash
curl -X POST http://polarix.localhost:8080/api/v1/roles/Content-Editor/permissions \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "moduleName": "blog-posts",
  "actions": ["view", "edit"]
}'
```
**Result:** Your `RoleService` has now automatically created the necessary Policy and Permission objects in Keycloak. The rule "A user with role 'Content-Editor' can 'view' and 'edit' 'blog-posts'" is now active.

---

### Step 5: Enforce and Test It

Now that the rules are configured, let's see how you enforce them in your application.

**1. Assign the Role:** In the Keycloak Admin UI, find a regular user and assign them the **"Content-Editor"** role.

**2. Protect Your API:** Imagine you have a `BlogController`. You would protect its endpoints like this:

```java
@RestController
@RequestMapping("/api/v1/blogs")
public class BlogController {

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_blog-posts:view')")
    public ResponseEntity<String> getAllBlogs() {
        return ResponseEntity.ok("Here are all the blogs.");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_blog-posts:edit')")
    public ResponseEntity<String> updateBlog(@PathVariable String id) {
        return ResponseEntity.ok("Blog " + id + " has been updated.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_blog-posts:delete')")
    public ResponseEntity<Void> deleteBlog(@PathVariable String id) {
        // Deletion logic here
        return ResponseEntity.noContent().build();
    }
}
```
**Important Note:** For this to work, you must update your `SecurityConfig` to extract scopes, not just roles.

```java:backend/src/main/java/com/polarix/backend/configurations/SecurityConfig.java
// ... existing code ...
import java.util.stream.Stream;

// ... existing code ...
    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        // Extract Roles
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        List<String> roles = (realmAccess != null && realmAccess.get("roles") != null) ? (List<String>) realmAccess.get("roles") : List.of();
        Stream<GrantedAuthority> roleAuthorities = roles.stream()
                .map(role -> "ROLE_" + role)
                .map(SimpleGrantedAuthority::new);

        // Extract Scopes from 'authorization' claim
        Map<String, Object> authorization = jwt.getClaim("authorization");
        List<Map<String, List<String>>> permissions = (authorization != null && authorization.get("permissions") != null) ? (List<Map<String, List<String>>>) authorization.get("permissions") : List.of();
        Stream<GrantedAuthority> scopeAuthorities = permissions.stream()
            .flatMap(p -> p.getOrDefault("scopes", List.of()).stream())
            .map(scope -> "SCOPE_" + scope)
            .map(SimpleGrantedAuthority::new);
            
        return Stream.concat(roleAuthorities, scopeAuthorities).collect(Collectors.toList());
    }
// ... existing code ...
```

**3. Test with the User:**
Now, log in as your regular user who has the "Content-Editor" role. Get their access token and try to call the endpoints:

*   `GET /api/v1/blogs` -> **Success (200 OK)**. The user's token has the `blog-posts:view` scope.
*   `PUT /api/v1/blogs/123` -> **Success (200 OK)**. The user's token has the `blog-posts:edit` scope.
*   `DELETE /api/v1/blogs/123` -> **Failure (403 Forbidden)**. The user's token *does not* have the `blog-posts:delete` scope, so the `@PreAuthorize` check fails.

This entire flow shows how you can manage complex permissions through your simple API facade, while Keycloak and Spring Security handle the heavy lifting of enforcement.