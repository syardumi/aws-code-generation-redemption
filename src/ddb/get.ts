import AWS, { AWSError } from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()

/**
 *
 * @param Key
 */
export const getItem = (Key: { code_domain: string; code_hash: string }) => {
  return ddb
    .get({
      TableName: process.env.CODE_TABLE_NAME,
      Key
    })
    .promise()
    .catch((e) => {
      console.error('Code Put Error', e)
      throw e
    })
}
