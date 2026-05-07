# Security Specifications for Fiqh Arena

## Data Invariants
1. **User Identity**: A user's profile (`/users/{uid}`) can only be modified by that specific user.
2. **Challenge Integrity**: Once a challenge is created, its `creatorId` and `createdAt` are immutable.
3. **Participation**: A user can only update their own score in the `participants` subcollection of a challenge.
4. **Relational Sync**: A participant record must have a matching global user profile.
5. **Terminal State**: A challenge marked as `finished` cannot be reverted to `open` or `active`.

## The Dirty Dozen (Malicious Payloads)
1. **Identity Spoofing**: Attempt to update `users/other_user_id` with my own data.
2. **XP Inflation**: Attempt to set my `xp` to `999999` in one write.
3. **Ghost Participation**: Create a participant record in a challenge I haven't joined.
4. **State Jumping**: Skip the `open` state and create a challenge as `finished`.
5. **Score Hijacking**: Update another participant's score in a shared challenge.
6. **Immutable Mutation**: Try to change the `creatorId` of an existing challenge.
7. **Phantom Section**: Create a challenge for a `sectionId` that doesn't exist in our logic.
8. **Resource Exhaustion**: Send a `displayName` string of 1MB in the user profile.
9. **Role Escalation**: Attempt to add an `isAdmin: true` field to my profile.
10. **Time Travel**: Set a `createdAt` timestamp to 10 years in the future.
11. **Orphaned Writes**: Create a participant record for a challenge that does not exist.
12. **Shadow Field**: Add a `private_key` field to a public challenge document.
