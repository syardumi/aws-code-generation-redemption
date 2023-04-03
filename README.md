# Code Redemption API (built using AWS)

This API library uses AWS services to create a 'code redemption' system which can
handle multiple domains (e.g. divisions) and expiration of codes. Codes are
unique only to their own domains. The system scales automatically using AWS
services API Gateway, Cloudfront, Lambda, and DynamoDB.

---

## Requirements

- Node 16+
- Yarn

---

## Install & Deploy

- `yarn`
- `npx serverless deploy [--stage dev|prod] [--aws-profile 'name']`

---

## HTTP Actions

`POST /generate`

Create a record stored in DynamoDB. The Key is the combination of `code_domain` and `code_hash`. Optionally, generate a `code_hash` based on the last 12 characters of UUID v4.

_Body (JSON):_

- \*`code_domain` (string): division in which this code can be used
- `code_hash` (string): unique id for this code - if none is given, one is generated
- \*`expire_timestamp` (number): the unix timestamp for when this code expires
- `use_count` (number): the amount of times this code can be redeemed
- \+ any other metadata you wish to store

_Response:_

- 200: Success
  - Body: all Code metadata
- 400: Record Already Exists

`GET /validate`

_Body (JSON):_

- \*`code_domain` (string): division in which this code can be used
- \*`code_hash` (string): unique id for this code

_Response:_

- 200: Success
  - Body: all Code metadata
- 404: Record Does Not Exist

`POST /redeem`

Redeem a code stored in DynamoDB and optionally reduce `use_count` by 1. If `use_count` goes to 0, then delete the code record.

_Body (JSON):_

- \*`code_domain` (string): division in which this code can be used
- \*`code_hash` (string): unique id for this code

_Response:_

- 200: Success
  - Body: all Code metadata, `wasDeleted` boolean
- 404: Record Does Not Exist

---

## Background Actions

### Expire

Runs at a fixed interval to remove any codes that are now since expired.
