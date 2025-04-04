package main

import (
	_ "embed"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"text/template"
)

//go:embed header.tmpl
var headerTmpl string

//go:embed nav-bar.tmpl
var navTmpl string

//go:embed blog.tmpl
var blogTmpl string

//go:embed demo.tmpl
var demoTmpl string

type HeaderData struct {
	Title   string
	Scripts []string
}

type NavData struct {
	Sections []string
}

func Capital(s string) string {
	return fmt.Sprintf("%s%s", strings.ToUpper(s[:1]), s[1:])
}

type BlogData struct {
	HData HeaderData
	NData NavData
	BData string
	Name  string
}

type DemoData struct {
	HData HeaderData
	NData NavData
	BData string
	Name  string
}

func makeBlogTemplate() *template.Template {
	fmap := make(map[string]any)
	fmap["Capital"] = Capital
	return template.Must(
		template.Must(
			template.Must(
				template.New("blog").Funcs(fmap).Parse(headerTmpl)).Parse(navTmpl)).Parse(blogTmpl))
}

func makeDemoTemplate() *template.Template {
	fmap := make(map[string]any)
	fmap["Capital"] = Capital
	return template.Must(
		template.Must(
			template.Must(
				template.New("demo").Funcs(fmap).Parse(headerTmpl)).Parse(navTmpl)).Parse(demoTmpl))
}

func applyBlogTemplates(root string, data []BlogData) {
	t := makeBlogTemplate()
	for _, datum := range data {
		f, err := os.Create(datum.Name)
		if err != nil {
			fmt.Printf("Couldn't open file %s\n", datum.Name)
			log.Fatal(err)
		}
		err = t.ExecuteTemplate(f, "blog", datum)
		if err != nil {
			fmt.Printf("Error with blog template on file %s\n", datum.Name)
			fmt.Printf("%v\n", err)
			f.Close()
			log.Fatal(err)
		}
		f.Close()
		out, err := exec.Command(fmt.Sprintf("%s/src/illuminate.py", root), datum.Name).Output()
		if err != nil {
			fmt.Printf("%s", string(out))
			log.Fatal(err)
		}
	}
}

func applyDemoTemplates(data []DemoData) {
	t := makeDemoTemplate()
	for _, datum := range data {
		f, err := os.Create(datum.Name)
		if err != nil {
			fmt.Printf("Couldn't open file %s\n", datum.Name)
			log.Fatal(err)
		}
		defer f.Close()
		err = t.ExecuteTemplate(f, "demo", datum)
		if err != nil {
			fmt.Printf("Error with blog template on file %s\n", datum.Name)
			fmt.Printf("%v\n", err)
			log.Fatal(err)
		}
	}
}
