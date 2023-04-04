import { Handler } from 'aws-lambda'
import { getItem, ddb } from '../ddb/index'

export { ddb }

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = event.pathParameters

  try {
    const item = (await getItem({ code_domain, code_hash }))?.Item
    if (!item) {
      throw new Error('Not Found')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ item })
    }
  } catch (e) {
    return {
      statusCode: 404,
      body: 'Record Not Found'
    }
  }
}
