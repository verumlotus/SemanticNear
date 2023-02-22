import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import RelevantText from "@/components/RelevantText";
import Loading from "@/components/Loading";
import axios from 'axios';

const BACKEND_ENDPOINT = "https://api.semanticnear.xyz/relevant-chunks"

export default function Home() {
  const [accountId, setAccountId] = useState("");
  const [query, setQuery] = useState("");
  const [relevantText, setRelevantText] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")

  async function fetchPosts(accountId: string): Promise<string[] | null> {
    try {
      const axiosResponse = await axios.get(`/api/${accountId}`)
      if (axiosResponse.status != 200) {
        return null;
      }
      // Else, return the posts
      return axiosResponse.data.posts;
    } catch (err) {
      return null;
    }
  }

  async function findRelevantText() {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const posts = await fetchPosts(accountId);
      console.log(`Posts are ${posts}`)
      if (posts == null) {
        setErrorMessage("We ran into an issue – apologies!")
        return;
      }
      if (posts!.length == 0) {
        setErrorMessage("No posts were found for this user!");
        return;
      }
      const postsAsSingleString = posts!.join("\n\n")
  
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
    } catch (err) {
      setErrorMessage("We ran into an issue – apologies!")
    } finally {
      setIsLoading(false);
    }
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
          {errorMessage &&
            <div className="text-red-500 text-center font-sans text-md pb-4">
              {errorMessage} 
            </div>
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
