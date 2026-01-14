# Web Portal Deployment

Steps to push a new build to the demo site.

Prereqs: Node.js 22.x, Yarn, AWS CLI configured for the account.

1) Install dependencies (once): `yarn install`
2) Build for production: `yarn build` (output goes to `dist/`)
3) Upload the build to S3: `aws s3 sync dist/ s3://dementiaxchange-demo-website/ --delete`
4) Invalidate CloudFront cache so changes show: `aws cloudfront create-invalidation --distribution-id <CLOUDFRONT_DIST_ID> --paths "/*"`

Notes:
- AWS CLI must be configured with credentials that can write to the S3 bucket and the CloudFront distribution.
- Replace `<CLOUDFRONT_DIST_ID>` with the distribution ID for the demo site.
- If you need a dry run first, add `--dryrun` to the `s3 sync` command.
