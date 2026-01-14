#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env ]]; then
  # Load optional env vars for deployment.
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${S3_BUCKET:?Set S3_BUCKET (bucket name) in env or export it}"
: "${AWS_REGION:?Set AWS_REGION (e.g. us-west-2) in env or export it}"

CLOUDFRONT_DISTRIBUTION_ID=${CLOUDFRONT_DISTRIBUTION_ID:-""}

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required." >&2
  exit 1
fi

if ! command -v yarn >/dev/null 2>&1; then
  echo "yarn is required." >&2
  exit 1
fi

echo "Building app..."
yarn build

echo "Uploading to s3://$S3_BUCKET in $AWS_REGION..."
aws s3 sync dist "s3://$S3_BUCKET" --region "$AWS_REGION" --delete

if [[ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]]; then
  echo "Creating CloudFront invalidation for $CLOUDFRONT_DISTRIBUTION_ID..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" >/dev/null
  echo "Invalidation submitted."
else
  echo "Skipping CloudFront invalidation (set CLOUDFRONT_DISTRIBUTION_ID to enable)."
fi

echo "Done."
