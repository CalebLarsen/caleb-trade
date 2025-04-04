#! /usr/bin/env python3
# 

import re
import sys

def illuminate(text):
    r = re.compile("<p>.")
    prev = 0
    newtext = ""
    for match in r.finditer(text):
        start, stop = match.span()
        newtext += text[prev:start]
        newtext += "<p><span class='initial'>"
        newtext += text[stop-1]
        newtext += "</span>"
        prev = stop
    newtext += text[prev:]
    return newtext

def main():
    if len(sys.argv) != 2:
        print("[Usage] ./illuminate.py 'file.html'")
        exit(1)
    with open(sys.argv[1], "r+") as f:
        newf = illuminate(f.read())
        f.seek(0)
        f.write(newf)
        f.truncate()


if __name__ == "__main__":
    main()
