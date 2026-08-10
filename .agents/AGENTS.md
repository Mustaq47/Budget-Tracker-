### Admin Panel Data Strictness
When building or modifying the admin panel (or similar internal tools):
1. **Never use dummy/demo data**: Do not hardcode JSON arrays, placeholder usernames, or mock revenue numbers in the frontend components or services.
2. **Direct DB Connection**: Immediately wire up services to fetch from the real database collections (e.g., Firestore `users`, `revenue`, `support_queries`).
3. **Empty States**: If a collection is not yet seeded, return structural zeros or empty arrays (`0`, `[]`) rather than fake data, and ensure the UI handles these empty states gracefully (e.g., showing a "No Data Yet" banner).
