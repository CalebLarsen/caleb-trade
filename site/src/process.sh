#!/usr/bin/env bash
# 
INPUT=$1
HTML="../blog/${INPUT%.*}.html"

pandoc -f markdown "$INPUT" > "$HTML" && ./illuminate.py "$HTML"
