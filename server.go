package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})
    http.HandleFunc("/projects", func(w http.ResponseWriter, r *http.Request){
        http.ServeFile(w, r, "projects.html")
    })
	fs := http.FileServer(http.Dir("static/"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	fmt.Println("Starting!")
	log.Fatal(http.ListenAndServe(":80", nil))
}
