from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from preprocessing import return_relevant_chunks

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"hello": "world"}

@app.post("/relevant-chunks")
def get_relevant_chunks(text: str, query: str):
    try: 
        return return_relevant_chunks(text, query)
    except Exception as e:
        print(e)
        raise e