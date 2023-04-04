import { Handler } from 'aws-lambda'
import createError from 'http-errors'
import { Code } from '../types/Code'
import { getItem, putItem, deleteItem, ddb } from '../ddb/index'

export { ddb }

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = JSON.parse(event.body)

  try {
    let item = (await getItem({ code_domain, code_hash }))?.Item as Code
    if (!item) {
      throw createError(404, 'Record Not Found')
    }

    let response, wasDeleted
    if (item?.use_count - 1 > 0) {
      item.use_count -= 1
      response = await putItem(item, true)
    } else {
      response = await deleteItem({ code_domain, code_hash })
      item = response?.Attributes
      delete item.use_count
      wasDeleted = true
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ item, wasDeleted })
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body: e.message
    }
  }
}
