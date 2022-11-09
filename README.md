# Code Redemption API (built using AWS)

This API library uses AWS services to create a 'code redemption' system which can
handle multiple domains (e.g. divisions) and expiration of codes. Codes are
unique only to their own domains. The system scales automatically using AWS
services API Gateway, Cloudfront, Lambda, and DynamoDB.

---

## Requirements

- Node 16.x
- Yarn

---

## Install & Deploy

- `yarn`
- `npx serverless deploy [--stage dev|prod] [--aws-profile 'name']`

---

## HTTP Actions

`POST /create`

Create a record stored in DynamoDB. The Key is the combination of `code_domain` and `code_hash`.

_Body (JSON):_

- `code_domain` (string): division in which this code can be used
- `code_hash` (string): unique id for this code
- `expire_timestamp` (number): the unix timestamp for when this code expires
- \+ any other metadata you wish to store

_Response:_

- 200: Success
- 400: Record Already Exists

`POST /redeem`

Redeem a code stored in DynamoDB (essentially delete it).

_Body (JSON):_

- `code_domain` (string): division in which this code can be used
- `code_hash` (string): unique id for this code

_Response:_

- 200: Success
  - Body: All Code Attributes
- 404: Record Does Not Exist

---

## Background Actions

### Expire

Runs at a fixed interval to remove any codes that are now since expired.
