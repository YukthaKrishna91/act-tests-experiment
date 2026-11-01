#!/bin/bash
set -e
SCRIPT_PATH=${0%/*}
PIPELINE_ACCOUNT=979446310614 # tvr-pipeline-prod

current_account="$(aws sts get-caller-identity --query Account --output text)"

if [[ "${current_account}" -eq "${PIPELINE_ACCOUNT}" ]]
then
  echo "Logged into pipeline account, deploying stacks..."

  aws cloudformation deploy \
    --region eu-west-1 \
    --capabilities CAPABILITY_IAM \
    --template-file "${SCRIPT_PATH}"/pipeline-pr.yaml \
    --stack-name act-tests-codepipeline-pr \
    --parameter-overrides \
      GitHubRepositoryName=act-tests \
    --tags \
      BBCProject=connected-tv \
      BBCComponent=act-tests \
      BBCEnvironment=build-infrastructure
else
  echo "Please log into correct account ${PIPELINE_ACCOUNT} by running:"
  echo "gobbc aws-credentials -account ${PIPELINE_ACCOUNT} -mfa"
fi
