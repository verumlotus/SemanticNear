import Head from "next/head";
import { Inter } from "@next/font/google";
import { Contract, connect } from "near-api-js";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import RelevantText from "@/components/RelevantText";
import Loading from "@/components/Loading";

const inter = Inter({ subsets: ["latin"] });
const NODE_URL = "https://archival-rpc.mainnet.near.org";
const CALLING_ACCOUNT_ID = "shivamcal.near";

export default function Home() {
  const [accountId, setAccountId] = useState("");
  const [query, setQuery] = useState("");
  const [relevantText, setRelevantText] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchPosts(accountId: string): Promise<string> {
    console.log("HERE");
    const nearConnection = await connect({
      networkId: "mainnet",
      nodeUrl: NODE_URL,
    });

    const account = await nearConnection.account(CALLING_ACCOUNT_ID);

    const socialDBConnection = new Contract(account, "social.near", {
      viewMethods: ["get", "keys"],
      changeMethods: [],
    });

    // @ts-ignore
    const response = await socialDBConnection.get({
      keys: ["littlelion.near/**"],
      options: {
        return_deleted: true,
      },
    });

    // TODO: get all the posts as text
    // const postText = TOOD

    return "Some dummy post data";
  }

  async function findRelevantText() {
    setIsLoading(true);
    
    // TODO: Fetch the posts based on the accountID
    // TODO just call the backend
    // axiosResponse = some Axios call
    // TODO: Some error checking

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
