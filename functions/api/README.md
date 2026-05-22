# Cloudflare Functions

These endpoints implement the private low-friction admin publishing runtime.
They read owner-provided values from Cloudflare environment variables listed in `ENV_REGISTRY.md` and use the GitHub Contents API to create, unpublish, republish, delete, and feature content.
