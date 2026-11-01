# Schedule

Every scheduled GitHub Actions job in this repo. Times are Central (America/Chicago): each
`schedule:` entry carries `timezone: America/Chicago`, which GitHub Actions honours, so the clock
change in March and November no longer moves a job. Rebalanced 1 Nov 2026 (owner-approved weekly
schedule); see the notes below for what moved.

| Job | Workflow | When | Cron |
|---|---|---|---|
| e2e | `e2e.yml` | every day 02:17 CT | `17 2 * * *` |

## Notes

- Monday 04:00–08:00 CT is kept clear: this repo's Monday jobs moved to quiet early-morning
  slots Tuesday–Saturday on 1 Nov 2026.

## Notes
- The nightly e2e keeps 02:17 Central, now pinned all year.
