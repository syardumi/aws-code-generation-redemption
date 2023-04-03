import { Handler } from 'aws-lambda'
import createError from 'http-errors'
import { getItem } from '../ddb/index'

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = event.pathParameters

  try {
    const item = (await getItem({ code_domain, code_hash }))?.Item
    if (!item) {
      throw createError(404, 'Record Not Found')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ item })
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body: e.message
    }
  }
}
