import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'
import httpErrors from 'http-errors'
import { getItem, putItem, deleteItem } from '../ddb/index'

export const ddb = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = JSON.parse(event.body)

  try {
    const item = (await getItem({ code_domain, code_hash }))?.Item
    if (!item) {
      throw httpErrors(404, 'Record Not Found')
    }

    let response, attributes, wasDeleted
    if (item?.use_count - 1 > 0) {
      attributes = {
        code_domain,
        code_hash,
        expire_timestamp: item.expire_timestamp,
        use_count: item.use_count - 1
      }
      response = await putItem(attributes, true)
    } else {
      response = await deleteItem({ code_domain, code_hash })
      attributes = response?.Attributes
      delete attributes.use_count
      wasDeleted = true
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ attributes, wasDeleted })
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body: e.message
    }
  }
}
