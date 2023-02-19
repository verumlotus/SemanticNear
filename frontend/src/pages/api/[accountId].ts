// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Contract, connect } from "near-api-js";
import axios from 'axios'

type ReturnData = {
  posts: string[]
  error?: string
}

type RequestParam = {
  accountId: string
}

const NODE_URL = "https://archival-rpc.mainnet.near.org";
const NEAR_API = "https://api.near.social/get"
const PAGODA_KEY = process.env.PAGODA_KEY
// const PAGODA_API = "https://near-mainnet.api.pagoda.co/eapi/v1"
const CALLING_ACCOUNT_ID = "social.near";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReturnData>
) {
  const accountId = req.query.accountId as string;
  const url = `https://near-mainnet.api.pagoda.co/eapi/v1/accounts/${accountId}/balances/NEAR/history`
  // Fetch the transaction history for the account in question
  const pagodaAxiosResponse = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": PAGODA_KEY
    }
  })
  if (pagodaAxiosResponse.status != 200) {
    return res.status(pagodaAxiosResponse.status).send({error: pagodaAxiosResponse.statusText, posts: []})
  }
  // Else, now that we have the transaction history we iterate through all the blocks, and check the post data 
  // at those blocks
  const blockheights = new Set<string>();
  for (const obj of pagodaAxiosResponse.data['history']) {
    // @ts-ignore
    blockheights.add(obj['block_height'])
  }

  // Ok, now with all the block heights let's grab the posts data
  const posts = new Set<string>();


  const near = await connect({
    networkId: "mainnet",
    nodeUrl: NODE_URL,
  });

  for (const blockHeight of Array.from(blockheights.values())) {
    const nearApiResponse = await near.connection.provider.query({
      request_type: "call_function",
      blockId: parseInt(blockHeight),
      account_id: "social.near",
      method_name: "get",
      args_base64: Buffer.from(`{"keys": ["${accountId}/post/main"]}`).toString('base64'),
    })
    // Convert Byte array of ASCII code into strings
    // @ts-ignore
    const post = String.fromCharCode.apply(null, nearApiResponse['result']);
    posts.add(post)

    // const nearApiAxiosResponse = await axios.post(NEAR_API, {}, {
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   params: {
    //     "keys": [`${accountId}/post/main`],
    //     "blockHeight": parseInt(blockHeight)
    //   }
    // });
    // if (nearApiAxiosResponse.status != 200) {
    //   return res.status(nearApiAxiosResponse.status).send({error: nearApiAxiosResponse.statusText, posts: []})
    // }

    // Get the post data and parse it into JSON
    //@ts-ignore
    // const postData = JSON.parse(nearApiResponse.data[accountId]['post']['main'])
    // posts.add(postData)
  }

  return res.status(200).json({posts: Array.from(posts.values())})

  // res.status(200).json({ name: 'John Doe' })
}
