import AWS from 'aws-sdk'
import { Code } from 'src/types/Code'

const ddb = new AWS.DynamoDB.DocumentClient()

/**
 *
 * @param Item
 */
export const put = async (Item: Code): Promise<void> => {
  await ddb
    .put({
      TableName: process.env.DOMAIN_TABLE_NAME,
      Item: { code_domain: Item.code_domain }
    })
    .promise()
    .catch((e) => {
      console.error('Domain Put Error', e)
      throw e
    })

  await ddb
    .put({
      TableName: process.env.CODE_TABLE_NAME,
      Item,
      ConditionExpression:
        'attribute_not_exists(code_domain) and attribute_not_exists(code_hash)'
    })
    .promise()
    .catch((e) => {
      console.error('Code Put Error', e)
      throw e
    })
}
