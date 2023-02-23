from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from preprocessing import return_relevant_chunks
import modal

stub = modal.Stub("semantic-near")

mount_exclude_lst = ['.venv', '.mypy_cache', '__pycache__']
filter_venv = lambda path: False if any([substr in path for substr in mount_exclude_lst]) else True
mount = modal.Mount.from_local_dir("../server", remote_path = "/", condition=filter_venv)
image = modal.Image.from_dockerfile("Dockerfile", context_mount=mount)


app = FastAPI()

origins = [
    "*",
    "https://www.semanticnear.xyz/",
    "https://www.semanticnear.xyz/*",
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

# This hooks up our asgi fastapi app to modal
@stub.asgi(image=image, secret=modal.Secret.from_name("openai-secret"))
def fastapi_app():
    return app