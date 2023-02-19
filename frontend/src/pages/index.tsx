import Head from "next/head";
import { Contract, connect } from "near-api-js";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import RelevantText from "@/components/RelevantText";
import Loading from "@/components/Loading";
import axios from 'axios';

const NODE_URL = "https://archival-rpc.mainnet.near.org";
const NEAR_API = "https://api.near.social/get"
const PAGODA_API = "https://near-mainnet.api.pagoda.co/eapi/v1"
const CALLING_ACCOUNT_ID = "shivamcal.near";
const BACKEND_ENDPOINT = "https://api.semanticnear.xyz/relevant-chunks"

export default function Home() {
  const [accountId, setAccountId] = useState("");
  const [query, setQuery] = useState("");
  const [relevantText, setRelevantText] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")

  async function fetchPosts(accountId: string): Promise<string[]> {
    const axiosResponse = await axios.get(`/api/${accountId}`)
    if (axiosResponse.status != 200) {
      setErrorMessage("We ran into an issue – apologies!")
      return [];
    }
    // Else, return the posts
    return axiosResponse.data.posts;
  }

  async function findRelevantText() {
    setErrorMessage("");
    setIsLoading(true);
    const posts = await fetchPosts(accountId);
    const postsAsSingleString = posts.join("\n\n")

    // Now call our backend
    const axiosResponse = await axios.post(BACKEND_ENDPOINT, {}, {
      headers: {
        "Content-Type": "application/json"
      },
      params: {
        text: postsAsSingleString,
        query: query
      }
    })
    if (axiosResponse.status != 200) {
      setErrorMessage("We ran into an issue – apologies!")
      return;
    }
    // Else, set the data (data should simply be an array)
    setRelevantText(axiosResponse.data)

    setIsLoading(false);
    setRelevantText(["Some relevant text would be over here", "Some other chunk here"]);
  }

  return (
    <>
      <Head>
        <title>SemanticNear</title>
        <meta name="SemanticNear" content="Semantic Search for Near Social" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>️Semantic Near</h1>
        <div className="text-center text-lg" style={{ width: "400px" }}>
          <i>
            Perform Semantic Search against the posts of any user on Near Social
          </i>
        </div>
        <div className="py-2"></div>
        <div className="w-full px-20 flex flex-col justify-center items-center">
          <div className="py-2"></div>
          <input
            className="w-full"
            placeholder="Account ID of user (e.g alex.near)"
            value={accountId}
            onChange={(evt) => setAccountId(evt.target.value)}
          />
          <div className="py-2"></div>
          <input
            className="w-full"
            placeholder="Query (e.g what is the effect of inflation on bonds?)"
            value={query}
            onChange={(evt) => setQuery(evt.target.value)}
          />
          <div className="py-2"></div>
          {relevantText &&
            <RelevantText relevantChunks={relevantText}/>
          }
          {isLoading &&
            <Loading/>
          }
          <div className="py-2"></div>
          <button 
            className="py-2 px-4 bg-transparent text-green-600 font-semibold border border-greeb-400 rounded hover:bg-green-600 hover:text-white hover:border-transparent"
            onClick={() => findRelevantText()}
          >
            Search
          </button>
        </div>
      </main>
    </>
  );
}
