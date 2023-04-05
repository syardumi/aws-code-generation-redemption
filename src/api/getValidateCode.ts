import { Handler } from 'aws-lambda'
import { getItem, ddb } from '../ddb/index'
import { Code } from '../types/Code'

export { ddb }

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = event.pathParameters

  try {
    const item = (await getItem({ code_domain, code_hash }))?.Item as Code
    if (!item) {
      throw new Error('Not Found')
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'GET' // Allow only GET request
      },
      body: JSON.stringify({ item })
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'GET' // Allow only GET request
      },
      body: 'Record Not Found'
    }
  }
}
