import { Context } from 'aws-lambda'
import { Code } from '../../src/types/Code'
import { handler, ddb } from '../../src/api/postRedeemCode'

jest.setTimeout(30e3)

const putItem = ddb.put
const getItem = ddb.get
const deleteItem = ddb.delete

let testItem: Code

describe(`POST Redeem Code`, () => {
  beforeEach(() => {
    testItem = {
      code_domain: 'ABC',
      code_hash: 'testcode',
      expire_timestamp: 32480292139
    }
    ddb.put = jest.fn().mockImplementation((params) => {
      return {
        promise: () => Promise.resolve(true)
      }
    })
    ddb.get = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.resolve({
            Item: testItem
          })
      }
    })
    ddb.delete = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.resolve({
            Attributes: { ...testItem }
          })
      }
    })
  })

  afterAll(() => {
    Object.assign(ddb, { put: putItem, get: getItem, delete: deleteItem })
  })

  it('redeems a one-time code: success', async () => {
    const response = await handler(
      { body: JSON.stringify({ code_domain: 'ABC', code_hash: 'testcode' }) },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST' // Allow only GET request
      },
      body: '{"item":{"code_domain":"ABC","code_hash":"testcode","expire_timestamp":32480292139},"wasDeleted":true}'
    })
  })

  it('redeems a multi-use code: success', async () => {
    testItem = {
      code_domain: 'ABC',
      code_hash: 'testcode',
      expire_timestamp: 32480292139,
      use_count: 5
    }

    const response = await handler(
      {
        body: JSON.stringify({
          code_domain: 'ABC',
          code_hash: 'testcode'
        })
      },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST' // Allow only GET request
      },
      body: '{"item":{"code_domain":"ABC","code_hash":"testcode","expire_timestamp":32480292139,"use_count":4}}'
    })
  })

  it('redeems a multi-use code: ddb put fail', async () => {
    testItem = {
      code_domain: 'ABC',
      code_hash: 'testcode',
      expire_timestamp: 32480292139,
      use_count: 5
    }

    ddb.put = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.reject({
            statusCode: 500,
            message: 'Internal server error'
          })
      }
    })

    const response = await handler(
      { body: JSON.stringify({ code_domain: 'ABC', code_hash: 'testcode' }) },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST' // Allow only GET request
      },
      body: 'Internal server error'
    })
  })

  it('redeems a one-time code: ddb delete fail', async () => {
    ddb.delete = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.reject({
            statusCode: 500,
            message: 'Internal server error'
          })
      }
    })

    const response = await handler(
      { body: JSON.stringify({ code_domain: 'ABC', code_hash: 'testcode' }) },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST' // Allow only GET request
      },
      body: 'Internal server error'
    })
  })
})
