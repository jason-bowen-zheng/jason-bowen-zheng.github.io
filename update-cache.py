import json
from os import path

def update_cache() :
    for blog in json.load(open(path.join("blogs", "index.json"), "r+", encoding="utf-8")):
        print(blog)

if __name__ == "__main__":
    update_cache()
